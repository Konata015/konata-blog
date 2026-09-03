interface Env {
	DIARY_IMAGES: {
		getWithMetadata: (
			key: string,
		) => Promise<{ value: any; metadata: any }>;
	};
}

export async function onRequestGet(context: {
	request: Request;
	env: Env;
	params: { path: string | string[] };
}): Promise<Response> {
	const rawPath = context.params.path;
	const parts = Array.isArray(rawPath)
		? rawPath
		: String(rawPath).split("/");
	const key = parts[0];
	if (!key || !/^img_[0-9a-f]{16}$/.test(key)) {
		return new Response("Not found", { status: 404 });
	}

	const { value, metadata } = await context.env.DIARY_IMAGES.getWithMetadata(
		key,
	);
	if (!value) {
		return new Response("Not found", { status: 404 });
	}
	const type =
		metadata && typeof metadata.type === "string" && metadata.type.startsWith("image/")
			? metadata.type
			: "application/octet-stream";
	return new Response(value, {
		headers: {
			"Content-Type": type,
			"Cache-Control": "public, max-age=31536000, immutable",
		},
	});
}
