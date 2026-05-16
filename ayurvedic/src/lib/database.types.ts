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
          email: string | null
          phone_number: string | null
          gender: 'male' | 'female' | null
          role: 'admin' | 'customer' | 'sales_agent'
          created_at: string
          date_of_birth: string | null
          language: 'en' | 'ms'
          height_cm: number | null
          weight_kg: number | null
          allergies: string | null
          current_medications: string | null
          medical_conditions: string | null
          marketing_opt_in: boolean
          whatsapp_reminders_opt_in: boolean
          email_reminders_opt_in: boolean
          treatment_followups_opt_in: boolean
          avatar_url: string | null
          deleted_at: string | null
          deletion_requested_at: string | null
          mfa_enrolled: boolean
        }
        Insert: {
          id: string
          full_name?: string | null
          email?: string | null
          phone_number?: string | null
          gender?: 'male' | 'female' | null
          role?: 'admin' | 'customer' | 'sales_agent'
          created_at?: string
          date_of_birth?: string | null
          language?: 'en' | 'ms'
          height_cm?: number | null
          weight_kg?: number | null
          allergies?: string | null
          current_medications?: string | null
          medical_conditions?: string | null
          marketing_opt_in?: boolean
          whatsapp_reminders_opt_in?: boolean
          email_reminders_opt_in?: boolean
          treatment_followups_opt_in?: boolean
          avatar_url?: string | null
          deleted_at?: string | null
          deletion_requested_at?: string | null
          mfa_enrolled?: boolean
        }
        Update: {
          id?: string
          full_name?: string | null
          email?: string | null
          phone_number?: string | null
          gender?: 'male' | 'female' | null
          role?: 'admin' | 'customer' | 'sales_agent'
          created_at?: string
          date_of_birth?: string | null
          language?: 'en' | 'ms'
          height_cm?: number | null
          weight_kg?: number | null
          allergies?: string | null
          current_medications?: string | null
          medical_conditions?: string | null
          marketing_opt_in?: boolean
          whatsapp_reminders_opt_in?: boolean
          email_reminders_opt_in?: boolean
          treatment_followups_opt_in?: boolean
          avatar_url?: string | null
          deleted_at?: string | null
          deletion_requested_at?: string | null
          mfa_enrolled?: boolean
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          kind: 'welcome' | 'order_placed' | 'order_shipped' | 'order_delivered' | 'order_cancelled' | 'appointment_confirmed' | 'appointment_reminder' | 'appointment_cancelled' | 'ticket_reply' | 'promo_granted' | 'account_deletion_scheduled' | 'address_saved'
          title: string
          body: string
          href: string | null
          read_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          kind: 'welcome' | 'order_placed' | 'order_shipped' | 'order_delivered' | 'order_cancelled' | 'appointment_confirmed' | 'appointment_reminder' | 'appointment_cancelled' | 'ticket_reply' | 'promo_granted' | 'account_deletion_scheduled' | 'address_saved'
          title: string
          body: string
          href?: string | null
          read_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          kind?: 'welcome' | 'order_placed' | 'order_shipped' | 'order_delivered' | 'order_cancelled' | 'appointment_confirmed' | 'appointment_reminder' | 'appointment_cancelled' | 'ticket_reply' | 'promo_granted' | 'account_deletion_scheduled' | 'address_saved'
          title?: string
          body?: string
          href?: string | null
          read_at?: string | null
          created_at?: string
        }
      }
      wishlist_items: {
        Row: {
          id: string
          customer_id: string
          product_id: string
          created_at: string
        }
        Insert: {
          id?: string
          customer_id: string
          product_id: string
          created_at?: string
        }
        Update: {
          id?: string
          customer_id?: string
          product_id?: string
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
          fulfillment_status: 'processing' | 'shipped' | 'delivered' | 'cancelled'
          courier_service: 'Pos Laju' | 'J&T Express' | 'DHL' | 'GDex' | 'Ninja Van' | 'Self-Pickup' | null
          tracking_number: string | null
          referral_agent_id: string | null
          created_at: string
          cancelled_at: string | null
          cancel_reason: string | null
          practitioner_note: string | null
        }
        Insert: {
          id?: string
          customer_id?: string | null
          total_amount_rm: number
          payment_status?: 'pending' | 'paid' | 'failed'
          fulfillment_status?: 'processing' | 'shipped' | 'delivered' | 'cancelled'
          courier_service?: 'Pos Laju' | 'J&T Express' | 'DHL' | 'GDex' | 'Ninja Van' | 'Self-Pickup' | null
          tracking_number?: string | null
          referral_agent_id?: string | null
          created_at?: string
          cancelled_at?: string | null
          cancel_reason?: string | null
          practitioner_note?: string | null
        }
        Update: {
          id?: string
          customer_id?: string | null
          total_amount_rm?: number
          payment_status?: 'pending' | 'paid' | 'failed'
          fulfillment_status?: 'processing' | 'shipped' | 'delivered' | 'cancelled'
          courier_service?: 'Pos Laju' | 'J&T Express' | 'DHL' | 'GDex' | 'Ninja Van' | 'Self-Pickup' | null
          tracking_number?: string | null
          referral_agent_id?: string | null
          created_at?: string
          cancelled_at?: string | null
          cancel_reason?: string | null
          practitioner_note?: string | null
        }
      }
      addresses: {
        Row: {
          id: string
          customer_id: string
          label: string
          recipient: string
          phone: string
          line1: string
          line2: string | null
          city: string
          state: string
          postcode: string
          country: string
          is_default: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          customer_id: string
          label: string
          recipient: string
          phone: string
          line1: string
          line2?: string | null
          city: string
          state: string
          postcode: string
          country?: string
          is_default?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          customer_id?: string
          label?: string
          recipient?: string
          phone?: string
          line1?: string
          line2?: string | null
          city?: string
          state?: string
          postcode?: string
          country?: string
          is_default?: boolean
          created_at?: string
          updated_at?: string
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
          mode: 'in-person' | 'virtual'
          meeting_link: string | null
          notes: string | null
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
          mode?: 'in-person' | 'virtual'
          meeting_link?: string | null
          notes?: string | null
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
          mode?: 'in-person' | 'virtual'
          meeting_link?: string | null
          notes?: string | null
        }
      }
      sales_agents: {
        Row: {
          id: string
          user_id: string
          referral_code: string
          commission_rate: number
          commission_type: 'affiliate' | 'reseller'
          total_sales_generated_rm: number
          total_commission_earned_rm: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          referral_code: string
          commission_rate?: number
          commission_type?: 'affiliate' | 'reseller'
          total_sales_generated_rm?: number
          total_commission_earned_rm?: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          referral_code?: string
          commission_rate?: number
          commission_type?: 'affiliate' | 'reseller'
          total_sales_generated_rm?: number
          total_commission_earned_rm?: number
          created_at?: string
        }
      }
      agent_invites: {
        Row: {
          id: string
          token: string
          email: string
          full_name: string
          referral_code: string
          commission_rate: number
          commission_type: 'affiliate' | 'reseller'
          expires_at: string
          used_at: string | null
          used_by_user_id: string | null
          created_by_admin_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          token: string
          email: string
          full_name: string
          referral_code: string
          commission_rate: number
          commission_type?: 'affiliate' | 'reseller'
          expires_at?: string
          used_at?: string | null
          used_by_user_id?: string | null
          created_by_admin_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          token?: string
          email?: string
          full_name?: string
          referral_code?: string
          commission_rate?: number
          commission_type?: 'affiliate' | 'reseller'
          expires_at?: string
          used_at?: string | null
          used_by_user_id?: string | null
          created_by_admin_id?: string | null
          created_at?: string
        }
      }
      quiz_results: {
        Row: {
          id: string
          user_id: string
          quiz_slug: 'prakriti' | 'vikriti' | 'agni' | 'skin' | 'hair' | 'sleep' | 'manas'
          result_data: Json
          completed_at: string
        }
        Insert: {
          id?: string
          user_id: string
          quiz_slug: 'prakriti' | 'vikriti' | 'agni' | 'skin' | 'hair' | 'sleep' | 'manas'
          result_data: Json
          completed_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          quiz_slug?: 'prakriti' | 'vikriti' | 'agni' | 'skin' | 'hair' | 'sleep' | 'manas'
          result_data?: Json
          completed_at?: string
        }
      }
      support_tickets: {
        Row: {
          id: string
          customer_id: string
          topic: 'treatment' | 'prescription' | 'appointment' | 'order' | 'billing' | 'welcome' | 'other'
          subject: string
          status: 'open' | 'awaiting-customer' | 'resolved' | 'closed'
          last_message_at: string
          unread_by_customer: boolean
          unread_by_clinic: boolean
          created_at: string
        }
        Insert: {
          id?: string
          customer_id: string
          topic: 'treatment' | 'prescription' | 'appointment' | 'order' | 'billing' | 'welcome' | 'other'
          subject: string
          status?: 'open' | 'awaiting-customer' | 'resolved' | 'closed'
          last_message_at?: string
          unread_by_customer?: boolean
          unread_by_clinic?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          customer_id?: string
          topic?: 'treatment' | 'prescription' | 'appointment' | 'order' | 'billing' | 'welcome' | 'other'
          subject?: string
          status?: 'open' | 'awaiting-customer' | 'resolved' | 'closed'
          last_message_at?: string
          unread_by_customer?: boolean
          unread_by_clinic?: boolean
          created_at?: string
        }
      }
      support_messages: {
        Row: {
          id: string
          ticket_id: string
          sender_kind: 'customer' | 'clinic' | 'system'
          body: string
          created_at: string
        }
        Insert: {
          id?: string
          ticket_id: string
          sender_kind: 'customer' | 'clinic' | 'system'
          body: string
          created_at?: string
        }
        Update: {
          id?: string
          ticket_id?: string
          sender_kind?: 'customer' | 'clinic' | 'system'
          body?: string
          created_at?: string
        }
      }
      promos: {
        Row: {
          id: string
          code: string
          title: string
          description: string | null
          kind: 'percentage' | 'fixed' | 'free-shipping'
          value_amount: number | null
          min_spend_rm: number
          applies_to: 'all' | 'products' | 'treatments' | 'consultation'
          starts_at: string
          expires_at: string | null
          is_public: boolean
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          code: string
          title: string
          description?: string | null
          kind: 'percentage' | 'fixed' | 'free-shipping'
          value_amount?: number | null
          min_spend_rm?: number
          applies_to?: 'all' | 'products' | 'treatments' | 'consultation'
          starts_at?: string
          expires_at?: string | null
          is_public?: boolean
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          code?: string
          title?: string
          description?: string | null
          kind?: 'percentage' | 'fixed' | 'free-shipping'
          value_amount?: number | null
          min_spend_rm?: number
          applies_to?: 'all' | 'products' | 'treatments' | 'consultation'
          starts_at?: string
          expires_at?: string | null
          is_public?: boolean
          is_active?: boolean
          created_at?: string
        }
      }
      customer_promos: {
        Row: {
          id: string
          customer_id: string
          promo_id: string
          status: 'active' | 'used' | 'expired' | 'revoked'
          source: 'signup' | 'manual-claim' | 'admin-grant' | 'referral' | 'birthday' | 'loyalty'
          granted_at: string
          used_at: string | null
          used_on_order_id: string | null
        }
        Insert: {
          id?: string
          customer_id: string
          promo_id: string
          status?: 'active' | 'used' | 'expired' | 'revoked'
          source: 'signup' | 'manual-claim' | 'admin-grant' | 'referral' | 'birthday' | 'loyalty'
          granted_at?: string
          used_at?: string | null
          used_on_order_id?: string | null
        }
        Update: {
          id?: string
          customer_id?: string
          promo_id?: string
          status?: 'active' | 'used' | 'expired' | 'revoked'
          source?: 'signup' | 'manual-claim' | 'admin-grant' | 'referral' | 'birthday' | 'loyalty'
          granted_at?: string
          used_at?: string | null
          used_on_order_id?: string | null
        }
      }
      contact_messages: {
        Row: {
          id: string
          intent: 'treatment' | 'product' | 'corporate' | 'other'
          name: string
          phone: string
          email: string
          message: string
          status: 'new' | 'contacted' | 'closed'
          created_at: string
        }
        Insert: {
          id?: string
          intent: 'treatment' | 'product' | 'corporate' | 'other'
          name: string
          phone: string
          email: string
          message: string
          status?: 'new' | 'contacted' | 'closed'
          created_at?: string
        }
        Update: {
          id?: string
          intent?: 'treatment' | 'product' | 'corporate' | 'other'
          name?: string
          phone?: string
          email?: string
          message?: string
          status?: 'new' | 'contacted' | 'closed'
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      claim_agent_invite: {
        Args: {
          p_token: string
          p_user_id: string
        }
        Returns: {
          agent_id: string
          referral_code: string
          commission_type: 'affiliate' | 'reseller'
        }
      }
    }
    Enums: {
      commission_type_enum: 'affiliate' | 'reseller'
    }
  }
}
