ALTER TABLE ml_accounts ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'active' CHECK(status IN ('active','suspended','deletion_requested'));
ALTER TABLE ml_accounts ADD COLUMN IF NOT EXISTS session_version integer NOT NULL DEFAULT 0;
ALTER TABLE ml_profiles ADD COLUMN IF NOT EXISTS hidden boolean NOT NULL DEFAULT false;
ALTER TABLE ml_profiles ADD COLUMN IF NOT EXISTS service_radius_km integer NOT NULL DEFAULT 10 CHECK(service_radius_km BETWEEN 1 AND 100);
ALTER TABLE ml_publications ADD COLUMN IF NOT EXISTS latitude double precision;
ALTER TABLE ml_publications ADD COLUMN IF NOT EXISTS longitude double precision;
ALTER TABLE ml_publications ADD COLUMN IF NOT EXISTS service_status text NOT NULL DEFAULT 'pendente' CHECK(service_status IN ('pendente','finalizado'));
ALTER TABLE ml_publications ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE ml_messages ADD COLUMN IF NOT EXISTS removed boolean NOT NULL DEFAULT false;
ALTER TABLE ml_reports ALTER COLUMN publication_id DROP NOT NULL;
ALTER TABLE ml_reports ADD COLUMN IF NOT EXISTS target_type text NOT NULL DEFAULT 'publication' CHECK(target_type IN ('publication','profile','message'));
ALTER TABLE ml_reports ADD COLUMN IF NOT EXISTS target_id uuid;
UPDATE ml_reports SET target_id=publication_id WHERE target_id IS NULL;
ALTER TABLE ml_reports ALTER COLUMN target_id SET NOT NULL;
ALTER TABLE ml_reports ADD COLUMN IF NOT EXISTS decision text CHECK(decision IN ('keep','remove','suspend'));
WITH duplicates AS (SELECT id,row_number() OVER(PARTITION BY reporter_id,target_type,target_id ORDER BY created_at,id) AS n FROM ml_reports WHERE reviewed_at IS NULL) UPDATE ml_reports SET reviewed_at=now(),review_note='Denúncia duplicada consolidada durante migration 002, conteúdo preservado.' WHERE id IN(SELECT id FROM duplicates WHERE n>1);
CREATE UNIQUE INDEX IF NOT EXISTS ml_reports_pending_unique ON ml_reports(reporter_id,target_type,target_id) WHERE reviewed_at IS NULL;
CREATE TABLE IF NOT EXISTS ml_moderation_actions (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), report_id uuid UNIQUE REFERENCES ml_reports(id),
 moderator_id uuid NOT NULL REFERENCES ml_accounts(id), target_type text NOT NULL, target_id uuid NOT NULL,
 decision text NOT NULL, note text NOT NULL, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE OR REPLACE RULE ml_moderation_no_update AS ON UPDATE TO ml_moderation_actions DO INSTEAD NOTHING;
CREATE OR REPLACE RULE ml_moderation_no_delete AS ON DELETE TO ml_moderation_actions DO INSTEAD NOTHING;
CREATE TABLE IF NOT EXISTS ml_deletion_requests (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), account_id uuid NOT NULL UNIQUE REFERENCES ml_accounts(id),
 created_at timestamptz NOT NULL DEFAULT now(), completed_at timestamptz
);
CREATE TABLE IF NOT EXISTS ml_request_limits (
 subject text NOT NULL, scope text NOT NULL, window_start timestamptz NOT NULL,
 count integer NOT NULL, expires_at timestamptz NOT NULL, PRIMARY KEY(subject,scope,window_start)
);
CREATE INDEX IF NOT EXISTS ml_request_limits_expiry ON ml_request_limits(expires_at);
CREATE TABLE IF NOT EXISTS ml_media_slots (
 owner_id uuid NOT NULL REFERENCES ml_accounts(id), slot integer NOT NULL CHECK(slot BETWEEN 1 AND 10),
 reservation_id uuid NOT NULL UNIQUE, reserved_at timestamptz NOT NULL DEFAULT now(),
 url text UNIQUE, PRIMARY KEY(owner_id,slot)
);
INSERT INTO ml_media_slots(owner_id,slot,reservation_id,reserved_at,url)
SELECT owner_id,position::integer,id,created_at,url FROM (
 SELECT m.*,row_number() OVER(PARTITION BY owner_id ORDER BY created_at,id) AS position FROM ml_media m
) numbered WHERE position<=10 ON CONFLICT DO NOTHING;
CREATE INDEX IF NOT EXISTS ml_profiles_region ON ml_profiles(lower(city),lower(neighborhood),category,updated_at DESC,user_id);
CREATE INDEX IF NOT EXISTS ml_publications_region ON ml_publications(lower(city),category,status,created_at DESC,id);
CREATE INDEX IF NOT EXISTS ml_conversations_author ON ml_conversations(author_id,created_at DESC,id);
CREATE INDEX IF NOT EXISTS ml_conversations_initiator ON ml_conversations(initiator_id,created_at DESC,id);
CREATE TABLE IF NOT EXISTS ml_blob_deletions (
 url text PRIMARY KEY, queued_at timestamptz NOT NULL DEFAULT now(), attempts integer NOT NULL DEFAULT 0
);
