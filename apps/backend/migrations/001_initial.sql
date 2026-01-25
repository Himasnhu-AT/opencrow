CREATE TABLE products (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  openapi_url TEXT NOT NULL,
  base_url TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE messages (
  id SERIAL PRIMARY KEY,
  product_id VARCHAR(255) REFERENCES products(id),
  session_id VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL,
  content TEXT NOT NULL,
  functions_called JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE analytics_events (
  id SERIAL PRIMARY KEY,
  product_id VARCHAR(255) REFERENCES products(id),
  event_type VARCHAR(50) NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_messages_session ON messages(session_id);
CREATE INDEX idx_messages_product ON messages(product_id);
CREATE INDEX idx_analytics_product ON analytics_events(product_id);
