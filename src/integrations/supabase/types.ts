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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      achievements: {
        Row: {
          category: string
          created_at: string | null
          criteria: Json
          description: string
          icon_url: string | null
          id: string
          is_active: boolean | null
          name: string
          points_value: number | null
          rarity: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          criteria: Json
          description: string
          icon_url?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          points_value?: number | null
          rarity?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          criteria?: Json
          description?: string
          icon_url?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          points_value?: number | null
          rarity?: string | null
        }
        Relationships: []
      }
      ai_insights: {
        Row: {
          applied_at: string | null
          branch_id: string | null
          confidence_score: number | null
          created_at: string | null
          data_sources: string[] | null
          description: string
          effectiveness_score: number | null
          expires_at: string | null
          id: string
          insight_type: string
          is_applied: boolean | null
          recommendation_data: Json | null
          title: string
          user_id: string | null
        }
        Insert: {
          applied_at?: string | null
          branch_id?: string | null
          confidence_score?: number | null
          created_at?: string | null
          data_sources?: string[] | null
          description: string
          effectiveness_score?: number | null
          expires_at?: string | null
          id?: string
          insight_type: string
          is_applied?: boolean | null
          recommendation_data?: Json | null
          title: string
          user_id?: string | null
        }
        Update: {
          applied_at?: string | null
          branch_id?: string | null
          confidence_score?: number | null
          created_at?: string | null
          data_sources?: string[] | null
          description?: string
          effectiveness_score?: number | null
          expires_at?: string | null
          id?: string
          insight_type?: string
          is_applied?: boolean | null
          recommendation_data?: Json | null
          title?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_insights_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_insights_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      analytics_events: {
        Row: {
          branch_id: string | null
          created_at: string | null
          event_category: string
          event_name: string
          id: string
          properties: Json | null
          session_id: string | null
          user_id: string | null
        }
        Insert: {
          branch_id?: string | null
          created_at?: string | null
          event_category: string
          event_name: string
          id?: string
          properties?: Json | null
          session_id?: string | null
          user_id?: string | null
        }
        Update: {
          branch_id?: string | null
          created_at?: string | null
          event_category?: string
          event_name?: string
          id?: string
          properties?: Json | null
          session_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "analytics_events_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analytics_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      announcements: {
        Row: {
          branch_ids: string[] | null
          content: string
          created_at: string
          created_by: string | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          notification_type:
            | Database["public"]["Enums"]["notification_type"]
            | null
          priority: number | null
          target_roles: string[] | null
          title: string
        }
        Insert: {
          branch_ids?: string[] | null
          content: string
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          notification_type?:
            | Database["public"]["Enums"]["notification_type"]
            | null
          priority?: number | null
          target_roles?: string[] | null
          title: string
        }
        Update: {
          branch_ids?: string[] | null
          content?: string
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          notification_type?:
            | Database["public"]["Enums"]["notification_type"]
            | null
          priority?: number | null
          target_roles?: string[] | null
          title?: string
        }
        Relationships: []
      }
      attendance_records: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          branch_id: string | null
          check_in_time: string
          check_out_time: string | null
          class_id: string | null
          created_at: string
          device_id: string | null
          device_location: string | null
          duration: number | null
          entry_method: Database["public"]["Enums"]["entry_method"] | null
          expected_check_in: string | null
          id: string
          is_late: boolean | null
          location: Json | null
          membership_id: string | null
          notes: string | null
          status: Database["public"]["Enums"]["attendance_status"] | null
          updated_at: string
          user_id: string
          work_shift_id: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          branch_id?: string | null
          check_in_time: string
          check_out_time?: string | null
          class_id?: string | null
          created_at?: string
          device_id?: string | null
          device_location?: string | null
          duration?: number | null
          entry_method?: Database["public"]["Enums"]["entry_method"] | null
          expected_check_in?: string | null
          id?: string
          is_late?: boolean | null
          location?: Json | null
          membership_id?: string | null
          notes?: string | null
          status?: Database["public"]["Enums"]["attendance_status"] | null
          updated_at?: string
          user_id: string
          work_shift_id?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          branch_id?: string | null
          check_in_time?: string
          check_out_time?: string | null
          class_id?: string | null
          created_at?: string
          device_id?: string | null
          device_location?: string | null
          duration?: number | null
          entry_method?: Database["public"]["Enums"]["entry_method"] | null
          expected_check_in?: string | null
          id?: string
          is_late?: boolean | null
          location?: Json | null
          membership_id?: string | null
          notes?: string | null
          status?: Database["public"]["Enums"]["attendance_status"] | null
          updated_at?: string
          user_id?: string
          work_shift_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "attendance_records_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_records_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "gym_classes"
            referencedColumns: ["id"]
          },
        ]
      }
      biometric_devices: {
        Row: {
          branch_id: string | null
          created_at: string
          id: string
          ip_address: unknown | null
          is_active: boolean | null
          last_sync: string | null
          location: string | null
          model: string | null
          name: string
          settings: Json | null
          status: Database["public"]["Enums"]["device_status"] | null
          total_records: number | null
          updated_at: string
        }
        Insert: {
          branch_id?: string | null
          created_at?: string
          id?: string
          ip_address?: unknown | null
          is_active?: boolean | null
          last_sync?: string | null
          location?: string | null
          model?: string | null
          name: string
          settings?: Json | null
          status?: Database["public"]["Enums"]["device_status"] | null
          total_records?: number | null
          updated_at?: string
        }
        Update: {
          branch_id?: string | null
          created_at?: string
          id?: string
          ip_address?: unknown | null
          is_active?: boolean | null
          last_sync?: string | null
          location?: string | null
          model?: string | null
          name?: string
          settings?: Json | null
          status?: Database["public"]["Enums"]["device_status"] | null
          total_records?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "biometric_devices_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
        ]
      }
      branch_analytics: {
        Row: {
          branch_id: string
          churned_members: number | null
          created_at: string | null
          equipment_utilization: number | null
          id: string
          member_satisfaction_avg: number | null
          membership_revenue: number | null
          month_year: string
          new_members: number | null
          peak_capacity_usage: number | null
          retail_revenue: number | null
          total_check_ins: number | null
          total_members: number | null
          total_revenue: number | null
          trainer_utilization: number | null
          training_revenue: number | null
          updated_at: string | null
        }
        Insert: {
          branch_id: string
          churned_members?: number | null
          created_at?: string | null
          equipment_utilization?: number | null
          id?: string
          member_satisfaction_avg?: number | null
          membership_revenue?: number | null
          month_year: string
          new_members?: number | null
          peak_capacity_usage?: number | null
          retail_revenue?: number | null
          total_check_ins?: number | null
          total_members?: number | null
          total_revenue?: number | null
          trainer_utilization?: number | null
          training_revenue?: number | null
          updated_at?: string | null
        }
        Update: {
          branch_id?: string
          churned_members?: number | null
          created_at?: string | null
          equipment_utilization?: number | null
          id?: string
          member_satisfaction_avg?: number | null
          membership_revenue?: number | null
          month_year?: string
          new_members?: number | null
          peak_capacity_usage?: number | null
          retail_revenue?: number | null
          total_check_ins?: number | null
          total_members?: number | null
          total_revenue?: number | null
          trainer_utilization?: number | null
          training_revenue?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "branch_analytics_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
        ]
      }
      branches: {
        Row: {
          address: Json
          amenities: string[] | null
          capacity: number
          contact: Json
          created_at: string
          current_members: number
          gym_id: string | null
          hours: Json
          id: string
          images: string[] | null
          manager_id: string | null
          name: string
          status: string
          updated_at: string
        }
        Insert: {
          address: Json
          amenities?: string[] | null
          capacity?: number
          contact: Json
          created_at?: string
          current_members?: number
          gym_id?: string | null
          hours: Json
          id?: string
          images?: string[] | null
          manager_id?: string | null
          name: string
          status?: string
          updated_at?: string
        }
        Update: {
          address?: Json
          amenities?: string[] | null
          capacity?: number
          contact?: Json
          created_at?: string
          current_members?: number
          gym_id?: string | null
          hours?: Json
          id?: string
          images?: string[] | null
          manager_id?: string | null
          name?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "branches_gym_id_fkey"
            columns: ["gym_id"]
            isOneToOne: false
            referencedRelation: "gyms"
            referencedColumns: ["id"]
          },
        ]
      }
      class_enrollments: {
        Row: {
          class_id: string
          enrolled_at: string
          id: string
          member_id: string
          notes: string | null
          status: string | null
        }
        Insert: {
          class_id: string
          enrolled_at?: string
          id?: string
          member_id: string
          notes?: string | null
          status?: string | null
        }
        Update: {
          class_id?: string
          enrolled_at?: string
          id?: string
          member_id?: string
          notes?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "class_enrollments_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "gym_classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "class_enrollments_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      credit_transactions: {
        Row: {
          amount: number
          created_at: string
          description: string | null
          id: string
          reference_id: string | null
          transaction_type: string
          user_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          description?: string | null
          id?: string
          reference_id?: string | null
          transaction_type: string
          user_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string | null
          id?: string
          reference_id?: string | null
          transaction_type?: string
          user_id?: string | null
        }
        Relationships: []
      }
      dashboard_metrics: {
        Row: {
          branch_id: string | null
          created_at: string | null
          id: string
          metric_date: string | null
          metric_name: string
          metric_value: number
        }
        Insert: {
          branch_id?: string | null
          created_at?: string | null
          id?: string
          metric_date?: string | null
          metric_name: string
          metric_value: number
        }
        Update: {
          branch_id?: string | null
          created_at?: string | null
          id?: string
          metric_date?: string | null
          metric_name?: string
          metric_value?: number
        }
        Relationships: [
          {
            foreignKeyName: "dashboard_metrics_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
        ]
      }
      diet_plans: {
        Row: {
          branch_id: string | null
          calorie_target: number | null
          created_at: string | null
          created_by: string | null
          description: string | null
          dietary_restrictions: string[] | null
          difficulty: Database["public"]["Enums"]["plan_difficulty"]
          duration_weeks: number | null
          id: string
          is_template: boolean | null
          macros: Json | null
          meal_plan: Json | null
          name: string
          status: Database["public"]["Enums"]["plan_status"] | null
          target_goals: string[] | null
          updated_at: string | null
        }
        Insert: {
          branch_id?: string | null
          calorie_target?: number | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          dietary_restrictions?: string[] | null
          difficulty: Database["public"]["Enums"]["plan_difficulty"]
          duration_weeks?: number | null
          id?: string
          is_template?: boolean | null
          macros?: Json | null
          meal_plan?: Json | null
          name: string
          status?: Database["public"]["Enums"]["plan_status"] | null
          target_goals?: string[] | null
          updated_at?: string | null
        }
        Update: {
          branch_id?: string | null
          calorie_target?: number | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          dietary_restrictions?: string[] | null
          difficulty?: Database["public"]["Enums"]["plan_difficulty"]
          duration_weeks?: number | null
          id?: string
          is_template?: boolean | null
          macros?: Json | null
          meal_plan?: Json | null
          name?: string
          status?: Database["public"]["Enums"]["plan_status"] | null
          target_goals?: string[] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "diet_plans_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "diet_plans_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      discount_codes: {
        Row: {
          applicable_to: string[] | null
          branch_id: string | null
          code: string
          created_at: string | null
          created_by: string | null
          description: string | null
          discount_type: string
          discount_value: number
          id: string
          is_active: boolean | null
          max_discount_amount: number | null
          min_purchase_amount: number | null
          updated_at: string | null
          usage_count: number | null
          usage_limit: number | null
          valid_from: string | null
          valid_until: string | null
        }
        Insert: {
          applicable_to?: string[] | null
          branch_id?: string | null
          code: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          discount_type: string
          discount_value: number
          id?: string
          is_active?: boolean | null
          max_discount_amount?: number | null
          min_purchase_amount?: number | null
          updated_at?: string | null
          usage_count?: number | null
          usage_limit?: number | null
          valid_from?: string | null
          valid_until?: string | null
        }
        Update: {
          applicable_to?: string[] | null
          branch_id?: string | null
          code?: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          discount_type?: string
          discount_value?: number
          id?: string
          is_active?: boolean | null
          max_discount_amount?: number | null
          min_purchase_amount?: number | null
          updated_at?: string | null
          usage_count?: number | null
          usage_limit?: number | null
          valid_from?: string | null
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "discount_codes_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
        ]
      }
      email_templates: {
        Row: {
          body: string
          branch_id: string | null
          created_at: string | null
          created_by: string | null
          id: string
          is_active: boolean | null
          name: string
          subject: string
          type: Database["public"]["Enums"]["email_template_type"]
          updated_at: string | null
          variables: Json | null
        }
        Insert: {
          body: string
          branch_id?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          subject: string
          type: Database["public"]["Enums"]["email_template_type"]
          updated_at?: string | null
          variables?: Json | null
        }
        Update: {
          body?: string
          branch_id?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          subject?: string
          type?: Database["public"]["Enums"]["email_template_type"]
          updated_at?: string | null
          variables?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "email_templates_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_templates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      equipment: {
        Row: {
          branch_id: string | null
          brand: string | null
          category: string
          condition: Database["public"]["Enums"]["equipment_condition"] | null
          created_at: string | null
          current_value: number | null
          id: string
          images: string[] | null
          last_maintenance_date: string | null
          location: string | null
          maintenance_schedule: Json | null
          model: string | null
          name: string
          next_maintenance_date: string | null
          notes: string | null
          purchase_date: string | null
          purchase_price: number | null
          serial_number: string | null
          specifications: Json | null
          status: Database["public"]["Enums"]["equipment_status"] | null
          updated_at: string | null
          warranty_expiry: string | null
        }
        Insert: {
          branch_id?: string | null
          brand?: string | null
          category: string
          condition?: Database["public"]["Enums"]["equipment_condition"] | null
          created_at?: string | null
          current_value?: number | null
          id?: string
          images?: string[] | null
          last_maintenance_date?: string | null
          location?: string | null
          maintenance_schedule?: Json | null
          model?: string | null
          name: string
          next_maintenance_date?: string | null
          notes?: string | null
          purchase_date?: string | null
          purchase_price?: number | null
          serial_number?: string | null
          specifications?: Json | null
          status?: Database["public"]["Enums"]["equipment_status"] | null
          updated_at?: string | null
          warranty_expiry?: string | null
        }
        Update: {
          branch_id?: string | null
          brand?: string | null
          category?: string
          condition?: Database["public"]["Enums"]["equipment_condition"] | null
          created_at?: string | null
          current_value?: number | null
          id?: string
          images?: string[] | null
          last_maintenance_date?: string | null
          location?: string | null
          maintenance_schedule?: Json | null
          model?: string | null
          name?: string
          next_maintenance_date?: string | null
          notes?: string | null
          purchase_date?: string | null
          purchase_price?: number | null
          serial_number?: string | null
          specifications?: Json | null
          status?: Database["public"]["Enums"]["equipment_status"] | null
          updated_at?: string | null
          warranty_expiry?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "equipment_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
        ]
      }
      equipment_analytics: {
        Row: {
          created_at: string | null
          downtime_hours: number | null
          equipment_id: string
          id: string
          maintenance_cost: number | null
          member_satisfaction: number | null
          month_year: string
          repair_incidents: number | null
          updated_at: string | null
          usage_hours: number | null
          utilization_rate: number | null
        }
        Insert: {
          created_at?: string | null
          downtime_hours?: number | null
          equipment_id: string
          id?: string
          maintenance_cost?: number | null
          member_satisfaction?: number | null
          month_year: string
          repair_incidents?: number | null
          updated_at?: string | null
          usage_hours?: number | null
          utilization_rate?: number | null
        }
        Update: {
          created_at?: string | null
          downtime_hours?: number | null
          equipment_id?: string
          id?: string
          maintenance_cost?: number | null
          member_satisfaction?: number | null
          month_year?: string
          repair_incidents?: number | null
          updated_at?: string | null
          usage_hours?: number | null
          utilization_rate?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "equipment_analytics_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "equipment"
            referencedColumns: ["id"]
          },
        ]
      }
      feedback: {
        Row: {
          admin_response: string | null
          attachments: string[] | null
          branch_id: string | null
          category: string | null
          created_at: string
          description: string
          id: string
          is_anonymous: boolean | null
          member_id: string | null
          priority: Database["public"]["Enums"]["feedback_priority"] | null
          rating: number | null
          related_entity_id: string | null
          related_entity_name: string | null
          resolved_at: string | null
          resolved_by: string | null
          status: Database["public"]["Enums"]["feedback_status"] | null
          tags: string[] | null
          title: string
          type: Database["public"]["Enums"]["feedback_type"]
          updated_at: string
          user_id: string | null
        }
        Insert: {
          admin_response?: string | null
          attachments?: string[] | null
          branch_id?: string | null
          category?: string | null
          created_at?: string
          description: string
          id?: string
          is_anonymous?: boolean | null
          member_id?: string | null
          priority?: Database["public"]["Enums"]["feedback_priority"] | null
          rating?: number | null
          related_entity_id?: string | null
          related_entity_name?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: Database["public"]["Enums"]["feedback_status"] | null
          tags?: string[] | null
          title: string
          type: Database["public"]["Enums"]["feedback_type"]
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          admin_response?: string | null
          attachments?: string[] | null
          branch_id?: string | null
          category?: string | null
          created_at?: string
          description?: string
          id?: string
          is_anonymous?: boolean | null
          member_id?: string | null
          priority?: Database["public"]["Enums"]["feedback_priority"] | null
          rating?: number | null
          related_entity_id?: string | null
          related_entity_name?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: Database["public"]["Enums"]["feedback_status"] | null
          tags?: string[] | null
          title?: string
          type?: Database["public"]["Enums"]["feedback_type"]
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "feedback_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feedback_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      feedback_responses: {
        Row: {
          created_at: string
          feedback_id: string
          id: string
          is_public: boolean | null
          message: string
          responder_id: string
          responder_name: string
          responder_role: string
        }
        Insert: {
          created_at?: string
          feedback_id: string
          id?: string
          is_public?: boolean | null
          message: string
          responder_id: string
          responder_name: string
          responder_role: string
        }
        Update: {
          created_at?: string
          feedback_id?: string
          id?: string
          is_public?: boolean | null
          message?: string
          responder_id?: string
          responder_name?: string
          responder_role?: string
        }
        Relationships: [
          {
            foreignKeyName: "feedback_responses_feedback_id_fkey"
            columns: ["feedback_id"]
            isOneToOne: false
            referencedRelation: "feedback"
            referencedColumns: ["id"]
          },
        ]
      }
      gym_classes: {
        Row: {
          branch_id: string | null
          capacity: number
          created_at: string
          created_by: string | null
          description: string | null
          end_time: string
          enrolled_count: number | null
          id: string
          name: string
          recurrence: Database["public"]["Enums"]["class_recurrence"] | null
          start_time: string
          status: Database["public"]["Enums"]["class_status"] | null
          tags: Database["public"]["Enums"]["class_tag"][] | null
          trainer_id: string | null
          updated_at: string
        }
        Insert: {
          branch_id?: string | null
          capacity?: number
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_time: string
          enrolled_count?: number | null
          id?: string
          name: string
          recurrence?: Database["public"]["Enums"]["class_recurrence"] | null
          start_time: string
          status?: Database["public"]["Enums"]["class_status"] | null
          tags?: Database["public"]["Enums"]["class_tag"][] | null
          trainer_id?: string | null
          updated_at?: string
        }
        Update: {
          branch_id?: string | null
          capacity?: number
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_time?: string
          enrolled_count?: number | null
          id?: string
          name?: string
          recurrence?: Database["public"]["Enums"]["class_recurrence"] | null
          start_time?: string
          status?: Database["public"]["Enums"]["class_status"] | null
          tags?: Database["public"]["Enums"]["class_tag"][] | null
          trainer_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "gym_classes_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gym_classes_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "trainer_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      gym_usage: {
        Row: {
          api_calls: number | null
          branch_count: number | null
          created_at: string
          gym_id: string
          id: string
          member_count: number | null
          month_year: string
          storage_used: number | null
          trainer_count: number | null
        }
        Insert: {
          api_calls?: number | null
          branch_count?: number | null
          created_at?: string
          gym_id: string
          id?: string
          member_count?: number | null
          month_year: string
          storage_used?: number | null
          trainer_count?: number | null
        }
        Update: {
          api_calls?: number | null
          branch_count?: number | null
          created_at?: string
          gym_id?: string
          id?: string
          member_count?: number | null
          month_year?: string
          storage_used?: number | null
          trainer_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "gym_usage_gym_id_fkey"
            columns: ["gym_id"]
            isOneToOne: false
            referencedRelation: "gyms"
            referencedColumns: ["id"]
          },
        ]
      }
      gyms: {
        Row: {
          billing_address: Json | null
          billing_email: string | null
          created_at: string
          created_by: string | null
          id: string
          max_branches: number | null
          max_members: number | null
          max_trainers: number | null
          name: string
          settings: Json | null
          status: string
          subscription_plan: string
          updated_at: string
        }
        Insert: {
          billing_address?: Json | null
          billing_email?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          max_branches?: number | null
          max_members?: number | null
          max_trainers?: number | null
          name: string
          settings?: Json | null
          status?: string
          subscription_plan?: string
          updated_at?: string
        }
        Update: {
          billing_address?: Json | null
          billing_email?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          max_branches?: number | null
          max_members?: number | null
          max_trainers?: number | null
          name?: string
          settings?: Json | null
          status?: string
          subscription_plan?: string
          updated_at?: string
        }
        Relationships: []
      }
      invoice_items: {
        Row: {
          created_at: string
          id: string
          invoice_id: string
          name: string
          quantity: number
          Tax: number | null
          total: number
          unit_price: number
        }
        Insert: {
          created_at?: string
          id?: string
          invoice_id: string
          name: string
          quantity?: number
          Tax?: number | null
          total: number
          unit_price: number
        }
        Update: {
          created_at?: string
          id?: string
          invoice_id?: string
          name?: string
          quantity?: number
          Tax?: number | null
          total?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoice_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          branch_id: string | null
          created_at: string
          created_by: string | null
          customer_email: string | null
          customer_id: string | null
          customer_name: string
          date: string
          discount: number
          due_date: string
          id: string
          invoice_number: string
          issue_date: string
          membership_id: string | null
          notes: string | null
          status: Database["public"]["Enums"]["invoice_status"] | null
          subtotal: number
          tax: number
          total: number
          updated_at: string
        }
        Insert: {
          branch_id?: string | null
          created_at?: string
          created_by?: string | null
          customer_email?: string | null
          customer_id?: string | null
          customer_name: string
          date?: string
          discount?: number
          due_date: string
          id?: string
          invoice_number: string
          issue_date?: string
          membership_id?: string | null
          notes?: string | null
          status?: Database["public"]["Enums"]["invoice_status"] | null
          subtotal?: number
          tax?: number
          total: number
          updated_at?: string
        }
        Update: {
          branch_id?: string | null
          created_at?: string
          created_by?: string | null
          customer_email?: string | null
          customer_id?: string | null
          customer_name?: string
          date?: string
          discount?: number
          due_date?: string
          id?: string
          invoice_number?: string
          issue_date?: string
          membership_id?: string | null
          notes?: string | null
          status?: Database["public"]["Enums"]["invoice_status"] | null
          subtotal?: number
          tax?: number
          total?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_membership_id_fkey"
            columns: ["membership_id"]
            isOneToOne: false
            referencedRelation: "member_memberships"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_notes: {
        Row: {
          content: string
          created_at: string
          created_by: string
          id: string
          lead_id: string
        }
        Insert: {
          content: string
          created_at?: string
          created_by: string
          id?: string
          lead_id: string
        }
        Update: {
          content?: string
          created_at?: string
          created_by?: string
          id?: string
          lead_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lead_notes_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_tasks: {
        Row: {
          assigned_to: string
          completed: boolean | null
          completed_at: string | null
          created_at: string
          created_by: string
          description: string | null
          due_date: string
          id: string
          lead_id: string
          priority: Database["public"]["Enums"]["lead_priority"] | null
          title: string
          type: string | null
        }
        Insert: {
          assigned_to: string
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          due_date: string
          id?: string
          lead_id: string
          priority?: Database["public"]["Enums"]["lead_priority"] | null
          title: string
          type?: string | null
        }
        Update: {
          assigned_to?: string
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          due_date?: string
          id?: string
          lead_id?: string
          priority?: Database["public"]["Enums"]["lead_priority"] | null
          title?: string
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lead_tasks_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          assigned_to: string | null
          conversion_date: string | null
          created_at: string
          email: string
          estimated_value: number | null
          first_name: string
          id: string
          interested_programs: string[] | null
          last_contact_date: string | null
          last_name: string
          message: string | null
          next_follow_up_date: string | null
          phone: string
          priority: Database["public"]["Enums"]["lead_priority"] | null
          referred_by: string | null
          source: Database["public"]["Enums"]["lead_source"]
          status: Database["public"]["Enums"]["lead_status"] | null
          tags: string[] | null
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          conversion_date?: string | null
          created_at?: string
          email: string
          estimated_value?: number | null
          first_name: string
          id?: string
          interested_programs?: string[] | null
          last_contact_date?: string | null
          last_name: string
          message?: string | null
          next_follow_up_date?: string | null
          phone: string
          priority?: Database["public"]["Enums"]["lead_priority"] | null
          referred_by?: string | null
          source: Database["public"]["Enums"]["lead_source"]
          status?: Database["public"]["Enums"]["lead_status"] | null
          tags?: string[] | null
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          conversion_date?: string | null
          created_at?: string
          email?: string
          estimated_value?: number | null
          first_name?: string
          id?: string
          interested_programs?: string[] | null
          last_contact_date?: string | null
          last_name?: string
          message?: string | null
          next_follow_up_date?: string | null
          phone?: string
          priority?: Database["public"]["Enums"]["lead_priority"] | null
          referred_by?: string | null
          source?: Database["public"]["Enums"]["lead_source"]
          status?: Database["public"]["Enums"]["lead_status"] | null
          tags?: string[] | null
          updated_at?: string
        }
        Relationships: []
      }
      locker_assignments: {
        Row: {
          assigned_date: string
          created_at: string
          expiration_date: string | null
          id: string
          locker_id: string
          member_id: string
          monthly_fee: number
          notes: string | null
          release_date: string | null
          status: string | null
        }
        Insert: {
          assigned_date?: string
          created_at?: string
          expiration_date?: string | null
          id?: string
          locker_id: string
          member_id: string
          monthly_fee: number
          notes?: string | null
          release_date?: string | null
          status?: string | null
        }
        Update: {
          assigned_date?: string
          created_at?: string
          expiration_date?: string | null
          id?: string
          locker_id?: string
          member_id?: string
          monthly_fee?: number
          notes?: string | null
          release_date?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "locker_assignments_locker_id_fkey"
            columns: ["locker_id"]
            isOneToOne: false
            referencedRelation: "lockers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "locker_assignments_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      locker_sizes: {
        Row: {
          created_at: string
          dimensions: string
          id: string
          monthly_fee: number
          name: string
        }
        Insert: {
          created_at?: string
          dimensions: string
          id?: string
          monthly_fee?: number
          name: string
        }
        Update: {
          created_at?: string
          dimensions?: string
          id?: string
          monthly_fee?: number
          name?: string
        }
        Relationships: []
      }
      lockers: {
        Row: {
          assigned_date: string | null
          assigned_member_id: string | null
          branch_id: string | null
          created_at: string
          expiration_date: string | null
          id: string
          monthly_fee: number | null
          name: string
          notes: string | null
          number: string
          release_date: string | null
          size_id: string | null
          status: Database["public"]["Enums"]["locker_status"] | null
          updated_at: string
        }
        Insert: {
          assigned_date?: string | null
          assigned_member_id?: string | null
          branch_id?: string | null
          created_at?: string
          expiration_date?: string | null
          id?: string
          monthly_fee?: number | null
          name: string
          notes?: string | null
          number: string
          release_date?: string | null
          size_id?: string | null
          status?: Database["public"]["Enums"]["locker_status"] | null
          updated_at?: string
        }
        Update: {
          assigned_date?: string | null
          assigned_member_id?: string | null
          branch_id?: string | null
          created_at?: string
          expiration_date?: string | null
          id?: string
          monthly_fee?: number | null
          name?: string
          notes?: string | null
          number?: string
          release_date?: string | null
          size_id?: string | null
          status?: Database["public"]["Enums"]["locker_status"] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lockers_assigned_member_id_fkey"
            columns: ["assigned_member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lockers_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lockers_size_id_fkey"
            columns: ["size_id"]
            isOneToOne: false
            referencedRelation: "locker_sizes"
            referencedColumns: ["id"]
          },
        ]
      }
      maintenance_records: {
        Row: {
          after_photos: string[] | null
          before_photos: string[] | null
          completed_date: string | null
          cost: number | null
          created_at: string | null
          created_by: string | null
          description: string
          equipment_id: string
          id: string
          notes: string | null
          parts_used: Json | null
          scheduled_date: string
          status: Database["public"]["Enums"]["maintenance_status"] | null
          technician_id: string | null
          type: Database["public"]["Enums"]["maintenance_type"]
          updated_at: string | null
        }
        Insert: {
          after_photos?: string[] | null
          before_photos?: string[] | null
          completed_date?: string | null
          cost?: number | null
          created_at?: string | null
          created_by?: string | null
          description: string
          equipment_id: string
          id?: string
          notes?: string | null
          parts_used?: Json | null
          scheduled_date: string
          status?: Database["public"]["Enums"]["maintenance_status"] | null
          technician_id?: string | null
          type: Database["public"]["Enums"]["maintenance_type"]
          updated_at?: string | null
        }
        Update: {
          after_photos?: string[] | null
          before_photos?: string[] | null
          completed_date?: string | null
          cost?: number | null
          created_at?: string | null
          created_by?: string | null
          description?: string
          equipment_id?: string
          id?: string
          notes?: string | null
          parts_used?: Json | null
          scheduled_date?: string
          status?: Database["public"]["Enums"]["maintenance_status"] | null
          technician_id?: string | null
          type?: Database["public"]["Enums"]["maintenance_type"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "maintenance_records_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "maintenance_records_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "equipment"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_records_technician_id_fkey"
            columns: ["technician_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      member_achievements: {
        Row: {
          achievement_id: string
          created_at: string | null
          earned_date: string | null
          id: string
          progress_data: Json | null
          user_id: string
        }
        Insert: {
          achievement_id: string
          created_at?: string | null
          earned_date?: string | null
          id?: string
          progress_data?: Json | null
          user_id: string
        }
        Update: {
          achievement_id?: string
          created_at?: string | null
          earned_date?: string | null
          id?: string
          progress_data?: Json | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "member_achievements_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "achievements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "member_achievements_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      member_analytics: {
        Row: {
          avg_session_duration: number | null
          check_ins_count: number | null
          classes_attended: number | null
          created_at: string | null
          favorite_workout_type: string | null
          feedback_submitted: number | null
          id: string
          month_year: string
          peak_usage_hours: number[] | null
          personal_training_sessions: number | null
          referrals_made: number | null
          revenue_generated: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          avg_session_duration?: number | null
          check_ins_count?: number | null
          classes_attended?: number | null
          created_at?: string | null
          favorite_workout_type?: string | null
          feedback_submitted?: number | null
          id?: string
          month_year: string
          peak_usage_hours?: number[] | null
          personal_training_sessions?: number | null
          referrals_made?: number | null
          revenue_generated?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          avg_session_duration?: number | null
          check_ins_count?: number | null
          classes_attended?: number | null
          created_at?: string | null
          favorite_workout_type?: string | null
          feedback_submitted?: number | null
          id?: string
          month_year?: string
          peak_usage_hours?: number[] | null
          personal_training_sessions?: number | null
          referrals_made?: number | null
          revenue_generated?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "member_analytics_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      member_credits: {
        Row: {
          balance: number | null
          id: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          balance?: number | null
          id?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          balance?: number | null
          id?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      member_diet_plans: {
        Row: {
          assigned_by: string | null
          created_at: string | null
          diet_plan_id: string
          end_date: string | null
          id: string
          is_active: boolean | null
          notes: string | null
          progress: Json | null
          start_date: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          assigned_by?: string | null
          created_at?: string | null
          diet_plan_id: string
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          notes?: string | null
          progress?: Json | null
          start_date?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          assigned_by?: string | null
          created_at?: string | null
          diet_plan_id?: string
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          notes?: string | null
          progress?: Json | null
          start_date?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "member_diet_plans_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "member_diet_plans_diet_plan_id_fkey"
            columns: ["diet_plan_id"]
            isOneToOne: false
            referencedRelation: "diet_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "member_diet_plans_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      member_discount_usage: {
        Row: {
          discount_amount: number
          discount_code_id: string
          id: string
          invoice_id: string | null
          order_id: string | null
          used_at: string | null
          user_id: string
        }
        Insert: {
          discount_amount: number
          discount_code_id: string
          id?: string
          invoice_id?: string | null
          order_id?: string | null
          used_at?: string | null
          user_id: string
        }
        Update: {
          discount_amount?: number
          discount_code_id?: string
          id?: string
          invoice_id?: string | null
          order_id?: string | null
          used_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "member_discount_usage_discount_code_id_fkey"
            columns: ["discount_code_id"]
            isOneToOne: false
            referencedRelation: "discount_codes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "member_discount_usage_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      member_goals: {
        Row: {
          category: string | null
          created_at: string
          current_value: number | null
          description: string | null
          id: string
          is_active: boolean | null
          target_date: string | null
          target_unit: string | null
          target_value: number | null
          title: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string
          current_value?: number | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          target_date?: string | null
          target_unit?: string | null
          target_value?: number | null
          title: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string
          current_value?: number | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          target_date?: string | null
          target_unit?: string | null
          target_value?: number | null
          title?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      member_measurements: {
        Row: {
          arms: number | null
          blood_pressure_diastolic: number | null
          blood_pressure_systolic: number | null
          bmi: number | null
          body_fat_percentage: number | null
          chest: number | null
          created_at: string | null
          height: number | null
          hips: number | null
          id: string
          measured_by: string | null
          measured_date: string | null
          member_id: string | null
          membership_id: string | null
          muscle_mass: number | null
          notes: string | null
          resting_heart_rate: number | null
          thighs: number | null
          waist: number | null
          weight: number | null
        }
        Insert: {
          arms?: number | null
          blood_pressure_diastolic?: number | null
          blood_pressure_systolic?: number | null
          bmi?: number | null
          body_fat_percentage?: number | null
          chest?: number | null
          created_at?: string | null
          height?: number | null
          hips?: number | null
          id?: string
          measured_by?: string | null
          measured_date?: string | null
          member_id?: string | null
          membership_id?: string | null
          muscle_mass?: number | null
          notes?: string | null
          resting_heart_rate?: number | null
          thighs?: number | null
          waist?: number | null
          weight?: number | null
        }
        Update: {
          arms?: number | null
          blood_pressure_diastolic?: number | null
          blood_pressure_systolic?: number | null
          bmi?: number | null
          body_fat_percentage?: number | null
          chest?: number | null
          created_at?: string | null
          height?: number | null
          hips?: number | null
          id?: string
          measured_by?: string | null
          measured_date?: string | null
          member_id?: string | null
          membership_id?: string | null
          muscle_mass?: number | null
          notes?: string | null
          resting_heart_rate?: number | null
          thighs?: number | null
          waist?: number | null
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "member_measurements_measured_by_fkey"
            columns: ["measured_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "member_measurements_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "member_measurements_membership_id_fkey"
            columns: ["membership_id"]
            isOneToOne: false
            referencedRelation: "member_memberships"
            referencedColumns: ["id"]
          },
        ]
      }
      member_memberships: {
        Row: {
          assigned_by: string | null
          branch_id: string | null
          created_at: string
          discount_amount: number | null
          discount_percent: number | null
          end_date: string
          final_amount: number | null
          gst_amount: number | null
          gst_enabled: boolean | null
          id: string
          membership_plan_id: string | null
          notes: string | null
          payment_amount: number
          payment_status: Database["public"]["Enums"]["payment_status"] | null
          start_date: string
          status: Database["public"]["Enums"]["membership_status"] | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          assigned_by?: string | null
          branch_id?: string | null
          created_at?: string
          discount_amount?: number | null
          discount_percent?: number | null
          end_date: string
          final_amount?: number | null
          gst_amount?: number | null
          gst_enabled?: boolean | null
          id?: string
          membership_plan_id?: string | null
          notes?: string | null
          payment_amount: number
          payment_status?: Database["public"]["Enums"]["payment_status"] | null
          start_date: string
          status?: Database["public"]["Enums"]["membership_status"] | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          assigned_by?: string | null
          branch_id?: string | null
          created_at?: string
          discount_amount?: number | null
          discount_percent?: number | null
          end_date?: string
          final_amount?: number | null
          gst_amount?: number | null
          gst_enabled?: boolean | null
          id?: string
          membership_plan_id?: string | null
          notes?: string | null
          payment_amount?: number
          payment_status?: Database["public"]["Enums"]["payment_status"] | null
          start_date?: string
          status?: Database["public"]["Enums"]["membership_status"] | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "member_memberships_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "member_memberships_membership_plan_id_fkey"
            columns: ["membership_plan_id"]
            isOneToOne: false
            referencedRelation: "membership_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      member_workout_plans: {
        Row: {
          assigned_by: string | null
          created_at: string | null
          end_date: string | null
          id: string
          is_active: boolean | null
          notes: string | null
          progress: Json | null
          start_date: string | null
          updated_at: string | null
          user_id: string
          workout_plan_id: string
        }
        Insert: {
          assigned_by?: string | null
          created_at?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          notes?: string | null
          progress?: Json | null
          start_date?: string | null
          updated_at?: string | null
          user_id: string
          workout_plan_id: string
        }
        Update: {
          assigned_by?: string | null
          created_at?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          notes?: string | null
          progress?: Json | null
          start_date?: string | null
          updated_at?: string | null
          user_id?: string
          workout_plan_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "member_workout_plans_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "member_workout_plans_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "member_workout_plans_workout_plan_id_fkey"
            columns: ["workout_plan_id"]
            isOneToOne: false
            referencedRelation: "workout_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      members: {
        Row: {
          address: Json | null
          branch_id: string | null
          created_at: string
          created_by: string | null
          date_of_birth: string | null
          email: string
          emergency_contact: Json | null
          full_name: string
          gender: Database["public"]["Enums"]["gender"] | null
          government_id: Json | null
          id: string
          joined_date: string
          measurements: Json | null
          membership_plan: string | null
          membership_status:
            | Database["public"]["Enums"]["membership_status"]
            | null
          phone: string | null
          profile_photo: string | null
          trainer_id: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          address?: Json | null
          branch_id?: string | null
          created_at?: string
          created_by?: string | null
          date_of_birth?: string | null
          email: string
          emergency_contact?: Json | null
          full_name: string
          gender?: Database["public"]["Enums"]["gender"] | null
          government_id?: Json | null
          id?: string
          joined_date?: string
          measurements?: Json | null
          membership_plan?: string | null
          membership_status?:
            | Database["public"]["Enums"]["membership_status"]
            | null
          phone?: string | null
          profile_photo?: string | null
          trainer_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          address?: Json | null
          branch_id?: string | null
          created_at?: string
          created_by?: string | null
          date_of_birth?: string | null
          email?: string
          emergency_contact?: Json | null
          full_name?: string
          gender?: Database["public"]["Enums"]["gender"] | null
          government_id?: Json | null
          id?: string
          joined_date?: string
          measurements?: Json | null
          membership_plan?: string | null
          membership_status?:
            | Database["public"]["Enums"]["membership_status"]
            | null
          phone?: string | null
          profile_photo?: string | null
          trainer_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "members_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
        ]
      }
      membership_freeze_requests: {
        Row: {
          admin_notes: string | null
          approved_at: string | null
          approved_by: string | null
          created_at: string
          freeze_end_date: string | null
          freeze_fee: number | null
          freeze_start_date: string | null
          id: string
          membership_id: string | null
          reason: string
          requested_days: number
          status: Database["public"]["Enums"]["freeze_status"] | null
          user_id: string | null
        }
        Insert: {
          admin_notes?: string | null
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          freeze_end_date?: string | null
          freeze_fee?: number | null
          freeze_start_date?: string | null
          id?: string
          membership_id?: string | null
          reason: string
          requested_days: number
          status?: Database["public"]["Enums"]["freeze_status"] | null
          user_id?: string | null
        }
        Update: {
          admin_notes?: string | null
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          freeze_end_date?: string | null
          freeze_fee?: number | null
          freeze_start_date?: string | null
          id?: string
          membership_id?: string | null
          reason?: string
          requested_days?: number
          status?: Database["public"]["Enums"]["freeze_status"] | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "membership_freeze_requests_membership_id_fkey"
            columns: ["membership_id"]
            isOneToOne: false
            referencedRelation: "member_memberships"
            referencedColumns: ["id"]
          },
        ]
      }
      membership_plans: {
        Row: {
          created_at: string
          description: string | null
          duration_months: number
          features: string[] | null
          id: string
          is_active: boolean | null
          name: string
          price: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          duration_months: number
          features?: string[] | null
          id?: string
          is_active?: boolean | null
          name: string
          price: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          duration_months?: number
          features?: string[] | null
          id?: string
          is_active?: boolean | null
          name?: string
          price?: number
          updated_at?: string
        }
        Relationships: []
      }
      notification_preferences: {
        Row: {
          achievement_notifications: boolean | null
          class_reminders: boolean | null
          created_at: string | null
          email_notifications: boolean | null
          id: string
          marketing_emails: boolean | null
          payment_reminders: boolean | null
          preferred_contact_time_end: string | null
          preferred_contact_time_start: string | null
          push_notifications: boolean | null
          sms_notifications: boolean | null
          social_notifications: boolean | null
          timezone: string | null
          updated_at: string | null
          user_id: string
          workout_reminders: boolean | null
        }
        Insert: {
          achievement_notifications?: boolean | null
          class_reminders?: boolean | null
          created_at?: string | null
          email_notifications?: boolean | null
          id?: string
          marketing_emails?: boolean | null
          payment_reminders?: boolean | null
          preferred_contact_time_end?: string | null
          preferred_contact_time_start?: string | null
          push_notifications?: boolean | null
          sms_notifications?: boolean | null
          social_notifications?: boolean | null
          timezone?: string | null
          updated_at?: string | null
          user_id: string
          workout_reminders?: boolean | null
        }
        Update: {
          achievement_notifications?: boolean | null
          class_reminders?: boolean | null
          created_at?: string | null
          email_notifications?: boolean | null
          id?: string
          marketing_emails?: boolean | null
          payment_reminders?: boolean | null
          preferred_contact_time_end?: string | null
          preferred_contact_time_start?: string | null
          push_notifications?: boolean | null
          sms_notifications?: boolean | null
          social_notifications?: boolean | null
          timezone?: string | null
          updated_at?: string | null
          user_id?: string
          workout_reminders?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "notification_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          order_id: string | null
          product_id: string | null
          quantity: number
          total_price: number
          unit_price: number
        }
        Insert: {
          created_at?: string
          id?: string
          order_id?: string | null
          product_id?: string | null
          quantity: number
          total_price: number
          unit_price: number
        }
        Update: {
          created_at?: string
          id?: string
          order_id?: string | null
          product_id?: string | null
          quantity?: number
          total_price?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          cash_amount: number | null
          created_at: string
          credit_used: number | null
          id: string
          order_number: string
          payment_method: string | null
          payment_reference: string | null
          status: Database["public"]["Enums"]["order_status"] | null
          total_amount: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          cash_amount?: number | null
          created_at?: string
          credit_used?: number | null
          id?: string
          order_number: string
          payment_method?: string | null
          payment_reference?: string | null
          status?: Database["public"]["Enums"]["order_status"] | null
          total_amount: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          cash_amount?: number | null
          created_at?: string
          credit_used?: number | null
          id?: string
          order_number?: string
          payment_method?: string | null
          payment_reference?: string | null
          status?: Database["public"]["Enums"]["order_status"] | null
          total_amount?: number
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      payment_gateway_configs: {
        Row: {
          access_code: string | null
          allowed_payment_methods: Json | null
          api_key: string | null
          api_secret: string | null
          auto_capture: boolean | null
          branch_id: string | null
          created_at: string | null
          created_by: string | null
          currency: string | null
          gst_on_gateway_fee: boolean | null
          gym_id: string | null
          id: string
          is_active: boolean | null
          is_test_mode: boolean | null
          merchant_id: string | null
          payment_gateway_fee_percent: number | null
          provider: string
          salt_key: string | null
          updated_at: string | null
          webhook_secret: string | null
          webhook_url: string | null
        }
        Insert: {
          access_code?: string | null
          allowed_payment_methods?: Json | null
          api_key?: string | null
          api_secret?: string | null
          auto_capture?: boolean | null
          branch_id?: string | null
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          gst_on_gateway_fee?: boolean | null
          gym_id?: string | null
          id?: string
          is_active?: boolean | null
          is_test_mode?: boolean | null
          merchant_id?: string | null
          payment_gateway_fee_percent?: number | null
          provider: string
          salt_key?: string | null
          updated_at?: string | null
          webhook_secret?: string | null
          webhook_url?: string | null
        }
        Update: {
          access_code?: string | null
          allowed_payment_methods?: Json | null
          api_key?: string | null
          api_secret?: string | null
          auto_capture?: boolean | null
          branch_id?: string | null
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          gst_on_gateway_fee?: boolean | null
          gym_id?: string | null
          id?: string
          is_active?: boolean | null
          is_test_mode?: boolean | null
          merchant_id?: string | null
          payment_gateway_fee_percent?: number | null
          provider?: string
          salt_key?: string | null
          updated_at?: string | null
          webhook_secret?: string | null
          webhook_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_gateway_configs_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_gateway_configs_gym_id_fkey"
            columns: ["gym_id"]
            isOneToOne: false
            referencedRelation: "gyms"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_gateway_transactions: {
        Row: {
          amount: number
          branch_id: string | null
          completed_at: string | null
          created_by: string | null
          currency: string | null
          customer_email: string | null
          customer_id: string | null
          customer_name: string | null
          customer_phone: string | null
          discount_amount: number | null
          discount_code: string | null
          error_message: string | null
          failed_at: string | null
          gateway_config_id: string | null
          gateway_fee: number | null
          gateway_order_id: string | null
          gateway_payment_id: string | null
          gateway_response: Json | null
          gst_amount: number | null
          gym_id: string | null
          id: string
          initiated_at: string | null
          invoice_id: string | null
          membership_id: string | null
          net_amount: number | null
          order_id: string
          payment_method: string | null
          provider: string
          rewards_used: number | null
          status: string | null
          webhook_data: Json | null
        }
        Insert: {
          amount: number
          branch_id?: string | null
          completed_at?: string | null
          created_by?: string | null
          currency?: string | null
          customer_email?: string | null
          customer_id?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          discount_amount?: number | null
          discount_code?: string | null
          error_message?: string | null
          failed_at?: string | null
          gateway_config_id?: string | null
          gateway_fee?: number | null
          gateway_order_id?: string | null
          gateway_payment_id?: string | null
          gateway_response?: Json | null
          gst_amount?: number | null
          gym_id?: string | null
          id?: string
          initiated_at?: string | null
          invoice_id?: string | null
          membership_id?: string | null
          net_amount?: number | null
          order_id: string
          payment_method?: string | null
          provider: string
          rewards_used?: number | null
          status?: string | null
          webhook_data?: Json | null
        }
        Update: {
          amount?: number
          branch_id?: string | null
          completed_at?: string | null
          created_by?: string | null
          currency?: string | null
          customer_email?: string | null
          customer_id?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          discount_amount?: number | null
          discount_code?: string | null
          error_message?: string | null
          failed_at?: string | null
          gateway_config_id?: string | null
          gateway_fee?: number | null
          gateway_order_id?: string | null
          gateway_payment_id?: string | null
          gateway_response?: Json | null
          gst_amount?: number | null
          gym_id?: string | null
          id?: string
          initiated_at?: string | null
          invoice_id?: string | null
          membership_id?: string | null
          net_amount?: number | null
          order_id?: string
          payment_method?: string | null
          provider?: string
          rewards_used?: number | null
          status?: string | null
          webhook_data?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_gateway_transactions_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_gateway_transactions_gateway_config_id_fkey"
            columns: ["gateway_config_id"]
            isOneToOne: false
            referencedRelation: "payment_gateway_configs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_gateway_transactions_gym_id_fkey"
            columns: ["gym_id"]
            isOneToOne: false
            referencedRelation: "gyms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_gateway_transactions_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_gateway_transactions_membership_id_fkey"
            columns: ["membership_id"]
            isOneToOne: false
            referencedRelation: "member_memberships"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_methods: {
        Row: {
          created_at: string
          id: string
          is_active: boolean | null
          name: string
          type: Database["public"]["Enums"]["payment_method_type"]
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          name: string
          type: Database["public"]["Enums"]["payment_method_type"]
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          name?: string
          type?: Database["public"]["Enums"]["payment_method_type"]
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          created_at: string | null
          discount_code: string | null
          id: string
          invoice_id: string | null
          notes: string | null
          payment_date: string
          payment_method: string
          reference: string | null
          rewards_used: number | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          discount_code?: string | null
          id?: string
          invoice_id?: string | null
          notes?: string | null
          payment_date?: string
          payment_method: string
          reference?: string | null
          rewards_used?: number | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          discount_code?: string | null
          id?: string
          invoice_id?: string | null
          notes?: string | null
          payment_date?: string
          payment_method?: string
          reference?: string | null
          rewards_used?: number | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      permissions: {
        Row: {
          category: string
          created_at: string | null
          description: string | null
          display_name: string
          id: string
          is_system: boolean | null
          module: string
          name: string
          updated_at: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          description?: string | null
          display_name: string
          id?: string
          is_system?: boolean | null
          module: string
          name: string
          updated_at?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string | null
          display_name?: string
          id?: string
          is_system?: boolean | null
          module?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      products: {
        Row: {
          category: string
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          member_price: number | null
          name: string
          price: number
          stock_quantity: number | null
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          member_price?: number | null
          name: string
          price: number
          stock_quantity?: number | null
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          member_price?: number | null
          name?: string
          price?: number
          stock_quantity?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          address: Json | null
          avatar_url: string | null
          branch_id: string | null
          created_at: string
          date_of_birth: string | null
          email: string
          full_name: string
          gym_id: string | null
          id: string
          is_active: boolean
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          team_role: Database["public"]["Enums"]["team_role"] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: Json | null
          avatar_url?: string | null
          branch_id?: string | null
          created_at?: string
          date_of_birth?: string | null
          email: string
          full_name: string
          gym_id?: string | null
          id?: string
          is_active?: boolean
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          team_role?: Database["public"]["Enums"]["team_role"] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: Json | null
          avatar_url?: string | null
          branch_id?: string | null
          created_at?: string
          date_of_birth?: string | null
          email?: string
          full_name?: string
          gym_id?: string | null
          id?: string
          is_active?: boolean
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          team_role?: Database["public"]["Enums"]["team_role"] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_gym_id_fkey"
            columns: ["gym_id"]
            isOneToOne: false
            referencedRelation: "gyms"
            referencedColumns: ["id"]
          },
        ]
      }
      progress_entries: {
        Row: {
          created_at: string
          goal_id: string | null
          id: string
          measurement_value: number
          notes: string | null
          photo_url: string | null
          recorded_date: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          goal_id?: string | null
          id?: string
          measurement_value: number
          notes?: string | null
          photo_url?: string | null
          recorded_date?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          goal_id?: string | null
          id?: string
          measurement_value?: number
          notes?: string | null
          photo_url?: string | null
          recorded_date?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "progress_entries_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "member_goals"
            referencedColumns: ["id"]
          },
        ]
      }
      progress_photos: {
        Row: {
          created_at: string | null
          goal_id: string | null
          id: string
          is_public: boolean | null
          measurements: Json | null
          notes: string | null
          photo_type: string | null
          photo_url: string
          taken_date: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          goal_id?: string | null
          id?: string
          is_public?: boolean | null
          measurements?: Json | null
          notes?: string | null
          photo_type?: string | null
          photo_url: string
          taken_date?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          goal_id?: string | null
          id?: string
          is_public?: boolean | null
          measurements?: Json | null
          notes?: string | null
          photo_type?: string | null
          photo_url?: string
          taken_date?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "progress_photos_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "member_goals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "progress_photos_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      referral_analytics: {
        Row: {
          completed_referrals: number
          conversion_rate: number | null
          created_at: string
          id: string
          pending_referrals: number
          period_end: string
          period_start: string
          total_bonus_earned: number
          total_referrals: number
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_referrals?: number
          conversion_rate?: number | null
          created_at?: string
          id?: string
          pending_referrals?: number
          period_end: string
          period_start: string
          total_bonus_earned?: number
          total_referrals?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_referrals?: number
          conversion_rate?: number | null
          created_at?: string
          id?: string
          pending_referrals?: number
          period_end?: string
          period_start?: string
          total_bonus_earned?: number
          total_referrals?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      referral_bonus_history: {
        Row: {
          amount: number
          bonus_type: string
          created_at: string
          id: string
          notes: string | null
          processed_at: string
          processed_by: string | null
          referral_id: string
        }
        Insert: {
          amount: number
          bonus_type: string
          created_at?: string
          id?: string
          notes?: string | null
          processed_at?: string
          processed_by?: string | null
          referral_id: string
        }
        Update: {
          amount?: number
          bonus_type?: string
          created_at?: string
          id?: string
          notes?: string | null
          processed_at?: string
          processed_by?: string | null
          referral_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "referral_bonus_history_referral_id_fkey"
            columns: ["referral_id"]
            isOneToOne: false
            referencedRelation: "referrals"
            referencedColumns: ["id"]
          },
        ]
      }
      referral_bonuses: {
        Row: {
          amount: number
          bonus_type: Database["public"]["Enums"]["bonus_type"]
          created_at: string
          description: string | null
          id: string
          is_redeemed: boolean | null
          redeemed_at: string | null
          referral_id: string | null
          user_id: string | null
        }
        Insert: {
          amount: number
          bonus_type: Database["public"]["Enums"]["bonus_type"]
          created_at?: string
          description?: string | null
          id?: string
          is_redeemed?: boolean | null
          redeemed_at?: string | null
          referral_id?: string | null
          user_id?: string | null
        }
        Update: {
          amount?: number
          bonus_type?: Database["public"]["Enums"]["bonus_type"]
          created_at?: string
          description?: string | null
          id?: string
          is_redeemed?: boolean | null
          redeemed_at?: string | null
          referral_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "referral_bonuses_referral_id_fkey"
            columns: ["referral_id"]
            isOneToOne: false
            referencedRelation: "referrals"
            referencedColumns: ["id"]
          },
        ]
      }
      referral_settings: {
        Row: {
          created_at: string
          created_by: string | null
          expiry_days: number
          id: string
          is_active: boolean
          max_referrals_per_user: number | null
          membership_bonus_amount: number
          min_purchase_amount: number | null
          signup_bonus_amount: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          expiry_days?: number
          id?: string
          is_active?: boolean
          max_referrals_per_user?: number | null
          membership_bonus_amount?: number
          min_purchase_amount?: number | null
          signup_bonus_amount?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          expiry_days?: number
          id?: string
          is_active?: boolean
          max_referrals_per_user?: number | null
          membership_bonus_amount?: number
          min_purchase_amount?: number | null
          signup_bonus_amount?: number
          updated_at?: string
        }
        Relationships: []
      }
      referrals: {
        Row: {
          completed_at: string | null
          converted_at: string | null
          created_at: string
          id: string
          membership_bonus_amount: number | null
          membership_id: string | null
          referral_code: string
          referred_email: string
          referred_id: string | null
          referrer_id: string | null
          signup_bonus_amount: number | null
          status: string | null
        }
        Insert: {
          completed_at?: string | null
          converted_at?: string | null
          created_at?: string
          id?: string
          membership_bonus_amount?: number | null
          membership_id?: string | null
          referral_code: string
          referred_email: string
          referred_id?: string | null
          referrer_id?: string | null
          signup_bonus_amount?: number | null
          status?: string | null
        }
        Update: {
          completed_at?: string | null
          converted_at?: string | null
          created_at?: string
          id?: string
          membership_bonus_amount?: number | null
          membership_id?: string | null
          referral_code?: string
          referred_email?: string
          referred_id?: string | null
          referrer_id?: string | null
          signup_bonus_amount?: number | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "referrals_membership_id_fkey"
            columns: ["membership_id"]
            isOneToOne: false
            referencedRelation: "member_memberships"
            referencedColumns: ["id"]
          },
        ]
      }
      role_permissions: {
        Row: {
          granted_at: string | null
          granted_by: string | null
          id: string
          permission_id: string
          role_id: string
        }
        Insert: {
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          permission_id: string
          role_id: string
        }
        Update: {
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          permission_id?: string
          role_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "role_permissions_permission_id_fkey"
            columns: ["permission_id"]
            isOneToOne: false
            referencedRelation: "permissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "role_permissions_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      roles: {
        Row: {
          color: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          display_name: string
          id: string
          is_system: boolean | null
          name: string
          scope: string | null
          updated_at: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          display_name: string
          id?: string
          is_system?: boolean | null
          name: string
          scope?: string | null
          updated_at?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          display_name?: string
          id?: string
          is_system?: boolean | null
          name?: string
          scope?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      sms_templates: {
        Row: {
          branch_id: string | null
          content: string
          created_at: string | null
          created_by: string | null
          id: string
          is_active: boolean | null
          name: string
          type: Database["public"]["Enums"]["sms_template_type"]
          updated_at: string | null
          variables: Json | null
        }
        Insert: {
          branch_id?: string | null
          content: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          type: Database["public"]["Enums"]["sms_template_type"]
          updated_at?: string | null
          variables?: Json | null
        }
        Update: {
          branch_id?: string | null
          content?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          type?: Database["public"]["Enums"]["sms_template_type"]
          updated_at?: string | null
          variables?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "sms_templates_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sms_templates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      subscription_plans: {
        Row: {
          billing_cycle: string
          created_at: string
          features: Json | null
          id: string
          is_active: boolean | null
          max_branches: number
          max_members: number
          max_trainers: number
          name: string
          price: number
        }
        Insert: {
          billing_cycle?: string
          created_at?: string
          features?: Json | null
          id?: string
          is_active?: boolean | null
          max_branches?: number
          max_members?: number
          max_trainers?: number
          name: string
          price: number
        }
        Update: {
          billing_cycle?: string
          created_at?: string
          features?: Json | null
          id?: string
          is_active?: boolean | null
          max_branches?: number
          max_members?: number
          max_trainers?: number
          name?: string
          price?: number
        }
        Relationships: []
      }
      system_backups: {
        Row: {
          backup_data: Json | null
          backup_type: string
          completed_at: string | null
          compression_type: string | null
          created_by: string | null
          error_message: string | null
          file_path: string | null
          file_size: number | null
          id: string
          retention_until: string | null
          started_at: string | null
          status: string
        }
        Insert: {
          backup_data?: Json | null
          backup_type: string
          completed_at?: string | null
          compression_type?: string | null
          created_by?: string | null
          error_message?: string | null
          file_path?: string | null
          file_size?: number | null
          id?: string
          retention_until?: string | null
          started_at?: string | null
          status?: string
        }
        Update: {
          backup_data?: Json | null
          backup_type?: string
          completed_at?: string | null
          compression_type?: string | null
          created_by?: string | null
          error_message?: string | null
          file_path?: string | null
          file_size?: number | null
          id?: string
          retention_until?: string | null
          started_at?: string | null
          status?: string
        }
        Relationships: []
      }
      system_events: {
        Row: {
          created_at: string | null
          description: string | null
          event_category: string
          event_type: string
          id: string
          metadata: Json | null
          resolved: boolean | null
          resolved_at: string | null
          resolved_by: string | null
          severity: number | null
          title: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          event_category: string
          event_type: string
          id?: string
          metadata?: Json | null
          resolved?: boolean | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: number | null
          title: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          event_category?: string
          event_type?: string
          id?: string
          metadata?: Json | null
          resolved?: boolean | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: number | null
          title?: string
        }
        Relationships: []
      }
      system_settings: {
        Row: {
          branch_id: string | null
          category: string
          created_at: string | null
          description: string | null
          id: string
          is_encrypted: boolean | null
          key: string
          updated_at: string | null
          value: Json
        }
        Insert: {
          branch_id?: string | null
          category: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_encrypted?: boolean | null
          key: string
          updated_at?: string | null
          value: Json
        }
        Update: {
          branch_id?: string | null
          category?: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_encrypted?: boolean | null
          key?: string
          updated_at?: string | null
          value?: Json
        }
        Relationships: [
          {
            foreignKeyName: "system_settings_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
        ]
      }
      team_members: {
        Row: {
          bank_details: Json | null
          branch_id: string | null
          certifications: string[] | null
          created_at: string | null
          department: string
          documents: Json | null
          emergency_contact: Json | null
          employee_id: string
          employment_type: Database["public"]["Enums"]["employment_type"] | null
          hire_date: string
          hourly_rate: number | null
          id: string
          is_active: boolean | null
          last_review_date: string | null
          manager_id: string | null
          next_review_date: string | null
          performance_rating: number | null
          position: string
          salary: number | null
          skills: string[] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          bank_details?: Json | null
          branch_id?: string | null
          certifications?: string[] | null
          created_at?: string | null
          department: string
          documents?: Json | null
          emergency_contact?: Json | null
          employee_id: string
          employment_type?:
            | Database["public"]["Enums"]["employment_type"]
            | null
          hire_date?: string
          hourly_rate?: number | null
          id?: string
          is_active?: boolean | null
          last_review_date?: string | null
          manager_id?: string | null
          next_review_date?: string | null
          performance_rating?: number | null
          position: string
          salary?: number | null
          skills?: string[] | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          bank_details?: Json | null
          branch_id?: string | null
          certifications?: string[] | null
          created_at?: string | null
          department?: string
          documents?: Json | null
          emergency_contact?: Json | null
          employee_id?: string
          employment_type?:
            | Database["public"]["Enums"]["employment_type"]
            | null
          hire_date?: string
          hourly_rate?: number | null
          id?: string
          is_active?: boolean | null
          last_review_date?: string | null
          manager_id?: string | null
          next_review_date?: string | null
          performance_rating?: number | null
          position?: string
          salary?: number | null
          skills?: string[] | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_members_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_members_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "team_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      trainer_analytics: {
        Row: {
          avg_session_rating: number | null
          cancellation_rate: number | null
          created_at: string | null
          id: string
          members_trained: number | null
          month_year: string
          new_members_acquired: number | null
          punctuality_score: number | null
          retention_rate: number | null
          sessions_conducted: number | null
          specialties_demand: Json | null
          total_revenue: number | null
          trainer_id: string
          updated_at: string | null
        }
        Insert: {
          avg_session_rating?: number | null
          cancellation_rate?: number | null
          created_at?: string | null
          id?: string
          members_trained?: number | null
          month_year: string
          new_members_acquired?: number | null
          punctuality_score?: number | null
          retention_rate?: number | null
          sessions_conducted?: number | null
          specialties_demand?: Json | null
          total_revenue?: number | null
          trainer_id: string
          updated_at?: string | null
        }
        Update: {
          avg_session_rating?: number | null
          cancellation_rate?: number | null
          created_at?: string | null
          id?: string
          members_trained?: number | null
          month_year?: string
          new_members_acquired?: number | null
          punctuality_score?: number | null
          retention_rate?: number | null
          sessions_conducted?: number | null
          specialties_demand?: Json | null
          total_revenue?: number | null
          trainer_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "trainer_analytics_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "trainer_profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      trainer_assignments: {
        Row: {
          completed_exercises: Json | null
          created_at: string | null
          created_by: string | null
          duration_minutes: number | null
          id: string
          location: string | null
          member_feedback: string | null
          member_goals: string[] | null
          member_id: string
          notes: string | null
          rating: number | null
          scheduled_date: string
          session_plan: Json | null
          session_type: Database["public"]["Enums"]["session_type"] | null
          status: Database["public"]["Enums"]["assignment_status"] | null
          trainer_id: string
          trainer_notes: string | null
          updated_at: string | null
        }
        Insert: {
          completed_exercises?: Json | null
          created_at?: string | null
          created_by?: string | null
          duration_minutes?: number | null
          id?: string
          location?: string | null
          member_feedback?: string | null
          member_goals?: string[] | null
          member_id: string
          notes?: string | null
          rating?: number | null
          scheduled_date: string
          session_plan?: Json | null
          session_type?: Database["public"]["Enums"]["session_type"] | null
          status?: Database["public"]["Enums"]["assignment_status"] | null
          trainer_id: string
          trainer_notes?: string | null
          updated_at?: string | null
        }
        Update: {
          completed_exercises?: Json | null
          created_at?: string | null
          created_by?: string | null
          duration_minutes?: number | null
          id?: string
          location?: string | null
          member_feedback?: string | null
          member_goals?: string[] | null
          member_id?: string
          notes?: string | null
          rating?: number | null
          scheduled_date?: string
          session_plan?: Json | null
          session_type?: Database["public"]["Enums"]["session_type"] | null
          status?: Database["public"]["Enums"]["assignment_status"] | null
          trainer_id?: string
          trainer_notes?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "trainer_assignments_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "trainer_assignments_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "trainer_assignments_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "trainer_profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      trainer_availability: {
        Row: {
          created_at: string
          day_of_week: number
          end_time: string
          id: string
          is_available: boolean | null
          start_time: string
          trainer_id: string
        }
        Insert: {
          created_at?: string
          day_of_week: number
          end_time: string
          id?: string
          is_available?: boolean | null
          start_time: string
          trainer_id: string
        }
        Update: {
          created_at?: string
          day_of_week?: number
          end_time?: string
          id?: string
          is_available?: boolean | null
          start_time?: string
          trainer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trainer_availability_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "trainer_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      trainer_certifications: {
        Row: {
          created_at: string
          expiry_date: string | null
          id: string
          issue_date: string
          issuing_organization: string
          level: Database["public"]["Enums"]["certification_level"]
          name: string
          trainer_id: string
          verified: boolean | null
        }
        Insert: {
          created_at?: string
          expiry_date?: string | null
          id?: string
          issue_date: string
          issuing_organization: string
          level: Database["public"]["Enums"]["certification_level"]
          name: string
          trainer_id: string
          verified?: boolean | null
        }
        Update: {
          created_at?: string
          expiry_date?: string | null
          id?: string
          issue_date?: string
          issuing_organization?: string
          level?: Database["public"]["Enums"]["certification_level"]
          name?: string
          trainer_id?: string
          verified?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "trainer_certifications_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "trainer_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      trainer_change_requests: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          created_at: string | null
          current_trainer_id: string | null
          description: string | null
          id: string
          member_id: string | null
          reason: string
          rejection_reason: string | null
          requested_trainer_id: string | null
          status: string | null
          updated_at: string | null
          urgency: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          current_trainer_id?: string | null
          description?: string | null
          id?: string
          member_id?: string | null
          reason: string
          rejection_reason?: string | null
          requested_trainer_id?: string | null
          status?: string | null
          updated_at?: string | null
          urgency?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          current_trainer_id?: string | null
          description?: string | null
          id?: string
          member_id?: string | null
          reason?: string
          rejection_reason?: string | null
          requested_trainer_id?: string | null
          status?: string | null
          updated_at?: string | null
          urgency?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "trainer_change_requests_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "trainer_change_requests_current_trainer_id_fkey"
            columns: ["current_trainer_id"]
            isOneToOne: false
            referencedRelation: "trainer_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trainer_change_requests_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trainer_change_requests_requested_trainer_id_fkey"
            columns: ["requested_trainer_id"]
            isOneToOne: false
            referencedRelation: "trainer_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      trainer_package_rates: {
        Row: {
          branch_id: string | null
          created_at: string | null
          description: string | null
          duration_days: number | null
          id: string
          is_active: boolean | null
          package_name: string
          price: number
          session_count: number
          trainer_id: string | null
          updated_at: string | null
        }
        Insert: {
          branch_id?: string | null
          created_at?: string | null
          description?: string | null
          duration_days?: number | null
          id?: string
          is_active?: boolean | null
          package_name: string
          price: number
          session_count: number
          trainer_id?: string | null
          updated_at?: string | null
        }
        Update: {
          branch_id?: string | null
          created_at?: string | null
          description?: string | null
          duration_days?: number | null
          id?: string
          is_active?: boolean | null
          package_name?: string
          price?: number
          session_count?: number
          trainer_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "trainer_package_rates_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trainer_package_rates_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      trainer_packages: {
        Row: {
          created_at: string | null
          expiry_date: string | null
          id: string
          member_id: string
          package_name: string
          price_per_session: number
          purchase_date: string | null
          status: Database["public"]["Enums"]["package_status"] | null
          total_amount: number
          total_sessions: number
          trainer_id: string
          updated_at: string | null
          used_sessions: number | null
        }
        Insert: {
          created_at?: string | null
          expiry_date?: string | null
          id?: string
          member_id: string
          package_name: string
          price_per_session: number
          purchase_date?: string | null
          status?: Database["public"]["Enums"]["package_status"] | null
          total_amount: number
          total_sessions: number
          trainer_id: string
          updated_at?: string | null
          used_sessions?: number | null
        }
        Update: {
          created_at?: string | null
          expiry_date?: string | null
          id?: string
          member_id?: string
          package_name?: string
          price_per_session?: number
          purchase_date?: string | null
          status?: Database["public"]["Enums"]["package_status"] | null
          total_amount?: number
          total_sessions?: number
          trainer_id?: string
          updated_at?: string | null
          used_sessions?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "trainer_packages_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "trainer_packages_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "trainer_profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      trainer_profiles: {
        Row: {
          avatar: string | null
          bio: string | null
          branch_id: string | null
          completion_rate: number | null
          created_at: string
          date_of_birth: string | null
          email: string
          employee_id: string
          experience: number | null
          full_name: string
          hourly_rate: number | null
          id: string
          is_active: boolean | null
          join_date: string
          languages: string[] | null
          max_clients_per_day: number | null
          max_clients_per_week: number | null
          package_rates: Json | null
          phone: string | null
          punctuality_score: number | null
          rating: number | null
          specialties: Database["public"]["Enums"]["trainer_specialty"][] | null
          status: Database["public"]["Enums"]["trainer_status"] | null
          total_clients: number | null
          total_sessions: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar?: string | null
          bio?: string | null
          branch_id?: string | null
          completion_rate?: number | null
          created_at?: string
          date_of_birth?: string | null
          email: string
          employee_id: string
          experience?: number | null
          full_name: string
          hourly_rate?: number | null
          id?: string
          is_active?: boolean | null
          join_date?: string
          languages?: string[] | null
          max_clients_per_day?: number | null
          max_clients_per_week?: number | null
          package_rates?: Json | null
          phone?: string | null
          punctuality_score?: number | null
          rating?: number | null
          specialties?:
            | Database["public"]["Enums"]["trainer_specialty"][]
            | null
          status?: Database["public"]["Enums"]["trainer_status"] | null
          total_clients?: number | null
          total_sessions?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar?: string | null
          bio?: string | null
          branch_id?: string | null
          completion_rate?: number | null
          created_at?: string
          date_of_birth?: string | null
          email?: string
          employee_id?: string
          experience?: number | null
          full_name?: string
          hourly_rate?: number | null
          id?: string
          is_active?: boolean | null
          join_date?: string
          languages?: string[] | null
          max_clients_per_day?: number | null
          max_clients_per_week?: number | null
          package_rates?: Json | null
          phone?: string | null
          punctuality_score?: number | null
          rating?: number | null
          specialties?:
            | Database["public"]["Enums"]["trainer_specialty"][]
            | null
          status?: Database["public"]["Enums"]["trainer_status"] | null
          total_clients?: number | null
          total_sessions?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trainer_profiles_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
        ]
      }
      trainer_utilization: {
        Row: {
          average_rating: number | null
          average_session_value: number | null
          booked_hours: number | null
          cancelled_sessions: number | null
          completed_sessions: number | null
          created_at: string | null
          date: string
          id: string
          no_show_sessions: number | null
          period: string
          punctuality_score: number | null
          scheduled_sessions: number | null
          total_available_hours: number | null
          total_revenue: number | null
          trainer_id: string | null
          utilization_rate: number | null
        }
        Insert: {
          average_rating?: number | null
          average_session_value?: number | null
          booked_hours?: number | null
          cancelled_sessions?: number | null
          completed_sessions?: number | null
          created_at?: string | null
          date: string
          id?: string
          no_show_sessions?: number | null
          period: string
          punctuality_score?: number | null
          scheduled_sessions?: number | null
          total_available_hours?: number | null
          total_revenue?: number | null
          trainer_id?: string | null
          utilization_rate?: number | null
        }
        Update: {
          average_rating?: number | null
          average_session_value?: number | null
          booked_hours?: number | null
          cancelled_sessions?: number | null
          completed_sessions?: number | null
          created_at?: string | null
          date?: string
          id?: string
          no_show_sessions?: number | null
          period?: string
          punctuality_score?: number | null
          scheduled_sessions?: number | null
          total_available_hours?: number | null
          total_revenue?: number | null
          trainer_id?: string | null
          utilization_rate?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "trainer_utilization_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "trainer_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      transaction_categories: {
        Row: {
          color: string | null
          created_at: string
          description: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
          type: Database["public"]["Enums"]["transaction_type"]
        }
        Insert: {
          color?: string | null
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          type: Database["public"]["Enums"]["transaction_type"]
        }
        Update: {
          color?: string | null
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          type?: Database["public"]["Enums"]["transaction_type"]
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          branch_id: string | null
          category_id: string | null
          created_at: string
          created_by: string | null
          date: string
          description: string
          id: string
          member_id: string | null
          payment_method_id: string | null
          reference: string | null
          status: Database["public"]["Enums"]["transaction_status"] | null
          type: Database["public"]["Enums"]["transaction_type"]
          updated_at: string
        }
        Insert: {
          amount: number
          branch_id?: string | null
          category_id?: string | null
          created_at?: string
          created_by?: string | null
          date?: string
          description: string
          id?: string
          member_id?: string | null
          payment_method_id?: string | null
          reference?: string | null
          status?: Database["public"]["Enums"]["transaction_status"] | null
          type: Database["public"]["Enums"]["transaction_type"]
          updated_at?: string
        }
        Update: {
          amount?: number
          branch_id?: string | null
          category_id?: string | null
          created_at?: string
          created_by?: string | null
          date?: string
          description?: string
          id?: string
          member_id?: string | null
          payment_method_id?: string | null
          reference?: string | null
          status?: Database["public"]["Enums"]["transaction_status"] | null
          type?: Database["public"]["Enums"]["transaction_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "transaction_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_payment_method_id_fkey"
            columns: ["payment_method_id"]
            isOneToOne: false
            referencedRelation: "payment_methods"
            referencedColumns: ["id"]
          },
        ]
      }
      user_notifications: {
        Row: {
          announcement_id: string | null
          created_at: string
          id: string
          is_read: boolean | null
          read_at: string | null
          user_id: string | null
        }
        Insert: {
          announcement_id?: string | null
          created_at?: string
          id?: string
          is_read?: boolean | null
          read_at?: string | null
          user_id?: string | null
        }
        Update: {
          announcement_id?: string | null
          created_at?: string
          id?: string
          is_read?: boolean | null
          read_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_notifications_announcement_id_fkey"
            columns: ["announcement_id"]
            isOneToOne: false
            referencedRelation: "announcements"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          branch_id: string | null
          created_at: string
          id: string
          role: Database["public"]["Enums"]["user_role"]
          team_role: string | null
          user_id: string
        }
        Insert: {
          branch_id?: string | null
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["user_role"]
          team_role?: string | null
          user_id: string
        }
        Update: {
          branch_id?: string | null
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          team_role?: string | null
          user_id?: string
        }
        Relationships: []
      }
      whatsapp_templates: {
        Row: {
          body_text: string
          branch_id: string | null
          buttons: Json | null
          category: string
          created_at: string | null
          created_by: string | null
          event: string
          footer_text: string | null
          header_text: string | null
          id: string
          is_active: boolean | null
          language: string | null
          name: string
          status: string | null
          template_type: string
          updated_at: string | null
          variables: Json | null
          whatsapp_template_id: string | null
        }
        Insert: {
          body_text: string
          branch_id?: string | null
          buttons?: Json | null
          category: string
          created_at?: string | null
          created_by?: string | null
          event: string
          footer_text?: string | null
          header_text?: string | null
          id?: string
          is_active?: boolean | null
          language?: string | null
          name: string
          status?: string | null
          template_type?: string
          updated_at?: string | null
          variables?: Json | null
          whatsapp_template_id?: string | null
        }
        Update: {
          body_text?: string
          branch_id?: string | null
          buttons?: Json | null
          category?: string
          created_at?: string | null
          created_by?: string | null
          event?: string
          footer_text?: string | null
          header_text?: string | null
          id?: string
          is_active?: boolean | null
          language?: string | null
          name?: string
          status?: string | null
          template_type?: string
          updated_at?: string | null
          variables?: Json | null
          whatsapp_template_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_templates_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
        ]
      }
      work_shifts: {
        Row: {
          branch_id: string | null
          break_duration: number | null
          created_at: string
          days: string[] | null
          end_time: string
          grace_period: number | null
          id: string
          is_active: boolean | null
          late_threshold: number | null
          maximum_hours: number | null
          minimum_hours: number | null
          name: string
          start_time: string
          updated_at: string
          user_ids: string[] | null
        }
        Insert: {
          branch_id?: string | null
          break_duration?: number | null
          created_at?: string
          days?: string[] | null
          end_time: string
          grace_period?: number | null
          id?: string
          is_active?: boolean | null
          late_threshold?: number | null
          maximum_hours?: number | null
          minimum_hours?: number | null
          name: string
          start_time: string
          updated_at?: string
          user_ids?: string[] | null
        }
        Update: {
          branch_id?: string | null
          break_duration?: number | null
          created_at?: string
          days?: string[] | null
          end_time?: string
          grace_period?: number | null
          id?: string
          is_active?: boolean | null
          late_threshold?: number | null
          maximum_hours?: number | null
          minimum_hours?: number | null
          name?: string
          start_time?: string
          updated_at?: string
          user_ids?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "work_shifts_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
        ]
      }
      workout_plans: {
        Row: {
          branch_id: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          difficulty: Database["public"]["Enums"]["plan_difficulty"]
          duration_weeks: number | null
          equipment_needed: string[] | null
          exercises: Json | null
          id: string
          is_template: boolean | null
          name: string
          status: Database["public"]["Enums"]["plan_status"] | null
          target_goals: string[] | null
          updated_at: string | null
        }
        Insert: {
          branch_id?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          difficulty: Database["public"]["Enums"]["plan_difficulty"]
          duration_weeks?: number | null
          equipment_needed?: string[] | null
          exercises?: Json | null
          id?: string
          is_template?: boolean | null
          name: string
          status?: Database["public"]["Enums"]["plan_status"] | null
          target_goals?: string[] | null
          updated_at?: string | null
        }
        Update: {
          branch_id?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          difficulty?: Database["public"]["Enums"]["plan_difficulty"]
          duration_weeks?: number | null
          equipment_needed?: string[] | null
          exercises?: Json | null
          id?: string
          is_template?: boolean | null
          name?: string
          status?: Database["public"]["Enums"]["plan_status"] | null
          target_goals?: string[] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workout_plans_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workout_plans_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      backfill_team_members: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      calculate_referral_analytics: {
        Args: { p_end_date: string; p_start_date: string; p_user_id: string }
        Returns: {
          completed_referrals: number
          conversion_rate: number
          pending_referrals: number
          total_bonus: number
          total_referrals: number
        }[]
      }
      create_gym_admin_atomic: {
        Args: {
          p_address: Json
          p_date_of_birth?: string
          p_email: string
          p_existing_branch_id?: string
          p_existing_gym_id?: string
          p_full_name: string
          p_gym_name: string
          p_password: string
          p_phone: string
          p_subscription_plan: string
        }
        Returns: Json
      }
      generate_order_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_referral_code: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_monthly_financial_summary: {
        Args: { branch_filter?: string }
        Returns: {
          expenses: number
          income: number
          month: string
          profit: number
        }[]
      }
      get_user_gym_id: {
        Args: { user_uuid: string }
        Returns: string
      }
      get_user_role: {
        Args: { user_uuid: string }
        Returns: string
      }
      get_user_team_role: {
        Args: { user_uuid: string }
        Returns: string
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["user_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin_user: {
        Args: { user_uuid: string }
        Returns: boolean
      }
      is_gym_admin: {
        Args: Record<PropertyKey, never> | { user_id: string }
        Returns: boolean
      }
      is_staff_or_above: {
        Args: { user_uuid: string }
        Returns: boolean
      }
      is_super_admin: {
        Args: { user_uuid: string }
        Returns: boolean
      }
      is_user_admin: {
        Args: { _user_id: string }
        Returns: boolean
      }
      process_membership_referral_bonus: {
        Args: { p_member_id: string; p_membership_id: string }
        Returns: undefined
      }
      record_invoice_payment: {
        Args: {
          p_amount: number
          p_invoice_id: string
          p_member_id?: string
          p_member_name?: string
          p_notes?: string
          p_payment_date?: string
          p_payment_method: string
          p_reference?: string
        }
        Returns: Json
      }
      upsert_member: {
        Args: { p_user_id: string }
        Returns: undefined
      }
    }
    Enums: {
      assignment_status:
        | "scheduled"
        | "in_progress"
        | "completed"
        | "cancelled"
        | "no_show"
      attendance_status: "checked-in" | "checked-out" | "no-show" | "late"
      bonus_type: "referral_signup" | "referral_membership" | "loyalty_points"
      certification_level: "basic" | "intermediate" | "advanced" | "expert"
      class_recurrence: "none" | "daily" | "weekly" | "monthly"
      class_status: "scheduled" | "completed" | "cancelled"
      class_tag:
        | "strength"
        | "cardio"
        | "flexibility"
        | "dance"
        | "martial-arts"
        | "water"
        | "mind-body"
      device_status: "online" | "offline" | "maintenance"
      email_template_type:
        | "welcome"
        | "membership_renewal"
        | "payment_reminder"
        | "class_reminder"
        | "birthday"
        | "promotional"
        | "system_notification"
      employment_type: "full_time" | "part_time" | "contract" | "intern"
      entry_method: "biometric" | "manual" | "card" | "mobile"
      equipment_condition: "excellent" | "good" | "fair" | "poor"
      equipment_status:
        | "operational"
        | "maintenance"
        | "out_of_order"
        | "retired"
      feedback_priority: "low" | "medium" | "high" | "urgent"
      feedback_status: "pending" | "in-review" | "resolved" | "closed"
      feedback_type:
        | "facility"
        | "trainer"
        | "class"
        | "equipment"
        | "service"
        | "general"
      freeze_status: "pending" | "approved" | "rejected" | "active"
      gender: "male" | "female" | "other" | "prefer-not-to-say"
      government_id_type: "aadhaar" | "pan" | "passport" | "voter-id"
      invoice_status: "draft" | "sent" | "paid" | "overdue" | "cancelled"
      lead_priority: "low" | "medium" | "high" | "urgent"
      lead_source:
        | "website"
        | "referral"
        | "social"
        | "walk-in"
        | "phone"
        | "email"
        | "event"
      lead_status: "new" | "contacted" | "qualified" | "converted" | "lost"
      locker_status: "available" | "occupied" | "maintenance" | "reserved"
      maintenance_status: "pending" | "in_progress" | "completed" | "cancelled"
      maintenance_type: "routine" | "repair" | "deep_cleaning" | "calibration"
      membership_status: "active" | "expired" | "frozen" | "cancelled"
      notification_type: "announcement" | "system" | "membership" | "referral"
      order_status: "pending" | "completed" | "cancelled" | "refunded"
      package_status: "active" | "paused" | "expired" | "cancelled"
      payment_method_type:
        | "cash"
        | "card"
        | "bank_transfer"
        | "digital_wallet"
        | "other"
      payment_status: "pending" | "completed" | "failed" | "refunded"
      plan_difficulty: "beginner" | "intermediate" | "advanced" | "expert"
      plan_status: "draft" | "active" | "archived"
      redemption_type:
        | "pos_purchase"
        | "membership_extension"
        | "cash_equivalent"
      session_type:
        | "personal_training"
        | "group_class"
        | "consultation"
        | "assessment"
      sms_template_type:
        | "welcome"
        | "appointment_reminder"
        | "payment_due"
        | "class_cancelled"
        | "promotional"
        | "otp_verification"
      team_role: "manager" | "trainer" | "staff"
      trainer_specialty:
        | "strength_training"
        | "cardio"
        | "yoga"
        | "pilates"
        | "crossfit"
        | "martial_arts"
        | "dance"
        | "swimming"
        | "rehabilitation"
        | "nutrition"
        | "weight_loss"
        | "bodybuilding"
        | "sports_performance"
        | "senior_fitness"
        | "youth_fitness"
      trainer_status: "active" | "inactive" | "on_leave" | "busy"
      transaction_status: "completed" | "pending" | "cancelled"
      transaction_type: "income" | "expense"
      user_role:
        | "super-admin"
        | "admin"
        | "team"
        | "member"
        | "manager"
        | "staff"
        | "trainer"
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
    Enums: {
      assignment_status: [
        "scheduled",
        "in_progress",
        "completed",
        "cancelled",
        "no_show",
      ],
      attendance_status: ["checked-in", "checked-out", "no-show", "late"],
      bonus_type: ["referral_signup", "referral_membership", "loyalty_points"],
      certification_level: ["basic", "intermediate", "advanced", "expert"],
      class_recurrence: ["none", "daily", "weekly", "monthly"],
      class_status: ["scheduled", "completed", "cancelled"],
      class_tag: [
        "strength",
        "cardio",
        "flexibility",
        "dance",
        "martial-arts",
        "water",
        "mind-body",
      ],
      device_status: ["online", "offline", "maintenance"],
      email_template_type: [
        "welcome",
        "membership_renewal",
        "payment_reminder",
        "class_reminder",
        "birthday",
        "promotional",
        "system_notification",
      ],
      employment_type: ["full_time", "part_time", "contract", "intern"],
      entry_method: ["biometric", "manual", "card", "mobile"],
      equipment_condition: ["excellent", "good", "fair", "poor"],
      equipment_status: [
        "operational",
        "maintenance",
        "out_of_order",
        "retired",
      ],
      feedback_priority: ["low", "medium", "high", "urgent"],
      feedback_status: ["pending", "in-review", "resolved", "closed"],
      feedback_type: [
        "facility",
        "trainer",
        "class",
        "equipment",
        "service",
        "general",
      ],
      freeze_status: ["pending", "approved", "rejected", "active"],
      gender: ["male", "female", "other", "prefer-not-to-say"],
      government_id_type: ["aadhaar", "pan", "passport", "voter-id"],
      invoice_status: ["draft", "sent", "paid", "overdue", "cancelled"],
      lead_priority: ["low", "medium", "high", "urgent"],
      lead_source: [
        "website",
        "referral",
        "social",
        "walk-in",
        "phone",
        "email",
        "event",
      ],
      lead_status: ["new", "contacted", "qualified", "converted", "lost"],
      locker_status: ["available", "occupied", "maintenance", "reserved"],
      maintenance_status: ["pending", "in_progress", "completed", "cancelled"],
      maintenance_type: ["routine", "repair", "deep_cleaning", "calibration"],
      membership_status: ["active", "expired", "frozen", "cancelled"],
      notification_type: ["announcement", "system", "membership", "referral"],
      order_status: ["pending", "completed", "cancelled", "refunded"],
      package_status: ["active", "paused", "expired", "cancelled"],
      payment_method_type: [
        "cash",
        "card",
        "bank_transfer",
        "digital_wallet",
        "other",
      ],
      payment_status: ["pending", "completed", "failed", "refunded"],
      plan_difficulty: ["beginner", "intermediate", "advanced", "expert"],
      plan_status: ["draft", "active", "archived"],
      redemption_type: [
        "pos_purchase",
        "membership_extension",
        "cash_equivalent",
      ],
      session_type: [
        "personal_training",
        "group_class",
        "consultation",
        "assessment",
      ],
      sms_template_type: [
        "welcome",
        "appointment_reminder",
        "payment_due",
        "class_cancelled",
        "promotional",
        "otp_verification",
      ],
      team_role: ["manager", "trainer", "staff"],
      trainer_specialty: [
        "strength_training",
        "cardio",
        "yoga",
        "pilates",
        "crossfit",
        "martial_arts",
        "dance",
        "swimming",
        "rehabilitation",
        "nutrition",
        "weight_loss",
        "bodybuilding",
        "sports_performance",
        "senior_fitness",
        "youth_fitness",
      ],
      trainer_status: ["active", "inactive", "on_leave", "busy"],
      transaction_status: ["completed", "pending", "cancelled"],
      transaction_type: ["income", "expense"],
      user_role: [
        "super-admin",
        "admin",
        "team",
        "member",
        "manager",
        "staff",
        "trainer",
      ],
    },
  },
} as const
