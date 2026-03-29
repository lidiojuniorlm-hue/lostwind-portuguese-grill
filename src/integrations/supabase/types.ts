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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      activity_log: {
        Row: {
          action: string
          created_at: string
          details: string | null
          id: string
          user_id: string | null
          user_name: string | null
        }
        Insert: {
          action: string
          created_at?: string
          details?: string | null
          id?: string
          user_id?: string | null
          user_name?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          details?: string | null
          id?: string
          user_id?: string | null
          user_name?: string | null
        }
        Relationships: []
      }
      app_settings: {
        Row: {
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string
          value?: Json
        }
        Update: {
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      inventory: {
        Row: {
          current_stock: number
          id: string
          max_stock: number
          min_stock: number
          product_id: string
          store_name: string
          updated_at: string
        }
        Insert: {
          current_stock?: number
          id?: string
          max_stock?: number
          min_stock?: number
          product_id: string
          store_name: string
          updated_at?: string
        }
        Update: {
          current_stock?: number
          id?: string
          max_stock?: number
          min_stock?: number
          product_id?: string
          store_name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          actual_price: number | null
          actual_qty: number | null
          actual_vat: number | null
          id: string
          order_id: string
          product_id: string
          product_name: string
          qty: number
          section: Database["public"]["Enums"]["product_section"]
          unit: string
          unit_price: number
          vat_rate: number
        }
        Insert: {
          actual_price?: number | null
          actual_qty?: number | null
          actual_vat?: number | null
          id?: string
          order_id: string
          product_id: string
          product_name: string
          qty?: number
          section: Database["public"]["Enums"]["product_section"]
          unit: string
          unit_price?: number
          vat_rate?: number
        }
        Update: {
          actual_price?: number | null
          actual_qty?: number | null
          actual_vat?: number | null
          id?: string
          order_id?: string
          product_id?: string
          product_name?: string
          qty?: number
          section?: Database["public"]["Enums"]["product_section"]
          unit?: string
          unit_price?: number
          vat_rate?: number
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
          created_at: string
          created_by: string
          id: string
          notes: string | null
          status: Database["public"]["Enums"]["order_status"]
          store_name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          notes?: string | null
          status?: Database["public"]["Enums"]["order_status"]
          store_name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          notes?: string | null
          status?: Database["public"]["Enums"]["order_status"]
          store_name?: string
          updated_at?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          active: boolean
          created_at: string
          id: string
          name: string
          section: Database["public"]["Enums"]["product_section"]
          unit: string
          unit_price: number
          updated_at: string
          vat_rate: number
        }
        Insert: {
          active?: boolean
          created_at?: string
          id?: string
          name: string
          section: Database["public"]["Enums"]["product_section"]
          unit?: string
          unit_price?: number
          updated_at?: string
          vat_rate?: number
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: string
          name?: string
          section?: Database["public"]["Enums"]["product_section"]
          unit?: string
          unit_price?: number
          updated_at?: string
          vat_rate?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      stores: {
        Row: {
          active: boolean
          created_at: string
          id: string
          name: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      suppliers: {
        Row: {
          address: string | null
          category: string
          contact: string | null
          created_at: string
          email: string | null
          id: string
          name: string
          nif: string | null
          notes: string | null
          phone: string | null
        }
        Insert: {
          address?: string | null
          category?: string
          contact?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name: string
          nif?: string | null
          notes?: string | null
          phone?: string | null
        }
        Update: {
          address?: string | null
          category?: string
          contact?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          nif?: string | null
          notes?: string | null
          phone?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          store: string | null
          user_id: string
        }
        Insert: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          store?: string | null
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          store?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      get_user_store: { Args: { _user_id: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "armazem" | "funcionario"
      order_status:
        | "pendente"
        | "em_preparacao"
        | "pronto"
        | "entregue"
        | "cancelado"
      product_section:
        | "Carnes"
        | "Secos e Molhados"
        | "Peixes"
        | "Embalagens"
        | "Bebidas"
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
      app_role: ["admin", "armazem", "funcionario"],
      order_status: [
        "pendente",
        "em_preparacao",
        "pronto",
        "entregue",
        "cancelado",
      ],
      product_section: [
        "Carnes",
        "Secos e Molhados",
        "Peixes",
        "Embalagens",
        "Bebidas",
      ],
    },
  },
} as const
