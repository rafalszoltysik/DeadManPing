-- Migration: Add Job Runs table and Max Execution Time support
-- This migration adds support for tracking concurrent job runs and detecting zombie jobs

-- Create job_runs table to track individual job executions
CREATE TABLE IF NOT EXISTS job_runs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  monitor_id UUID NOT NULL REFERENCES monitors(id) ON DELETE CASCADE,
  run_id TEXT NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'running' CHECK (status IN ('running', 'completed', 'timeout', 'failed')),
  duration_ms INTEGER,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(monitor_id, run_id)
);

-- Add max_execution_time_seconds column to monitors table
ALTER TABLE monitors 
ADD COLUMN IF NOT EXISTS max_execution_time_seconds INTEGER;

-- Add comment explaining the column
COMMENT ON COLUMN monitors.max_execution_time_seconds IS 
'Maximum time a job can run before being marked as timeout (in seconds). If NULL, timeout detection is disabled for this monitor.';

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_job_runs_monitor_started ON job_runs(monitor_id, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_job_runs_running ON job_runs(monitor_id, status) WHERE status = 'running';
CREATE INDEX IF NOT EXISTS idx_job_runs_monitor_id ON job_runs(monitor_id);

-- Add trigger to update updated_at timestamp
CREATE TRIGGER update_job_runs_updated_at BEFORE UPDATE ON job_runs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE job_runs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for job_runs

-- Users can view job_runs for their monitors
CREATE POLICY "Users can view job_runs for own monitors" ON job_runs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM monitors 
      WHERE monitors.id = job_runs.monitor_id 
      AND monitors.user_id = auth.uid()
    )
  );

-- Allow service role to insert/update job_runs (for API endpoints)
CREATE POLICY "Service role can insert job_runs" ON job_runs
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Service role can update job_runs" ON job_runs
  FOR UPDATE USING (true);

