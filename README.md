# 导航页项目

> 双端部署导航页项目 - 前端 Vercel + 后端 Render

一个简洁美观的个人项目导航页，支持博客文章发布与访客评论功能。

## 🚀 快速开始

### 前端启动

```bash
cd frontend
npm install
npm run dev
```

访问 http://localhost:3000

### 后端启动

1. 复制环境变量配置：
```bash
cd backend
cp .env.example .env
```

2. 修改 `.env` 中的数据库连接和密钥

3. 安装依赖并启动：
```bash
npm install
npm run db:migrate  # 初始化数据库
npm run dev         # 开发模式
```

API 运行在 http://localhost:4000

## 📁 项目结构

```
navigation/
├── frontend/          # Vue 3 + Vite + Tailwind CSS
│   ├── src/
│   │   ├── components/   # 组件
│   │   ├── views/        # 页面
│   │   ├── router/       # 路由
│   │   └── stores/       # 状态管理
│   └── package.json
├── backend/           # Express + PostgreSQL
│   ├── src/
│   │   ├── routes/       # API 路由
│   │   ├── middleware/   # 中间件
│   │   └── db/           # 数据库
│   └── package.json
└── project.md         # 项目计划书
```

## 🌐 部署

### 前端部署到 Vercel

1. 在 Vercel 导入 `frontend` 目录
2. 设置环境变量 `VITE_API_URL` 为后端地址
3. 自动构建部署

### 后端部署到 Render

1. 创建 Web Service，选择 `backend` 目录
2. 设置环境变量（DATABASE_URL, JWT_SECRET 等）
3. 创建 PostgreSQL 数据库并连接
4. 运行 `npm run db:migrate` 初始化

## 🔗 当前导航链接

- [每日一签](https://reimu-fortune-qqfo.vercel.app/) - 灵梦御神签

## 📝 API 文档

详见 [project.md](./project.md) 中的 API 规格设计章节。

## 🛠️ 技术栈

**前端**
- Vue 3 + Vite
- Tailwind CSS
- Vue Router
- Pinia

**后端**
- Node.js + Express
- PostgreSQL
- JWT 认证
- bcrypt 加密

## 📄 License

MIT
