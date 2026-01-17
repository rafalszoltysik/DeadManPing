-- Schedule pg_cron job to call the Edge Function every minute
-- Note: This requires the http extension and proper configuration
-- The actual cron job should be set up via Supabase Dashboard or CLI

-- Example SQL to set up the cron job (run this manually in Supabase SQL Editor):
-- SELECT cron.schedule(
--   'check-timeouts',
--   '* * * * *', -- Every minute
--   $$
--   SELECT
--     net.http_post(
--       url:='https://YOUR_PROJECT_REF.supabase.co/functions/v1/check-timeouts',
--       headers:='{"Content-Type": "application/json", "Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"}'::jsonb
--     ) AS request_id;
--   $$
-- );

-- For now, we'll create a function that can be called manually or via external cron
CREATE OR REPLACE FUNCTION trigger_timeout_check()
RETURNS void AS $$
BEGIN
  -- This function can be called by external services (e.g., Vercel Cron)
  -- The actual HTTP call to Edge Function should be made from application code
  RAISE NOTICE 'Timeout check should be triggered via HTTP call to Edge Function';
END;
$$ LANGUAGE plpgsql;

