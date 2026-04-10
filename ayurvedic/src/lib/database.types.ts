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
      users: {
        Row: {
          id: string
          full_name: string | null
          email: string
          phone_number: string | null
          gender: 'male' | 'female' | null
          role: 'admin' | 'customer' | 'sales_agent'
          created_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          email: string
          phone_number?: string | null
          gender?: 'male' | 'female' | null
          role?: 'admin' | 'customer' | 'sales_agent'
          created_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          email?: string
          phone_number?: string | null
          gender?: 'male' | 'female' | null
          role?: 'admin' | 'customer' | 'sales_agent'
          created_at?: string
        }
      }
      products: {
        Row: {
          id: string
          name: string
          description: string | null
          price_rm: number
          sku: string
          stock_qty: number
          category: string | null
          is_bundle: boolean
          image_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          price_rm: number
          sku: string
          stock_qty?: number
          category?: string | null
          is_bundle?: boolean
          image_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          price_rm?: number
          sku?: string
          stock_qty?: number
          category?: string | null
          is_bundle?: boolean
          image_url?: string | null
          created_at?: string
        }
      }
      bundle_items: {
        Row: {
          id: string
          bundle_product_id: string
          child_product_id: string
          quantity: number
        }
        Insert: {
          id?: string
          bundle_product_id: string
          child_product_id: string
          quantity?: number
        }
        Update: {
          id?: string
          bundle_product_id?: string
          child_product_id?: string
          quantity?: number
        }
      }
      orders: {
        Row: {
          id: string
          customer_id: string | null
          total_amount_rm: number
          payment_status: 'pending' | 'paid' | 'failed'
          fulfillment_status: 'processing' | 'shipped' | 'delivered'
          courier_service: 'Pos Laju' | 'J&T Express' | 'DHL' | 'GDex' | 'Ninja Van' | 'Self-Pickup' | null
          tracking_number: string | null
          referral_agent_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          customer_id?: string | null
          total_amount_rm: number
          payment_status?: 'pending' | 'paid' | 'failed'
          fulfillment_status?: 'processing' | 'shipped' | 'delivered'
          courier_service?: 'Pos Laju' | 'J&T Express' | 'DHL' | 'GDex' | 'Ninja Van' | 'Self-Pickup' | null
          tracking_number?: string | null
          referral_agent_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          customer_id?: string | null
          total_amount_rm?: number
          payment_status?: 'pending' | 'paid' | 'failed'
          fulfillment_status?: 'processing' | 'shipped' | 'delivered'
          courier_service?: 'Pos Laju' | 'J&T Express' | 'DHL' | 'GDex' | 'Ninja Van' | 'Self-Pickup' | null
          tracking_number?: string | null
          referral_agent_id?: string | null
          created_at?: string
        }
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          product_id: string | null
          quantity: number
          price_at_purchase_rm: number
        }
        Insert: {
          id?: string
          order_id: string
          product_id?: string | null
          quantity: number
          price_at_purchase_rm: number
        }
        Update: {
          id?: string
          order_id?: string
          product_id?: string | null
          quantity?: number
          price_at_purchase_rm?: number
        }
      }
      appointments: {
        Row: {
          id: string
          customer_id: string | null
          treatment_name: string
          doctor_name: string
          appointment_date_time: string
          duration_mins: number
          status: 'scheduled' | 'completed' | 'cancelled'
          advance_payment_rm: number | null
          calcom_booking_uid: string | null
        }
        Insert: {
          id?: string
          customer_id?: string | null
          treatment_name: string
          doctor_name?: string
          appointment_date_time: string
          duration_mins?: number
          status?: 'scheduled' | 'completed' | 'cancelled'
          advance_payment_rm?: number | null
          calcom_booking_uid?: string | null
        }
        Update: {
          id?: string
          customer_id?: string | null
          treatment_name?: string
          doctor_name?: string
          appointment_date_time?: string
          duration_mins?: number
          status?: 'scheduled' | 'completed' | 'cancelled'
          advance_payment_rm?: number | null
          calcom_booking_uid?: string | null
        }
      }
      sales_agents: {
        Row: {
          id: string
          user_id: string
          referral_code: string
          commission_rate: number
          total_sales_generated_rm: number
          total_commission_earned_rm: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          referral_code: string
          commission_rate?: number
          total_sales_generated_rm?: number
          total_commission_earned_rm?: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          referral_code?: string
          commission_rate?: number
          total_sales_generated_rm?: number
          total_commission_earned_rm?: number
          created_at?: string
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
  }
}
