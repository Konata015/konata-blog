CREATE TABLE IF NOT EXISTS diary (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	content TEXT NOT NULL,
	tags TEXT NOT NULL DEFAULT '[]',
	pinned INTEGER NOT NULL DEFAULT 0,
	created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS diary_attachments (
	id TEXT PRIMARY KEY,
	memo_id INTEGER NOT NULL,
	filename TEXT NOT NULL,
	type TEXT NOT NULL,
	size INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_diary_sort ON diary (pinned DESC, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_attachments_memo ON diary_attachments (memo_id);
