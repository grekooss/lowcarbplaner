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
      [_ in never]: never
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
      equipment: {
        Row: {
          category: Database['public']['Enums']['equipment_category_enum']
          created_at: string
          icon_name: string | null
          id: number
          name: string
          name_plural: string | null
        }
        Insert: {
          category?: Database['public']['Enums']['equipment_category_enum']
          created_at?: string
          icon_name?: string | null
          id?: number
          name: string
          name_plural?: string | null
        }
        Update: {
          category?: Database['public']['Enums']['equipment_category_enum']
          created_at?: string
          icon_name?: string | null
          id?: number
          name?: string
          name_plural?: string | null
        }
        Relationships: []
      }
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
            foreignKeyName: 'planned_meals_recipe_id_fkey'
            columns: ['recipe_id']
            isOneToOne: false
            referencedRelation: 'recipes'
            referencedColumns: ['id']
          },
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
          activity_level:
            | Database['public']['Enums']['activity_level_enum']
            | null
          age: number | null
          created_at: string
          disclaimer_accepted_at: string | null
          eating_end_time: string
          eating_start_time: string
          email: string
          gender: Database['public']['Enums']['gender_enum'] | null
          goal: Database['public']['Enums']['goal_enum'] | null
          height_cm: number | null
          id: string
          macro_ratio: Database['public']['Enums']['macro_ratio_enum']
          meal_plan_type: Database['public']['Enums']['meal_plan_type_enum']
          selected_meals: Database['public']['Enums']['meal_type_enum'][] | null
          target_calories: number | null
          target_carbs_g: number | null
          target_fats_g: number | null
          target_protein_g: number | null
          updated_at: string
          weight_kg: number | null
          weight_loss_rate_kg_week: number | null
        }
        Insert: {
          activity_level?:
            | Database['public']['Enums']['activity_level_enum']
            | null
          age?: number | null
          created_at?: string
          disclaimer_accepted_at?: string | null
          eating_end_time?: string
          eating_start_time?: string
          email: string
          gender?: Database['public']['Enums']['gender_enum'] | null
          goal?: Database['public']['Enums']['goal_enum'] | null
          height_cm?: number | null
          id: string
          macro_ratio?: Database['public']['Enums']['macro_ratio_enum']
          meal_plan_type?: Database['public']['Enums']['meal_plan_type_enum']
          selected_meals?:
            | Database['public']['Enums']['meal_type_enum'][]
            | null
          target_calories?: number | null
          target_carbs_g?: number | null
          target_fats_g?: number | null
          target_protein_g?: number | null
          updated_at?: string
          weight_kg?: number | null
          weight_loss_rate_kg_week?: number | null
        }
        Update: {
          activity_level?:
            | Database['public']['Enums']['activity_level_enum']
            | null
          age?: number | null
          created_at?: string
          disclaimer_accepted_at?: string | null
          eating_end_time?: string
          eating_start_time?: string
          email?: string
          gender?: Database['public']['Enums']['gender_enum'] | null
          goal?: Database['public']['Enums']['goal_enum'] | null
          height_cm?: number | null
          id?: string
          macro_ratio?: Database['public']['Enums']['macro_ratio_enum']
          meal_plan_type?: Database['public']['Enums']['meal_plan_type_enum']
          selected_meals?:
            | Database['public']['Enums']['meal_type_enum'][]
            | null
          target_calories?: number | null
          target_carbs_g?: number | null
          target_fats_g?: number | null
          target_protein_g?: number | null
          updated_at?: string
          weight_kg?: number | null
          weight_loss_rate_kg_week?: number | null
        }
        Relationships: []
      }
      recipe_equipment: {
        Row: {
          equipment_id: number
          notes: string | null
          quantity: number
          recipe_id: number
        }
        Insert: {
          equipment_id: number
          notes?: string | null
          quantity?: number
          recipe_id: number
        }
        Update: {
          equipment_id?: number
          notes?: string | null
          quantity?: number
          recipe_id?: number
        }
        Relationships: [
          {
            foreignKeyName: 'recipe_equipment_equipment_id_fkey'
            columns: ['equipment_id']
            isOneToOne: false
            referencedRelation: 'equipment'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'recipe_equipment_recipe_id_fkey'
            columns: ['recipe_id']
            isOneToOne: false
            referencedRelation: 'recipes'
            referencedColumns: ['id']
          },
        ]
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
          average_rating: number | null
          cook_time_min: number | null
          created_at: string
          difficulty_level: Database['public']['Enums']['difficulty_level_enum']
          id: number
          image_url: string | null
          instructions: Json
          meal_types: Database['public']['Enums']['meal_type_enum'][]
          name: string
          prep_time_min: number | null
          reviews_count: number
          tags: string[] | null
          total_calories: number | null
          total_carbs_g: number | null
          total_fats_g: number | null
          total_protein_g: number | null
          updated_at: string
        }
        Insert: {
          average_rating?: number | null
          cook_time_min?: number | null
          created_at?: string
          difficulty_level?: Database['public']['Enums']['difficulty_level_enum']
          id?: number
          image_url?: string | null
          instructions: Json
          meal_types: Database['public']['Enums']['meal_type_enum'][]
          name: string
          prep_time_min?: number | null
          reviews_count?: number
          tags?: string[] | null
          total_calories?: number | null
          total_carbs_g?: number | null
          total_fats_g?: number | null
          total_protein_g?: number | null
          updated_at?: string
        }
        Update: {
          average_rating?: number | null
          cook_time_min?: number | null
          created_at?: string
          difficulty_level?: Database['public']['Enums']['difficulty_level_enum']
          id?: number
          image_url?: string | null
          instructions?: Json
          meal_types?: Database['public']['Enums']['meal_type_enum'][]
          name?: string
          prep_time_min?: number | null
          reviews_count?: number
          tags?: string[] | null
          total_calories?: number | null
          total_carbs_g?: number | null
          total_fats_g?: number | null
          total_protein_g?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      user_history: {
        Row: {
          created_at: string
          event_date: string
          event_type: Database['public']['Enums']['history_event_type_enum']
          id: number
          meal_data: Json | null
          profile_snapshot: Json | null
          user_id: string
        }
        Insert: {
          created_at?: string
          event_date?: string
          event_type: Database['public']['Enums']['history_event_type_enum']
          id?: number
          meal_data?: Json | null
          profile_snapshot?: Json | null
          user_id: string
        }
        Update: {
          created_at?: string
          event_date?: string
          event_type?: Database['public']['Enums']['history_event_type_enum']
          id?: number
          meal_data?: Json | null
          profile_snapshot?: Json | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'user_history_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_email_exists: { Args: { check_email: string }; Returns: boolean }
    }
    Enums: {
      activity_level_enum:
        | 'very_low'
        | 'low'
        | 'moderate'
        | 'high'
        | 'very_high'
      difficulty_level_enum: 'easy' | 'medium' | 'hard'
      equipment_category_enum:
        | 'heating'
        | 'mixing'
        | 'cookware'
        | 'bakeware'
        | 'cutting'
        | 'measuring'
        | 'other'
      gender_enum: 'male' | 'female'
      goal_enum: 'weight_loss' | 'weight_maintenance'
      history_event_type_enum:
        | 'profile_created'
        | 'profile_updated'
        | 'meal_eaten'
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
      macro_ratio_enum:
        | '70_25_5'
        | '60_35_5'
        | '60_30_10'
        | '60_25_15'
        | '50_30_20'
        | '45_30_25'
        | '35_40_25'
      meal_plan_type_enum:
        | '3_main_2_snacks'
        | '3_main_1_snack'
        | '3_main'
        | '2_main'
      meal_type_enum:
        | 'breakfast'
        | 'lunch'
        | 'dinner'
        | 'snack'
        | 'snack_morning'
        | 'snack_afternoon'
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
      difficulty_level_enum: ['easy', 'medium', 'hard'],
      equipment_category_enum: [
        'heating',
        'mixing',
        'cookware',
        'bakeware',
        'cutting',
        'measuring',
        'other',
      ],
      gender_enum: ['male', 'female'],
      goal_enum: ['weight_loss', 'weight_maintenance'],
      history_event_type_enum: [
        'profile_created',
        'profile_updated',
        'meal_eaten',
      ],
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
      macro_ratio_enum: [
        '70_25_5',
        '60_35_5',
        '60_30_10',
        '60_25_15',
        '50_30_20',
        '45_30_25',
        '35_40_25',
      ],
      meal_plan_type_enum: [
        '3_main_2_snacks',
        '3_main_1_snack',
        '3_main',
        '2_main',
      ],
      meal_type_enum: [
        'breakfast',
        'lunch',
        'dinner',
        'snack',
        'snack_morning',
        'snack_afternoon',
      ],
    },
  },
} as const
