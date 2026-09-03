# 后端部署指南：日记（Memos）与评论（Twikoo）

本博客的两个动态功能各需要一个轻量后端：

| 功能 | 后端 | 访客是否需要登录 | 费用 |
|------|------|----------------|------|
| 日记 `/diary/` | Memos | 无需登录，只读展示 | 需要一台能跑 Docker 的服务器 |
| 留言评论 | Twikoo | 无需登录，昵称+邮箱即可 | 可免费跑在 Vercel 上 |

两者完全独立，可以只部署其中一个。

---

## 一、Memos（日记后端）

Memos 是开源自托管备忘录服务（[usememos/memos](https://github.com/usememos/memos)）。你在它的网页或手机 App 上写日记，博客的 `/diary/` 页面自动拉取展示。支持文字、图片、标签、定位、置顶。

> **⚠️ 已实测验证（2026-09-03）**：必须在服务端设置 `MEMOS_INSTANCE_URL` 环境变量，否则 Memos v0.30+ 的 API 会拒绝匿名访问（博客拉不到日记）。设为你的 Memos 对外访问地址即可。此项不设置时，浏览器跨域（CORS）也会被拒绝。

### 1. 服务器部署（Docker，推荐）

在服务器上创建 `/opt/memos/` 目录，放入以下 `docker-compose.yml`：

```yaml
services:
  memos:
    image: neosmemo/memos:stable
    container_name: memos
    restart: unless-stopped
    ports:
      - "5230:5230"
    environment:
      # 关键：不设置则 API 拒绝匿名访问 + 跨域请求
      - MEMOS_INSTANCE_URL=https://memos.你的域名.com
    volumes:
      - ./data:/var/opt/memos
```

启动：

```bash
cd /opt/memos
docker compose up -d
```

### 2. 初始化

1. 浏览器打开 `https://memos.你的域名.com`（先完成下面的 HTTPS 反代）
2. 首次访问会要求注册管理员账号（第一个注册的用户即管理员）
3. 建议在设置里关闭"允许新用户注册"（避免陌生人注册）

### 3. HTTPS 反向代理（重要）

博客部署在 Cloudflare Pages（HTTPS），浏览器不允许 HTTPS 页面请求 HTTP 接口（混合内容限制），所以 **Memos 必须以 HTTPS 对外提供服务**。用 Nginx + 你域名的一个子域（如 `memos.example.com`）反代到 5230 端口：

```nginx
server {
    listen 443 ssl;
    server_name memos.example.com;

    ssl_certificate     /path/to/fullchain.pem;   # 用 certbot 免费申请
    ssl_certificate_key /path/to/privkey.pem;

    client_max_body_size 32m;   # 允许上传图片

    location / {
        proxy_pass http://127.0.0.1:5230;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

如果服务器上有 1Panel/宝塔等面板，直接用面板的"反代/网站"功能配一个子域指向 127.0.0.1:5230 更省事。

### 4. 写一条测试日记

登录 Memos → 输入内容 → 可选加标签（输入 `#日常` 空格即成标签）→ 可见性保持 **公开（PUBLIC）** → 发布。

验证 API 通不通（浏览器直接打开这个地址，能看到 JSON 且 `memos` 数组里有你的日记即成功）：

```
https://memos.你的域名.com/api/v1/memos?visibility=PUBLIC&state=NORMAL&limit=100
```

### 5. 接入博客

编辑 `src/config/siteConfig.ts`：

```ts
diaryApiUrl: "https://memos.你的域名.com/api/v1/memos?visibility=PUBLIC&state=NORMAL&limit=100",
```

推送到 GitHub / 重新部署后，打开博客 `/diary/` 即可看到日记。

### 6. 日常写日记的姿势

- **网页**：`https://memos.你的域名.com`，手机浏览器加到主屏幕当 App 用
- **手机 App**：Memos 有 iOS/Android 客户端，登录时服务器地址填你的 Memos 域名
- **置顶**：某条日记右上角菜单选 Pin，会排在博客日记页最前
- **隐私**：可见性选"私有"的日记不会出现在博客上，可以放心当私人备忘录用

---

## 二、Twikoo（评论后端）

Twikoo 是开源评论系统（[imaegoo/twikoo](https://github.com/imaegoo/twikoo)），访客填昵称+邮箱即可留言，头像自动取邮箱对应的 Gravatar。评论数据存在你的 MongoDB 里，你可以在文章页底部直接管理（删除/置顶）。

### 1. 免费部署到 Vercel

打开 [imaegoo/twikoo](https://github.com/imaegoo/twikoo) 仓库 README，点击 **Deploy to Vercel** 一键部署。

### 2. 准备 MongoDB（免费）

1. 注册 [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) 免费套餐（M0，512MB，个人博客绰绰有余）
2. 创建 Cluster → Database Access 里建一个数据库用户（记住用户名密码）
3. Network Access 里允许来源 IP 填 `0.0.0.0/0`（Vercel 的出口 IP 不固定）
4. Database → Connect → Drivers，复制连接串，形如：
   `mongodb+srv://user:pass@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`

### 3. 配置 Vercel 环境变量

部署 Twikoo 的 Vercel 项目 → Settings → Environment Variables，添加：

| 变量名 | 值 |
|--------|-----|
| `MONGODB_URI` | 上一步的连接串 |
| `MONGODB_DB` | `twikoo`（自定义库名） |

重新 Deploy 一次使配置生效。

### 4. 接入博客

编辑 `src/config/commentConfig.ts`：

```ts
enable: true,
system: "twikoo",
twikoo: {
	envId: "https://你的twikoo项目名.vercel.app",   // Vercel 部署后的域名
	lang: SITE_LANG,
},
```

### 5. 首次设置管理员

推送到 GitHub 让博客重新部署后，打开任意文章页：

1. 评论框会正常显示（此时后台已连上）
2. 用你自己的昵称+邮箱发一条评论
3. 首次评论后，Twikoo 会提示设置管理员密码（在评论框的管理面板里），设置后你的评论旁会有"博主"标识，鼠标悬停在自己评论上会出现删除/置顶管理按钮

### 6. 防垃圾评论（可选）

Twikoo 管理面板支持：启用频率限制、垃圾评论关键词过滤。国内访问 Vercel 不稳的话可改部署到 Netlify 或 Zeabur，envId 换成对应域名即可。

---

## 三、常见问题

**Q: 日记页拉不到内容，但 Memos 里明明有公开日记？**
按顺序检查：① 服务器上 `MEMOS_INSTANCE_URL` 是否已设置（最常见原因）；② 浏览器直接打开 `https://memos.你的域名/api/v1/memos?visibility=PUBLIC&state=NORMAL&limit=100` 能否看到 JSON 里的日记；③ 日记的可见性是否为 PUBLIC；④ 是否 HTTPS（HTTP 会被博客的 HTTPS 页面拒绝）。

**Q: 本地开发时（http://localhost:4321）能调试线上接口吗？**
能。HTTP 页面请求 HTTPS 接口不受混合内容限制，本地 dev 环境可以直接连线上 Memos/Twikoo。

**Q: 以后不想用 Memos 了怎么回退？**
把 `diaryApiUrl` 改回空字符串 `""`，日记页自动回落到本地数据 `src/data/diary.ts`（当前行为），什么都不用改。

**Q: Vercel 部署的 Twikoo 会休眠吗？**
免费版 Serverless 函数有冷启动，偶尔首条评论会慢几秒，属正常现象。

---

## 附：本次接入已完成的代码改动（2026-09-03）

- `src/config/commentConfig.ts` — 评论已启用（`enable: true`，system: twikoo），`envId` 当前为占位地址，部署完 Twikoo 后替换
- `src/config/siteConfig.ts` — `diaryApiUrl` 当前指向本地测试实例（`http://localhost:5230`），部署完 Memos 后替换为线上地址
- 本地已验证：Memos v0.30.0 + `MEMOS_INSTANCE_URL` → 匿名拉取公开日记 ✓、跨域 CORS ✓、博客日记页渲染（文字/标签/时间）✓；Twikoo 评论组件在文章页/关于页/友链页挂载渲染 ✓
