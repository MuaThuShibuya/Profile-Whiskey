import { jwtVerify, SignJWT } from 'jose'

const getJwtSecretKey = () => {
  const secret = process.env.JWT_SECRET
  if (!secret) throw new Error('JWT_SECRET is not set')
  return new TextEncoder().encode(secret)
}

export async function verifyAuth(token: string) {
  try {
    const verified = await jwtVerify(token, getJwtSecretKey())
    return verified.payload
  } catch (err) {
    throw new Error('Your token has expired.')
  }
}

export async function signToken(payload: { role: string }) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(getJwtSecretKey())
}