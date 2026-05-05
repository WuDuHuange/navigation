const test = require('node:test')
const assert = require('node:assert/strict')
const express = require('express')
const request = require('supertest')
const proxyquire = require('proxyquire').noCallThru()

test('GET /articles returns published list with pagination', async () => {
  const mockDb = {
    query: async (sql) => {
      if (sql.includes('SELECT id, title, slug')) {
        return {
          rows: [
            {
              id: 1,
              title: '文章A',
              slug: 'article-a',
              summary: '摘要A',
              ai_summary: null,
              tags: ['技术'],
              view_count: 1,
              created_at: new Date().toISOString()
            }
          ]
        }
      }
      if (sql.includes('SELECT COUNT(*) FROM articles WHERE published = true')) {
        return { rows: [{ count: '1' }] }
      }
      return { rows: [] }
    }
  }

  const articlesRouter = proxyquire('../routes/articles', {
    '../db': mockDb,
    '../services/ai': {
      isAvailable: () => false,
      generateSummary: async () => 'summary'
    }
  })

  const app = express()
  app.use(express.json())
  app.use('/articles', articlesRouter)

  const res = await request(app).get('/articles?page=1&limit=10')

  assert.equal(res.status, 200)
  assert.equal(res.body.success, true)
  assert.equal(Array.isArray(res.body.data), true)
  assert.equal(res.body.pagination.page, 1)
  assert.equal(res.body.pagination.total, 1)
})

test('GET /articles/:slug returns article detail and increments view count', async () => {
  const queryCalls = []
  const mockDb = {
    query: async (sql, params = []) => {
      queryCalls.push({ sql, params })

      if (sql.includes('SELECT * FROM articles WHERE slug = $1 AND published = true')) {
        return {
          rows: [
            {
              id: 7,
              title: '文章详情',
              slug: 'article-detail',
              content: '内容',
              published: true,
              view_count: 3
            }
          ]
        }
      }

      if (sql.includes('UPDATE articles SET view_count = view_count + 1 WHERE slug = $1')) {
        return { rows: [] }
      }

      return { rows: [] }
    }
  }

  const articlesRouter = proxyquire('../routes/articles', {
    '../db': mockDb,
    '../services/ai': {
      isAvailable: () => false,
      generateSummary: async () => 'summary'
    }
  })

  const app = express()
  app.use(express.json())
  app.use('/articles', articlesRouter)

  const res = await request(app).get('/articles/article-detail')

  assert.equal(res.status, 200)
  assert.equal(res.body.success, true)
  assert.equal(res.body.data.slug, 'article-detail')
  assert.equal(res.body.data.view_count, 4)
  assert.ok(queryCalls.some((call) => call.sql.includes('UPDATE articles SET view_count = view_count + 1 WHERE slug = $1')))
})

test('GET /articles/:id/comments returns approved comments for nested route', async () => {
  const articlesRouter = proxyquire('../routes/articles', {
    '../db': {
      query: async () => ({
        rows: [
          { id: 2, nickname: '访客', content: '支持', created_at: new Date().toISOString() }
        ]
      })
    },
    '../services/ai': {
      isAvailable: () => false,
      generateSummary: async () => 'summary'
    }
  })

  const app = express()
  app.use(express.json())
  app.use('/articles', articlesRouter)

  const res = await request(app).get('/articles/2/comments')

  assert.equal(res.status, 200)
  assert.equal(res.body.success, true)
  assert.equal(res.body.data.length, 1)
  assert.equal(res.body.data[0].nickname, '访客')
})
