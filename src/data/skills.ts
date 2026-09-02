// Skill data configuration file
// Used to manage data for the skill display page

export interface Skill {
	id: string;
	name: string;
	description: string;
	icon: string; // Iconify icon name
	category: "frontend" | "backend" | "database" | "tools" | "other";
	level: "beginner" | "intermediate" | "advanced" | "expert";
	experience: {
		years: number;
		months: number;
	};
	projects?: string[]; // Related project IDs
	certifications?: string[];
	color?: string; // Skill card theme color
}

export const skillsData: Skill[] = [
	{
		id: "java",
		name: "Java",
		description: "主力语言，熟悉 JavaWeb / JavaEE 开发，正在深入学习后端架构",
		icon: "logos:java",
		category: "backend",
		level: "intermediate",
		experience: { years: 2, months: 0 },
		color: "#f89820",
	},
	{
		id: "mysql",
		name: "MySQL",
		description: "关系型数据库，掌握常用 SQL、索引与基础调优",
		icon: "logos:mysql",
		category: "database",
		level: "intermediate",
		experience: { years: 1, months: 6 },
		color: "#00758f",
	},
	{
		id: "redis",
		name: "Redis",
		description: "缓存、会话存储与常用数据结构的使用",
		icon: "logos:redis",
		category: "database",
		level: "beginner",
		experience: { years: 1, months: 0 },
		color: "#d82c20",
	},
	{
		id: "html",
		name: "HTML",
		description: "语义化标签与页面结构搭建",
		icon: "logos:html-5",
		category: "frontend",
		level: "intermediate",
		experience: { years: 1, months: 6 },
		color: "#e34f26",
	},
	{
		id: "css",
		name: "CSS",
		description: "页面样式与布局，正在修炼 Flex / Grid",
		icon: "logos:css-3",
		category: "frontend",
		level: "beginner",
		experience: { years: 1, months: 6 },
		color: "#1572b6",
	},
	{
		id: "claude-code",
		name: "Claude Code",
		description: "AI 编程助手，日常开发提效神器",
		icon: "mdi:robot-outline",
		category: "tools",
		level: "intermediate",
		experience: { years: 0, months: 8 },
		color: "#d97757",
	},
	{
		id: "codex",
		name: "Codex",
		description: "OpenAI 的 AI 编程工具",
		icon: "mdi:robot-happy-outline",
		category: "tools",
		level: "beginner",
		experience: { years: 0, months: 6 },
		color: "#10a37f",
	},
	{
		id: "glm",
		name: "GLM",
		description: "智谱大模型，中文场景下很好用",
		icon: "mdi:thought-bubble-outline",
		category: "tools",
		level: "beginner",
		experience: { years: 0, months: 6 },
		color: "#3859ff",
	},
	{
		id: "gemini",
		name: "Gemini",
		description: "Google 的 AI 助手，查资料写文档两不误",
		icon: "mdi:star-four-points-outline",
		category: "tools",
		level: "beginner",
		experience: { years: 0, months: 8 },
		color: "#4285f4",
	},
];
