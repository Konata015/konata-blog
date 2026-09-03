import type { CommentConfig } from "../types/config";
import { SITE_LANG } from "./siteConfig";

// 评论系统配置
// 当前使用 giscus：评论数据存在 GitHub Discussions（Konata015/konata-blog 的 Announcements 分类）
// 前置条件：giscus App 已安装到该仓库（https://github.com/apps/giscus）
export const commentConfig: CommentConfig = {
	enable: true, // 启用评论功能。当设置为 false 时，评论组件将不会显示在文章区域。
	system: "giscus", // 评论系统选择: "twikoo" | "giscus"
	twikoo: {
		// 备用方案：如需换回 Twikoo，部署后端后填服务端地址并把 system 改为 "twikoo"
		envId: "",
		lang: SITE_LANG,
	},
	giscus: {
		repo: "Konata015/konata-blog",
		repoId: "R_kgDOUMW1gQ",
		category: "Announcements",
		categoryId: "DIC_kwDOUMW1gc4DEyUQ",
		mapping: "pathname",
		strict: "0",
		reactionsEnabled: "1",
		emitMetadata: "0",
		inputPosition: "top",
		theme: "preferred_color_scheme",
		lang: SITE_LANG,
		loading: "lazy",
	},
};
