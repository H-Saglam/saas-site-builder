CREATE TABLE IF NOT EXISTS email_template_overrides (
  template_key text PRIMARY KEY CHECK (template_key IN ('welcome', 'payment_success', 'admin_sale_alert')),
  subject text NOT NULL,
  preheader text NOT NULL,
  eyebrow text NOT NULL,
  title text NOT NULL,
  subtitle text NOT NULL,
  body_html text NOT NULL,
  text_body text NOT NULL,
  cta_label text,
  footer_html text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_email_template_overrides_updated_at
  ON email_template_overrides (updated_at DESC);
