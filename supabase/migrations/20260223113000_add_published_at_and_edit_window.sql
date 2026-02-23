ALTER TABLE sites
ADD COLUMN IF NOT EXISTS published_at timestamptz;

-- Backfill active records so edit window can be enforced immediately.
UPDATE sites
SET published_at = COALESCE(published_at, updated_at, created_at)
WHERE status = 'active'
  AND published_at IS NULL;

-- Keep dashboard summary view in sync with the new field.
CREATE OR REPLACE VIEW sites_summary WITH (security_invoker = true) AS
SELECT
  id,
  user_id,
  slug,
  title,
  recipient_name,
  template_id,
  status,
  package_type,
  is_private,
  music_id,
  expires_at,
  created_at,
  updated_at,
  COALESCE(jsonb_array_length(slides), 0) as slides_count,
  slides->0 as first_slide,
  published_at
FROM sites;
