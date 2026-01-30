export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      alerts: {
        Row: {
          alert_type: string
          channels: string[]
          id: string
          monitor_id: string
          sent_at: string | null
        }
        Insert: {
          alert_type: string
          channels: string[]
          id?: string
          monitor_id: string
          sent_at?: string | null
        }
        Update: {
          alert_type?: string
          channels?: string[]
          id?: string
          monitor_id?: string
          sent_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "alerts_monitor_id_fkey"
            columns: ["monitor_id"]
            isOneToOne: false
            referencedRelation: "monitors"
            referencedColumns: ["id"]
          },
        ]
      }
      job_runs: {
        Row: {
          completed_at: string | null
          created_at: string | null
          duration_ms: number | null
          id: string
          metadata: Json | null
          monitor_id: string
          run_id: string
          started_at: string
          status: string
          updated_at: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          duration_ms?: number | null
          id?: string
          metadata?: Json | null
          monitor_id: string
          run_id: string
          started_at: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          duration_ms?: number | null
          id?: string
          metadata?: Json | null
          monitor_id?: string
          run_id?: string
          started_at?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "job_runs_monitor_id_fkey"
            columns: ["monitor_id"]
            isOneToOne: false
            referencedRelation: "monitors"
            referencedColumns: ["id"]
          },
        ]
      }
      monitors: {
        Row: {
          alert_email: string | null
          created_at: string | null
          cron_expression: string | null
          custom_webhook_url: string | null
          disable_email_alerts: boolean | null
          discord_webhook_url: string | null
          expected_interval_seconds: number
          grace_period_seconds: number
          id: string
          last_ping_at: string | null
          max_execution_time_seconds: number | null
          name: string
          next_expected_ping_at: string | null
          payload_validation_rules: Json | null
          slack_webhook_url: string | null
          slug: string
          status: string
          updated_at: string | null
          user_id: string
          workspace_id: string | null
        }
        Insert: {
          alert_email?: string | null
          created_at?: string | null
          cron_expression?: string | null
          custom_webhook_url?: string | null
          disable_email_alerts?: boolean | null
          discord_webhook_url?: string | null
          expected_interval_seconds: number
          grace_period_seconds?: number
          id?: string
          last_ping_at?: string | null
          max_execution_time_seconds?: number | null
          name: string
          next_expected_ping_at?: string | null
          payload_validation_rules?: Json | null
          slack_webhook_url?: string | null
          slug: string
          status?: string
          updated_at?: string | null
          user_id: string
          workspace_id?: string | null
        }
        Update: {
          alert_email?: string | null
          created_at?: string | null
          cron_expression?: string | null
          custom_webhook_url?: string | null
          disable_email_alerts?: boolean | null
          discord_webhook_url?: string | null
          expected_interval_seconds?: number
          grace_period_seconds?: number
          id?: string
          last_ping_at?: string | null
          max_execution_time_seconds?: number | null
          name?: string
          next_expected_ping_at?: string | null
          payload_validation_rules?: Json | null
          slack_webhook_url?: string | null
          slug?: string
          status?: string
          updated_at?: string | null
          user_id?: string
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "monitors_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "monitors_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      pings: {
        Row: {
          duration_ms: number | null
          id: string
          message: string | null
          metadata: Json | null
          monitor_id: string
          received_at: string | null
          status: string
        }
        Insert: {
          duration_ms?: number | null
          id?: string
          message?: string | null
          metadata?: Json | null
          monitor_id: string
          received_at?: string | null
          status?: string
        }
        Update: {
          duration_ms?: number | null
          id?: string
          message?: string | null
          metadata?: Json | null
          monitor_id?: string
          received_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "pings_monitor_id_fkey"
            columns: ["monitor_id"]
            isOneToOne: false
            referencedRelation: "monitors"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          alert_email: string | null
          created_at: string | null
          custom_webhook_url: string | null
          disable_email_alerts: boolean | null
          discord_webhook_url: string | null
          email: string
          email_verified: boolean | null
          grace_period_ends_at: string | null
          id: string
          is_admin: boolean
          slack_webhook_url: string | null
          stripe_customer_id: string | null
          subscription_status: string | null
          subscription_tier: string | null
          updated_at: string | null
        }
        Insert: {
          alert_email?: string | null
          created_at?: string | null
          custom_webhook_url?: string | null
          disable_email_alerts?: boolean | null
          discord_webhook_url?: string | null
          email: string
          email_verified?: boolean | null
          grace_period_ends_at?: string | null
          id: string
          is_admin?: boolean
          slack_webhook_url?: string | null
          stripe_customer_id?: string | null
          subscription_status?: string | null
          subscription_tier?: string | null
          updated_at?: string | null
        }
        Update: {
          alert_email?: string | null
          created_at?: string | null
          custom_webhook_url?: string | null
          disable_email_alerts?: boolean | null
          discord_webhook_url?: string | null
          email?: string
          email_verified?: boolean | null
          grace_period_ends_at?: string | null
          id?: string
          is_admin?: boolean
          slack_webhook_url?: string | null
          stripe_customer_id?: string | null
          subscription_status?: string | null
          subscription_tier?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      workspace_members: {
        Row: {
          id: string
          invite_email: string | null
          invited_at: string | null
          invited_by: string | null
          joined_at: string | null
          role: string
          status: string | null
          user_id: string | null
          workspace_id: string
        }
        Insert: {
          id?: string
          invite_email?: string | null
          invited_at?: string | null
          invited_by?: string | null
          joined_at?: string | null
          role?: string
          status?: string | null
          user_id?: string | null
          workspace_id: string
        }
        Update: {
          id?: string
          invite_email?: string | null
          invited_at?: string | null
          invited_by?: string | null
          joined_at?: string | null
          role?: string
          status?: string | null
          user_id?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workspace_members_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workspace_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workspace_members_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      workspaces: {
        Row: {
          created_at: string | null
          grace_period_ends_at: string | null
          id: string
          max_members: number | null
          name: string
          owner_id: string
          slug: string
          stripe_customer_id: string | null
          subscription_status: string | null
          subscription_tier: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          grace_period_ends_at?: string | null
          id?: string
          max_members?: number | null
          name: string
          owner_id: string
          slug: string
          stripe_customer_id?: string | null
          subscription_status?: string | null
          subscription_tier?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          grace_period_ends_at?: string | null
          id?: string
          max_members?: number | null
          name?: string
          owner_id?: string
          slug?: string
          stripe_customer_id?: string | null
          subscription_status?: string | null
          subscription_tier?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workspaces_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cleanup_old_pings: {
        Args: { keep_count: number; monitor_id: string }
        Returns: undefined
      }
      trigger_timeout_check: { Args: never; Returns: undefined }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
