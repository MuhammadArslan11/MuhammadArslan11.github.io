CREATE TABLE IF NOT EXISTS documents (
  document_key TEXT PRIMARY KEY,
  version INTEGER NOT NULL DEFAULT 1,
  payload TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  updated_by TEXT
);

CREATE TABLE IF NOT EXISTS device_data (
  namespace TEXT NOT NULL,
  device_id TEXT NOT NULL,
  payload TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  PRIMARY KEY (namespace, device_id)
);

CREATE INDEX IF NOT EXISTS idx_device_data_updated_at ON device_data(updated_at);

