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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      app_settings: {
        Row: {
          key: string
          updated_at: string | null
          value: string | null
        }
        Insert: {
          key: string
          updated_at?: string | null
          value?: string | null
        }
        Update: {
          key?: string
          updated_at?: string | null
          value?: string | null
        }
        Relationships: []
      }
      application_reminders: {
        Row: {
          application_ids: string[]
          id: string
          owner_id: string
          reminder_day: number
          sent_at: string
          sent_date: string
        }
        Insert: {
          application_ids: string[]
          id?: string
          owner_id: string
          reminder_day: number
          sent_at?: string
          sent_date?: string
        }
        Update: {
          application_ids?: string[]
          id?: string
          owner_id?: string
          reminder_day?: number
          sent_at?: string
          sent_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "application_reminders_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "application_reminders_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "v_user_last_login"
            referencedColumns: ["user_id"]
          },
        ]
      }
      application_views: {
        Row: {
          created_at: string | null
          id: string
          owner_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          owner_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          owner_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "application_views_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "application_views_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "v_user_last_login"
            referencedColumns: ["user_id"]
          },
        ]
      }
      applications: {
        Row: {
          applicant_role: string | null
          car_id: string | null
          counter_price: number | null
          created_at: string | null
          driver_agreed_terms: boolean
          driver_id: string | null
          id: string
          initiated_by: string | null
          matched_at: string | null
          message: string | null
          owner_agreed_terms: boolean
          owner_id: string | null
          owner_notes: string | null
          owner_rated: boolean | null
          status: string | null
          terms_agreed_at: string | null
          terms_proposed: Json | null
          terms_proposed_by: string | null
          unmatch_reason: string | null
          unmatched_at: string | null
          unmatched_by: string | null
        }
        Insert: {
          applicant_role?: string | null
          car_id?: string | null
          counter_price?: number | null
          created_at?: string | null
          driver_agreed_terms?: boolean
          driver_id?: string | null
          id?: string
          initiated_by?: string | null
          matched_at?: string | null
          message?: string | null
          owner_agreed_terms?: boolean
          owner_id?: string | null
          owner_notes?: string | null
          owner_rated?: boolean | null
          status?: string | null
          terms_agreed_at?: string | null
          terms_proposed?: Json | null
          terms_proposed_by?: string | null
          unmatch_reason?: string | null
          unmatched_at?: string | null
          unmatched_by?: string | null
        }
        Update: {
          applicant_role?: string | null
          car_id?: string | null
          counter_price?: number | null
          created_at?: string | null
          driver_agreed_terms?: boolean
          driver_id?: string | null
          id?: string
          initiated_by?: string | null
          matched_at?: string | null
          message?: string | null
          owner_agreed_terms?: boolean
          owner_id?: string | null
          owner_notes?: string | null
          owner_rated?: boolean | null
          status?: string | null
          terms_agreed_at?: string | null
          terms_proposed?: Json | null
          terms_proposed_by?: string | null
          unmatch_reason?: string | null
          unmatched_at?: string | null
          unmatched_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "applications_car_id_fkey"
            columns: ["car_id"]
            isOneToOne: false
            referencedRelation: "cars"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "v_user_last_login"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "applications_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "v_user_last_login"
            referencedColumns: ["user_id"]
          },
        ]
      }
      boost_config: {
        Row: {
          key: string
          updated_at: string
          value: string
        }
        Insert: {
          key: string
          updated_at?: string
          value: string
        }
        Update: {
          key?: string
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
      boost_payments: {
        Row: {
          amount_cents: number
          boost_expires_at: string | null
          boost_id: string | null
          boost_start_at: string | null
          boost_type: string
          created_at: string
          currency: string
          duration_days: number
          id: string
          paid_at: string | null
          payment_status: string
          target_id: string
          updated_at: string
          user_id: string
          yoco_checkout_id: string | null
          yoco_payment_id: string | null
        }
        Insert: {
          amount_cents: number
          boost_expires_at?: string | null
          boost_id?: string | null
          boost_start_at?: string | null
          boost_type: string
          created_at?: string
          currency?: string
          duration_days?: number
          id?: string
          paid_at?: string | null
          payment_status?: string
          target_id: string
          updated_at?: string
          user_id: string
          yoco_checkout_id?: string | null
          yoco_payment_id?: string | null
        }
        Update: {
          amount_cents?: number
          boost_expires_at?: string | null
          boost_id?: string | null
          boost_start_at?: string | null
          boost_type?: string
          created_at?: string
          currency?: string
          duration_days?: number
          id?: string
          paid_at?: string | null
          payment_status?: string
          target_id?: string
          updated_at?: string
          user_id?: string
          yoco_checkout_id?: string | null
          yoco_payment_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "boost_payments_boost_id_fkey"
            columns: ["boost_id"]
            isOneToOne: false
            referencedRelation: "boosts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "boost_payments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "boost_payments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_user_last_login"
            referencedColumns: ["user_id"]
          },
        ]
      }
      boost_requests: {
        Row: {
          admin_note: string | null
          created_at: string
          driver_id: string
          driver_profile_id: string | null
          id: string
          message: string | null
          status: string
          updated_at: string
        }
        Insert: {
          admin_note?: string | null
          created_at?: string
          driver_id: string
          driver_profile_id?: string | null
          id?: string
          message?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          admin_note?: string | null
          created_at?: string
          driver_id?: string
          driver_profile_id?: string | null
          id?: string
          message?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "boost_requests_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "boost_requests_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "v_user_last_login"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "boost_requests_driver_profile_id_fkey"
            columns: ["driver_profile_id"]
            isOneToOne: false
            referencedRelation: "driver_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "boost_requests_driver_profile_id_fkey"
            columns: ["driver_profile_id"]
            isOneToOne: false
            referencedRelation: "driver_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "boost_requests_driver_profile_id_fkey"
            columns: ["driver_profile_id"]
            isOneToOne: false
            referencedRelation: "v_driver_listing"
            referencedColumns: ["id"]
          },
        ]
      }
      boosts: {
        Row: {
          applications_count: number
          created_at: string
          created_by: string | null
          duration_days: number
          end_at: string
          id: string
          impressions: number
          matches_count: number
          profile_views: number
          shortlisted_count: number
          start_at: string
          status: string
          target_id: string
          test_mode: boolean
          type: string
        }
        Insert: {
          applications_count?: number
          created_at?: string
          created_by?: string | null
          duration_days?: number
          end_at: string
          id?: string
          impressions?: number
          matches_count?: number
          profile_views?: number
          shortlisted_count?: number
          start_at?: string
          status?: string
          target_id: string
          test_mode?: boolean
          type: string
        }
        Update: {
          applications_count?: number
          created_at?: string
          created_by?: string | null
          duration_days?: number
          end_at?: string
          id?: string
          impressions?: number
          matches_count?: number
          profile_views?: number
          shortlisted_count?: number
          start_at?: string
          status?: string
          target_id?: string
          test_mode?: boolean
          type?: string
        }
        Relationships: []
      }
      brevo_sync_failures: {
        Row: {
          attempts: number
          created_at: string
          email: string
          error: string | null
          event_type: string
          id: string
          last_attempted_at: string
          payload: Json | null
          sync_status: string
          user_id: string | null
        }
        Insert: {
          attempts?: number
          created_at?: string
          email: string
          error?: string | null
          event_type: string
          id?: string
          last_attempted_at?: string
          payload?: Json | null
          sync_status?: string
          user_id?: string | null
        }
        Update: {
          attempts?: number
          created_at?: string
          email?: string
          error?: string | null
          event_type?: string
          id?: string
          last_attempted_at?: string
          payload?: Json | null
          sync_status?: string
          user_id?: string | null
        }
        Relationships: []
      }
      car_reference_photos: {
        Row: {
          analysis_error: string | null
          analyzed_at: string | null
          car_id: string
          created_at: string
          damage: Json
          id: string
          photo_path: string
          shot_key: string
          uploaded_by: string | null
        }
        Insert: {
          analysis_error?: string | null
          analyzed_at?: string | null
          car_id: string
          created_at?: string
          damage?: Json
          id?: string
          photo_path: string
          shot_key: string
          uploaded_by?: string | null
        }
        Update: {
          analysis_error?: string | null
          analyzed_at?: string | null
          car_id?: string
          created_at?: string
          damage?: Json
          id?: string
          photo_path?: string
          shot_key?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "car_reference_photos_car_id_fkey"
            columns: ["car_id"]
            isOneToOne: false
            referencedRelation: "cars"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "car_reference_photos_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "car_reference_photos_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "v_user_last_login"
            referencedColumns: ["user_id"]
          },
        ]
      }
      cars: {
        Row: {
          admin_note: string | null
          admin_status: string | null
          applications_paused: boolean | null
          checkin_time: string | null
          color: string | null
          created_at: string | null
          damoov_vehicle_token: string | null
          deposit: string | null
          description: string | null
          fuel_policy: string | null
          id: string
          ideal_driver_prefs: Json | null
          image_url: string | null
          insurance: boolean | null
          location: string
          make: string
          model: string
          next_service_date: string | null
          owner_id: string | null
          photo_back_url: string | null
          photo_extra_url: string | null
          photo_front_url: string | null
          photo_interior_url: string | null
          photo_side_url: string | null
          photo_urls: string[] | null
          photo1_url: string | null
          photo2_url: string | null
          photo3_url: string | null
          photo4_url: string | null
          photo5_url: string | null
          platforms: string[] | null
          price_per_week: number
          removal_reason: string | null
          removed_at: string | null
          removed_by: string | null
          status: string | null
          transmission: string | null
          weekly_checkin_day: string | null
          year: number
        }
        Insert: {
          admin_note?: string | null
          admin_status?: string | null
          applications_paused?: boolean | null
          checkin_time?: string | null
          color?: string | null
          created_at?: string | null
          damoov_vehicle_token?: string | null
          deposit?: string | null
          description?: string | null
          fuel_policy?: string | null
          id?: string
          ideal_driver_prefs?: Json | null
          image_url?: string | null
          insurance?: boolean | null
          location: string
          make: string
          model: string
          next_service_date?: string | null
          owner_id?: string | null
          photo_back_url?: string | null
          photo_extra_url?: string | null
          photo_front_url?: string | null
          photo_interior_url?: string | null
          photo_side_url?: string | null
          photo_urls?: string[] | null
          photo1_url?: string | null
          photo2_url?: string | null
          photo3_url?: string | null
          photo4_url?: string | null
          photo5_url?: string | null
          platforms?: string[] | null
          price_per_week: number
          removal_reason?: string | null
          removed_at?: string | null
          removed_by?: string | null
          status?: string | null
          transmission?: string | null
          weekly_checkin_day?: string | null
          year: number
        }
        Update: {
          admin_note?: string | null
          admin_status?: string | null
          applications_paused?: boolean | null
          checkin_time?: string | null
          color?: string | null
          created_at?: string | null
          damoov_vehicle_token?: string | null
          deposit?: string | null
          description?: string | null
          fuel_policy?: string | null
          id?: string
          ideal_driver_prefs?: Json | null
          image_url?: string | null
          insurance?: boolean | null
          location?: string
          make?: string
          model?: string
          next_service_date?: string | null
          owner_id?: string | null
          photo_back_url?: string | null
          photo_extra_url?: string | null
          photo_front_url?: string | null
          photo_interior_url?: string | null
          photo_side_url?: string | null
          photo_urls?: string[] | null
          photo1_url?: string | null
          photo2_url?: string | null
          photo3_url?: string | null
          photo4_url?: string | null
          photo5_url?: string | null
          platforms?: string[] | null
          price_per_week?: number
          removal_reason?: string | null
          removed_at?: string | null
          removed_by?: string | null
          status?: string | null
          transmission?: string | null
          weekly_checkin_day?: string | null
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "cars_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cars_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "v_user_last_login"
            referencedColumns: ["user_id"]
          },
        ]
      }
      device_push_tokens: {
        Row: {
          created_at: string | null
          expo_push_token: string
          id: string
          platform: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          expo_push_token: string
          id?: string
          platform: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          expo_push_token?: string
          id?: string
          platform?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "device_push_tokens_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "device_push_tokens_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_user_last_login"
            referencedColumns: ["user_id"]
          },
        ]
      }
      driver_live_status: {
        Row: {
          car_id: string | null
          driver_id: string
          is_moving: boolean
          lat: number
          lng: number
          speed_kmh: number | null
          state_since: string
          updated_at: string
        }
        Insert: {
          car_id?: string | null
          driver_id: string
          is_moving?: boolean
          lat: number
          lng: number
          speed_kmh?: number | null
          state_since?: string
          updated_at?: string
        }
        Update: {
          car_id?: string | null
          driver_id?: string
          is_moving?: boolean
          lat?: number
          lng?: number
          speed_kmh?: number | null
          state_since?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "driver_live_status_car_id_fkey"
            columns: ["car_id"]
            isOneToOne: false
            referencedRelation: "cars"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "driver_live_status_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "driver_live_status_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: true
            referencedRelation: "v_user_last_login"
            referencedColumns: ["user_id"]
          },
        ]
      }
      driver_profiles: {
        Row: {
          accidents: number | null
          admin_note: string | null
          age: number | null
          applications_paused: boolean | null
          approved_at: string | null
          bio: string | null
          bolt_rating: string | null
          bolt_trips: string | null
          citizenship: string | null
          consecutive_payments: number | null
          created_at: string | null
          criminal_check_submitted: boolean | null
          criminal_check_url: string | null
          damage_incidents: number | null
          date_of_birth: string | null
          deposit_amount: number | null
          doc_car_url: string | null
          doc_expires_at: string | null
          doc_holding_id_url: string | null
          doc_id_url: string | null
          doc_license_back_url: string | null
          doc_license_url: string | null
          doc_selfie_url: string | null
          doc_uploaded_at: string | null
          docs_verified: boolean | null
          e_hailing_registration_date: string | null
          excellent_care: number | null
          gender: string | null
          has_1yr_experience: boolean | null
          has_pdp: boolean | null
          id: string
          id_number: string | null
          id_verified: boolean | null
          indrive_rating: string | null
          indrive_trips: string | null
          late_payments: number | null
          license_date: string | null
          license_expiry_date: string | null
          license_number: string | null
          license_verified: boolean | null
          license_year: number | null
          major_accidents: number | null
          missed_checkins: number | null
          missed_payments: number | null
          months_with_owner: number | null
          ontime_payments: number | null
          pdp_expiry_date: string | null
          pdp_url: string | null
          photo_fullbody_url: string | null
          photo_headshot_url: string | null
          photo_holding_id_url: string | null
          platforms: string[] | null
          profile_views: number
          proof_of_residence_url: string | null
          reckless_driving: number | null
          rejected_at: string | null
          rejection_reason: string | null
          removal_reason: string | null
          removed_at: string | null
          rentals_completed: number | null
          safe_parking: boolean | null
          screenshot_bolt_url: string | null
          screenshot_indrive_url: string | null
          screenshot_uber_url: string | null
          self_bolt_rating: number | null
          self_bolt_trips: number | null
          self_indrive_rating: number | null
          self_indrive_trips: number | null
          self_uber_rating: number | null
          self_uber_trips: number | null
          status: string | null
          suspended: boolean | null
          suspension_reason: string | null
          trust_score: number | null
          uber_rating: string | null
          uber_trips: string | null
          updated_at: string | null
          user_id: string | null
          vehicle_abuse: number | null
          vehicles_stolen: number | null
          verified_references: number | null
          weekly_checkin_amount: number | null
          years_driving: number | null
        }
        Insert: {
          accidents?: number | null
          admin_note?: string | null
          age?: number | null
          applications_paused?: boolean | null
          approved_at?: string | null
          bio?: string | null
          bolt_rating?: string | null
          bolt_trips?: string | null
          citizenship?: string | null
          consecutive_payments?: number | null
          created_at?: string | null
          criminal_check_submitted?: boolean | null
          criminal_check_url?: string | null
          damage_incidents?: number | null
          date_of_birth?: string | null
          deposit_amount?: number | null
          doc_car_url?: string | null
          doc_expires_at?: string | null
          doc_holding_id_url?: string | null
          doc_id_url?: string | null
          doc_license_back_url?: string | null
          doc_license_url?: string | null
          doc_selfie_url?: string | null
          doc_uploaded_at?: string | null
          docs_verified?: boolean | null
          e_hailing_registration_date?: string | null
          excellent_care?: number | null
          gender?: string | null
          has_1yr_experience?: boolean | null
          has_pdp?: boolean | null
          id?: string
          id_number?: string | null
          id_verified?: boolean | null
          indrive_rating?: string | null
          indrive_trips?: string | null
          late_payments?: number | null
          license_date?: string | null
          license_expiry_date?: string | null
          license_number?: string | null
          license_verified?: boolean | null
          license_year?: number | null
          major_accidents?: number | null
          missed_checkins?: number | null
          missed_payments?: number | null
          months_with_owner?: number | null
          ontime_payments?: number | null
          pdp_expiry_date?: string | null
          pdp_url?: string | null
          photo_fullbody_url?: string | null
          photo_headshot_url?: string | null
          photo_holding_id_url?: string | null
          platforms?: string[] | null
          profile_views?: number
          proof_of_residence_url?: string | null
          reckless_driving?: number | null
          rejected_at?: string | null
          rejection_reason?: string | null
          removal_reason?: string | null
          removed_at?: string | null
          rentals_completed?: number | null
          safe_parking?: boolean | null
          screenshot_bolt_url?: string | null
          screenshot_indrive_url?: string | null
          screenshot_uber_url?: string | null
          self_bolt_rating?: number | null
          self_bolt_trips?: number | null
          self_indrive_rating?: number | null
          self_indrive_trips?: number | null
          self_uber_rating?: number | null
          self_uber_trips?: number | null
          status?: string | null
          suspended?: boolean | null
          suspension_reason?: string | null
          trust_score?: number | null
          uber_rating?: string | null
          uber_trips?: string | null
          updated_at?: string | null
          user_id?: string | null
          vehicle_abuse?: number | null
          vehicles_stolen?: number | null
          verified_references?: number | null
          weekly_checkin_amount?: number | null
          years_driving?: number | null
        }
        Update: {
          accidents?: number | null
          admin_note?: string | null
          age?: number | null
          applications_paused?: boolean | null
          approved_at?: string | null
          bio?: string | null
          bolt_rating?: string | null
          bolt_trips?: string | null
          citizenship?: string | null
          consecutive_payments?: number | null
          created_at?: string | null
          criminal_check_submitted?: boolean | null
          criminal_check_url?: string | null
          damage_incidents?: number | null
          date_of_birth?: string | null
          deposit_amount?: number | null
          doc_car_url?: string | null
          doc_expires_at?: string | null
          doc_holding_id_url?: string | null
          doc_id_url?: string | null
          doc_license_back_url?: string | null
          doc_license_url?: string | null
          doc_selfie_url?: string | null
          doc_uploaded_at?: string | null
          docs_verified?: boolean | null
          e_hailing_registration_date?: string | null
          excellent_care?: number | null
          gender?: string | null
          has_1yr_experience?: boolean | null
          has_pdp?: boolean | null
          id?: string
          id_number?: string | null
          id_verified?: boolean | null
          indrive_rating?: string | null
          indrive_trips?: string | null
          late_payments?: number | null
          license_date?: string | null
          license_expiry_date?: string | null
          license_number?: string | null
          license_verified?: boolean | null
          license_year?: number | null
          major_accidents?: number | null
          missed_checkins?: number | null
          missed_payments?: number | null
          months_with_owner?: number | null
          ontime_payments?: number | null
          pdp_expiry_date?: string | null
          pdp_url?: string | null
          photo_fullbody_url?: string | null
          photo_headshot_url?: string | null
          photo_holding_id_url?: string | null
          platforms?: string[] | null
          profile_views?: number
          proof_of_residence_url?: string | null
          reckless_driving?: number | null
          rejected_at?: string | null
          rejection_reason?: string | null
          removal_reason?: string | null
          removed_at?: string | null
          rentals_completed?: number | null
          safe_parking?: boolean | null
          screenshot_bolt_url?: string | null
          screenshot_indrive_url?: string | null
          screenshot_uber_url?: string | null
          self_bolt_rating?: number | null
          self_bolt_trips?: number | null
          self_indrive_rating?: number | null
          self_indrive_trips?: number | null
          self_uber_rating?: number | null
          self_uber_trips?: number | null
          status?: string | null
          suspended?: boolean | null
          suspension_reason?: string | null
          trust_score?: number | null
          uber_rating?: string | null
          uber_trips?: string | null
          updated_at?: string | null
          user_id?: string | null
          vehicle_abuse?: number | null
          vehicles_stolen?: number | null
          verified_references?: number | null
          weekly_checkin_amount?: number | null
          years_driving?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "driver_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "driver_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "v_user_last_login"
            referencedColumns: ["user_id"]
          },
        ]
      }
      driver_telematics_accounts: {
        Row: {
          connected_at: string | null
          consent_given_at: string | null
          created_at: string
          damoov_device_token: string | null
          damoov_user_id: string | null
          driver_id: string
          id: string
          last_seen_at: string | null
          sdk_status: string
          updated_at: string
        }
        Insert: {
          connected_at?: string | null
          consent_given_at?: string | null
          created_at?: string
          damoov_device_token?: string | null
          damoov_user_id?: string | null
          driver_id: string
          id?: string
          last_seen_at?: string | null
          sdk_status?: string
          updated_at?: string
        }
        Update: {
          connected_at?: string | null
          consent_given_at?: string | null
          created_at?: string
          damoov_device_token?: string | null
          damoov_user_id?: string | null
          driver_id?: string
          id?: string
          last_seen_at?: string | null
          sdk_status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "driver_telematics_accounts_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "driver_telematics_accounts_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: true
            referencedRelation: "v_user_last_login"
            referencedColumns: ["user_id"]
          },
        ]
      }
      driving_events: {
        Row: {
          car_id: string
          created_at: string
          driver_id: string
          event_type: string
          id: string
          lat: number | null
          lng: number | null
          occurred_at: string
          severity: number
          speed_kmh: number | null
          trip_id: string
        }
        Insert: {
          car_id: string
          created_at?: string
          driver_id: string
          event_type: string
          id?: string
          lat?: number | null
          lng?: number | null
          occurred_at?: string
          severity: number
          speed_kmh?: number | null
          trip_id: string
        }
        Update: {
          car_id?: string
          created_at?: string
          driver_id?: string
          event_type?: string
          id?: string
          lat?: number | null
          lng?: number | null
          occurred_at?: string
          severity?: number
          speed_kmh?: number | null
          trip_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "driving_events_car_id_fkey"
            columns: ["car_id"]
            isOneToOne: false
            referencedRelation: "cars"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "driving_events_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "driving_events_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "v_user_last_login"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "driving_events_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "vehicle_trips"
            referencedColumns: ["id"]
          },
        ]
      }
      image_analytics: {
        Row: {
          bucket: string
          created_at: string
          id: number
          last_seen_at: string
          page: string
          path: string
          request_count: number
        }
        Insert: {
          bucket: string
          created_at?: string
          id?: number
          last_seen_at?: string
          page: string
          path: string
          request_count?: number
        }
        Update: {
          bucket?: string
          created_at?: string
          id?: number
          last_seen_at?: string
          page?: string
          path?: string
          request_count?: number
        }
        Relationships: []
      }
      incidents: {
        Row: {
          created_at: string | null
          description: string | null
          driver_id: string | null
          id: string
          incident_type: string
          reporter_id: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          driver_id?: string | null
          id?: string
          incident_type: string
          reporter_id?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          driver_id?: string | null
          id?: string
          incident_type?: string
          reporter_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "incidents_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "driver_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incidents_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "driver_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incidents_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "v_driver_listing"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incidents_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incidents_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "v_user_last_login"
            referencedColumns: ["user_id"]
          },
        ]
      }
      login_events: {
        Row: {
          created_at: string | null
          id: string
          role: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          role?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "login_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "login_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_user_last_login"
            referencedColumns: ["user_id"]
          },
        ]
      }
      messages: {
        Row: {
          application_id: string
          content: string
          created_at: string
          id: string
          metadata: Json | null
          read_by_recipient: boolean
          sender_id: string | null
          type: string
        }
        Insert: {
          application_id: string
          content: string
          created_at?: string
          id?: string
          metadata?: Json | null
          read_by_recipient?: boolean
          sender_id?: string | null
          type?: string
        }
        Update: {
          application_id?: string
          content?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          read_by_recipient?: boolean
          sender_id?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "active_matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
        ]
      }
      page_views: {
        Row: {
          created_at: string | null
          id: string
          page: string
          referrer: string | null
          user_agent: string | null
          visitor_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          page: string
          referrer?: string | null
          user_agent?: string | null
          visitor_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          page?: string
          referrer?: string | null
          user_agent?: string | null
          visitor_id?: string | null
        }
        Relationships: []
      }
      platform_reviews: {
        Row: {
          car_label: string | null
          comment: string
          created_at: string | null
          id: string
          is_approved: boolean | null
          is_matched: boolean | null
          matched_name: string | null
          rating: number | null
          reviewer_name: string | null
          role: string | null
          user_id: string | null
        }
        Insert: {
          car_label?: string | null
          comment: string
          created_at?: string | null
          id?: string
          is_approved?: boolean | null
          is_matched?: boolean | null
          matched_name?: string | null
          rating?: number | null
          reviewer_name?: string | null
          role?: string | null
          user_id?: string | null
        }
        Update: {
          car_label?: string | null
          comment?: string
          created_at?: string | null
          id?: string
          is_approved?: boolean | null
          is_matched?: boolean | null
          matched_name?: string | null
          rating?: number | null
          reviewer_name?: string | null
          role?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      profile_change_requests: {
        Row: {
          admin_note: string | null
          changes: Json
          created_at: string | null
          id: string
          reviewed_at: string | null
          role: string
          status: string
          user_id: string | null
        }
        Insert: {
          admin_note?: string | null
          changes: Json
          created_at?: string | null
          id?: string
          reviewed_at?: string | null
          role: string
          status?: string
          user_id?: string | null
        }
        Update: {
          admin_note?: string | null
          changes?: Json
          created_at?: string | null
          id?: string
          reviewed_at?: string | null
          role?: string
          status?: string
          user_id?: string | null
        }
        Relationships: []
      }
      profile_views_log: {
        Row: {
          driver_user_id: string
          id: string
          viewed_at: string
          viewer_id: string
          viewer_role: string | null
        }
        Insert: {
          driver_user_id: string
          id?: string
          viewed_at?: string
          viewer_id: string
          viewer_role?: string | null
        }
        Update: {
          driver_user_id?: string
          id?: string
          viewed_at?: string
          viewer_id?: string
          viewer_role?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          admin_note: string | null
          admin_reviewed_at: string | null
          admin_status: string | null
          applications_paused: boolean | null
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          doc_id_url: string | null
          email: string | null
          email_confirmed: boolean
          full_name: string
          id: string
          is_admin: boolean | null
          is_removed: boolean | null
          is_suspended: boolean | null
          location: string | null
          phone: string | null
          photo_headshot_url: string | null
          photo_holding_id_url: string | null
          photo_url: string | null
          popia_accepted: boolean | null
          popia_accepted_at: string | null
          preferred_contact: string | null
          removal_reason: string | null
          removed_at: string | null
          role: string
          suspended_at: string | null
          suspension_reason: string | null
          tc_accepted_at: string | null
          tc_accepted_ip: string | null
          tc_version: string | null
          terms_accepted: boolean | null
          terms_accepted_at: string | null
          terms_version: string | null
          whatsapp: string | null
        }
        Insert: {
          admin_note?: string | null
          admin_reviewed_at?: string | null
          admin_status?: string | null
          applications_paused?: boolean | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          doc_id_url?: string | null
          email?: string | null
          email_confirmed?: boolean
          full_name: string
          id: string
          is_admin?: boolean | null
          is_removed?: boolean | null
          is_suspended?: boolean | null
          location?: string | null
          phone?: string | null
          photo_headshot_url?: string | null
          photo_holding_id_url?: string | null
          photo_url?: string | null
          popia_accepted?: boolean | null
          popia_accepted_at?: string | null
          preferred_contact?: string | null
          removal_reason?: string | null
          removed_at?: string | null
          role: string
          suspended_at?: string | null
          suspension_reason?: string | null
          tc_accepted_at?: string | null
          tc_accepted_ip?: string | null
          tc_version?: string | null
          terms_accepted?: boolean | null
          terms_accepted_at?: string | null
          terms_version?: string | null
          whatsapp?: string | null
        }
        Update: {
          admin_note?: string | null
          admin_reviewed_at?: string | null
          admin_status?: string | null
          applications_paused?: boolean | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          doc_id_url?: string | null
          email?: string | null
          email_confirmed?: boolean
          full_name?: string
          id?: string
          is_admin?: boolean | null
          is_removed?: boolean | null
          is_suspended?: boolean | null
          location?: string | null
          phone?: string | null
          photo_headshot_url?: string | null
          photo_holding_id_url?: string | null
          photo_url?: string | null
          popia_accepted?: boolean | null
          popia_accepted_at?: string | null
          preferred_contact?: string | null
          removal_reason?: string | null
          removed_at?: string | null
          role?: string
          suspended_at?: string | null
          suspension_reason?: string | null
          tc_accepted_at?: string | null
          tc_accepted_ip?: string | null
          tc_version?: string | null
          terms_accepted?: boolean | null
          terms_accepted_at?: string | null
          terms_version?: string | null
          whatsapp?: string | null
        }
        Relationships: []
      }
      registration_otps: {
        Row: {
          created_at: string
          email: string
          expires_at: string
          id: string
          otp_code: string
          used: boolean
        }
        Insert: {
          created_at?: string
          email: string
          expires_at?: string
          id?: string
          otp_code: string
          used?: boolean
        }
        Update: {
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          otp_code?: string
          used?: boolean
        }
        Relationships: []
      }
      registration_reminder_log: {
        Row: {
          email: string
          id: string
          sent_at: string
        }
        Insert: {
          email: string
          id?: string
          sent_at?: string
        }
        Update: {
          email?: string
          id?: string
          sent_at?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          application_id: string | null
          comment: string | null
          communication_rating: number | null
          created_at: string | null
          driver_id: string | null
          id: string
          payment_status: string | null
          rating: number
          reviewer_id: string | null
          reviewer_name_override: string | null
          written_by_admin: boolean | null
        }
        Insert: {
          application_id?: string | null
          comment?: string | null
          communication_rating?: number | null
          created_at?: string | null
          driver_id?: string | null
          id?: string
          payment_status?: string | null
          rating: number
          reviewer_id?: string | null
          reviewer_name_override?: string | null
          written_by_admin?: boolean | null
        }
        Update: {
          application_id?: string | null
          comment?: string | null
          communication_rating?: number | null
          created_at?: string | null
          driver_id?: string | null
          id?: string
          payment_status?: string | null
          rating?: number
          reviewer_id?: string | null
          reviewer_name_override?: string | null
          written_by_admin?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "active_matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "driver_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "driver_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "v_driver_listing"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "v_user_last_login"
            referencedColumns: ["user_id"]
          },
        ]
      }
      shortlisted_cars: {
        Row: {
          car_id: string
          created_at: string
          driver_id: string
          id: string
        }
        Insert: {
          car_id: string
          created_at?: string
          driver_id: string
          id?: string
        }
        Update: {
          car_id?: string
          created_at?: string
          driver_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "shortlisted_cars_car_id_fkey"
            columns: ["car_id"]
            isOneToOne: false
            referencedRelation: "cars"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shortlisted_cars_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shortlisted_cars_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "v_user_last_login"
            referencedColumns: ["user_id"]
          },
        ]
      }
      shortlisted_drivers: {
        Row: {
          created_at: string
          driver_id: string
          id: string
          owner_id: string
        }
        Insert: {
          created_at?: string
          driver_id: string
          id?: string
          owner_id: string
        }
        Update: {
          created_at?: string
          driver_id?: string
          id?: string
          owner_id?: string
        }
        Relationships: []
      }
      telematics_events: {
        Row: {
          application_id: string
          car_id: string
          created_at: string
          driver_id: string
          event_type: string
          id: string
          lat: number | null
          lng: number | null
          occurred_at: string
          severity: number | null
          trip_id: string | null
        }
        Insert: {
          application_id: string
          car_id: string
          created_at?: string
          driver_id: string
          event_type: string
          id?: string
          lat?: number | null
          lng?: number | null
          occurred_at: string
          severity?: number | null
          trip_id?: string | null
        }
        Update: {
          application_id?: string
          car_id?: string
          created_at?: string
          driver_id?: string
          event_type?: string
          id?: string
          lat?: number | null
          lng?: number | null
          occurred_at?: string
          severity?: number | null
          trip_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "telematics_events_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "active_matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "telematics_events_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "telematics_events_car_id_fkey"
            columns: ["car_id"]
            isOneToOne: false
            referencedRelation: "cars"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "telematics_events_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "telematics_events_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "v_user_last_login"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "telematics_events_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "telematics_trips"
            referencedColumns: ["id"]
          },
        ]
      }
      telematics_live_status: {
        Row: {
          application_id: string
          car_id: string
          driver_id: string
          heading: number | null
          is_moving: boolean
          lat: number | null
          lng: number | null
          speed_kmh: number | null
          trip_id: string | null
          updated_at: string
        }
        Insert: {
          application_id: string
          car_id: string
          driver_id: string
          heading?: number | null
          is_moving?: boolean
          lat?: number | null
          lng?: number | null
          speed_kmh?: number | null
          trip_id?: string | null
          updated_at?: string
        }
        Update: {
          application_id?: string
          car_id?: string
          driver_id?: string
          heading?: number | null
          is_moving?: boolean
          lat?: number | null
          lng?: number | null
          speed_kmh?: number | null
          trip_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "telematics_live_status_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "active_matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "telematics_live_status_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "telematics_live_status_car_id_fkey"
            columns: ["car_id"]
            isOneToOne: false
            referencedRelation: "cars"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "telematics_live_status_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "telematics_live_status_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: true
            referencedRelation: "v_user_last_login"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "telematics_live_status_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "telematics_trips"
            referencedColumns: ["id"]
          },
        ]
      }
      telematics_trips: {
        Row: {
          application_id: string
          avg_speed_kmh: number | null
          car_id: string
          created_at: string
          damoov_trip_id: string | null
          distance_km: number | null
          driver_id: string
          duration_seconds: number | null
          eco_score: number | null
          end_lat: number | null
          end_lng: number | null
          ended_at: string | null
          id: string
          max_speed_kmh: number | null
          safety_score: number | null
          start_lat: number | null
          start_lng: number | null
          started_at: string
          status: string
        }
        Insert: {
          application_id: string
          avg_speed_kmh?: number | null
          car_id: string
          created_at?: string
          damoov_trip_id?: string | null
          distance_km?: number | null
          driver_id: string
          duration_seconds?: number | null
          eco_score?: number | null
          end_lat?: number | null
          end_lng?: number | null
          ended_at?: string | null
          id?: string
          max_speed_kmh?: number | null
          safety_score?: number | null
          start_lat?: number | null
          start_lng?: number | null
          started_at: string
          status?: string
        }
        Update: {
          application_id?: string
          avg_speed_kmh?: number | null
          car_id?: string
          created_at?: string
          damoov_trip_id?: string | null
          distance_km?: number | null
          driver_id?: string
          duration_seconds?: number | null
          eco_score?: number | null
          end_lat?: number | null
          end_lng?: number | null
          ended_at?: string | null
          id?: string
          max_speed_kmh?: number | null
          safety_score?: number | null
          start_lat?: number | null
          start_lng?: number | null
          started_at?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "telematics_trips_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "active_matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "telematics_trips_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "telematics_trips_car_id_fkey"
            columns: ["car_id"]
            isOneToOne: false
            referencedRelation: "cars"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "telematics_trips_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "telematics_trips_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "v_user_last_login"
            referencedColumns: ["user_id"]
          },
        ]
      }
      traffic_offences: {
        Row: {
          application_id: string | null
          car_id: string | null
          created_at: string
          created_by: string | null
          description: string | null
          driver_id: string
          evidence_url: string | null
          fine_amount: number | null
          id: string
          offence_date: string
          offence_type: string | null
          status: string
        }
        Insert: {
          application_id?: string | null
          car_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          driver_id: string
          evidence_url?: string | null
          fine_amount?: number | null
          id?: string
          offence_date?: string
          offence_type?: string | null
          status?: string
        }
        Update: {
          application_id?: string | null
          car_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          driver_id?: string
          evidence_url?: string | null
          fine_amount?: number | null
          id?: string
          offence_date?: string
          offence_type?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "traffic_offences_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "active_matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "traffic_offences_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "traffic_offences_car_id_fkey"
            columns: ["car_id"]
            isOneToOne: false
            referencedRelation: "cars"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "traffic_offences_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "traffic_offences_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "v_user_last_login"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "traffic_offences_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "traffic_offences_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "v_user_last_login"
            referencedColumns: ["user_id"]
          },
        ]
      }
      trip_waypoints: {
        Row: {
          accuracy_m: number | null
          id: string
          lat: number
          lng: number
          recorded_at: string
          speed_kmh: number | null
          trip_id: string
        }
        Insert: {
          accuracy_m?: number | null
          id?: string
          lat: number
          lng: number
          recorded_at?: string
          speed_kmh?: number | null
          trip_id: string
        }
        Update: {
          accuracy_m?: number | null
          id?: string
          lat?: number
          lng?: number
          recorded_at?: string
          speed_kmh?: number | null
          trip_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trip_waypoints_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "vehicle_trips"
            referencedColumns: ["id"]
          },
        ]
      }
      trust_actions: {
        Row: {
          action_type: string
          application_id: string | null
          created_at: string | null
          driver_id: string | null
          id: string
          note: string | null
          override_note: string | null
          owner_id: string | null
          points: number
          submitted_by: string | null
        }
        Insert: {
          action_type: string
          application_id?: string | null
          created_at?: string | null
          driver_id?: string | null
          id?: string
          note?: string | null
          override_note?: string | null
          owner_id?: string | null
          points: number
          submitted_by?: string | null
        }
        Update: {
          action_type?: string
          application_id?: string | null
          created_at?: string | null
          driver_id?: string | null
          id?: string
          note?: string | null
          override_note?: string | null
          owner_id?: string | null
          points?: number
          submitted_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "trust_actions_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "active_matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trust_actions_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trust_actions_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "driver_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trust_actions_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "driver_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trust_actions_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "v_driver_listing"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trust_actions_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trust_actions_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "v_user_last_login"
            referencedColumns: ["user_id"]
          },
        ]
      }
      trust_score_log: {
        Row: {
          created_at: string | null
          driver_id: string | null
          event_type: string
          id: string
          notes: string | null
          points_change: number
          score_after: number | null
          score_before: number | null
        }
        Insert: {
          created_at?: string | null
          driver_id?: string | null
          event_type: string
          id?: string
          notes?: string | null
          points_change: number
          score_after?: number | null
          score_before?: number | null
        }
        Update: {
          created_at?: string | null
          driver_id?: string | null
          event_type?: string
          id?: string
          notes?: string | null
          points_change?: number
          score_after?: number | null
          score_before?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "trust_score_log_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "driver_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trust_score_log_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "driver_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trust_score_log_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "v_driver_listing"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicle_inspections: {
        Row: {
          admin_note: string | null
          ai_analysis: Json | null
          ai_analyzed_at: string | null
          application_id: string | null
          car_id: string | null
          created_at: string | null
          driver_id: string
          id: string
          inspection_type: string
          notes: string | null
          odometer_km: number | null
          owner_flag_reason: string | null
          owner_review_comment: string | null
          owner_review_status: string
          owner_reviewed_at: string | null
          photo_urls: string[] | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
        }
        Insert: {
          admin_note?: string | null
          ai_analysis?: Json | null
          ai_analyzed_at?: string | null
          application_id?: string | null
          car_id?: string | null
          created_at?: string | null
          driver_id: string
          id?: string
          inspection_type?: string
          notes?: string | null
          odometer_km?: number | null
          owner_flag_reason?: string | null
          owner_review_comment?: string | null
          owner_review_status?: string
          owner_reviewed_at?: string | null
          photo_urls?: string[] | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
        }
        Update: {
          admin_note?: string | null
          ai_analysis?: Json | null
          ai_analyzed_at?: string | null
          application_id?: string | null
          car_id?: string | null
          created_at?: string | null
          driver_id?: string
          id?: string
          inspection_type?: string
          notes?: string | null
          odometer_km?: number | null
          owner_flag_reason?: string | null
          owner_review_comment?: string | null
          owner_review_status?: string
          owner_reviewed_at?: string | null
          photo_urls?: string[] | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "vehicle_inspections_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "active_matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicle_inspections_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicle_inspections_car_id_fkey"
            columns: ["car_id"]
            isOneToOne: false
            referencedRelation: "cars"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicle_inspections_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicle_inspections_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "v_user_last_login"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "vehicle_inspections_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicle_inspections_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "v_user_last_login"
            referencedColumns: ["user_id"]
          },
        ]
      }
      vehicle_odometers: {
        Row: {
          car_id: string
          current_km: number | null
          last_updated: string | null
        }
        Insert: {
          car_id: string
          current_km?: number | null
          last_updated?: string | null
        }
        Update: {
          car_id?: string
          current_km?: number | null
          last_updated?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vehicle_odometers_car_id_fkey"
            columns: ["car_id"]
            isOneToOne: true
            referencedRelation: "cars"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicle_trips: {
        Row: {
          application_id: string | null
          avg_speed_kmh: number | null
          car_id: string | null
          created_at: string | null
          distance_km: number | null
          driver_id: string
          duration_seconds: number | null
          end_location: string | null
          ended_at: string | null
          id: string
          idle_seconds: number | null
          max_speed_kmh: number | null
          odometer_end_km: number | null
          odometer_start_km: number | null
          start_location: string | null
          started_at: string
          status: string | null
        }
        Insert: {
          application_id?: string | null
          avg_speed_kmh?: number | null
          car_id?: string | null
          created_at?: string | null
          distance_km?: number | null
          driver_id: string
          duration_seconds?: number | null
          end_location?: string | null
          ended_at?: string | null
          id?: string
          idle_seconds?: number | null
          max_speed_kmh?: number | null
          odometer_end_km?: number | null
          odometer_start_km?: number | null
          start_location?: string | null
          started_at?: string
          status?: string | null
        }
        Update: {
          application_id?: string | null
          avg_speed_kmh?: number | null
          car_id?: string | null
          created_at?: string | null
          distance_km?: number | null
          driver_id?: string
          duration_seconds?: number | null
          end_location?: string | null
          ended_at?: string | null
          id?: string
          idle_seconds?: number | null
          max_speed_kmh?: number | null
          odometer_end_km?: number | null
          odometer_start_km?: number | null
          start_location?: string | null
          started_at?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vehicle_trips_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "active_matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicle_trips_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicle_trips_car_id_fkey"
            columns: ["car_id"]
            isOneToOne: false
            referencedRelation: "cars"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicle_trips_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicle_trips_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "v_user_last_login"
            referencedColumns: ["user_id"]
          },
        ]
      }
    }
    Views: {
      active_matches: {
        Row: {
          car_id: string | null
          driver_id: string | null
          id: string | null
          matched_at: string | null
          owner_id: string | null
          status: string | null
        }
        Insert: {
          car_id?: string | null
          driver_id?: string | null
          id?: string | null
          matched_at?: string | null
          owner_id?: string | null
          status?: string | null
        }
        Update: {
          car_id?: string | null
          driver_id?: string | null
          id?: string | null
          matched_at?: string | null
          owner_id?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "applications_car_id_fkey"
            columns: ["car_id"]
            isOneToOne: false
            referencedRelation: "cars"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "v_user_last_login"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "applications_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "v_user_last_login"
            referencedColumns: ["user_id"]
          },
        ]
      }
      driver_stats: {
        Row: {
          bolt_rating: string | null
          id: string | null
          indrive_rating: string | null
          late_payments: number | null
          ontime_payments: number | null
          rentals_completed: number | null
          status: string | null
          trust_score: number | null
          uber_rating: string | null
          user_id: string | null
        }
        Insert: {
          bolt_rating?: string | null
          id?: string | null
          indrive_rating?: string | null
          late_payments?: number | null
          ontime_payments?: number | null
          rentals_completed?: number | null
          status?: string | null
          trust_score?: number | null
          uber_rating?: string | null
          user_id?: string | null
        }
        Update: {
          bolt_rating?: string | null
          id?: string | null
          indrive_rating?: string | null
          late_payments?: number | null
          ontime_payments?: number | null
          rentals_completed?: number | null
          status?: string | null
          trust_score?: number | null
          uber_rating?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "driver_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "driver_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "v_user_last_login"
            referencedColumns: ["user_id"]
          },
        ]
      }
      v_driver_listing: {
        Row: {
          accidents: number | null
          age: number | null
          applications_paused: boolean | null
          bolt_rating: string | null
          bolt_trips: string | null
          citizenship: string | null
          created_at: string | null
          damage_incidents: number | null
          date_of_birth: string | null
          deposit_amount: number | null
          doc_id_url: string | null
          doc_license_url: string | null
          e_hailing_registration_date: string | null
          full_name: string | null
          gender: string | null
          id: string | null
          indrive_rating: string | null
          indrive_trips: string | null
          is_matched: boolean | null
          late_payments: number | null
          license_date: string | null
          location: string | null
          missed_payments: number | null
          ontime_payments: number | null
          photo_headshot_url: string | null
          platforms: string[] | null
          reckless_driving: number | null
          rentals_completed: number | null
          safe_parking: boolean | null
          trust_score: number | null
          uber_rating: string | null
          uber_trips: string | null
          user_id: string | null
          weekly_checkin_amount: number | null
          years_driving: number | null
        }
        Relationships: [
          {
            foreignKeyName: "driver_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "driver_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "v_user_last_login"
            referencedColumns: ["user_id"]
          },
        ]
      }
      v_user_last_login: {
        Row: {
          admin_status: string | null
          email: string | null
          full_name: string | null
          last_login_at: string | null
          login_count: number | null
          registered_at: string | null
          role: string | null
          user_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      apply_trust_action: {
        Args: { dp_id: string; pts: number }
        Returns: number
      }
      award_inspection_trust_points: {
        Args: {
          p_action_type: string
          p_inspection_id: string
          p_points: number
        }
        Returns: undefined
      }
      award_weekly_safety_trust_points: { Args: never; Returns: undefined }
      calculate_trust_score: { Args: { dp_id: string }; Returns: number }
      cleanup_expired_otps: { Args: never; Returns: undefined }
      complete_driver_registration: {
        Args: { payload: Json }
        Returns: undefined
      }
      expire_stale_boosts: { Args: never; Returns: undefined }
      get_incomplete_registrations: {
        Args: never
        Returns: {
          email: string
        }[]
      }
      increment_boost_impressions: {
        Args: { boost_ids: string[] }
        Returns: undefined
      }
      increment_boost_profile_views: {
        Args: { p_boost_id: string }
        Returns: undefined
      }
      recalculate_trust_score: { Args: { dp_id: string }; Returns: undefined }
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
