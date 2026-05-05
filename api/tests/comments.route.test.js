const test = require('node:test')
const assert = require('node:assert/strict')
const express = require('express')
const request = require('supertest')
const proxyquire = require('proxyquire').noCallThru()

test('POST /comments returns 400 when required fields missing', async () => {
  const commentsRouter = proxyquire('../routes/comments', {
    '../db': { query: async () => ({ rows: [] }) }
  })

  const app = express()
  app.use(express.json())
  app.use('/comments', commentsRouter)

  const res = await request(app).post('/comments').send({ nickname: '访客' })
  assert.equal(res.status, 400)
  assert.equal(res.body.error, '缺少必填字段')
})

test('POST /comments returns 201 on valid payload', async () => {
  const commentsRouter = proxyquire('../routes/comments', {
    '../db': {
      query: async (sql) => {
        // 重复检测 → 无重复
        if (sql.includes('SELECT id FROM comments WHERE ip_address')) {
          return { rows: [] }
        }
        // 文章存在性检查 → 存在
        if (sql.includes('SELECT id FROM articles')) {
          return { rows: [{ id: 1 }] }
        }
        // INSERT → 返回新建评论
        return {
          rows: [{ id: 9, nickname: '访客', content: '写得很好', created_at: new Date().toISOString() }]
        }
      }
    }
  })

  const app = express()
  app.use(express.json())
  app.use('/comments', commentsRouter)

  const res = await request(app).post('/comments').send({
    article_id: 1,
    nickname: '访客',
    email: 'a@b.com',
    content: '写得很好'
  })

  assert.equal(res.status, 201)
  assert.equal(res.body.success, true)
  assert.equal(res.body.data.nickname, '访客')
})

test('GET /article/:articleId returns approved comments', async () => {
  const commentsRouter = proxyquire('../routes/comments', {
    '../db': {
      query: async () => ({
        rows: [
          { id: 1, nickname: 'A', content: '好文章', created_at: new Date().toISOString() }
        ]
      })
    }
  })

  const app = express()
  app.use(express.json())
  app.use('/comments', commentsRouter)

  const res = await request(app).get('/comments/article/12')

  assert.equal(res.status, 200)
  assert.equal(res.body.success, true)
  assert.equal(res.body.data.length, 1)
  assert.equal(res.body.data[0].nickname, 'A')
})
