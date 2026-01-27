-- Migration: Fix RLS Performance Issues
-- Wraps all auth.uid() calls in subqueries to prevent re-evaluation for each row
-- This improves query performance at scale by ensuring auth.uid() is evaluated once per query

-- ============================================================================
-- PROFILES TABLE POLICIES
-- ============================================================================

-- Fix "Users can insert own profile"
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT 
  WITH CHECK ((select auth.uid()) = id);

-- Fix "Users can update own profile"
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING ((select auth.uid()) = id);

-- Fix "Users can view own profile"
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING ((select auth.uid()) = id);

-- ============================================================================
-- MONITORS TABLE POLICIES
-- ============================================================================

-- Fix "Users can view monitors in workspace"
DROP POLICY IF EXISTS "Users can view monitors in workspace" ON monitors;
CREATE POLICY "Users can view monitors in workspace" ON monitors
  FOR SELECT USING (
    workspace_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM workspace_members wm
      WHERE wm.workspace_id = monitors.workspace_id
      AND wm.user_id = (select auth.uid())
    )
  );

-- Fix "Users can insert monitors in workspace"
DROP POLICY IF EXISTS "Users can insert monitors in workspace" ON monitors;
CREATE POLICY "Users can insert monitors in workspace" ON monitors
  FOR INSERT WITH CHECK (
    workspace_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM workspace_members wm
      WHERE wm.workspace_id = monitors.workspace_id
      AND wm.user_id = (select auth.uid())
    )
  );

-- Fix "Users can update monitors in workspace"
DROP POLICY IF EXISTS "Users can update monitors in workspace" ON monitors;
CREATE POLICY "Users can update monitors in workspace" ON monitors
  FOR UPDATE USING (
    workspace_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM workspace_members wm
      WHERE wm.workspace_id = monitors.workspace_id
      AND wm.user_id = (select auth.uid())
    )
  );

-- Fix "Users can delete monitors in workspace"
DROP POLICY IF EXISTS "Users can delete monitors in workspace" ON monitors;
CREATE POLICY "Users can delete monitors in workspace" ON monitors
  FOR DELETE USING (
    workspace_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM workspace_members wm
      WHERE wm.workspace_id = monitors.workspace_id
      AND wm.user_id = (select auth.uid())
    )
  );

-- ============================================================================
-- PINGS TABLE POLICIES
-- ============================================================================

-- Fix "Users can view pings for workspace monitors"
DROP POLICY IF EXISTS "Users can view pings for workspace monitors" ON pings;
CREATE POLICY "Users can view pings for workspace monitors" ON pings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM monitors m
      JOIN workspace_members wm ON wm.workspace_id = m.workspace_id
      WHERE m.id = pings.monitor_id
      AND wm.user_id = (select auth.uid())
    )
  );

-- ============================================================================
-- ALERTS TABLE POLICIES
-- ============================================================================

-- Fix "Users can view alerts for workspace monitors"
DROP POLICY IF EXISTS "Users can view alerts for workspace monitors" ON alerts;
CREATE POLICY "Users can view alerts for workspace monitors" ON alerts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM monitors m
      JOIN workspace_members wm ON wm.workspace_id = m.workspace_id
      WHERE m.id = alerts.monitor_id
      AND wm.user_id = (select auth.uid())
    )
  );

-- ============================================================================
-- WORKSPACES TABLE POLICIES
-- ============================================================================

-- Fix "Users can create workspace"
DROP POLICY IF EXISTS "Users can create workspace" ON workspaces;
CREATE POLICY "Users can create workspace" ON workspaces
  FOR INSERT WITH CHECK (owner_id = (select auth.uid()));

-- Fix "Users can view workspace if member"
DROP POLICY IF EXISTS "Users can view workspace if member" ON workspaces;
CREATE POLICY "Users can view workspace if member" ON workspaces
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM workspace_members wm
      WHERE wm.workspace_id = workspaces.id
      AND wm.user_id = (select auth.uid())
    )
  );

-- Fix "Owners can update workspace (restricted)"
DROP POLICY IF EXISTS "Owners can update workspace (restricted)" ON workspaces;
CREATE POLICY "Owners can update workspace (restricted)" ON workspaces
  FOR UPDATE 
  USING (owner_id = (select auth.uid()))
  WITH CHECK (owner_id = (select auth.uid()));

-- ============================================================================
-- WORKSPACE_MEMBERS TABLE POLICIES
-- ============================================================================

-- Fix "Users can view workspace members"
DROP POLICY IF EXISTS "Users can view workspace members" ON workspace_members;
CREATE POLICY "Users can view workspace members" ON workspace_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM workspace_members wm2
      WHERE wm2.workspace_id = workspace_members.workspace_id
      AND wm2.user_id = (select auth.uid())
    )
  );

-- Fix "Owners/admins can add members"
DROP POLICY IF EXISTS "Owners/admins can add members" ON workspace_members;
CREATE POLICY "Owners/admins can add members" ON workspace_members
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM workspace_members wm
      WHERE wm.workspace_id = workspace_members.workspace_id
      AND wm.user_id = (select auth.uid())
      AND wm.role IN ('owner', 'admin')
    )
  );

-- Fix "Owners/admins can remove members"
DROP POLICY IF EXISTS "Owners/admins can remove members" ON workspace_members;
CREATE POLICY "Owners/admins can remove members" ON workspace_members
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM workspace_members wm
      WHERE wm.workspace_id = workspace_members.workspace_id
      AND wm.user_id = (select auth.uid())
      AND wm.role IN ('owner', 'admin')
    )
  );

-- ============================================================================
-- JOB_RUNS TABLE POLICIES
-- ============================================================================

-- Fix "Users can view job_runs for own monitors"
DROP POLICY IF EXISTS "Users can view job_runs for own monitors" ON job_runs;
CREATE POLICY "Users can view job_runs for own monitors" ON job_runs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM monitors 
      WHERE monitors.id = job_runs.monitor_id 
      AND monitors.user_id = (select auth.uid())
    )
  );

