-- Add 'warn' alert type to alerts table
ALTER TABLE alerts 
  DROP CONSTRAINT IF EXISTS alerts_alert_type_check;

ALTER TABLE alerts 
  ADD CONSTRAINT alerts_alert_type_check 
  CHECK (alert_type IN ('missing', 'failed', 'recovered', 'warn'));

