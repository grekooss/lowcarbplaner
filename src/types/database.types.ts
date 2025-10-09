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
    PostgrestVersion: '13.0.5'
  }
  content: {
    Tables: {
      ingredient_unit_conversions: {
        Row: {
          grams_equivalent: number
          id: number
          ingredient_id: number
          unit_name: string
        }
        Insert: {
          grams_equivalent: number
          id?: number
          ingredient_id: number
          unit_name: string
        }
        Update: {
          grams_equivalent?: number
          id?: number
          ingredient_id?: number
          unit_name?: string
        }
        Relationships: [
          {
            foreignKeyName: 'ingredient_unit_conversions_ingredient_id_fkey'
            columns: ['ingredient_id']
            isOneToOne: false
            referencedRelation: 'ingredients'
            referencedColumns: ['id']
          },
        ]
      }
      ingredients: {
        Row: {
          calories_per_100_units: number
          carbs_per_100_units: number
          category: Database['public']['Enums']['ingredient_category_enum']
          created_at: string
          fats_per_100_units: number
          id: number
          image_url: string | null
          is_divisible: boolean
          name: string
          protein_per_100_units: number
          unit: string
        }
        Insert: {
          calories_per_100_units: number
          carbs_per_100_units: number
          category: Database['public']['Enums']['ingredient_category_enum']
          created_at?: string
          fats_per_100_units: number
          id?: number
          image_url?: string | null
          is_divisible?: boolean
          name: string
          protein_per_100_units: number
          unit?: string
        }
        Update: {
          calories_per_100_units?: number
          carbs_per_100_units?: number
          category?: Database['public']['Enums']['ingredient_category_enum']
          created_at?: string
          fats_per_100_units?: number
          id?: number
          image_url?: string | null
          is_divisible?: boolean
          name?: string
          protein_per_100_units?: number
          unit?: string
        }
        Relationships: []
      }
      recipe_ingredients: {
        Row: {
          base_amount: number
          calories: number | null
          carbs_g: number | null
          fats_g: number | null
          ingredient_id: number
          is_scalable: boolean
          protein_g: number | null
          recipe_id: number
          step_number: number | null
          unit: string
        }
        Insert: {
          base_amount: number
          calories?: number | null
          carbs_g?: number | null
          fats_g?: number | null
          ingredient_id: number
          is_scalable?: boolean
          protein_g?: number | null
          recipe_id: number
          step_number?: number | null
          unit?: string
        }
        Update: {
          base_amount?: number
          calories?: number | null
          carbs_g?: number | null
          fats_g?: number | null
          ingredient_id?: number
          is_scalable?: boolean
          protein_g?: number | null
          recipe_id?: number
          step_number?: number | null
          unit?: string
        }
        Relationships: [
          {
            foreignKeyName: 'recipe_ingredients_ingredient_id_fkey'
            columns: ['ingredient_id']
            isOneToOne: false
            referencedRelation: 'ingredients'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'recipe_ingredients_recipe_id_fkey'
            columns: ['recipe_id']
            isOneToOne: false
            referencedRelation: 'recipes'
            referencedColumns: ['id']
          },
        ]
      }
      recipes: {
        Row: {
          created_at: string
          id: number
          image_url: string | null
          instructions: Json
          meal_types: Database['public']['Enums']['meal_type_enum'][]
          name: string
          tags: string[] | null
          total_calories: number | null
          total_carbs_g: number | null
          total_fats_g: number | null
          total_protein_g: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: number
          image_url?: string | null
          instructions: Json
          meal_types: Database['public']['Enums']['meal_type_enum'][]
          name: string
          tags?: string[] | null
          total_calories?: number | null
          total_carbs_g?: number | null
          total_fats_g?: number | null
          total_protein_g?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: number
          image_url?: string | null
          instructions?: Json
          meal_types?: Database['public']['Enums']['meal_type_enum'][]
          name?: string
          tags?: string[] | null
          total_calories?: number | null
          total_carbs_g?: number | null
          total_fats_g?: number | null
          total_protein_g?: number | null
          updated_at?: string
        }
        Relationships: []
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
  public: {
    Tables: {
      feedback: {
        Row: {
          content: string
          created_at: string
          id: number
          metadata: Json | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: number
          metadata?: Json | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: number
          metadata?: Json | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'feedback_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      planned_meals: {
        Row: {
          created_at: string
          id: number
          ingredient_overrides: Json | null
          is_eaten: boolean
          meal_date: string
          meal_type: Database['public']['Enums']['meal_type_enum']
          recipe_id: number | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: number
          ingredient_overrides?: Json | null
          is_eaten?: boolean
          meal_date: string
          meal_type: Database['public']['Enums']['meal_type_enum']
          recipe_id?: number | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: number
          ingredient_overrides?: Json | null
          is_eaten?: boolean
          meal_date?: string
          meal_type?: Database['public']['Enums']['meal_type_enum']
          recipe_id?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'planned_meals_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      profiles: {
        Row: {
          activity_level: Database['public']['Enums']['activity_level_enum']
          age: number
          created_at: string
          disclaimer_accepted_at: string | null
          email: string
          gender: Database['public']['Enums']['gender_enum']
          goal: Database['public']['Enums']['goal_enum']
          height_cm: number
          id: string
          target_calories: number
          target_carbs_g: number
          target_fats_g: number
          target_protein_g: number
          updated_at: string
          weight_kg: number
          weight_loss_rate_kg_week: number | null
        }
        Insert: {
          activity_level: Database['public']['Enums']['activity_level_enum']
          age: number
          created_at?: string
          disclaimer_accepted_at?: string | null
          email: string
          gender: Database['public']['Enums']['gender_enum']
          goal: Database['public']['Enums']['goal_enum']
          height_cm: number
          id: string
          target_calories: number
          target_carbs_g: number
          target_fats_g: number
          target_protein_g: number
          updated_at?: string
          weight_kg: number
          weight_loss_rate_kg_week?: number | null
        }
        Update: {
          activity_level?: Database['public']['Enums']['activity_level_enum']
          age?: number
          created_at?: string
          disclaimer_accepted_at?: string | null
          email?: string
          gender?: Database['public']['Enums']['gender_enum']
          goal?: Database['public']['Enums']['goal_enum']
          height_cm?: number
          id?: string
          target_calories?: number
          target_carbs_g?: number
          target_fats_g?: number
          target_protein_g?: number
          updated_at?: string
          weight_kg?: number
          weight_loss_rate_kg_week?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      activity_level_enum:
        | 'very_low'
        | 'low'
        | 'moderate'
        | 'high'
        | 'very_high'
      gender_enum: 'male' | 'female'
      goal_enum: 'weight_loss' | 'weight_maintenance'
      ingredient_category_enum:
        | 'vegetables'
        | 'fruits'
        | 'meat'
        | 'fish'
        | 'dairy'
        | 'eggs'
        | 'nuts_seeds'
        | 'oils_fats'
        | 'spices_herbs'
        | 'flours'
        | 'beverages'
        | 'sweeteners'
        | 'condiments'
        | 'other'
      meal_type_enum: 'breakfast' | 'lunch' | 'dinner'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] &
        DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] &
        DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  content: {
    Enums: {},
  },
  public: {
    Enums: {
      activity_level_enum: ['very_low', 'low', 'moderate', 'high', 'very_high'],
      gender_enum: ['male', 'female'],
      goal_enum: ['weight_loss', 'weight_maintenance'],
      ingredient_category_enum: [
        'vegetables',
        'fruits',
        'meat',
        'fish',
        'dairy',
        'eggs',
        'nuts_seeds',
        'oils_fats',
        'spices_herbs',
        'flours',
        'beverages',
        'sweeteners',
        'condiments',
        'other',
      ],
      meal_type_enum: ['breakfast', 'lunch', 'dinner'],
    },
  },
} as const
