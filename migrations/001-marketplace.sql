CREATE TABLE IF NOT EXISTS ml_accounts (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), google_sub text NOT NULL UNIQUE,
 name text NOT NULL, email text NOT NULL, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS ml_profiles (
 user_id uuid PRIMARY KEY REFERENCES ml_accounts(id), bio text NOT NULL DEFAULT '',
 category text NOT NULL, city text NOT NULL, neighborhood text NOT NULL,
 portfolio text NOT NULL DEFAULT '', updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS ml_publications (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), author_id uuid NOT NULL REFERENCES ml_accounts(id),
 type text NOT NULL CHECK(type IN ('contratar','disponivel')), category text NOT NULL,
 title text NOT NULL CHECK(length(title) BETWEEN 3 AND 120),
 description text NOT NULL CHECK(length(description) BETWEEN 10 AND 2000),
 city text NOT NULL, neighborhood text NOT NULL,
 price_minor integer CHECK(price_minor > 0), price_unit text NOT NULL CHECK(price_unit IN ('hora','diaria','servico','m2')),
 starts_at timestamptz NOT NULL, ends_at timestamptz NOT NULL CHECK(ends_at > starts_at),
 status text NOT NULL DEFAULT 'active' CHECK(status IN ('active','paused','closed')),
 version integer NOT NULL DEFAULT 1, request_id uuid NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now(), UNIQUE(author_id, request_id)
);
CREATE INDEX IF NOT EXISTS ml_publications_feed ON ml_publications(status, ends_at, created_at DESC);
CREATE INDEX IF NOT EXISTS ml_publications_author ON ml_publications(author_id);
CREATE TABLE IF NOT EXISTS ml_conversations (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), publication_id uuid NOT NULL REFERENCES ml_publications(id),
 author_id uuid NOT NULL REFERENCES ml_accounts(id), initiator_id uuid NOT NULL REFERENCES ml_accounts(id),
 created_at timestamptz NOT NULL DEFAULT now(), CHECK(author_id <> initiator_id),
 UNIQUE(publication_id, initiator_id)
);
CREATE TABLE IF NOT EXISTS ml_blocks (
 blocker_id uuid NOT NULL REFERENCES ml_accounts(id), blocked_id uuid NOT NULL REFERENCES ml_accounts(id),
 PRIMARY KEY(blocker_id, blocked_id), CHECK(blocker_id <> blocked_id)
);
CREATE TABLE IF NOT EXISTS ml_messages (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), conversation_id uuid NOT NULL REFERENCES ml_conversations(id),
 sender_id uuid NOT NULL REFERENCES ml_accounts(id), body text NOT NULL CHECK(length(body) BETWEEN 1 AND 2000),
 client_id uuid NOT NULL, created_at timestamptz NOT NULL DEFAULT now(), UNIQUE(sender_id, client_id)
);
CREATE INDEX IF NOT EXISTS ml_messages_conversation ON ml_messages(conversation_id, created_at, id);
CREATE TABLE IF NOT EXISTS ml_reports (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), reporter_id uuid NOT NULL REFERENCES ml_accounts(id),
 publication_id uuid NOT NULL REFERENCES ml_publications(id), reason text NOT NULL CHECK(length(reason) BETWEEN 5 AND 1000),
 created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE ml_profiles ADD COLUMN IF NOT EXISTS latitude double precision;
ALTER TABLE ml_profiles ADD COLUMN IF NOT EXISTS longitude double precision;
ALTER TABLE ml_profiles ADD COLUMN IF NOT EXISTS images jsonb NOT NULL DEFAULT '[]';
CREATE TABLE IF NOT EXISTS ml_media (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), owner_id uuid NOT NULL REFERENCES ml_accounts(id),
 url text NOT NULL UNIQUE, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS ml_rate_limits (
 account_id uuid NOT NULL REFERENCES ml_accounts(id), minute timestamptz NOT NULL, count integer NOT NULL,
 PRIMARY KEY(account_id,minute)
);
ALTER TABLE ml_publications DROP CONSTRAINT IF EXISTS ml_publications_status_check;
ALTER TABLE ml_publications ADD CONSTRAINT ml_publications_status_check CHECK(status IN ('active','paused','closed','removed'));
ALTER TABLE ml_reports ADD COLUMN IF NOT EXISTS reviewed_at timestamptz;
ALTER TABLE ml_reports ADD COLUMN IF NOT EXISTS review_note text;
ALTER TABLE ml_reports ADD COLUMN IF NOT EXISTS reviewed_by uuid REFERENCES ml_accounts(id);
