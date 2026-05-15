'use client'

import { useState, useEffect, useCallback } from 'react'

export type ToastState = { message: string; type: 'success' | 'error' } | null

export function useAdminProfile() {
  const [config, setConfig] = useState<any>(null)
  const [formData, setFormData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [toast, setToast] = useState<ToastState>(null)

  const showToast = useCallback((msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ message: msg, type })
    setTimeout(() => setToast(null), 3500)
  }, [])

  const refetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/profile')
      const json = await res.json()
      if (json.success) {
        setConfig(json.data)
        setFormData(json.data)
      } else {
        setError(json.message || 'Lỗi tải dữ liệu')
      }
    } catch (e: any) {
      setError(e.message || 'Lỗi kết nối')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { refetch() }, [refetch])

  const setNested = useCallback((path: string, value: any) => {
    const keys = path.split('.')
    setFormData((prev: any) => {
      if (!prev) return prev
      const next = { ...prev }
      let cur: any = next
      for (let i = 0; i < keys.length - 1; i++) {
        cur[keys[i]] = { ...cur[keys[i]] }
        cur = cur[keys[i]]
      }
      cur[keys[keys.length - 1]] = value
      return next
    })
  }, [])

  const resetToSaved = useCallback(() => {
    if (config) setFormData(JSON.parse(JSON.stringify(config)))
  }, [config])

  const handleSave = useCallback(async (partial?: Record<string, any>): Promise<boolean> => {
    setIsSaving(true)
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(partial ?? formData),
      })
      const data = await res.json()
      if (data.success) {
        showToast('Đã lưu vào MongoDB! 🌌')
        setConfig(data.data)
        setFormData(data.data)
        return true
      }
      showToast(data.message || 'Lỗi khi lưu', 'error')
      return false
    } catch {
      showToast('Lỗi kết nối server', 'error')
      return false
    } finally {
      setIsSaving(false)
    }
  }, [formData, showToast])

  return {
    config,
    formData,
    setFormData,
    setNested,
    handleSave,
    resetToSaved,
    isSaving,
    loading,
    error,
    toast,
    showToast,
    refetch,
  }
}
