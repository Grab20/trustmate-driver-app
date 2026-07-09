// Generated via Supabase MCP `generate_typescript_types` against project qyyflivkmnwikagnvstv.
// Regenerate when the schema changes — do not hand-edit.
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
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
        ]
      }
      applications: {
        Row: {
          applicant_role: string | null
          car_id: string | null
          counter_price: number | null
          created_at: string | null
          driver_id: string | null
          id: string
          initiated_by: string | null
          matched_at: string | null
          message: string | null
          owner_id: string | null
          owner_notes: string | null
          owner_rated: boolean | null
          status: string | null
          unmatched_at: string | null
          unmatched_by: string | null
        }
        Insert: {
          applicant_role?: string | null
          car_id?: string | null
          counter_price?: number | null
          created_at?: string | null
          driver_id?: string | null
          id?: string
          initiated_by?: string | null
          matched_at?: string | null
          message?: string | null
          owner_id?: string | null
          owner_notes?: string | null
          owner_rated?: boolean | null
          status?: string | null
          unmatched_at?: string | null
          unmatched_by?: string | null
        }
        Update: {
          applicant_role?: string | null
          car_id?: string | null
          counter_price?: number | null
          created_at?: string | null
          driver_id?: string | null
          id?: string
          initiated_by?: string | null
          matched_at?: string | null
          message?: string | null
          owner_id?: string | null
          owner_notes?: string | null
          owner_rated?: boolean | null
          status?: string | null
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
            foreignKeyName: "applications_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      cars: {
        Row: {
          admin_note: string | null
          admin_status: string | null
          checkin_time: string | null
          color: string | null
          created_at: string | null
          deposit: string | null
          description: string | null
          fuel_policy: string | null
          id: string
          image_url: string | null
          insurance: boolean | null
          location: string
          make: string
          model: string
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
          checkin_time?: string | null
          color?: string | null
          created_at?: string | null
          deposit?: string | null
          description?: string | null
          fuel_policy?: string | null
          id?: string
          image_url?: string | null
          insurance?: boolean | null
          location: string
          make: string
          model: string
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
          checkin_time?: string | null
          color?: string | null
          created_at?: string | null
          deposit?: string | null
          description?: string | null
          fuel_policy?: string | null
          id?: string
          image_url?: string | null
          insurance?: boolean | null
          location?: string
          make?: string
          model?: string
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
        ]
      }
      driver_profiles: {
        Row: {
          accidents: number | null
          admin_note: string | null
          age: number | null
          bio: string | null
          bolt_rating: string | null
          bolt_trips: string | null
          consecutive_payments: number | null
          created_at: string | null
          criminal_check_submitted: boolean | null
          criminal_check_url: string | null
          damage_incidents: number | null
          doc_car_url: string | null
          doc_expires_at: string | null
          doc_holding_id_url: string | null
          doc_id_url: string | null
          doc_license_url: string | null
          doc_selfie_url: string | null
          doc_uploaded_at: string | null
          docs_verified: boolean | null
          excellent_care: number | null
          id: string
          id_number: string | null
          id_verified: boolean | null
          indrive_rating: string | null
          indrive_trips: string | null
          late_payments: number | null
          license_number: string | null
          license_verified: boolean | null
          major_accidents: number | null
          missed_checkins: number | null
          missed_payments: number | null
          months_with_owner: number | null
          ontime_payments: number | null
          photo_fullbody_url: string | null
          photo_headshot_url: string | null
          photo_holding_id_url: string | null
          platforms: string[] | null
          reckless_driving: number | null
          rejected_at: string | null
          rejection_reason: string | null
          rentals_completed: number | null
          safe_parking: boolean | null
          screenshot_bolt_url: string | null
          screenshot_indrive_url: string | null
          screenshot_uber_url: string | null
          status: string | null
          suspended: boolean | null
          trust_score: number | null
          uber_rating: string | null
          uber_trips: string | null
          updated_at: string | null
          user_id: string | null
          vehicle_abuse: number | null
          vehicles_stolen: number | null
          verified_references: number | null
          years_driving: number | null
        }
        Insert: {
          accidents?: number | null
          admin_note?: string | null
          age?: number | null
          bio?: string | null
          bolt_rating?: string | null
          bolt_trips?: string | null
          consecutive_payments?: number | null
          created_at?: string | null
          criminal_check_submitted?: boolean | null
          criminal_check_url?: string | null
          damage_incidents?: number | null
          doc_car_url?: string | null
          doc_expires_at?: string | null
          doc_holding_id_url?: string | null
          doc_id_url?: string | null
          doc_license_url?: string | null
          doc_selfie_url?: string | null
          doc_uploaded_at?: string | null
          docs_verified?: boolean | null
          excellent_care?: number | null
          id?: string
          id_number?: string | null
          id_verified?: boolean | null
          indrive_rating?: string | null
          indrive_trips?: string | null
          late_payments?: number | null
          license_number?: string | null
          license_verified?: boolean | null
          major_accidents?: number | null
          missed_checkins?: number | null
          missed_payments?: number | null
          months_with_owner?: number | null
          ontime_payments?: number | null
          photo_fullbody_url?: string | null
          photo_headshot_url?: string | null
          photo_holding_id_url?: string | null
          platforms?: string[] | null
          reckless_driving?: number | null
          rejected_at?: string | null
          rejection_reason?: string | null
          rentals_completed?: number | null
          safe_parking?: boolean | null
          screenshot_bolt_url?: string | null
          screenshot_indrive_url?: string | null
          screenshot_uber_url?: string | null
          status?: string | null
          suspended?: boolean | null
          trust_score?: number | null
          uber_rating?: string | null
          uber_trips?: string | null
          updated_at?: string | null
          user_id?: string | null
          vehicle_abuse?: number | null
          vehicles_stolen?: number | null
          verified_references?: number | null
          years_driving?: number | null
        }
        Update: {
          accidents?: number | null
          admin_note?: string | null
          age?: number | null
          bio?: string | null
          bolt_rating?: string | null
          bolt_trips?: string | null
          consecutive_payments?: number | null
          created_at?: string | null
          criminal_check_submitted?: boolean | null
          criminal_check_url?: string | null
          damage_incidents?: number | null
          doc_car_url?: string | null
          doc_expires_at?: string | null
          doc_holding_id_url?: string | null
          doc_id_url?: string | null
          doc_license_url?: string | null
          doc_selfie_url?: string | null
          doc_uploaded_at?: string | null
          docs_verified?: boolean | null
          excellent_care?: number | null
          id?: string
          id_number?: string | null
          id_verified?: boolean | null
          indrive_rating?: string | null
          indrive_trips?: string | null
          late_payments?: number | null
          license_number?: string | null
          license_verified?: boolean | null
          major_accidents?: number | null
          missed_checkins?: number | null
          missed_payments?: number | null
          months_with_owner?: number | null
          ontime_payments?: number | null
          photo_fullbody_url?: string | null
          photo_headshot_url?: string | null
          photo_holding_id_url?: string | null
          platforms?: string[] | null
          reckless_driving?: number | null
          rejected_at?: string | null
          rejection_reason?: string | null
          rentals_completed?: number | null
          safe_parking?: boolean | null
          screenshot_bolt_url?: string | null
          screenshot_indrive_url?: string | null
          screenshot_uber_url?: string | null
          status?: string | null
          suspended?: boolean | null
          trust_score?: number | null
          uber_rating?: string | null
          uber_trips?: string | null
          updated_at?: string | null
          user_id?: string | null
          vehicle_abuse?: number | null
          vehicles_stolen?: number | null
          verified_references?: number | null
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
        ]
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
            foreignKeyName: "incidents_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
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
      profiles: {
        Row: {
          admin_note: string | null
          admin_reviewed_at: string | null
          admin_status: string | null
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          doc_id_url: string | null
          email: string | null
          full_name: string
          id: string
          is_admin: boolean | null
          location: string | null
          phone: string | null
          photo_url: string | null
          popia_accepted: boolean | null
          popia_accepted_at: string | null
          preferred_contact: string | null
          role: string
          terms_accepted: boolean | null
          terms_accepted_at: string | null
          terms_version: string | null
          whatsapp: string | null
        }
        Insert: {
          admin_note?: string | null
          admin_reviewed_at?: string | null
          admin_status?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          doc_id_url?: string | null
          email?: string | null
          full_name: string
          id: string
          is_admin?: boolean | null
          location?: string | null
          phone?: string | null
          photo_url?: string | null
          popia_accepted?: boolean | null
          popia_accepted_at?: string | null
          preferred_contact?: string | null
          role: string
          terms_accepted?: boolean | null
          terms_accepted_at?: string | null
          terms_version?: string | null
          whatsapp?: string | null
        }
        Update: {
          admin_note?: string | null
          admin_reviewed_at?: string | null
          admin_status?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          doc_id_url?: string | null
          email?: string | null
          full_name?: string
          id?: string
          is_admin?: boolean | null
          location?: string | null
          phone?: string | null
          photo_url?: string | null
          popia_accepted?: boolean | null
          popia_accepted_at?: string | null
          preferred_contact?: string | null
          role?: string
          terms_accepted?: boolean | null
          terms_accepted_at?: string | null
          terms_version?: string | null
          whatsapp?: string | null
        }
        Relationships: []
      }
      reviews: {
        Row: {
          application_id: string | null
          comment: string | null
          created_at: string | null
          driver_id: string | null
          id: string
          rating: number
          reviewer_id: string | null
          reviewer_name_override: string | null
          written_by_admin: boolean | null
        }
        Insert: {
          application_id?: string | null
          comment?: string | null
          created_at?: string | null
          driver_id?: string | null
          id?: string
          rating: number
          reviewer_id?: string | null
          reviewer_name_override?: string | null
          written_by_admin?: boolean | null
        }
        Update: {
          application_id?: string | null
          comment?: string | null
          created_at?: string | null
          driver_id?: string | null
          id?: string
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
            foreignKeyName: "reviews_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
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
            foreignKeyName: "trust_actions_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
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
            foreignKeyName: "applications_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
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
        Relationships: [
          {
            foreignKeyName: "driver_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      v_driver_listing: {
        Row: {
          accidents: number | null
          age: number | null
          bolt_rating: string | null
          bolt_trips: string | null
          damage_incidents: number | null
          doc_id_url: string | null
          doc_license_url: string | null
          full_name: string | null
          id: string | null
          indrive_rating: string | null
          indrive_trips: string | null
          is_matched: boolean | null
          late_payments: number | null
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
        ]
      }
    }
    Functions: {
      calculate_trust_score: { Args: { dp_id: string }; Returns: number }
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
type DefaultSchema = DatabaseWithoutInternals["public"]

export type Tables<
  TableName extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"]),
> = (DefaultSchema["Tables"] & DefaultSchema["Views"])[TableName] extends {
  Row: infer R
}
  ? R
  : never

export type TablesInsert<TableName extends keyof DefaultSchema["Tables"]> =
  DefaultSchema["Tables"][TableName] extends { Insert: infer I } ? I : never

export type TablesUpdate<TableName extends keyof DefaultSchema["Tables"]> =
  DefaultSchema["Tables"][TableName] extends { Update: infer U } ? U : never
