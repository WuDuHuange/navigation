# 🧭 导航页项目

一个简洁美观的个人项目导航页，支持博客文章、AI 总结、图片上传与访客评论。

## ✨ 功能特性

- 🔗 **导航链接管理** - 展示和管理个人项目链接
- 📝 **博客系统** - Markdown 文章发布
- 🤖 **AI 总结** - Gemini AI 自动生成文章摘要
- 🖼️ **图片上传** - Cloudinary 云存储
- 💬 **评论系统** - 访客评论与审核
- 🔐 **管理后台** - 完整的后台管理界面

## 🚀 快速部署（Vercel 全栈）

### 1. 准备数据库

在 [Neon](https://neon.tech) 创建免费 PostgreSQL 数据库，获取连接字符串。

### 2. 初始化数据库

```bash
# 克隆项目
git clone https://github.com/WuDuHuange/navigation.git
cd navigation

# 安装依赖
npm install pg bcryptjs dotenv

# 设置数据库连接并初始化
set DATABASE_URL=你的PostgreSQL连接字符串
node scripts/init-db.js
```

### 3. 配置 Cloudinary（图片上传）

1. 注册 [Cloudinary](https://cloudinary.com)（免费 25GB）
2. 在 Dashboard 获取：
   - Cloud Name
   - API Key
   - API Secret

### 4. 部署到 Vercel

1. Fork 此仓库或导入到 Vercel
2. 添加环境变量：

| 变量名 | 说明 |
|--------|------|
| `DATABASE_URL` | PostgreSQL 连接字符串 |
| `JWT_SECRET` | 随机密钥（如 `openssl rand -base64 32`） |
| `NODE_ENV` | `production` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary Cloud Name |
| `CLOUDINARY_API_KEY` | Cloudinary API Key |
| `CLOUDINARY_API_SECRET` | Cloudinary API Secret |

3. 点击 Deploy

### 5. 访问

- 首页：`https://你的域名.vercel.app`
- 管理后台：`https://你的域名.vercel.app/admin`

## 🛠️ 本地开发

### 前端

```bash
cd frontend
npm install
npm run dev
# 访问 http://localhost:3000
```

### 后端

```bash
cd backend
cp .env.example .env
# 编辑 .env 配置数据库等

npm install
npm run db:migrate
npm run dev
# API 运行在 http://localhost:4000
```

## 📁 项目结构

```
navigation/
├── api/                 # Vercel Serverless Functions
│   ├── routes/          # API 路由
│   ├── services/        # AI、Cloudinary 服务
│   └── index.js         # 入口文件
├── frontend/            # Vue 3 前端
│   ├── src/
│   │   ├── components/  # 组件
│   │   ├── views/       # 页面
│   │   ├── router/      # 路由
│   │   └── stores/      # Pinia 状态
│   └── package.json
├── backend/             # 独立后端（可选 Render 部署）
├── scripts/             # 数据库初始化脚本
├── vercel.json          # Vercel 配置
└── project.md           # 详细项目计划
```

## 🔧 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | Vue 3 + Vite + Tailwind CSS + Pinia |
| 后端 | Node.js + Express |
| 数据库 | PostgreSQL (Neon) |
| 图片存储 | Cloudinary |
| AI | Google Gemini API |
| 部署 | Vercel |

## 📡 API 端点

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/v1/links` | 获取导航链接 |
| GET | `/api/v1/articles` | 获取文章列表 |
| GET | `/api/v1/articles/:slug` | 获取文章详情 |
| POST | `/api/v1/auth/login` | 管理员登录 |
| POST | `/api/v1/upload` | 上传图片 |
| GET | `/api/health` | 健康检查 |

完整 API 文档见 [project.md](./project.md)

## 🔒 管理后台功能

- 导航链接 CRUD
- 文章发布（Markdown + 图片）
- AI 总结生成
- 评论审核
- 系统设置（Gemini API Key）

## 📄 License

MIT
