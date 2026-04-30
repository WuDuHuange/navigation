function getJwtSecret() {
  const secret = process.env.JWT_SECRET
  const isInvalid = !secret || secret === 'your-secret-key'

  if (isInvalid) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('JWT_SECRET is required in production and cannot use default value')
    }
    return 'dev-only-insecure-secret'
  }

  return secret
}

module.exports = {
  getJwtSecret
}
