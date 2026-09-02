import type { ProfileConfig } from "../types/config";

// 个人资料配置
export const profileConfig: ProfileConfig = {
	avatar: "/avatar.png", // 相对于 /src 目录。如果以 '/' 开头，则相对于 /public 目录
	name: "Konata",
	bio: "", // 侧边栏不显示简介；想显示就填一句话，例如："大数据专业大三学生"
	typewriter: {
		enable: true, // 启用个人简介打字机效果
		speed: 80, // 打字速度（毫秒）
	},
	links: [
		// TODO: 在这里添加你自己的社交链接，例如：
		// {
		// 	name: "GitHub",
		// 	icon: "fa7-brands:github",
		// 	url: "https://github.com/yourname",
		// },
	],
};
