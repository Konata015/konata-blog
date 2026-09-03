interface Env {
	DIARY_DB: {
		prepare: (sql: string) => any;
	};
	DIARY_IMAGES: {
		put: (key: string, value: ArrayBuffer, options?: any) => Promise<any>;
		delete: (key: string) => Promise<any>;
	};
	DIARY_ADMIN_PASSWORD?: string;
}

interface HandlerContext {
	request: Request;
	env: Env;
}

const MAX_CONTENT_LENGTH = 5000;
const MAX_IMAGES = 9;
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

function json(data: unknown, status = 200): Response {
	return new Response(JSON.stringify(data), {
		status,
		headers: { "Content-Type": "application/json; charset=utf-8" },
	});
}

function parseTags(raw: string): string[] {
	return raw
		.split(/[,，]/)
		.map((t) => t.trim())
		.filter((t) => t.length > 0 && t.length <= 20)
		.slice(0, 6);
}

function constantTimeEqual(a: Uint8Array, b: Uint8Array): boolean {
	if (a.length !== b.length) {
		return false;
	}
	let diff = 0;
	for (let i = 0; i < a.length; i++) {
		diff |= a[i] ^ b[i];
	}
	return diff === 0;
}

async function verifyAdmin(request: Request, env: Env): Promise<boolean> {
	const secret = env.DIARY_ADMIN_PASSWORD;
	if (!secret) {
		return false;
	}
	const provided = request.headers.get("x-admin-token") ?? "";
	if (!provided || provided.length > 200) {
		return false;
	}
	const encoder = new TextEncoder();
	const [providedHash, secretHash] = await Promise.all([
		crypto.subtle.digest("SHA-256", encoder.encode(provided)),
		crypto.subtle.digest("SHA-256", encoder.encode(secret)),
	]);
	return constantTimeEqual(
		new Uint8Array(providedHash),
		new Uint8Array(secretHash),
	);
}

function safeTags(raw: string): string[] {
	try {
		const parsed = JSON.parse(raw);
		return Array.isArray(parsed) ? parsed.map(String) : [];
	} catch {
		return [];
	}
}

export async function onRequestGet(context: HandlerContext): Promise<Response> {
	const { env } = context;
	const diaryRows = await env.DIARY_DB.prepare(
		"SELECT id, content, tags, pinned, created_at FROM diary ORDER BY pinned DESC, created_at DESC",
	).all<{
		id: number;
		content: string;
		tags: string;
		pinned: number;
		created_at: string;
	}>();
	const attachRows = await env.DIARY_DB.prepare(
		"SELECT id, memo_id, filename, type FROM diary_attachments",
	).all<{
		id: string;
		memo_id: number;
		filename: string;
		type: string;
	}>();

	const memos = diaryRows.results.map((row) => ({
		name: String(row.id),
		visibility: "PUBLIC",
		state: "NORMAL",
		createTime: row.created_at,
		content: row.content,
		tags: safeTags(row.tags),
		pinned: row.pinned === 1,
		attachments: attachRows.results
			.filter((a) => a.memo_id === row.id)
			.map((a) => ({
				name: a.id,
				filename: a.filename,
				type: a.type,
			})),
	}));
	return json({ memos });
}

export async function onRequestPost(
	context: HandlerContext,
): Promise<Response> {
	const { request, env } = context;
	if (!(await verifyAdmin(request, env))) {
		return json({ error: "管理密码错误" }, 401);
	}

	const contentType = request.headers.get("content-type") ?? "";
	let content = "";
	let tags: string[] = [];
	let pinned = false;
	const files: File[] = [];

	if (contentType.includes("multipart/form-data")) {
		const form = await request.formData();
		content = String(form.get("content") ?? "").trim();
		tags = parseTags(String(form.get("tags") ?? ""));
		pinned = String(form.get("pinned") ?? "") === "1";
		for (const value of form.getAll("images")) {
			if (value instanceof File && value.size > 0) {
				files.push(value);
			}
		}
	} else {
		const body = await request.json().catch(() => null);
		if (!body) {
			return json({ error: "请求格式错误" }, 400);
		}
		content = String(body.content ?? "").trim();
		tags = parseTags(String(body.tags ?? ""));
		pinned = Boolean(body.pinned);
	}

	if (!content) {
		return json({ error: "内容不能为空" }, 400);
	}
	if (content.length > MAX_CONTENT_LENGTH) {
		return json({ error: `内容过长（上限 ${MAX_CONTENT_LENGTH} 字）` }, 400);
	}
	if (files.length > MAX_IMAGES) {
		return json({ error: `图片最多 ${MAX_IMAGES} 张` }, 400);
	}
	for (const file of files) {
		if (!file.type.startsWith("image/")) {
			return json({ error: `不支持的文件类型: ${file.type || "未知"}` }, 400);
		}
		if (file.size > MAX_IMAGE_SIZE) {
			return json({ error: `图片过大（上限 5MB）: ${file.name}` }, 400);
		}
	}

	const now = new Date().toISOString().replace(/\.\d{3}Z$/, "Z");
	const insertResult = await env.DIARY_DB.prepare(
		"INSERT INTO diary (content, tags, pinned, created_at) VALUES (?1, ?2, ?3, ?4)",
	)
		.bind(content, JSON.stringify(tags), pinned ? 1 : 0, now)
		.run();
	const memoId = insertResult.meta.last_row_id;

	const attachments: { name: string; filename: string; type: string }[] = [];
	for (const file of files) {
		const key = `img_${crypto.randomUUID().replace(/-/g, "").slice(0, 16)}`;
		await env.DIARY_IMAGES.put(key, await file.arrayBuffer(), {
			metadata: { type: file.type, filename: file.name },
		});
		await env.DIARY_DB.prepare(
			"INSERT INTO diary_attachments (id, memo_id, filename, type, size) VALUES (?1, ?2, ?3, ?4, ?5)",
		)
			.bind(key, memoId, file.name, file.type, file.size)
			.run();
		attachments.push({ name: key, filename: file.name, type: file.type });
	}

	return json(
		{
			memo: {
				name: String(memoId),
				visibility: "PUBLIC",
				state: "NORMAL",
				createTime: now,
				content,
				tags,
				pinned,
				attachments,
			},
		},
		201,
	);
}

export async function onRequestDelete(
	context: HandlerContext,
): Promise<Response> {
	const { request, env } = context;
	if (!(await verifyAdmin(request, env))) {
		return json({ error: "管理密码错误" }, 401);
	}
	const id = Number(new URL(request.url).searchParams.get("id"));
	if (!Number.isInteger(id) || id <= 0) {
		return json({ error: "无效的 id" }, 400);
	}

	const attachRows = await env.DIARY_DB.prepare(
		"SELECT id FROM diary_attachments WHERE memo_id = ?1",
	)
		.bind(id)
		.all<{ id: string }>();
	for (const row of attachRows.results) {
		await env.DIARY_IMAGES.delete(row.id);
	}
	await env.DIARY_DB.prepare(
		"DELETE FROM diary_attachments WHERE memo_id = ?1",
	)
		.bind(id)
		.run();
	await env.DIARY_DB.prepare("DELETE FROM diary WHERE id = ?1")
		.bind(id)
		.run();
	return json({ ok: true });
}
