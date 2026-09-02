// 本地番剧数据配置 —— Konata 的乐队番收藏
export interface AnimeItem {
	title: string;
	status: "watching" | "completed" | "planned";
	rating: number;
	cover: string;
	description: string;
	episodes: string;
	year: string;
	genre: string[];
	studio: string;
	link: string;
	progress: number;
	totalEpisodes: number;
	startDate: string;
	endDate: string;
}

const localAnimeList: AnimeItem[] = [
	{
		title: "孤独摇滚！",
		status: "completed",
		rating: 9.9,
		cover: "/assets/anime/cover-bocchi.webp",
		description: "社恐吉他英雄波奇酱的摇滚日常，吹爆!!",
		episodes: "12 episodes",
		year: "2022",
		genre: ["音乐", "喜剧", "治愈"],
		studio: "CloverWorks",
		link: "https://search.bilibili.com/all?keyword=孤独摇滚",
		progress: 12,
		totalEpisodes: 12,
		startDate: "2022-10",
		endDate: "2022-12",
	},
	{
		title: "轻音少女 K-ON!",
		status: "completed",
		rating: 9.9,
		cover: "/assets/anime/cover-k-on.webp",
		description: "放学后茶话部，丢弃』是永远的神曲",
		episodes: "13 episodes (含OVA)",
		year: "2009",
		genre: ["音乐", "日常", "百合"],
		studio: "京都动画",
		link: "https://search.bilibili.com/all?keyword=轻音少女",
		progress: 13,
		totalEpisodes: 13,
		startDate: "2009-04",
		endDate: "2009-06",
	},
	{
		title: "BanG Dream! It's MyGO!!!!!",
		status: "completed",
		rating: 9.6,
		cover: "/assets/anime/cover-mygo.webp",
		description: "一辈子……乐队是什么样的呢？迷子でもいい、迷子でも進め",
		episodes: "13 episodes",
		year: "2023",
		genre: ["音乐", "少女乐队", "剧情"],
		studio: "SANZIGEN",
		link: "https://search.bilibili.com/all?keyword=MyGO",
		progress: 13,
		totalEpisodes: 13,
		startDate: "2023-06",
		endDate: "2023-09",
	},
	{
		title: "幸运星",
		status: "completed",
		rating: 9.4,
		cover: "/assets/anime/cover-konata.webp",
		description: "此方就是我的本体，宅属性圣典",
		episodes: "24 episodes",
		year: "2007",
		genre: ["搞笑", "日常", "宅向"],
		studio: "京都动画",
		link: "https://search.bilibili.com/all?keyword=幸运星",
		progress: 24,
		totalEpisodes: 24,
		startDate: "2007-04",
		endDate: "2007-09",
	},
];

export default localAnimeList;
