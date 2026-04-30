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
