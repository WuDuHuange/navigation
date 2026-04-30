const request = require('supertest')
const assert = require('assert')
const test = require('node:test')
const app = require('../index')

test('POST /api/v1/auth/login missing fields returns 400', async (t) => {
  const res = await request(app).post('/api/v1/auth/login').send({})
  assert.strictEqual(res.status, 400)
  assert.ok(res.body.error)
})
