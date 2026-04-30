const request = require('supertest')
const app = require('../index')

;(async () => {
  try {
    // auth missing fields -> 400
    const res1 = await request(app).post('/api/v1/auth/login').send({})
    if (res1.status !== 400) throw new Error('auth.login expected 400, got ' + res1.status)

    // comments pending without auth -> 401
    const res2 = await request(app).get('/api/v1/comments/pending')
    if (res2.status !== 401) throw new Error('comments.pending expected 401, got ' + res2.status)

    // articles admin all without auth -> 401
    const res3 = await request(app).get('/api/v1/articles/admin/all')
    if (res3.status !== 401) throw new Error('articles.admin.all expected 401, got ' + res3.status)

    console.log('ALL_TESTS_PASSED')
    process.exit(0)
  } catch (err) {
    console.error('TEST_FAILED', err && err.message)
    process.exit(2)
  }
})()
