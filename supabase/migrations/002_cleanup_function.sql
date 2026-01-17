-- Function to cleanup old pings (keep only N most recent per monitor)
CREATE OR REPLACE FUNCTION cleanup_old_pings(monitor_id UUID, keep_count INTEGER)
RETURNS void AS $$
BEGIN
  DELETE FROM pings
  WHERE pings.monitor_id = cleanup_old_pings.monitor_id
  AND pings.id NOT IN (
    SELECT id
    FROM pings
    WHERE pings.monitor_id = cleanup_old_pings.monitor_id
    ORDER BY received_at DESC
    LIMIT keep_count
  );
END;
$$ LANGUAGE plpgsql;

