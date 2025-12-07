# 双端部署导航页项目计划书

> 说明：本项目主题为“导航页”，博客为附加功能（非主体）。当前示例链接：每日一签 https://reimu-fortune-qqfo.vercel.app/

## 一、项目背景

本项目旨在搭建一个以导航页为核心的站点，集中展示并链接到开发者的各个项目与外部资源。作为附加功能，项目将提供文章发布（Markdown 支持）与访客评论，但重点仍为导航页的易用性与展示效果。

## 二、项目目标

- **主导航页**：搭建简洁、美观、响应式的导航页，突出项目/链接卡片与简介。
- **博客功能（可选）**：支持 Markdown 格式文章发布与展示，为开发者提供内容扩展入口。
- **评论功能（可选）**：实现访客评论，存储在后端并通过 API 交互。
- **双端部署**：前端部署在 Vercel（静态与 CDN 优势），后端部署在 Render（持久服务与 PostgreSQL）。

## 三、技术选型

- **前端（Vercel）**
  - 框架：Vue 3 + Vite
  - 样式：Tailwind CSS
  - 部署：Vercel（免费版）

- **后端（Render）**
  - 运行时：Node.js（可选 Express 轻量或 NestJS for 结构化）
  - 数据库：PostgreSQL（Render 提供托管）
  - 功能：评论 API、文章 CRUD、可选管理员认证

## 四、架构设计

用户浏览器 → Vercel (前端导航页 + 博客 UI)
                        ↓ API 请求
                   Render (后端服务 + PostgreSQL 数据库)

前端负责页面渲染、卡片展示与与用户交互；后端负责文章与评论的存储、管理接口与安全策略。

## 五、仓库结构

建议使用 Monorepo 布局：

```
project-root/
  ├── frontend/   # 前端代码 (Vercel 部署)
  ├── backend/    # 后端代码 (Render 部署)
  ├── infra/      # 可选：部署脚本、数据库迁移
  └── PROJECT_PLAN.md
```

## 六、重点说明：UI 风格与导航优先原则

- 本项目以“导航页”为第一优先级，界面采用卡片式设计以清晰展示各个链接与项目入口。博客与评论为附属模块，应在不干扰导航体验的前提下以子页面或抽屉/模态形式提供。
- 配色参考 Copilot 风格：沉稳的橙灰主色，辅以适度渐变与阴影，动效轻巧且不影响阅读。

功能模块（前端）：
- 导航卡片列表（支持自定义图标、描述与外链）
- 文章列表与详情（Markdown 渲染，置于子页面）
- 评论区组件（可延迟加载，避免影响首屏性能）

功能模块（后端）：
- 文章服务：文章 CRUD、Markdown 原文保存与渲染字段
- 评论服务：评论提交、审核标记、分页查询
- 安全：输入校验、速率限制、CORS 配置

## 七、开发计划（高阶）

- 第 1 周：需求确认与架构设计（API 草案、数据表设计）
- 第 2-3 周：前端实现导航页 UI（卡片、响应式、主题与样式）、在 Vercel 上做初步部署预览
- 第 4-5 周：后端实现基础 API（文章/评论）、数据库建表与迁移脚本、在 Render 上部署测试
- 第 6 周：联调、功能微调（评论审核、反垃圾策略）、性能优化
- 第 7 周：上线、编写使用与运维文档

注：若仅需最小可用产品（MVP），可以在第 2 周完成导航页并上线，仅在后续迭代增加博客/评论。

## 八、时间细化（示例里程碑）

- Day 1-3：确定页面内容与卡片列表结构（列出要展示的链接，如每日一签）
- Day 4-10：实现导航页前端、样式与交互
- Day 11-21：实现后端基础 API 与数据库
- Day 22-28：联调与上线准备

## 九、成本与资源

- Vercel 免费版适合前端部署。  
- Render 免费版提供 750 小时/月 和托管数据库，适合个人项目。  
- 其他成本：域名、备份存储（如使用外部对象存储）、可能的付费升级。

## 十、风险与对策

- 流量超额：优化静态资源缓存、图片懒加载，必要时升级计划。  
- 评论滥用：引入验证码（reCAPTCHA）、评论审核、IP 限流。  
- 数据库瓶颈：添加索引、优化查询或迁移至更高配数据库。

## 十一、交付物与验收标准

- `frontend/` 在 Vercel 上可访问，导航卡片加载正确（含 `每日一签` 链接）。
- `backend/` 在 Render 上运行（如已配置），API 能存取文章与评论（若启用）。
- 提供 `README.md`：包含部署步骤、环境变量示例和上线说明。

验收要点：
- 访问 `导航页`（桌面与移动）正常显示卡片并能打开外链（例如每日一签）
- 如果启用，文章能以 Markdown 渲染并且评论能提交与展示

## 十二、后续拓展建议

- 支持第三方登录（GitHub）以便作者管理文章
- 添加搜索（全文检索）与标签过滤
- 管理后台支持评论审核、文章管理与数据导出

---

## 十三、API 规格设计

### 13.1 基础信息

- **Base URL**: `https://<render-app>.onrender.com/api/v1`
- **Content-Type**: `application/json`
- **认证方式**: JWT Bearer Token（仅管理接口需要）

### 13.2 导航链接 API

| 方法 | 路径 | 描述 | 认证 |
|------|------|------|------|
| GET | `/links` | 获取所有导航链接 | 否 |
| GET | `/links/:id` | 获取单个链接详情 | 否 |
| POST | `/links` | 创建导航链接 | 是 |
| PUT | `/links/:id` | 更新导航链接 | 是 |
| DELETE | `/links/:id` | 删除导航链接 | 是 |

**GET /links 响应示例**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "每日一签",
      "description": "灵梦御神签 - 每日运势占卜",
      "url": "https://reimu-fortune-qqfo.vercel.app/",
      "icon": "🎋",
      "category": "工具",
      "sort_order": 1,
      "created_at": "2025-12-07T00:00:00Z"
    }
  ]
}
```

### 13.3 文章 API

| 方法 | 路径 | 描述 | 认证 |
|------|------|------|------|
| GET | `/articles` | 获取文章列表（分页） | 否 |
| GET | `/articles/:id` | 获取文章详情 | 否 |
| POST | `/articles` | 创建文章 | 是 |
| PUT | `/articles/:id` | 更新文章 | 是 |
| DELETE | `/articles/:id` | 删除文章 | 是 |

**GET /articles 查询参数**:
- `page`: 页码（默认 1）
- `limit`: 每页数量（默认 10，最大 50）
- `tag`: 按标签筛选

**GET /articles/:id 响应示例**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "项目介绍",
    "content": "# 欢迎\n这是一篇 Markdown 文章...",
    "summary": "项目简介与使用说明",
    "tags": ["公告", "教程"],
    "published": true,
    "created_at": "2025-12-07T00:00:00Z",
    "updated_at": "2025-12-07T00:00:00Z"
  }
}
```

### 13.4 评论 API

| 方法 | 路径 | 描述 | 认证 |
|------|------|------|------|
| GET | `/articles/:articleId/comments` | 获取文章评论 | 否 |
| POST | `/articles/:articleId/comments` | 发表评论 | 否* |
| DELETE | `/comments/:id` | 删除评论 | 是 |
| PUT | `/comments/:id/approve` | 审核通过评论 | 是 |

> *发表评论不需要登录，但需要通过验证码校验

**POST /articles/:articleId/comments 请求体**:
```json
{
  "nickname": "访客",
  "email": "visitor@example.com",
  "content": "这篇文章很有帮助！",
  "captcha_token": "recaptcha_token_here"
}
```

### 13.5 认证 API（管理员）

| 方法 | 路径 | 描述 |
|------|------|------|
| POST | `/auth/login` | 管理员登录 |
| POST | `/auth/refresh` | 刷新 Token |

---

## 十四、数据库表设计

### 14.1 导航链接表 (links)

```sql
CREATE TABLE links (
    id SERIAL PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    description VARCHAR(500),
    url VARCHAR(500) NOT NULL,
    icon VARCHAR(50),                -- emoji 或图标类名
    category VARCHAR(50) DEFAULT '默认',
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 初始数据
INSERT INTO links (title, description, url, icon, category, sort_order)
VALUES ('每日一签', '灵梦御神签 - 每日运势占卜', 'https://reimu-fortune-qqfo.vercel.app/', '🎋', '工具', 1);
```

### 14.2 文章表 (articles)

```sql
CREATE TABLE articles (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    slug VARCHAR(200) UNIQUE,        -- URL 友好标识
    content TEXT NOT NULL,           -- Markdown 原文
    summary VARCHAR(500),
    tags VARCHAR(50)[] DEFAULT '{}', -- PostgreSQL 数组类型
    published BOOLEAN DEFAULT false,
    view_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_articles_published ON articles(published);
CREATE INDEX idx_articles_tags ON articles USING GIN(tags);
```

### 14.3 评论表 (comments)

```sql
CREATE TABLE comments (
    id SERIAL PRIMARY KEY,
    article_id INTEGER NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
    nickname VARCHAR(50) NOT NULL,
    email VARCHAR(100),
    content TEXT NOT NULL,
    is_approved BOOLEAN DEFAULT false,  -- 审核状态
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_comments_article ON comments(article_id);
CREATE INDEX idx_comments_approved ON comments(is_approved);
```

### 14.4 管理员表 (admins)

```sql
CREATE TABLE admins (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP
);
```

### 14.5 ER 关系图（文字描述）

```
admins (管理员)
    |
    | 1:N (管理)
    v
articles (文章) <---- 1:N ----> comments (评论)
    
links (导航链接) -- 独立表，无外键关联
```

---

## 十五、前端组件树与路由

### 15.1 路由设计

| 路径 | 组件 | 描述 |
|------|------|------|
| `/` | HomePage | 导航页首页（卡片列表） |
| `/blog` | BlogList | 文章列表页 |
| `/blog/:slug` | BlogDetail | 文章详情页（含评论） |
| `/admin` | AdminLogin | 管理员登录 |
| `/admin/dashboard` | AdminDashboard | 管理后台 |

### 15.2 组件树

```
App.vue
├── components/
│   ├── layout/
│   │   ├── NavHeader.vue      # 顶部导航栏
│   │   └── Footer.vue         # 页脚
│   ├── home/
│   │   ├── LinkCard.vue       # 单个导航卡片
│   │   └── LinkGrid.vue       # 卡片网格容器
│   ├── blog/
│   │   ├── ArticleCard.vue    # 文章摘要卡片
│   │   ├── ArticleContent.vue # 文章正文（Markdown 渲染）
│   │   └── CommentSection.vue # 评论区
│   └── common/
│       ├── Loading.vue        # 加载状态
│       └── ErrorMessage.vue   # 错误提示
├── views/
│   ├── HomePage.vue
│   ├── BlogList.vue
│   ├── BlogDetail.vue
│   └── admin/
│       ├── AdminLogin.vue
│       └── AdminDashboard.vue
└── stores/
    ├── links.js               # 导航链接状态
    └── articles.js            # 文章状态
```


