const request = require('supertest')
const assert = require('assert')
const test = require('node:test')
const app = require('../index')

test('GET /api/v1/comments/pending without auth returns 401', async (t) => {
  const res = await request(app).get('/api/v1/comments/pending')
  assert.strictEqual(res.status, 401)
  assert.strictEqual(res.body.code, 'AUTH_REQUIRED')
})
