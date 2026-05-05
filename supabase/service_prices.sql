-- Service price overrides — admin-editable prices that override content.ts defaults
CREATE TABLE IF NOT EXISTS service_prices (
  name        text PRIMARY KEY,
  price       numeric(10,2) NOT NULL,
  price_note  text,
  updated_at  timestamptz DEFAULT now()
);

-- Public can read prices (they are displayed on the site)
CREATE POLICY "Public can read service prices"
  ON service_prices FOR SELECT TO anon, authenticated
  USING (true);
