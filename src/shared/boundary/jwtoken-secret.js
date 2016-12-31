import jwt from 'jsonwebtoken'

const jwtSecret = 'shhhhh'

export function encryptSecret (data) {
  return jwt.sign(data, jwtSecret)
}

export function decryptSecret (secret) {
  return jwt.verify(secret, jwtSecret)
}
