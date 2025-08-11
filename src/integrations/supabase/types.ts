export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      patients: {
        Row: {
          id: string
          patient_name: string
          contact_number: string
          doctor_name: string
          opd_fee: number
          lab_fee: number
          ultrasound_fee: number
          ecg_fee: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          patient_name: string
          contact_number: string
          doctor_name: string
          opd_fee?: number
          lab_fee?: number
          ultrasound_fee?: number
          ecg_fee?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          patient_name?: string
          contact_number?: string
          doctor_name?: string
          opd_fee?: number
          lab_fee?: number
          ultrasound_fee?: number
          ecg_fee?: number
          created_at?: string
          updated_at?: string
        }
      }
      doctors: {
        Row: {
          id: string
          name: string
          email: string | null
          phone: string | null
          specialization: string
          license_number: string | null
          department: string | null
          consultation_fee: number
          experience_years: number
          qualification: string | null
          address: string | null
          is_active: boolean
          created_at: string
          updated_at: string
          opd_percentage: number | null
          lab_percentage: number | null
          ultrasound_percentage: number | null
          ecg_percentage: number | null
          ot_percentage: number | null
        }
        Insert: {
          id?: string
          name: string
          email?: string | null
          phone?: string | null
          specialization: string
          license_number?: string | null
          department?: string | null
          consultation_fee?: number
          experience_years?: number
          qualification?: string | null
          address?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
          opd_percentage?: number | null
          lab_percentage?: number | null
          ultrasound_percentage?: number | null
          ecg_percentage?: number | null
          ot_percentage?: number | null
        }
        Update: {
          id?: string
          name?: string
          email?: string | null
          phone?: string | null
          specialization?: string
          license_number?: string | null
          department?: string | null
          consultation_fee?: number
          experience_years?: number
          qualification?: string | null
          address?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
          opd_percentage?: number | null
          lab_percentage?: number | null
          ultrasound_percentage?: number | null
          ecg_percentage?: number | null
          ot_percentage?: number | null
        }
      }
      visits: {
        Row: {
          id: string
          patient_name: string
          contact: string
          doctor_id: string
          visit_date: string
          opd_fee: number
          lab_fee: number
          ot_fee: number
          ultrasound_fee: number
          ecg_fee: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          patient_name: string
          contact: string
          doctor_id: string
          visit_date: string
          opd_fee?: number
          lab_fee?: number
          ot_fee?: number
          ultrasound_fee?: number
          ecg_fee?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          patient_name?: string
          contact?: string
          doctor_id?: string
          visit_date?: string
          opd_fee?: number
          lab_fee?: number
          ot_fee?: number
          ultrasound_fee?: number
          ecg_fee?: number
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
