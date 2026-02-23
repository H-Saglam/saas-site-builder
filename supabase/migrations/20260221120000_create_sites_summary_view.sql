-- Create a lightweight view for listing sites without fetching the full slides JSON
-- This optimizes the dashboard list performance significantly.
-- security_invoker = true ensures RLS policies on 'sites' table are applied.

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
  slides->0 as first_slide
FROM sites;
