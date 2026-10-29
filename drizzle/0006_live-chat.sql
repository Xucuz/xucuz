CREATE TABLE chat_members (
  id text PRIMARY KEY,
  nickname text NOT NULL,
  nickname_key text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  banned_at timestamptz,
  ban_reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT chat_members_nickname_length CHECK (char_length(nickname) BETWEEN 3 AND 20)
);
--> statement-breakpoint
CREATE TABLE chat_sessions (
  session_hash text PRIMARY KEY,
  member_id text NOT NULL REFERENCES chat_members(id) ON DELETE CASCADE,
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
--> statement-breakpoint
CREATE INDEX chat_sessions_expiry_idx ON chat_sessions(expires_at);
--> statement-breakpoint
CREATE INDEX chat_sessions_member_idx ON chat_sessions(member_id);
--> statement-breakpoint
CREATE TABLE chat_messages (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  member_id text NOT NULL REFERENCES chat_members(id) ON DELETE CASCADE,
  nickname text NOT NULL,
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT chat_messages_body_length CHECK (char_length(body) BETWEEN 1 AND 500)
);
--> statement-breakpoint
CREATE INDEX chat_messages_created_idx ON chat_messages(created_at);
--> statement-breakpoint
CREATE INDEX chat_messages_member_created_idx ON chat_messages(member_id, created_at);
