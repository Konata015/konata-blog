# 日记与评论系统（零成本方案）

> 全部运行在 Cloudflare 免费套餐上，无需服务器、无需域名，月费 ¥0。
> 免费额度对个人博客绰绰有余：D1 每天 10 万次读 + 1 万次写、KV 每天 10 万次读 + 1 千次写、Pages Functions 每天 10 万次请求。

## 架构

| 功能 | 实现 | 数据存放 |
| --- | --- | --- |
| 日记 | Pages Functions（`functions/api/diary.ts`） | D1 数据库 `konata-diary`（文字/标签）+ KV `DIARY_IMAGES`（图片） |
| 日记图片 | `functions/file/[[path]].ts` 从 KV 读取 | KV 命名空间 `DIARY_IMAGES` |
| 评论 | giscus，评论写入仓库的 GitHub Discussions | GitHub（无限、免费） |

资源绑定统一在根目录 `wrangler.toml` 配置（D1 id / KV id），部署时 `wrangler pages deploy` 自动带上 Functions 和绑定。

## 怎么发日记

1. 打开 `https://konata-blog.pages.dev/diary-admin/`（此页面无入口链接，`noindex`，仅自己使用）
2. 首次输入管理密码，点「验证并加载」——正确后密码保存在本机浏览器
3. 写内容、加标签（逗号分隔）、选图片（前端自动压缩），点「发布」
4. 打开 `/diary/` 即可看到，置顶的排最前

支持删除：管理页每条日记右侧有「删除」按钮（同时清理 KV 里的图片）。

## 管理密码

密码存在 Cloudflare Pages 的加密环境变量 `DIARY_ADMIN_PASSWORD` 里，不进代码库。

```bash
# 修改密码（在博客目录执行，回车后输入新密码）
npx wrangler pages secret put DIARY_ADMIN_PASSWORD --project-name konata-blog
```

本地开发密码在 `.dev.vars` 文件（已 gitignore），与线上互不影响。

## 常用运维命令

```bash
# 备份全部日记到本地 JSON
npx wrangler d1 execute konata-diary --remote --json --command "SELECT * FROM diary" > diary-backup.json

# 查看 KV 里的图片数量
npx wrangler kv key list --namespace-id 00e9200066f849b3aa9453e6a0311993 | grep -c img_

# 重新初始化数据库表结构（危险操作前先备份）
npx wrangler d1 execute konata-diary --remote --file schema.sql
```

## API 说明

- `GET /api/diary` — 公开。返回 Memos 兼容格式 `{"memos":[...]}`，`src/pages/diary.astro` 的客户端脚本直接消费（置顶优先、时间倒序）
- `POST /api/diary` — 需 `x-admin-token` 头。`multipart/form-data`：`content`、`tags`（逗号分隔）、`pinned`（1/0）、`images`（多文件，≤9 张、单张 ≤5MB）
- `DELETE /api/diary?id=N` — 需 `x-admin-token` 头
- `GET /file/<key>/<filename>` — 公开。KV 图片读取，带一年强缓存

评论 API 由 giscus.app 提供，评论数据在仓库 Discussions 的 `Announcements` 分类（该分类只有仓库所有者能发帖，访客只评论，防灌水）。

## 如果以后想换方案

- **换 Twikoo**：部署后端（Vercel + MongoDB Atlas 免费版），填 `src/config/commentConfig.ts` 的 `twikoo.envId` 并把 `system` 改为 `"twikoo"`
- **换自托管 Memos**：需要一台常驻服务器（约 ¥80~150/年），日记页兼容 Memos API 格式，服务器部署好后把 `src/config/siteConfig.ts` 的 `diaryApiUrl` 改为 Memos 地址即可；`GET /api/diary` 的返回格式与 Memos 对齐就是为了保留这条路

## 部署

```bash
pnpm build
npx wrangler pages deploy dist --project-name konata-blog --branch main --commit-dirty=true
```

首次部署后如 Functions 未生效，检查 Cloudflare 面板 → Pages → konata-blog → Settings → Functions 是否启用、D1/KV 绑定是否存在（正常由 wrangler.toml 自动带上）。
