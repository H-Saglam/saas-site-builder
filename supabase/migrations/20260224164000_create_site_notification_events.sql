CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS site_notification_events (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  site_id uuid NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  notification_type text NOT NULL CHECK (
    notification_type IN (
      'expiration_warning_7d',
      'expiration_warning_3d',
      'expiration_warning_1d',
      'edit_window_reminder_1d',
      'draft_reminder_24h'
    )
  ),
  trigger_key text NOT NULL,
  status text NOT NULL DEFAULT 'processing' CHECK (status IN ('processing', 'sent')),
  recipient_email text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  sent_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (site_id, notification_type, trigger_key)
);

CREATE INDEX IF NOT EXISTS idx_site_notification_events_status_created_at
  ON site_notification_events (status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_site_notification_events_site_id
  ON site_notification_events (site_id);

CREATE INDEX IF NOT EXISTS idx_site_notification_events_sent_at
  ON site_notification_events (sent_at DESC);

ALTER TABLE IF EXISTS email_template_overrides
  DROP CONSTRAINT IF EXISTS email_template_overrides_template_key_check;

ALTER TABLE IF EXISTS email_template_overrides
  ADD CONSTRAINT email_template_overrides_template_key_check CHECK (
    template_key IN (
      'welcome',
      'payment_success',
      'admin_sale_alert',
      'site_expiration_warning',
      'edit_window_reminder',
      'draft_reminder'
    )
  );
