export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string
          created_at: string | null
          details: Json | null
          entity_id: string | null
          entity_type: string
          id: string
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          details?: Json | null
          entity_id?: string | null
          entity_type: string
          id?: string
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          details?: Json | null
          entity_id?: string | null
          entity_type?: string
          id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      billing_records: {
        Row: {
          amount: number
          billing_date: string | null
          created_at: string | null
          customer_id: string
          id: string
          payment_status: string | null
          sample_id: string
          test_type: Database["public"]["Enums"]["test_type"]
          updated_at: string | null
        }
        Insert: {
          amount: number
          billing_date?: string | null
          created_at?: string | null
          customer_id: string
          id?: string
          payment_status?: string | null
          sample_id: string
          test_type: Database["public"]["Enums"]["test_type"]
          updated_at?: string | null
        }
        Update: {
          amount?: number
          billing_date?: string | null
          created_at?: string | null
          customer_id?: string
          id?: string
          payment_status?: string | null
          sample_id?: string
          test_type?: Database["public"]["Enums"]["test_type"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "billing_records_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "billing_records_sample_id_fkey"
            columns: ["sample_id"]
            isOneToOne: false
            referencedRelation: "samples"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          contact: string
          created_at: string | null
          email: string
          id: string
          location: string
          name: string
          tier: Database["public"]["Enums"]["customer_tier"]
          updated_at: string | null
        }
        Insert: {
          contact: string
          created_at?: string | null
          email: string
          id?: string
          location: string
          name: string
          tier?: Database["public"]["Enums"]["customer_tier"]
          updated_at?: string | null
        }
        Update: {
          contact?: string
          created_at?: string | null
          email?: string
          id?: string
          location?: string
          name?: string
          tier?: Database["public"]["Enums"]["customer_tier"]
          updated_at?: string | null
        }
        Relationships: []
      }
      lab_locations: {
        Row: {
          active: boolean | null
          address: string | null
          contact_info: Json | null
          created_at: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          address?: string | null
          contact_info?: Json | null
          created_at?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          address?: string | null
          contact_info?: Json | null
          created_at?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      patients: {
        Row: {
          address: string | null
          age: number | null
          contact_number: string | null
          created_at: string | null
          created_by: string | null
          gender: string | null
          id: string
          medical_history: string | null
          name: string
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          age?: number | null
          contact_number?: string | null
          created_at?: string | null
          created_by?: string | null
          gender?: string | null
          id?: string
          medical_history?: string | null
          name: string
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          age?: number | null
          contact_number?: string | null
          created_at?: string | null
          created_by?: string | null
          gender?: string | null
          id?: string
          medical_history?: string | null
          name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "patients_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      pricing_tiers: {
        Row: {
          co_test_price: number
          created_at: string | null
          hpv_price: number
          id: string
          lbc_price: number
          tier_name: Database["public"]["Enums"]["customer_tier"]
          updated_at: string | null
        }
        Insert: {
          co_test_price: number
          created_at?: string | null
          hpv_price: number
          id?: string
          lbc_price: number
          tier_name: Database["public"]["Enums"]["customer_tier"]
          updated_at?: string | null
        }
        Update: {
          co_test_price?: number
          created_at?: string | null
          hpv_price?: number
          id?: string
          lbc_price?: number
          tier_name?: Database["public"]["Enums"]["customer_tier"]
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          id: string
          profile_type: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id: string
          profile_type: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          profile_type?: string
        }
        Relationships: []
      }
      samples: {
        Row: {
          accession_date: string | null
          assigned_pathologist: string | null
          assigned_technician: string | null
          barcode: string
          created_at: string | null
          customer_id: string
          customer_name: string
          id: string
          lab_id: string
          pathologist_assigned_at: string | null
          patient_id: string | null
          processing_notes: string | null
          status: Database["public"]["Enums"]["sample_status"]
          technician_completed_at: string | null
          test_type: Database["public"]["Enums"]["test_type"]
          updated_at: string | null
        }
        Insert: {
          accession_date?: string | null
          assigned_pathologist?: string | null
          assigned_technician?: string | null
          barcode: string
          created_at?: string | null
          customer_id: string
          customer_name: string
          id?: string
          lab_id: string
          pathologist_assigned_at?: string | null
          patient_id?: string | null
          processing_notes?: string | null
          status?: Database["public"]["Enums"]["sample_status"]
          technician_completed_at?: string | null
          test_type: Database["public"]["Enums"]["test_type"]
          updated_at?: string | null
        }
        Update: {
          accession_date?: string | null
          assigned_pathologist?: string | null
          assigned_technician?: string | null
          barcode?: string
          created_at?: string | null
          customer_id?: string
          customer_name?: string
          id?: string
          lab_id?: string
          pathologist_assigned_at?: string | null
          patient_id?: string | null
          processing_notes?: string | null
          status?: Database["public"]["Enums"]["sample_status"]
          technician_completed_at?: string | null
          test_type?: Database["public"]["Enums"]["test_type"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "samples_assigned_pathologist_fkey"
            columns: ["assigned_pathologist"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "samples_assigned_technician_fkey"
            columns: ["assigned_technician"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "samples_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "samples_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      slide_images: {
        Row: {
          file_name: string
          id: string
          upload_url: string | null
          uploaded_at: string
          user_id: string
        }
        Insert: {
          file_name: string
          id?: string
          upload_url?: string | null
          uploaded_at?: string
          user_id: string
        }
        Update: {
          file_name?: string
          id?: string
          upload_url?: string | null
          uploaded_at?: string
          user_id?: string
        }
        Relationships: []
      }
      test_results: {
        Row: {
          completed_by: string | null
          created_at: string | null
          diagnosis: string | null
          id: string
          images_uploaded: boolean | null
          patient_id: string | null
          recommendations: string | null
          report_generated: boolean | null
          report_sent_at: string | null
          report_sent_to: string | null
          report_url: string | null
          reviewed_by: string | null
          sample_id: string
          test_findings: string | null
          updated_at: string | null
        }
        Insert: {
          completed_by?: string | null
          created_at?: string | null
          diagnosis?: string | null
          id?: string
          images_uploaded?: boolean | null
          patient_id?: string | null
          recommendations?: string | null
          report_generated?: boolean | null
          report_sent_at?: string | null
          report_sent_to?: string | null
          report_url?: string | null
          reviewed_by?: string | null
          sample_id: string
          test_findings?: string | null
          updated_at?: string | null
        }
        Update: {
          completed_by?: string | null
          created_at?: string | null
          diagnosis?: string | null
          id?: string
          images_uploaded?: boolean | null
          patient_id?: string | null
          recommendations?: string | null
          report_generated?: boolean | null
          report_sent_at?: string | null
          report_sent_to?: string | null
          report_url?: string | null
          reviewed_by?: string | null
          sample_id?: string
          test_findings?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "test_results_completed_by_fkey"
            columns: ["completed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "test_results_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "test_results_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "test_results_sample_id_fkey"
            columns: ["sample_id"]
            isOneToOne: false
            referencedRelation: "samples"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string | null
          email: string
          id: string
          lab_location: string | null
          name: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id: string
          lab_location?: string | null
          name: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          lab_location?: string | null
          name?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_random_password: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: Database["public"]["Enums"]["user_role"]
      }
      log_audit_event: {
        Args: {
          p_action: string
          p_entity_type: string
          p_entity_id?: string
          p_details?: Json
        }
        Returns: undefined
      }
    }
    Enums: {
      customer_tier: "Platinum" | "Gold" | "Silver"
      sample_status:
        | "pending"
        | "processing"
        | "review"
        | "completed"
        | "rejected"
      test_type: "LBC" | "HPV" | "Co-test"
      user_role:
        | "admin"
        | "accession"
        | "technician"
        | "pathologist"
        | "customer"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      customer_tier: ["Platinum", "Gold", "Silver"],
      sample_status: [
        "pending",
        "processing",
        "review",
        "completed",
        "rejected",
      ],
      test_type: ["LBC", "HPV", "Co-test"],
      user_role: [
        "admin",
        "accession",
        "technician",
        "pathologist",
        "customer",
      ],
    },
  },
} as const
