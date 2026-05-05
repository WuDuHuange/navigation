# 扩展功能跟进文档（基础版）

本文件用于持续跟进“导航页项目”的扩展工作。

## 目标定位

- 主体：导航页能力持续增强（可用性、检索、运营数据）
- 附属：博客、评论、AI 与后台管理体验优化
- 工程：稳定性、安全性、可观测性与自动化测试补齐

## 当前扩展主线（基础描述）

1. 平台稳定性扩展
- 统一 API 调用层
- 标准化错误处理
- 关键接口超时与重试策略

2. 安全与风控扩展
- 登录与评论限流
- JWT 与环境变量强校验
- 评论防刷与审核规则

3. 导航核心能力扩展
- 链接健康检查
- 点击统计与热门排序
- 搜索与筛选能力

4. 管理后台扩展
- 审核流优化
- 批量操作
- 操作日志与审计

5. 工程化扩展
- 自动化测试（API + 前端关键流程）
- CI 检查流程
- 结构化日志与监控指标

## 推进方式

- 先按“稳定性与安全”优先推进，再做产品功能增强。
- 每一轮扩展均以“小步可上线”方式实施。
- 详细设计与任务拆分在对话中确认后再写入代码。

## 进展记录

### 2026-04-24 第一阶段（已完成）

- 平台稳定性：新增前端统一请求模块 `frontend/src/utils/apiClient.js`
- 平台稳定性：已迁移关键请求调用（auth、links、articles、博客详情、后台管理）
- 安全风控：新增轻量限流中间件 `api/middleware/rateLimit.js`
- 安全风控：登录接口已接入限流（15 分钟 10 次）
- 安全风控：评论提交接口已接入限流（1 分钟 6 次）
- 安全风控：新增 JWT 密钥校验配置 `api/config/security.js`
- 安全风控：鉴权与登录签发 Token 均改为强校验密钥逻辑

### 2026-04-24 第二阶段（已完成）

- 可观测性：新增请求上下文中间件 `api/middleware/requestContext.js`
- 可观测性：全链路注入 `x-request-id`，并输出结构化访问日志
- 可观测性：全局错误响应新增 `code` 与 `requestId`
- 稳定性：`apiClient` 新增状态码/错误码映射与 `requestId` 透传
- 稳定性：认证与限流错误响应已统一错误码（`AUTH_REQUIRED`、`INVALID_TOKEN`、`RATE_LIMITED`）

### 下一步（待推进）

- 补充最小回归测试（登录、评论、文章列表）
- 为后台关键操作补充用户友好提示（基于错误码）
- 增加 API 层最小集成测试（auth/comments/articles）
 
### 2026-04-30 第三阶段（部分完成）

- 工程化：在 `api/tests` 下添加最小集成测试：`auth.test.js`、`comments.test.js`、`articles.test.js`，并新增运行脚本 `run-min-tests.js`。
- 验证：在本地已安装依赖并运行 `node tests/run-min-tests.js`，三项最小检查均通过（针对未授权/缺失字段返回正确的 401/400）。
- 备注：测试覆盖了鉴权边界和基本输入验证，未依赖数据库初始化；下一步将扩展到对数据库的端到端用例并在 CI 中运行。

### 2026-04-30 第三阶段（继续推进）

- 工程化：新增 `api/tests/all.test.js` 作为跨平台测试入口，统一运行边界测试与路由测试。
- 工程化：补充 `auth.route.test.js`、`comments.route.test.js`、`articles.route.test.js` 的正常路径与详情路径回归。
- 验证：本地执行 `npm test --prefix api`，12 条测试全部通过。
- CI：更新 GitHub Actions，改为安装 `api` 与 `frontend` 依赖后执行完整 `api` 测试，并构建前端。

### 2026-05-05 第四阶段（导航核心 & 审计）

- 导航核心：为 `links` 表添加 `click_count` 字段，新增 `POST /api/v1/links/:id/click` 端点记录点击。
- 导航核心：`LinkCard.vue` 点击时静默上报点击统计。
- 导航核心：`GET /api/v1/links` 支持 `?sort=hot` 按热门（点击量）排序。
- 导航核心：新增 `GET /api/v1/links/health` 管理员健康检查端点，并发检测所有活跃链接 HTTP 状态。
- 管理后台：新增操作审计表 `audit_logs` 与审计中间件 `api/middleware/auditLog.js`。
- 管理后台：`links`、`articles`、`comments` 的创建/更新/删除操作均写入审计日志。
- 管理后台：新增 `GET /api/v1/audit-logs` 查询接口（支持分页与操作类型筛选）。
- 管理后台：`AdminDashboard.vue` 新增"健康检查"与"操作日志"两个 Tab 页。
- 数据库：提供增量迁移脚本 `api/db/migrate_20260430.sql`。
- 验证：`npm test --prefix api` 12 条测试全通过，`npm run build --prefix frontend` 构建成功。

### 2026-05-05 第五阶段（搜索筛选 & 批量操作）

- 导航核心：首页新增"默认/热门"排序切换按钮，`GET /api/v1/links` 支持 `?search=` 服务端模糊搜索（ILIKE 匹配标题、描述、URL）。
- 导航核心：`LinkGrid.vue` 新增搜索栏，可即时按标题/描述/链接地址筛选卡片。
- 管理后台：链接列表新增复选框与"批量删除"按钮。
- 管理后台：评论审核新增"全部通过"一键批量审核。
- 验证：`npm test` 12/12 通过，`npm run build` 构建成功。
