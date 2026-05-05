const test = require('node:test')
const assert = require('node:assert/strict')
const express = require('express')
const request = require('supertest')
const proxyquire = require('proxyquire').noCallThru()

test('POST /login returns 400 when username/password missing', async () => {
  process.env.JWT_SECRET = 'test-secret'

  const mockDb = { query: async () => ({ rows: [] }) }
  const authRouter = proxyquire('../routes/auth', {
    '../db': mockDb,
    bcryptjs: { compare: async () => false }
  })

  const app = express()
  app.use(express.json())
  app.use('/auth', authRouter)

  const res = await request(app).post('/auth/login').send({ username: '' })
  assert.equal(res.status, 400)
  assert.equal(res.body.error, '用户名和密码为必填项')
})

test('POST /login returns token on valid credentials', async () => {
  process.env.JWT_SECRET = 'test-secret'

  const mockDb = {
    query: async (sql) => {
      if (sql.includes('SELECT * FROM admins')) {
        return {
          rows: [{ id: 1, username: 'admin', password_hash: 'hashed' }]
        }
      }
      return { rows: [] }
    }
  }

  const authRouter = proxyquire('../routes/auth', {
    '../db': mockDb,
    bcryptjs: { compare: async () => true }
  })

  const app = express()
  app.use(express.json())
  app.use('/auth', authRouter)

  const res = await request(app).post('/auth/login').send({
    username: 'admin',
    password: 'admin123'
  })

  assert.equal(res.status, 200)
  assert.equal(res.body.success, true)
  assert.ok(res.body.data.token)
  assert.equal(res.body.data.admin.username, 'admin')
})

test('POST /login returns 401 when password is incorrect', async () => {
  process.env.JWT_SECRET = 'test-secret'

  const mockDb = {
    query: async (sql) => {
      if (sql.includes('SELECT * FROM admins')) {
        return {
          rows: [{ id: 1, username: 'admin', password_hash: 'hashed' }]
        }
      }
      return { rows: [] }
    }
  }

  const authRouter = proxyquire('../routes/auth', {
    '../db': mockDb,
    bcryptjs: { compare: async () => false }
  })

  const app = express()
  app.use(express.json())
  app.use('/auth', authRouter)

  const res = await request(app).post('/auth/login').send({
    username: 'admin',
    password: 'wrong-password'
  })

  assert.equal(res.status, 401)
  assert.equal(res.body.error, '用户名或密码错误')
})
