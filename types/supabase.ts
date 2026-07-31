// Generated from the live `askgeniebhai` Supabase project schema via the
// Supabase Management API (`generate_typescript_types`). Regenerate with
// `supabase gen types typescript --project-id <ref> > types/supabase.ts`
// whenever the schema changes — do not hand-edit.

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.15";
  };
  public: {
    Tables: {
      availability: {
        Row: {
          booked_count: number;
          capacity: number;
          created_at: string;
          ends_at: string;
          id: string;
          partner_service_id: string;
          starts_at: string;
          updated_at: string;
        };
        Insert: {
          booked_count?: number;
          capacity?: number;
          created_at?: string;
          ends_at: string;
          id?: string;
          partner_service_id: string;
          starts_at: string;
          updated_at?: string;
        };
        Update: {
          booked_count?: number;
          capacity?: number;
          created_at?: string;
          ends_at?: string;
          id?: string;
          partner_service_id?: string;
          starts_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "availability_partner_service_id_fkey";
            columns: ["partner_service_id"];
            isOneToOne: false;
            referencedRelation: "partner_services";
            referencedColumns: ["id"];
          },
        ];
      };
      booking_status: {
        Row: {
          booking_id: string;
          changed_at: string;
          id: string;
          note: string | null;
          status: Database["public"]["Enums"]["booking_status_value"];
        };
        Insert: {
          booking_id: string;
          changed_at?: string;
          id?: string;
          note?: string | null;
          status: Database["public"]["Enums"]["booking_status_value"];
        };
        Update: {
          booking_id?: string;
          changed_at?: string;
          id?: string;
          note?: string | null;
          status?: Database["public"]["Enums"]["booking_status_value"];
        };
        Relationships: [
          {
            foreignKeyName: "booking_status_booking_id_fkey";
            columns: ["booking_id"];
            isOneToOne: false;
            referencedRelation: "bookings";
            referencedColumns: ["id"];
          },
        ];
      };
      bookings: {
        Row: {
          availability_id: string;
          created_at: string;
          currency: string;
          id: string;
          notes: string | null;
          partner_service_id: string;
          total_price: number;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          availability_id: string;
          created_at?: string;
          currency?: string;
          id?: string;
          notes?: string | null;
          partner_service_id: string;
          total_price: number;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          availability_id?: string;
          created_at?: string;
          currency?: string;
          id?: string;
          notes?: string | null;
          partner_service_id?: string;
          total_price?: number;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "bookings_availability_id_fkey";
            columns: ["availability_id"];
            isOneToOne: false;
            referencedRelation: "availability";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "bookings_partner_service_id_fkey";
            columns: ["partner_service_id"];
            isOneToOne: false;
            referencedRelation: "partner_services";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "bookings_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      media: {
        Row: {
          content_type: string | null;
          created_at: string;
          id: string;
          partner_location_id: string | null;
          partner_service_id: string | null;
          storage_path: string;
        };
        Insert: {
          content_type?: string | null;
          created_at?: string;
          id?: string;
          partner_location_id?: string | null;
          partner_service_id?: string | null;
          storage_path: string;
        };
        Update: {
          content_type?: string | null;
          created_at?: string;
          id?: string;
          partner_location_id?: string | null;
          partner_service_id?: string | null;
          storage_path?: string;
        };
        Relationships: [
          {
            foreignKeyName: "media_partner_location_id_fkey";
            columns: ["partner_location_id"];
            isOneToOne: false;
            referencedRelation: "partner_locations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "media_partner_service_id_fkey";
            columns: ["partner_service_id"];
            isOneToOne: false;
            referencedRelation: "partner_services";
            referencedColumns: ["id"];
          },
        ];
      };
      partner_locations: {
        Row: {
          address_line1: string;
          address_line2: string | null;
          city: string;
          country: string;
          created_at: string;
          id: string;
          name: string;
          partner_id: string;
          postal_code: string | null;
          state: string | null;
          updated_at: string;
        };
        Insert: {
          address_line1: string;
          address_line2?: string | null;
          city: string;
          country?: string;
          created_at?: string;
          id?: string;
          name: string;
          partner_id: string;
          postal_code?: string | null;
          state?: string | null;
          updated_at?: string;
        };
        Update: {
          address_line1?: string;
          address_line2?: string | null;
          city?: string;
          country?: string;
          created_at?: string;
          id?: string;
          name?: string;
          partner_id?: string;
          postal_code?: string | null;
          state?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "partner_locations_partner_id_fkey";
            columns: ["partner_id"];
            isOneToOne: false;
            referencedRelation: "partners";
            referencedColumns: ["id"];
          },
        ];
      };
      partner_services: {
        Row: {
          base_price: number;
          category: Database["public"]["Enums"]["partner_category"];
          created_at: string;
          currency: string;
          description: string | null;
          id: string;
          is_active: boolean;
          name: string;
          partner_location_id: string;
          updated_at: string;
        };
        Insert: {
          base_price: number;
          category: Database["public"]["Enums"]["partner_category"];
          created_at?: string;
          currency?: string;
          description?: string | null;
          id?: string;
          is_active?: boolean;
          name: string;
          partner_location_id: string;
          updated_at?: string;
        };
        Update: {
          base_price?: number;
          category?: Database["public"]["Enums"]["partner_category"];
          created_at?: string;
          currency?: string;
          description?: string | null;
          id?: string;
          is_active?: boolean;
          name?: string;
          partner_location_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "partner_services_partner_location_id_fkey";
            columns: ["partner_location_id"];
            isOneToOne: false;
            referencedRelation: "partner_locations";
            referencedColumns: ["id"];
          },
        ];
      };
      partners: {
        Row: {
          business_name: string;
          contact_email: string | null;
          contact_phone: string | null;
          created_at: string;
          id: string;
          updated_at: string;
        };
        Insert: {
          business_name: string;
          contact_email?: string | null;
          contact_phone?: string | null;
          created_at?: string;
          id?: string;
          updated_at?: string;
        };
        Update: {
          business_name?: string;
          contact_email?: string | null;
          contact_phone?: string | null;
          created_at?: string;
          id?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      reviews: {
        Row: {
          booking_id: string;
          comment: string | null;
          created_at: string;
          id: string;
          rating: number;
          user_id: string;
        };
        Insert: {
          booking_id: string;
          comment?: string | null;
          created_at?: string;
          id?: string;
          rating: number;
          user_id: string;
        };
        Update: {
          booking_id?: string;
          comment?: string | null;
          created_at?: string;
          id?: string;
          rating?: number;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "reviews_booking_id_fkey";
            columns: ["booking_id"];
            isOneToOne: true;
            referencedRelation: "bookings";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "reviews_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      users: {
        Row: {
          created_at: string;
          full_name: string | null;
          id: string;
          phone: string | null;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          full_name?: string | null;
          id: string;
          phone?: string | null;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          full_name?: string | null;
          id?: string;
          phone?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      verification: {
        Row: {
          id: string;
          notes: string | null;
          partner_location_id: string;
          partner_service_id: string | null;
          status: Database["public"]["Enums"]["verification_status"];
          verified_at: string;
          verified_by: string | null;
        };
        Insert: {
          id?: string;
          notes?: string | null;
          partner_location_id: string;
          partner_service_id?: string | null;
          status?: Database["public"]["Enums"]["verification_status"];
          verified_at?: string;
          verified_by?: string | null;
        };
        Update: {
          id?: string;
          notes?: string | null;
          partner_location_id?: string;
          partner_service_id?: string | null;
          status?: Database["public"]["Enums"]["verification_status"];
          verified_at?: string;
          verified_by?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "verification_partner_location_id_fkey";
            columns: ["partner_location_id"];
            isOneToOne: false;
            referencedRelation: "partner_locations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "verification_partner_service_id_fkey";
            columns: ["partner_service_id"];
            isOneToOne: false;
            referencedRelation: "partner_services";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      booking_status_value:
        "requested" | "confirmed" | "in_progress" | "completed" | "cancelled";
      partner_category: "freshen_up" | "bag_storage" | "rest" | "cab" | "room";
      verification_status: "pending" | "passed" | "failed";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      booking_status_value: [
        "requested",
        "confirmed",
        "in_progress",
        "completed",
        "cancelled",
      ],
      partner_category: ["freshen_up", "bag_storage", "rest", "cab", "room"],
      verification_status: ["pending", "passed", "failed"],
    },
  },
} as const;
