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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      article_dataset_meta: {
        Row: {
          data: Json
          id: string
        }
        Insert: {
          data: Json
          id?: string
        }
        Update: {
          data?: Json
          id?: string
        }
        Relationships: []
      }
      article_links: {
        Row: {
          article_id: string
          created_at: string
          id: number
          item_id: string
          relation_type: string
          sort_order: number
          weight: number
        }
        Insert: {
          article_id: string
          created_at?: string
          id?: never
          item_id: string
          relation_type: string
          sort_order?: number
          weight?: number
        }
        Update: {
          article_id?: string
          created_at?: string
          id?: never
          item_id?: string
          relation_type?: string
          sort_order?: number
          weight?: number
        }
        Relationships: [
          {
            foreignKeyName: "article_links_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "article_links_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "article_links_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "v_item_execution_depth"
            referencedColumns: ["item_id"]
          },
          {
            foreignKeyName: "article_links_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "v_item_statute_candidate_v2"
            referencedColumns: ["item_id"]
          },
          {
            foreignKeyName: "article_links_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "v_item_statute_coverage"
            referencedColumns: ["item_id"]
          },
          {
            foreignKeyName: "article_links_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "v_item_structural_position"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "article_links_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "v_item_structural_risk"
            referencedColumns: ["item_id"]
          },
          {
            foreignKeyName: "article_links_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "v_item_system_map"
            referencedColumns: ["item_id"]
          },
          {
            foreignKeyName: "article_links_relation_type_fkey"
            columns: ["relation_type"]
            isOneToOne: false
            referencedRelation: "article_relation_types"
            referencedColumns: ["type"]
          },
        ]
      }
      article_relation_types: {
        Row: {
          label: string
          type: string
        }
        Insert: {
          label: string
          type: string
        }
        Update: {
          label?: string
          type?: string
        }
        Relationships: []
      }
      articles: {
        Row: {
          body: string[]
          created_at: string
          dek: string | null
          id: string
          note: string | null
          status: string
          tags: string[]
          title: string
          updated_at: string
        }
        Insert: {
          body?: string[]
          created_at?: string
          dek?: string | null
          id: string
          note?: string | null
          status?: string
          tags?: string[]
          title: string
          updated_at?: string
        }
        Update: {
          body?: string[]
          created_at?: string
          dek?: string | null
          id?: string
          note?: string | null
          status?: string
          tags?: string[]
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      association: {
        Row: {
          activities: string[]
          activities_title: string | null
          board_lead: string | null
          chair: string | null
          created_at: string
          id: string
          kicker: string | null
          links: Json
          membership: Json
          mission: string | null
          name: string
          role_in_atlas: string | null
          short_name: string | null
          updated: string | null
          updated_at: string
        }
        Insert: {
          activities?: string[]
          activities_title?: string | null
          board_lead?: string | null
          chair?: string | null
          created_at?: string
          id?: string
          kicker?: string | null
          links?: Json
          membership?: Json
          mission?: string | null
          name: string
          role_in_atlas?: string | null
          short_name?: string | null
          updated?: string | null
          updated_at?: string
        }
        Update: {
          activities?: string[]
          activities_title?: string | null
          board_lead?: string | null
          chair?: string | null
          created_at?: string
          id?: string
          kicker?: string | null
          links?: Json
          membership?: Json
          mission?: string | null
          name?: string
          role_in_atlas?: string | null
          short_name?: string | null
          updated?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      association_board_members: {
        Row: {
          created_at: string
          email: string | null
          id: number
          image: string | null
          name: string
          note: string | null
          phone: string | null
          profile_url: string | null
          role: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: never
          image?: string | null
          name: string
          note?: string | null
          phone?: string | null
          profile_url?: string | null
          role: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: never
          image?: string | null
          name?: string
          note?: string | null
          phone?: string | null
          profile_url?: string | null
          role?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      association_contacts: {
        Row: {
          address_line: string | null
          city: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          municipality: string | null
          phone: string | null
          postal_code: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          address_line?: string | null
          city?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id?: string
          municipality?: string | null
          phone?: string | null
          postal_code?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          address_line?: string | null
          city?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          municipality?: string | null
          phone?: string | null
          postal_code?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      association_documents: {
        Row: {
          created_at: string
          date: string | null
          description: string | null
          group_empty_text: string | null
          group_sort_order: number
          group_title: string
          id: number
          sort_order: number
          title: string | null
          type: string | null
          updated_at: string
          url: string | null
        }
        Insert: {
          created_at?: string
          date?: string | null
          description?: string | null
          group_empty_text?: string | null
          group_sort_order?: number
          group_title: string
          id?: never
          sort_order?: number
          title?: string | null
          type?: string | null
          updated_at?: string
          url?: string | null
        }
        Update: {
          created_at?: string
          date?: string | null
          description?: string | null
          group_empty_text?: string | null
          group_sort_order?: number
          group_title?: string
          id?: never
          sort_order?: number
          title?: string | null
          type?: string | null
          updated_at?: string
          url?: string | null
        }
        Relationships: []
      }
      association_meetings: {
        Row: {
          absentees: string | null
          agenda_lines: string[]
          attendees: string | null
          chair: string | null
          closing_note: string | null
          created_at: string
          doc_type: string
          id: number
          invite_sent_date: string | null
          location: string | null
          meeting_date: string | null
          meeting_number: string | null
          meeting_time: string | null
          meeting_type: string
          notes: string | null
          opening_note: string | null
          post_agenda_note: string | null
          pre_agenda_note: string | null
          reviewers: string | null
          secretary: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          absentees?: string | null
          agenda_lines?: string[]
          attendees?: string | null
          chair?: string | null
          closing_note?: string | null
          created_at?: string
          doc_type: string
          id?: never
          invite_sent_date?: string | null
          location?: string | null
          meeting_date?: string | null
          meeting_number?: string | null
          meeting_time?: string | null
          meeting_type: string
          notes?: string | null
          opening_note?: string | null
          post_agenda_note?: string | null
          pre_agenda_note?: string | null
          reviewers?: string | null
          secretary?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          absentees?: string | null
          agenda_lines?: string[]
          attendees?: string | null
          chair?: string | null
          closing_note?: string | null
          created_at?: string
          doc_type?: string
          id?: never
          invite_sent_date?: string | null
          location?: string | null
          meeting_date?: string | null
          meeting_number?: string | null
          meeting_time?: string | null
          meeting_type?: string
          notes?: string | null
          opening_note?: string | null
          post_agenda_note?: string | null
          pre_agenda_note?: string | null
          reviewers?: string | null
          secretary?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      association_members: {
        Row: {
          address_line: string | null
          city: string | null
          contact_id: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          joined_at: string | null
          member_number: number
          member_status: string
          municipality: string | null
          notes: string | null
          phone: string | null
          postal_code: string | null
          resigned_at: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          address_line?: string | null
          city?: string | null
          contact_id?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id?: string
          joined_at?: string | null
          member_number?: number
          member_status?: string
          municipality?: string | null
          notes?: string | null
          phone?: string | null
          postal_code?: string | null
          resigned_at?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          address_line?: string | null
          city?: string | null
          contact_id?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          joined_at?: string | null
          member_number?: number
          member_status?: string
          municipality?: string | null
          notes?: string | null
          phone?: string | null
          postal_code?: string | null
          resigned_at?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "association_members_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "association_contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      association_memberships: {
        Row: {
          created_at: string
          id: string
          membership_type: string
          membership_year: number
          paid_at: string
          payment_id: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          membership_type: string
          membership_year: number
          paid_at?: string
          payment_id: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          membership_type?: string
          membership_year?: number
          paid_at?: string
          payment_id?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "association_memberships_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: true
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
        ]
      }
      association_news: {
        Row: {
          audience: string
          body: string | null
          created_at: string
          excerpt: string | null
          id: number
          image_url: string | null
          kicker: string | null
          link_label: string | null
          link_url: string | null
          pinned: boolean
          published_at: string | null
          sort_order: number
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          audience?: string
          body?: string | null
          created_at?: string
          excerpt?: string | null
          id?: never
          image_url?: string | null
          kicker?: string | null
          link_label?: string | null
          link_url?: string | null
          pinned?: boolean
          published_at?: string | null
          sort_order?: number
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          audience?: string
          body?: string | null
          created_at?: string
          excerpt?: string | null
          id?: never
          image_url?: string | null
          kicker?: string | null
          link_label?: string | null
          link_url?: string | null
          pinned?: boolean
          published_at?: string | null
          sort_order?: number
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      association_rules: {
        Row: {
          approved_date: string | null
          id: string
          intro: string | null
          paragraph_lines: string[]
          registered_date: string | null
          updated_at: string
          version_label: string | null
        }
        Insert: {
          approved_date?: string | null
          id?: string
          intro?: string | null
          paragraph_lines?: string[]
          registered_date?: string | null
          updated_at?: string
          version_label?: string | null
        }
        Update: {
          approved_date?: string | null
          id?: string
          intro?: string | null
          paragraph_lines?: string[]
          registered_date?: string | null
          updated_at?: string
          version_label?: string | null
        }
        Relationships: []
      }
      association_volunteers: {
        Row: {
          availability: string | null
          contact_id: string | null
          created_at: string
          id: string
          interests: string[]
          note: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          availability?: string | null
          contact_id?: string | null
          created_at?: string
          id?: string
          interests?: string[]
          note?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          availability?: string | null
          contact_id?: string | null
          created_at?: string
          id?: string
          interests?: string[]
          note?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "association_volunteers_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "association_contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      atlas_admins: {
        Row: {
          user_id: string
        }
        Insert: {
          user_id: string
        }
        Update: {
          user_id?: string
        }
        Relationships: []
      }
      atlas_evidence_links: {
        Row: {
          evidence_role: string
          id: number
          item_id: string | null
          mechanism_id: number
          rationale: string
          series_key: string | null
          variable_id: number | null
        }
        Insert: {
          evidence_role: string
          id?: number
          item_id?: string | null
          mechanism_id: number
          rationale?: string
          series_key?: string | null
          variable_id?: number | null
        }
        Update: {
          evidence_role?: string
          id?: number
          item_id?: string | null
          mechanism_id?: number
          rationale?: string
          series_key?: string | null
          variable_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "atlas_evidence_links_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "atlas_evidence_links_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "v_item_execution_depth"
            referencedColumns: ["item_id"]
          },
          {
            foreignKeyName: "atlas_evidence_links_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "v_item_statute_candidate_v2"
            referencedColumns: ["item_id"]
          },
          {
            foreignKeyName: "atlas_evidence_links_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "v_item_statute_coverage"
            referencedColumns: ["item_id"]
          },
          {
            foreignKeyName: "atlas_evidence_links_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "v_item_structural_position"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "atlas_evidence_links_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "v_item_structural_risk"
            referencedColumns: ["item_id"]
          },
          {
            foreignKeyName: "atlas_evidence_links_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "v_item_system_map"
            referencedColumns: ["item_id"]
          },
          {
            foreignKeyName: "atlas_evidence_links_mechanism_id_fkey"
            columns: ["mechanism_id"]
            isOneToOne: false
            referencedRelation: "atlas_mechanisms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "atlas_evidence_links_series_key_fkey"
            columns: ["series_key"]
            isOneToOne: false
            referencedRelation: "indicator_series"
            referencedColumns: ["series_key"]
          },
          {
            foreignKeyName: "atlas_evidence_links_variable_id_fkey"
            columns: ["variable_id"]
            isOneToOne: false
            referencedRelation: "atlas_variables"
            referencedColumns: ["id"]
          },
        ]
      }
      atlas_links: {
        Row: {
          id: number
          payload: Json
        }
        Insert: {
          id?: number
          payload: Json
        }
        Update: {
          id?: number
          payload?: Json
        }
        Relationships: []
      }
      atlas_mechanism_cases: {
        Row: {
          created_at: string
          data: Json
          id: string
          kind: string
          primary_item_id: string | null
          published: boolean
          revision: number
          status: string
          title: string
          updated_at: string
          year_end: number
          year_start: number
        }
        Insert: {
          created_at?: string
          data?: Json
          id?: string
          kind?: string
          primary_item_id?: string | null
          published?: boolean
          revision?: number
          status?: string
          title: string
          updated_at?: string
          year_end: number
          year_start: number
        }
        Update: {
          created_at?: string
          data?: Json
          id?: string
          kind?: string
          primary_item_id?: string | null
          published?: boolean
          revision?: number
          status?: string
          title?: string
          updated_at?: string
          year_end?: number
          year_start?: number
        }
        Relationships: [
          {
            foreignKeyName: "atlas_mechanism_cases_primary_item_id_fkey"
            columns: ["primary_item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "atlas_mechanism_cases_primary_item_id_fkey"
            columns: ["primary_item_id"]
            isOneToOne: false
            referencedRelation: "v_item_execution_depth"
            referencedColumns: ["item_id"]
          },
          {
            foreignKeyName: "atlas_mechanism_cases_primary_item_id_fkey"
            columns: ["primary_item_id"]
            isOneToOne: false
            referencedRelation: "v_item_statute_candidate_v2"
            referencedColumns: ["item_id"]
          },
          {
            foreignKeyName: "atlas_mechanism_cases_primary_item_id_fkey"
            columns: ["primary_item_id"]
            isOneToOne: false
            referencedRelation: "v_item_statute_coverage"
            referencedColumns: ["item_id"]
          },
          {
            foreignKeyName: "atlas_mechanism_cases_primary_item_id_fkey"
            columns: ["primary_item_id"]
            isOneToOne: false
            referencedRelation: "v_item_structural_position"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "atlas_mechanism_cases_primary_item_id_fkey"
            columns: ["primary_item_id"]
            isOneToOne: false
            referencedRelation: "v_item_structural_risk"
            referencedColumns: ["item_id"]
          },
          {
            foreignKeyName: "atlas_mechanism_cases_primary_item_id_fkey"
            columns: ["primary_item_id"]
            isOneToOne: false
            referencedRelation: "v_item_system_map"
            referencedColumns: ["item_id"]
          },
        ]
      }
      atlas_mechanism_cluster_members: {
        Row: {
          cluster_id: number
          mechanism_id: number
          membership_type: string
          rationale: string | null
        }
        Insert: {
          cluster_id: number
          mechanism_id: number
          membership_type?: string
          rationale?: string | null
        }
        Update: {
          cluster_id?: number
          mechanism_id?: number
          membership_type?: string
          rationale?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "atlas_mechanism_cluster_members_cluster_id_fkey"
            columns: ["cluster_id"]
            isOneToOne: false
            referencedRelation: "atlas_mechanism_clusters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "atlas_mechanism_cluster_members_mechanism_id_fkey"
            columns: ["mechanism_id"]
            isOneToOne: false
            referencedRelation: "atlas_mechanisms"
            referencedColumns: ["id"]
          },
        ]
      }
      atlas_mechanism_clusters: {
        Row: {
          code: string
          description: string
          id: number
          sort_order: number
          title: string
        }
        Insert: {
          code: string
          description: string
          id?: number
          sort_order: number
          title: string
        }
        Update: {
          code?: string
          description?: string
          id?: number
          sort_order?: number
          title?: string
        }
        Relationships: []
      }
      atlas_mechanism_relations: {
        Row: {
          evidence_status: string
          rationale: string
          relation: string
          source_mechanism_id: number
          target_mechanism_id: number
        }
        Insert: {
          evidence_status?: string
          rationale?: string
          relation: string
          source_mechanism_id: number
          target_mechanism_id: number
        }
        Update: {
          evidence_status?: string
          rationale?: string
          relation?: string
          source_mechanism_id?: number
          target_mechanism_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "atlas_mechanism_relations_source_mechanism_id_fkey"
            columns: ["source_mechanism_id"]
            isOneToOne: false
            referencedRelation: "atlas_mechanisms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "atlas_mechanism_relations_target_mechanism_id_fkey"
            columns: ["target_mechanism_id"]
            isOneToOne: false
            referencedRelation: "atlas_mechanisms"
            referencedColumns: ["id"]
          },
        ]
      }
      atlas_mechanisms: {
        Row: {
          created_at: string
          evidence_status: string
          hypothesis: string
          id: number
          lag_years_max: number | null
          lag_years_min: number | null
          theme_id: number | null
          title: string
        }
        Insert: {
          created_at?: string
          evidence_status?: string
          hypothesis: string
          id?: number
          lag_years_max?: number | null
          lag_years_min?: number | null
          theme_id?: number | null
          title: string
        }
        Update: {
          created_at?: string
          evidence_status?: string
          hypothesis?: string
          id?: number
          lag_years_max?: number | null
          lag_years_min?: number | null
          theme_id?: number | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "atlas_mechanisms_theme_id_fkey"
            columns: ["theme_id"]
            isOneToOne: false
            referencedRelation: "atlas_themes"
            referencedColumns: ["id"]
          },
        ]
      }
      atlas_stage_mechanisms: {
        Row: {
          direction: string
          evidence_status: string
          lag_years_max: number | null
          lag_years_min: number | null
          mechanism_id: number
          rationale: string
          role: string
          stage: number
          theme_id: number
        }
        Insert: {
          direction?: string
          evidence_status?: string
          lag_years_max?: number | null
          lag_years_min?: number | null
          mechanism_id: number
          rationale?: string
          role?: string
          stage: number
          theme_id: number
        }
        Update: {
          direction?: string
          evidence_status?: string
          lag_years_max?: number | null
          lag_years_min?: number | null
          mechanism_id?: number
          rationale?: string
          role?: string
          stage?: number
          theme_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "atlas_stage_mechanisms_mechanism_id_fkey"
            columns: ["mechanism_id"]
            isOneToOne: false
            referencedRelation: "atlas_mechanisms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "atlas_stage_mechanisms_theme_id_fkey"
            columns: ["theme_id"]
            isOneToOne: false
            referencedRelation: "atlas_themes"
            referencedColumns: ["id"]
          },
        ]
      }
      atlas_stage_variables: {
        Row: {
          direction: string
          rationale: string
          role: string
          stage: number
          theme_id: number
          variable_id: number
        }
        Insert: {
          direction?: string
          rationale?: string
          role?: string
          stage: number
          theme_id: number
          variable_id: number
        }
        Update: {
          direction?: string
          rationale?: string
          role?: string
          stage?: number
          theme_id?: number
          variable_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "atlas_stage_variables_theme_id_fkey"
            columns: ["theme_id"]
            isOneToOne: false
            referencedRelation: "atlas_themes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "atlas_stage_variables_variable_id_fkey"
            columns: ["variable_id"]
            isOneToOne: false
            referencedRelation: "atlas_variables"
            referencedColumns: ["id"]
          },
        ]
      }
      atlas_theme_variables: {
        Row: {
          rationale: string
          role: string
          theme_id: number
          variable_id: number
        }
        Insert: {
          rationale?: string
          role: string
          theme_id: number
          variable_id: number
        }
        Update: {
          rationale?: string
          role?: string
          theme_id?: number
          variable_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "atlas_theme_variables_theme_id_fkey"
            columns: ["theme_id"]
            isOneToOne: false
            referencedRelation: "atlas_themes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "atlas_theme_variables_variable_id_fkey"
            columns: ["variable_id"]
            isOneToOne: false
            referencedRelation: "atlas_variables"
            referencedColumns: ["id"]
          },
        ]
      }
      atlas_themes: {
        Row: {
          id: number
          payload: Json
          updated_at: string
        }
        Insert: {
          id: number
          payload: Json
          updated_at?: string
        }
        Update: {
          id?: number
          payload?: Json
          updated_at?: string
        }
        Relationships: []
      }
      atlas_variable_indicators: {
        Row: {
          rationale: string
          relation_type: string
          series_key: string
          variable_id: number
        }
        Insert: {
          rationale?: string
          relation_type?: string
          series_key: string
          variable_id: number
        }
        Update: {
          rationale?: string
          relation_type?: string
          series_key?: string
          variable_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "atlas_variable_indicators_series_key_fkey"
            columns: ["series_key"]
            isOneToOne: false
            referencedRelation: "indicator_series"
            referencedColumns: ["series_key"]
          },
          {
            foreignKeyName: "atlas_variable_indicators_variable_id_fkey"
            columns: ["variable_id"]
            isOneToOne: false
            referencedRelation: "atlas_variables"
            referencedColumns: ["id"]
          },
        ]
      }
      atlas_variables: {
        Row: {
          code: string
          created_at: string
          definition: string
          favorable_direction: string
          id: number
          measurement_status: string
          name: string
          source_note: string | null
          unit: string | null
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          definition?: string
          favorable_direction?: string
          id?: number
          measurement_status?: string
          name: string
          source_note?: string | null
          unit?: string | null
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          definition?: string
          favorable_direction?: string
          id?: number
          measurement_status?: string
          name?: string
          source_note?: string | null
          unit?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      attachments: {
        Row: {
          article_id: string | null
          caption: string | null
          created_at: string
          id: number
          item_id: string | null
          sort_order: number | null
          storage_path: string
        }
        Insert: {
          article_id?: string | null
          caption?: string | null
          created_at?: string
          id?: never
          item_id?: string | null
          sort_order?: number | null
          storage_path: string
        }
        Update: {
          article_id?: string | null
          caption?: string | null
          created_at?: string
          id?: never
          item_id?: string | null
          sort_order?: number | null
          storage_path?: string
        }
        Relationships: [
          {
            foreignKeyName: "attachments_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attachments_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attachments_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "v_item_execution_depth"
            referencedColumns: ["item_id"]
          },
          {
            foreignKeyName: "attachments_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "v_item_statute_candidate_v2"
            referencedColumns: ["item_id"]
          },
          {
            foreignKeyName: "attachments_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "v_item_statute_coverage"
            referencedColumns: ["item_id"]
          },
          {
            foreignKeyName: "attachments_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "v_item_structural_position"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attachments_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "v_item_structural_risk"
            referencedColumns: ["item_id"]
          },
          {
            foreignKeyName: "attachments_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "v_item_system_map"
            referencedColumns: ["item_id"]
          },
        ]
      }
      dataset_meta: {
        Row: {
          data: Json
          id: string
        }
        Insert: {
          data: Json
          id?: string
        }
        Update: {
          data?: Json
          id?: string
        }
        Relationships: []
      }
      donations: {
        Row: {
          amount_cents: number
          created_at: string
          currency: string
          donated_at: string
          id: string
          payment_id: string
          user_id: string
        }
        Insert: {
          amount_cents: number
          created_at?: string
          currency?: string
          donated_at?: string
          id?: string
          payment_id: string
          user_id: string
        }
        Update: {
          amount_cents?: number
          created_at?: string
          currency?: string
          donated_at?: string
          id?: string
          payment_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "donations_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: true
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
        ]
      }
      entitlements: {
        Row: {
          created_at: string
          id: string
          product_id: string
          status: string
          user_id: string
          valid_from: string
          valid_until: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          status?: string
          user_id: string
          valid_from?: string
          valid_until?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          status?: string
          user_id?: string
          valid_from?: string
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "entitlements_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      indicator_aliases: {
        Row: {
          alias_code: string
          created_at: string
          group_key: string | null
          match_status: string
          rationale: string
          series_key: string | null
          updated_at: string
        }
        Insert: {
          alias_code: string
          created_at?: string
          group_key?: string | null
          match_status: string
          rationale: string
          series_key?: string | null
          updated_at?: string
        }
        Update: {
          alias_code?: string
          created_at?: string
          group_key?: string | null
          match_status?: string
          rationale?: string
          series_key?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "indicator_aliases_alias_code_fkey"
            columns: ["alias_code"]
            isOneToOne: true
            referencedRelation: "murros_indicator_series"
            referencedColumns: ["legacy_code"]
          },
          {
            foreignKeyName: "indicator_aliases_alias_code_fkey"
            columns: ["alias_code"]
            isOneToOne: true
            referencedRelation: "statistic_series"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "indicator_aliases_series_key_fkey"
            columns: ["series_key"]
            isOneToOne: false
            referencedRelation: "indicator_series"
            referencedColumns: ["series_key"]
          },
        ]
      }
      indicator_series: {
        Row: {
          created_at: string
          data_class: string
          description: string | null
          end_year: number | null
          frequency: string
          geography: string
          indicator_role: string | null
          interpretation: string | null
          lenses: string[]
          metadata: Json
          pressure_domain: string | null
          published: boolean
          quality: Json
          series_key: string
          source: string | null
          source_project_ref: string | null
          source_url: string | null
          start_year: number | null
          status: string
          theme: string | null
          title: string
          unit: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          data_class?: string
          description?: string | null
          end_year?: number | null
          frequency?: string
          geography?: string
          indicator_role?: string | null
          interpretation?: string | null
          lenses?: string[]
          metadata?: Json
          pressure_domain?: string | null
          published?: boolean
          quality?: Json
          series_key: string
          source?: string | null
          source_project_ref?: string | null
          source_url?: string | null
          start_year?: number | null
          status?: string
          theme?: string | null
          title: string
          unit?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          data_class?: string
          description?: string | null
          end_year?: number | null
          frequency?: string
          geography?: string
          indicator_role?: string | null
          interpretation?: string | null
          lenses?: string[]
          metadata?: Json
          pressure_domain?: string | null
          published?: boolean
          quality?: Json
          series_key?: string
          source?: string | null
          source_project_ref?: string | null
          source_url?: string | null
          start_year?: number | null
          status?: string
          theme?: string | null
          title?: string
          unit?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      indicator_values: {
        Row: {
          group_key: string
          group_label: string | null
          imported_at: string
          is_published: boolean
          meta: Json
          period: string | null
          series_key: string
          source_retrieved_at: string | null
          source_url: string | null
          source_version: string | null
          validation_note: string | null
          validation_status: string
          value: number | null
          value_kind: string
          value_text: string | null
          year: number
        }
        Insert: {
          group_key?: string
          group_label?: string | null
          imported_at?: string
          is_published?: boolean
          meta?: Json
          period?: string | null
          series_key: string
          source_retrieved_at?: string | null
          source_url?: string | null
          source_version?: string | null
          validation_note?: string | null
          validation_status?: string
          value?: number | null
          value_kind?: string
          value_text?: string | null
          year: number
        }
        Update: {
          group_key?: string
          group_label?: string | null
          imported_at?: string
          is_published?: boolean
          meta?: Json
          period?: string | null
          series_key?: string
          source_retrieved_at?: string | null
          source_url?: string | null
          source_version?: string | null
          validation_note?: string | null
          validation_status?: string
          value?: number | null
          value_kind?: string
          value_text?: string | null
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "indicator_values_series_key_fkey"
            columns: ["series_key"]
            isOneToOne: false
            referencedRelation: "indicator_series"
            referencedColumns: ["series_key"]
          },
        ]
      }
      infographics: {
        Row: {
          article_id: string | null
          caption: string | null
          content_summary: string
          created_at: string
          id: number
          murros_item_id: string | null
          purpose: string | null
          selitys_generation_id: string | null
          selitys_mechanism_id: string | null
          selitys_model_id: string | null
          selitys_theme_id: string | null
          sort_order: number
          storage_path: string
          unpublished: boolean
          updated_at: string
        }
        Insert: {
          article_id?: string | null
          caption?: string | null
          content_summary: string
          created_at?: string
          id?: never
          murros_item_id?: string | null
          purpose?: string | null
          selitys_generation_id?: string | null
          selitys_mechanism_id?: string | null
          selitys_model_id?: string | null
          selitys_theme_id?: string | null
          sort_order?: number
          storage_path: string
          unpublished?: boolean
          updated_at?: string
        }
        Update: {
          article_id?: string | null
          caption?: string | null
          content_summary?: string
          created_at?: string
          id?: never
          murros_item_id?: string | null
          purpose?: string | null
          selitys_generation_id?: string | null
          selitys_mechanism_id?: string | null
          selitys_model_id?: string | null
          selitys_theme_id?: string | null
          sort_order?: number
          storage_path?: string
          unpublished?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "infographics_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "infographics_murros_item_id_fkey"
            columns: ["murros_item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "infographics_murros_item_id_fkey"
            columns: ["murros_item_id"]
            isOneToOne: false
            referencedRelation: "v_item_execution_depth"
            referencedColumns: ["item_id"]
          },
          {
            foreignKeyName: "infographics_murros_item_id_fkey"
            columns: ["murros_item_id"]
            isOneToOne: false
            referencedRelation: "v_item_statute_candidate_v2"
            referencedColumns: ["item_id"]
          },
          {
            foreignKeyName: "infographics_murros_item_id_fkey"
            columns: ["murros_item_id"]
            isOneToOne: false
            referencedRelation: "v_item_statute_coverage"
            referencedColumns: ["item_id"]
          },
          {
            foreignKeyName: "infographics_murros_item_id_fkey"
            columns: ["murros_item_id"]
            isOneToOne: false
            referencedRelation: "v_item_structural_position"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "infographics_murros_item_id_fkey"
            columns: ["murros_item_id"]
            isOneToOne: false
            referencedRelation: "v_item_structural_risk"
            referencedColumns: ["item_id"]
          },
          {
            foreignKeyName: "infographics_murros_item_id_fkey"
            columns: ["murros_item_id"]
            isOneToOne: false
            referencedRelation: "v_item_system_map"
            referencedColumns: ["item_id"]
          },
        ]
      }
      item_execution_depth: {
        Row: {
          best_statute_id: string | null
          best_statute_title: string | null
          delegation_class: string | null
          delegation_depth_score: number | null
          execution_risk_class: string | null
          execution_risk_score: number | null
          historical_importance_score: number | null
          institutional_system_weight: number | null
          item_id: string
          legislative_change_intensity: number | null
          methodology_version: string
          structural_risk_score: number | null
          updated_at: string
        }
        Insert: {
          best_statute_id?: string | null
          best_statute_title?: string | null
          delegation_class?: string | null
          delegation_depth_score?: number | null
          execution_risk_class?: string | null
          execution_risk_score?: number | null
          historical_importance_score?: number | null
          institutional_system_weight?: number | null
          item_id: string
          legislative_change_intensity?: number | null
          methodology_version?: string
          structural_risk_score?: number | null
          updated_at?: string
        }
        Update: {
          best_statute_id?: string | null
          best_statute_title?: string | null
          delegation_class?: string | null
          delegation_depth_score?: number | null
          execution_risk_class?: string | null
          execution_risk_score?: number | null
          historical_importance_score?: number | null
          institutional_system_weight?: number | null
          item_id?: string
          legislative_change_intensity?: number | null
          methodology_version?: string
          structural_risk_score?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "item_execution_depth_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: true
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "item_execution_depth_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: true
            referencedRelation: "v_item_execution_depth"
            referencedColumns: ["item_id"]
          },
          {
            foreignKeyName: "item_execution_depth_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: true
            referencedRelation: "v_item_statute_candidate_v2"
            referencedColumns: ["item_id"]
          },
          {
            foreignKeyName: "item_execution_depth_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: true
            referencedRelation: "v_item_statute_coverage"
            referencedColumns: ["item_id"]
          },
          {
            foreignKeyName: "item_execution_depth_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: true
            referencedRelation: "v_item_structural_position"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "item_execution_depth_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: true
            referencedRelation: "v_item_structural_risk"
            referencedColumns: ["item_id"]
          },
          {
            foreignKeyName: "item_execution_depth_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: true
            referencedRelation: "v_item_system_map"
            referencedColumns: ["item_id"]
          },
        ]
      }
      item_institutional_weight: {
        Row: {
          best_link_confidence: string | null
          best_statute_id: string | null
          best_statute_title: string | null
          historical_importance_score: number | null
          institutional_system_weight: number | null
          item_id: string
          link_adjusted_weight: number | null
          methodology_version: string
          statute_count: number
          updated_at: string
        }
        Insert: {
          best_link_confidence?: string | null
          best_statute_id?: string | null
          best_statute_title?: string | null
          historical_importance_score?: number | null
          institutional_system_weight?: number | null
          item_id: string
          link_adjusted_weight?: number | null
          methodology_version?: string
          statute_count: number
          updated_at?: string
        }
        Update: {
          best_link_confidence?: string | null
          best_statute_id?: string | null
          best_statute_title?: string | null
          historical_importance_score?: number | null
          institutional_system_weight?: number | null
          item_id?: string
          link_adjusted_weight?: number | null
          methodology_version?: string
          statute_count?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "item_institutional_weight_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: true
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "item_institutional_weight_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: true
            referencedRelation: "v_item_execution_depth"
            referencedColumns: ["item_id"]
          },
          {
            foreignKeyName: "item_institutional_weight_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: true
            referencedRelation: "v_item_statute_candidate_v2"
            referencedColumns: ["item_id"]
          },
          {
            foreignKeyName: "item_institutional_weight_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: true
            referencedRelation: "v_item_statute_coverage"
            referencedColumns: ["item_id"]
          },
          {
            foreignKeyName: "item_institutional_weight_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: true
            referencedRelation: "v_item_structural_position"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "item_institutional_weight_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: true
            referencedRelation: "v_item_structural_risk"
            referencedColumns: ["item_id"]
          },
          {
            foreignKeyName: "item_institutional_weight_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: true
            referencedRelation: "v_item_system_map"
            referencedColumns: ["item_id"]
          },
        ]
      }
      item_statute_candidates: {
        Row: {
          candidate_score: number
          candidate_status: string
          confidence: string
          context_similarity: number
          generated_at: string
          generated_by: string
          item_id: string
          rank: number
          statute_id: string
          title_similarity: number
        }
        Insert: {
          candidate_score: number
          candidate_status?: string
          confidence: string
          context_similarity: number
          generated_at?: string
          generated_by?: string
          item_id: string
          rank: number
          statute_id: string
          title_similarity: number
        }
        Update: {
          candidate_score?: number
          candidate_status?: string
          confidence?: string
          context_similarity?: number
          generated_at?: string
          generated_by?: string
          item_id?: string
          rank?: number
          statute_id?: string
          title_similarity?: number
        }
        Relationships: []
      }
      item_statute_links: {
        Row: {
          confidence: string
          created_at: string
          id: number
          item_id: string
          link_type: string
          rationale: string | null
          score: number | null
          source: string
          status: string
          statute_id: string
        }
        Insert: {
          confidence?: string
          created_at?: string
          id?: never
          item_id: string
          link_type?: string
          rationale?: string | null
          score?: number | null
          source?: string
          status?: string
          statute_id: string
        }
        Update: {
          confidence?: string
          created_at?: string
          id?: never
          item_id?: string
          link_type?: string
          rationale?: string | null
          score?: number | null
          source?: string
          status?: string
          statute_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "item_statute_links_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "item_statute_links_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "v_item_execution_depth"
            referencedColumns: ["item_id"]
          },
          {
            foreignKeyName: "item_statute_links_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "v_item_statute_candidate_v2"
            referencedColumns: ["item_id"]
          },
          {
            foreignKeyName: "item_statute_links_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "v_item_statute_coverage"
            referencedColumns: ["item_id"]
          },
          {
            foreignKeyName: "item_statute_links_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "v_item_structural_position"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "item_statute_links_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "v_item_structural_risk"
            referencedColumns: ["item_id"]
          },
          {
            foreignKeyName: "item_statute_links_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "v_item_system_map"
            referencedColumns: ["item_id"]
          },
        ]
      }
      item_structural_risk: {
        Row: {
          best_statute_id: string | null
          best_statute_title: string | null
          historical_importance_score: number | null
          institutional_system_weight: number | null
          item_id: string
          legislative_change_intensity: number | null
          link_adjusted_weight: number | null
          methodology_version: string
          stability_class: string | null
          structural_risk_class: string | null
          structural_risk_score: number | null
          updated_at: string
        }
        Insert: {
          best_statute_id?: string | null
          best_statute_title?: string | null
          historical_importance_score?: number | null
          institutional_system_weight?: number | null
          item_id: string
          legislative_change_intensity?: number | null
          link_adjusted_weight?: number | null
          methodology_version?: string
          stability_class?: string | null
          structural_risk_class?: string | null
          structural_risk_score?: number | null
          updated_at?: string
        }
        Update: {
          best_statute_id?: string | null
          best_statute_title?: string | null
          historical_importance_score?: number | null
          institutional_system_weight?: number | null
          item_id?: string
          legislative_change_intensity?: number | null
          link_adjusted_weight?: number | null
          methodology_version?: string
          stability_class?: string | null
          structural_risk_class?: string | null
          structural_risk_score?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "item_structural_risk_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: true
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "item_structural_risk_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: true
            referencedRelation: "v_item_execution_depth"
            referencedColumns: ["item_id"]
          },
          {
            foreignKeyName: "item_structural_risk_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: true
            referencedRelation: "v_item_statute_candidate_v2"
            referencedColumns: ["item_id"]
          },
          {
            foreignKeyName: "item_structural_risk_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: true
            referencedRelation: "v_item_statute_coverage"
            referencedColumns: ["item_id"]
          },
          {
            foreignKeyName: "item_structural_risk_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: true
            referencedRelation: "v_item_structural_position"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "item_structural_risk_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: true
            referencedRelation: "v_item_structural_risk"
            referencedColumns: ["item_id"]
          },
          {
            foreignKeyName: "item_structural_risk_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: true
            referencedRelation: "v_item_system_map"
            referencedColumns: ["item_id"]
          },
        ]
      }
      items: {
        Row: {
          confidence: string
          created_at: string
          current_relevance: string
          domains: string[]
          effects: string[]
          evidence_confidence: string | null
          id: string
          importance: number
          interpretation_confidence: string | null
          long_effect: string
          mechanism: string
          phase: string
          problem: string
          sources: string[]
          subtype: string | null
          title: string
          type: string
          unpublished: boolean
          updated_at: string
          year_end: number
          year_start: number
        }
        Insert: {
          confidence: string
          created_at?: string
          current_relevance: string
          domains?: string[]
          effects?: string[]
          evidence_confidence?: string | null
          id: string
          importance: number
          interpretation_confidence?: string | null
          long_effect: string
          mechanism: string
          phase: string
          problem: string
          sources?: string[]
          subtype?: string | null
          title: string
          type: string
          unpublished?: boolean
          updated_at?: string
          year_end: number
          year_start: number
        }
        Update: {
          confidence?: string
          created_at?: string
          current_relevance?: string
          domains?: string[]
          effects?: string[]
          evidence_confidence?: string | null
          id?: string
          importance?: number
          interpretation_confidence?: string | null
          long_effect?: string
          mechanism?: string
          phase?: string
          problem?: string
          sources?: string[]
          subtype?: string | null
          title?: string
          type?: string
          unpublished?: boolean
          updated_at?: string
          year_end?: number
          year_start?: number
        }
        Relationships: []
      }
      painekartta_edges: {
        Row: {
          confidence: string | null
          from_item_id: string
          generated_at: string
          pressure_signal: boolean
          rationale: string | null
          rel_class: string
          relation_id: number
          relation_type: string
          source_updated_at: string | null
          to_item_id: string
          weight: number
        }
        Insert: {
          confidence?: string | null
          from_item_id: string
          generated_at?: string
          pressure_signal?: boolean
          rationale?: string | null
          rel_class: string
          relation_id: number
          relation_type: string
          source_updated_at?: string | null
          to_item_id: string
          weight?: number
        }
        Update: {
          confidence?: string | null
          from_item_id?: string
          generated_at?: string
          pressure_signal?: boolean
          rationale?: string | null
          rel_class?: string
          relation_id?: number
          relation_type?: string
          source_updated_at?: string | null
          to_item_id?: string
          weight?: number
        }
        Relationships: [
          {
            foreignKeyName: "painekartta_edges_from_item_id_fkey"
            columns: ["from_item_id"]
            isOneToOne: false
            referencedRelation: "painekartta_nodes"
            referencedColumns: ["item_id"]
          },
          {
            foreignKeyName: "painekartta_edges_relation_id_fkey"
            columns: ["relation_id"]
            isOneToOne: true
            referencedRelation: "relations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "painekartta_edges_to_item_id_fkey"
            columns: ["to_item_id"]
            isOneToOne: false
            referencedRelation: "painekartta_nodes"
            referencedColumns: ["item_id"]
          },
        ]
      }
      painekartta_nodes: {
        Row: {
          budget: number | null
          change_intensity: number | null
          coamendment: number | null
          coverage_status: string
          delegation_depth: number | null
          domains: string[]
          evidence_confidence: string | null
          generated_at: string
          importance: number | null
          interpretation_confidence: string | null
          item_id: string
          item_title: string
          item_type: string | null
          layering_risk: number | null
          link_confidence: string | null
          link_score: number | null
          link_status: string | null
          long_effect: string | null
          mechanism: string | null
          methodology_version: string
          network: number | null
          pressure: number | null
          pressure_signal_count: number
          problem: string | null
          repair_signal: boolean
          role: string
          source_updated_at: string | null
          statute_id: string | null
          statute_title: string | null
          statute_year: number | null
          structural_in: number
          structural_out: number
          system_weight: number | null
          year_end: number | null
          year_start: number | null
        }
        Insert: {
          budget?: number | null
          change_intensity?: number | null
          coamendment?: number | null
          coverage_status?: string
          delegation_depth?: number | null
          domains?: string[]
          evidence_confidence?: string | null
          generated_at?: string
          importance?: number | null
          interpretation_confidence?: string | null
          item_id: string
          item_title: string
          item_type?: string | null
          layering_risk?: number | null
          link_confidence?: string | null
          link_score?: number | null
          link_status?: string | null
          long_effect?: string | null
          mechanism?: string | null
          methodology_version?: string
          network?: number | null
          pressure?: number | null
          pressure_signal_count?: number
          problem?: string | null
          repair_signal?: boolean
          role?: string
          source_updated_at?: string | null
          statute_id?: string | null
          statute_title?: string | null
          statute_year?: number | null
          structural_in?: number
          structural_out?: number
          system_weight?: number | null
          year_end?: number | null
          year_start?: number | null
        }
        Update: {
          budget?: number | null
          change_intensity?: number | null
          coamendment?: number | null
          coverage_status?: string
          delegation_depth?: number | null
          domains?: string[]
          evidence_confidence?: string | null
          generated_at?: string
          importance?: number | null
          interpretation_confidence?: string | null
          item_id?: string
          item_title?: string
          item_type?: string | null
          layering_risk?: number | null
          link_confidence?: string | null
          link_score?: number | null
          link_status?: string | null
          long_effect?: string | null
          mechanism?: string | null
          methodology_version?: string
          network?: number | null
          pressure?: number | null
          pressure_signal_count?: number
          problem?: string | null
          repair_signal?: boolean
          role?: string
          source_updated_at?: string | null
          statute_id?: string | null
          statute_title?: string | null
          statute_year?: number | null
          structural_in?: number
          structural_out?: number
          system_weight?: number | null
          year_end?: number | null
          year_start?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "painekartta_nodes_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: true
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "painekartta_nodes_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: true
            referencedRelation: "v_item_execution_depth"
            referencedColumns: ["item_id"]
          },
          {
            foreignKeyName: "painekartta_nodes_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: true
            referencedRelation: "v_item_statute_candidate_v2"
            referencedColumns: ["item_id"]
          },
          {
            foreignKeyName: "painekartta_nodes_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: true
            referencedRelation: "v_item_statute_coverage"
            referencedColumns: ["item_id"]
          },
          {
            foreignKeyName: "painekartta_nodes_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: true
            referencedRelation: "v_item_structural_position"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "painekartta_nodes_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: true
            referencedRelation: "v_item_structural_risk"
            referencedColumns: ["item_id"]
          },
          {
            foreignKeyName: "painekartta_nodes_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: true
            referencedRelation: "v_item_system_map"
            referencedColumns: ["item_id"]
          },
        ]
      }
      payment_events: {
        Row: {
          created_at: string
          event_type: string
          id: string
          payload: Json
          payment_id: string | null
          provider: string
        }
        Insert: {
          created_at?: string
          event_type: string
          id?: string
          payload?: Json
          payment_id?: string | null
          provider: string
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: string
          payload?: Json
          payment_id?: string | null
          provider?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_events_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount_cents: number
          created_at: string
          currency: string
          id: string
          is_test: boolean
          paid_at: string | null
          product_id: string
          provider: string
          provider_transaction_id: string | null
          status: string
          user_id: string
        }
        Insert: {
          amount_cents: number
          created_at?: string
          currency?: string
          id?: string
          is_test?: boolean
          paid_at?: string | null
          product_id: string
          provider?: string
          provider_transaction_id?: string | null
          status?: string
          user_id: string
        }
        Update: {
          amount_cents?: number
          created_at?: string
          currency?: string
          id?: string
          is_test?: boolean
          paid_at?: string | null
          product_id?: string
          provider?: string
          provider_transaction_id?: string | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          active: boolean
          code: string
          created_at: string
          currency: string
          description: string | null
          grants_entitlement: boolean
          id: string
          kind: string
          max_amount_cents: number | null
          min_amount_cents: number | null
          name: string
          price_cents: number
          variable_amount: boolean
          vat_percentage: number | null
        }
        Insert: {
          active?: boolean
          code: string
          created_at?: string
          currency?: string
          description?: string | null
          grants_entitlement?: boolean
          id?: string
          kind?: string
          max_amount_cents?: number | null
          min_amount_cents?: number | null
          name: string
          price_cents: number
          variable_amount?: boolean
          vat_percentage?: number | null
        }
        Update: {
          active?: boolean
          code?: string
          created_at?: string
          currency?: string
          description?: string | null
          grants_entitlement?: boolean
          id?: string
          kind?: string
          max_amount_cents?: number | null
          min_amount_cents?: number | null
          name?: string
          price_cents?: number
          variable_amount?: boolean
          vat_percentage?: number | null
        }
        Relationships: []
      }
      public_finance_item_links: {
        Row: {
          evidence_status: string
          item_id: string
          rationale: string
          relation_type: string
          series_key: string
          source_url: string | null
        }
        Insert: {
          evidence_status?: string
          item_id: string
          rationale: string
          relation_type: string
          series_key: string
          source_url?: string | null
        }
        Update: {
          evidence_status?: string
          item_id?: string
          rationale?: string
          relation_type?: string
          series_key?: string
          source_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "public_finance_item_links_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "public_finance_item_links_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "v_item_execution_depth"
            referencedColumns: ["item_id"]
          },
          {
            foreignKeyName: "public_finance_item_links_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "v_item_statute_candidate_v2"
            referencedColumns: ["item_id"]
          },
          {
            foreignKeyName: "public_finance_item_links_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "v_item_statute_coverage"
            referencedColumns: ["item_id"]
          },
          {
            foreignKeyName: "public_finance_item_links_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "v_item_structural_position"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "public_finance_item_links_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "v_item_structural_risk"
            referencedColumns: ["item_id"]
          },
          {
            foreignKeyName: "public_finance_item_links_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "v_item_system_map"
            referencedColumns: ["item_id"]
          },
          {
            foreignKeyName: "public_finance_item_links_series_key_fkey"
            columns: ["series_key"]
            isOneToOne: false
            referencedRelation: "public_finance_series"
            referencedColumns: ["series_key"]
          },
        ]
      }
      public_finance_observations: {
        Row: {
          imported_at: string
          notes: string
          release_status: string | null
          series_key: string
          source_url: string | null
          validation_status: string
          value: number
          value_kind: string
          year: number
        }
        Insert: {
          imported_at?: string
          notes?: string
          release_status?: string | null
          series_key: string
          source_url?: string | null
          validation_status?: string
          value: number
          value_kind: string
          year: number
        }
        Update: {
          imported_at?: string
          notes?: string
          release_status?: string | null
          series_key?: string
          source_url?: string | null
          validation_status?: string
          value?: number
          value_kind?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "public_finance_observations_series_key_fkey"
            columns: ["series_key"]
            isOneToOne: false
            referencedRelation: "public_finance_series"
            referencedColumns: ["series_key"]
          },
        ]
      }
      public_finance_series: {
        Row: {
          accounting_framework: string
          base_year: number | null
          classification_code: string
          classification_system: string
          comparability_notes: string
          created_at: string
          currency: string | null
          geography: string
          geography_level: string | null
          measure: string
          metadata: Json | null
          price_basis: string
          sector: string
          series_key: string
          source_key: string
          source_locator: string
          title: string
          unit: string
          unit_multiplier: number
        }
        Insert: {
          accounting_framework?: string
          base_year?: number | null
          classification_code: string
          classification_system: string
          comparability_notes?: string
          created_at?: string
          currency?: string | null
          geography?: string
          geography_level?: string | null
          measure: string
          metadata?: Json | null
          price_basis: string
          sector: string
          series_key: string
          source_key: string
          source_locator: string
          title: string
          unit: string
          unit_multiplier?: number
        }
        Update: {
          accounting_framework?: string
          base_year?: number | null
          classification_code?: string
          classification_system?: string
          comparability_notes?: string
          created_at?: string
          currency?: string | null
          geography?: string
          geography_level?: string | null
          measure?: string
          metadata?: Json | null
          price_basis?: string
          sector?: string
          series_key?: string
          source_key?: string
          source_locator?: string
          title?: string
          unit?: string
          unit_multiplier?: number
        }
        Relationships: [
          {
            foreignKeyName: "public_finance_series_source_key_fkey"
            columns: ["source_key"]
            isOneToOne: false
            referencedRelation: "public_finance_sources"
            referencedColumns: ["source_key"]
          },
        ]
      }
      public_finance_sources: {
        Row: {
          imported_at: string
          notes: string
          provenance: Json | null
          publisher: string
          retrieved_at: string | null
          source_file: string | null
          source_key: string
          source_sha256: string | null
          source_url: string | null
          source_version: string
          title: string
        }
        Insert: {
          imported_at?: string
          notes?: string
          provenance?: Json | null
          publisher: string
          retrieved_at?: string | null
          source_file?: string | null
          source_key: string
          source_sha256?: string | null
          source_url?: string | null
          source_version: string
          title: string
        }
        Update: {
          imported_at?: string
          notes?: string
          provenance?: Json | null
          publisher?: string
          retrieved_at?: string | null
          source_file?: string | null
          source_key?: string
          source_sha256?: string | null
          source_url?: string | null
          source_version?: string
          title?: string
        }
        Relationships: []
      }
      relations: {
        Row: {
          confidence: string
          created_at: string
          from_id: string
          id: number
          rationale: string
          rel_class: string
          to_id: string
          type: string
          updated_at: string
        }
        Insert: {
          confidence: string
          created_at?: string
          from_id: string
          id?: never
          rationale: string
          rel_class: string
          to_id: string
          type: string
          updated_at?: string
        }
        Update: {
          confidence?: string
          created_at?: string
          from_id?: string
          id?: never
          rationale?: string
          rel_class?: string
          to_id?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "relations_from_id_fkey"
            columns: ["from_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "relations_from_id_fkey"
            columns: ["from_id"]
            isOneToOne: false
            referencedRelation: "v_item_execution_depth"
            referencedColumns: ["item_id"]
          },
          {
            foreignKeyName: "relations_from_id_fkey"
            columns: ["from_id"]
            isOneToOne: false
            referencedRelation: "v_item_statute_candidate_v2"
            referencedColumns: ["item_id"]
          },
          {
            foreignKeyName: "relations_from_id_fkey"
            columns: ["from_id"]
            isOneToOne: false
            referencedRelation: "v_item_statute_coverage"
            referencedColumns: ["item_id"]
          },
          {
            foreignKeyName: "relations_from_id_fkey"
            columns: ["from_id"]
            isOneToOne: false
            referencedRelation: "v_item_structural_position"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "relations_from_id_fkey"
            columns: ["from_id"]
            isOneToOne: false
            referencedRelation: "v_item_structural_risk"
            referencedColumns: ["item_id"]
          },
          {
            foreignKeyName: "relations_from_id_fkey"
            columns: ["from_id"]
            isOneToOne: false
            referencedRelation: "v_item_system_map"
            referencedColumns: ["item_id"]
          },
          {
            foreignKeyName: "relations_to_id_fkey"
            columns: ["to_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "relations_to_id_fkey"
            columns: ["to_id"]
            isOneToOne: false
            referencedRelation: "v_item_execution_depth"
            referencedColumns: ["item_id"]
          },
          {
            foreignKeyName: "relations_to_id_fkey"
            columns: ["to_id"]
            isOneToOne: false
            referencedRelation: "v_item_statute_candidate_v2"
            referencedColumns: ["item_id"]
          },
          {
            foreignKeyName: "relations_to_id_fkey"
            columns: ["to_id"]
            isOneToOne: false
            referencedRelation: "v_item_statute_coverage"
            referencedColumns: ["item_id"]
          },
          {
            foreignKeyName: "relations_to_id_fkey"
            columns: ["to_id"]
            isOneToOne: false
            referencedRelation: "v_item_structural_position"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "relations_to_id_fkey"
            columns: ["to_id"]
            isOneToOne: false
            referencedRelation: "v_item_structural_risk"
            referencedColumns: ["item_id"]
          },
          {
            foreignKeyName: "relations_to_id_fkey"
            columns: ["to_id"]
            isOneToOne: false
            referencedRelation: "v_item_system_map"
            referencedColumns: ["item_id"]
          },
        ]
      }
      selitysatlas_links: {
        Row: {
          created_at: string
          id: number
          item_id: string
          note: string | null
          score: number | null
          shared_terms: string[] | null
          status: string
          theme_id: string
          tier: string
        }
        Insert: {
          created_at?: string
          id?: never
          item_id: string
          note?: string | null
          score?: number | null
          shared_terms?: string[] | null
          status?: string
          theme_id: string
          tier: string
        }
        Update: {
          created_at?: string
          id?: never
          item_id?: string
          note?: string | null
          score?: number | null
          shared_terms?: string[] | null
          status?: string
          theme_id?: string
          tier?: string
        }
        Relationships: [
          {
            foreignKeyName: "selitysatlas_links_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "selitysatlas_links_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "v_item_execution_depth"
            referencedColumns: ["item_id"]
          },
          {
            foreignKeyName: "selitysatlas_links_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "v_item_statute_candidate_v2"
            referencedColumns: ["item_id"]
          },
          {
            foreignKeyName: "selitysatlas_links_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "v_item_statute_coverage"
            referencedColumns: ["item_id"]
          },
          {
            foreignKeyName: "selitysatlas_links_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "v_item_structural_position"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "selitysatlas_links_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "v_item_structural_risk"
            referencedColumns: ["item_id"]
          },
          {
            foreignKeyName: "selitysatlas_links_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "v_item_system_map"
            referencedColumns: ["item_id"]
          },
        ]
      }
      simulation_indicator_baselines: {
        Row: {
          annual_trend_raw: number
          generated_at: string
          group_key: string
          last_observed_value: number
          last_observed_year: number
          methodology_version: string
          raw_value: number
          score_0_100: number
          series_key: string
          value_kind: string
          year: number
        }
        Insert: {
          annual_trend_raw: number
          generated_at?: string
          group_key?: string
          last_observed_value: number
          last_observed_year: number
          methodology_version?: string
          raw_value: number
          score_0_100: number
          series_key: string
          value_kind: string
          year: number
        }
        Update: {
          annual_trend_raw?: number
          generated_at?: string
          group_key?: string
          last_observed_value?: number
          last_observed_year?: number
          methodology_version?: string
          raw_value?: number
          score_0_100?: number
          series_key?: string
          value_kind?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "simulation_indicator_baselines_series_key_fkey"
            columns: ["series_key"]
            isOneToOne: false
            referencedRelation: "indicator_series"
            referencedColumns: ["series_key"]
          },
        ]
      }
      simulation_normalization_params: {
        Row: {
          annual_change_cap_share: number
          favorable_direction: number
          generated_at: string
          lower_anchor: number
          methodology_version: string
          normalization_method: string
          observed_max: number
          observed_min: number
          series_key: string
          trend_damping: number
          trend_window_years: number
          upper_anchor: number
        }
        Insert: {
          annual_change_cap_share?: number
          favorable_direction: number
          generated_at?: string
          lower_anchor: number
          methodology_version?: string
          normalization_method?: string
          observed_max: number
          observed_min: number
          series_key: string
          trend_damping?: number
          trend_window_years?: number
          upper_anchor: number
        }
        Update: {
          annual_change_cap_share?: number
          favorable_direction?: number
          generated_at?: string
          lower_anchor?: number
          methodology_version?: string
          normalization_method?: string
          observed_max?: number
          observed_min?: number
          series_key?: string
          trend_damping?: number
          trend_window_years?: number
          upper_anchor?: number
        }
        Relationships: [
          {
            foreignKeyName: "simulation_normalization_params_series_key_fkey"
            columns: ["series_key"]
            isOneToOne: true
            referencedRelation: "indicator_series"
            referencedColumns: ["series_key"]
          },
        ]
      }
      simulation_statute_effects: {
        Row: {
          created_at: string
          effect_direction: number
          evidence_status: string
          include_in_composite: boolean
          lag_max_years: number
          lag_min_years: number
          lever_key: string
          methodology_version: string
          persistence_years: number
          rationale: string
          relationship_type: string
          relative_strength: number
          series_key: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          effect_direction: number
          evidence_status?: string
          include_in_composite?: boolean
          lag_max_years: number
          lag_min_years: number
          lever_key: string
          methodology_version?: string
          persistence_years: number
          rationale: string
          relationship_type: string
          relative_strength: number
          series_key: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          effect_direction?: number
          evidence_status?: string
          include_in_composite?: boolean
          lag_max_years?: number
          lag_min_years?: number
          lever_key?: string
          methodology_version?: string
          persistence_years?: number
          rationale?: string
          relationship_type?: string
          relative_strength?: number
          series_key?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "simulation_statute_effects_lever_key_fkey"
            columns: ["lever_key"]
            isOneToOne: false
            referencedRelation: "simulation_statute_effect_matrix"
            referencedColumns: ["lever_key"]
          },
          {
            foreignKeyName: "simulation_statute_effects_lever_key_fkey"
            columns: ["lever_key"]
            isOneToOne: false
            referencedRelation: "simulation_statute_levers"
            referencedColumns: ["lever_key"]
          },
          {
            foreignKeyName: "simulation_statute_effects_series_key_fkey"
            columns: ["series_key"]
            isOneToOne: false
            referencedRelation: "indicator_series"
            referencedColumns: ["series_key"]
          },
        ]
      }
      simulation_statute_levers: {
        Row: {
          active: boolean
          coefficient_basis: string
          created_at: string
          default_intensity: number
          evidence_status: string
          implementation_coefficient: number
          intervention_definition: string
          lever_key: string
          metadata: Json
          methodology_version: string
          policy_area: string
          statute_id: string
          title: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          coefficient_basis: string
          created_at?: string
          default_intensity?: number
          evidence_status?: string
          implementation_coefficient: number
          intervention_definition: string
          lever_key: string
          metadata?: Json
          methodology_version?: string
          policy_area: string
          statute_id: string
          title: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          coefficient_basis?: string
          created_at?: string
          default_intensity?: number
          evidence_status?: string
          implementation_coefficient?: number
          intervention_definition?: string
          lever_key?: string
          metadata?: Json
          methodology_version?: string
          policy_area?: string
          statute_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "simulation_statute_levers_statute_id_fkey"
            columns: ["statute_id"]
            isOneToOne: true
            referencedRelation: "v_item_statute_candidate_v2"
            referencedColumns: ["statute_id"]
          },
        ]
      }
      statistic_series: {
        Row: {
          code: string
          created_at: string
          decimals: number
          description: string | null
          group_name: string | null
          published: boolean
          sort_order: number
          source: string | null
          source_url: string | null
          title: string
          unit: string | null
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          decimals?: number
          description?: string | null
          group_name?: string | null
          published?: boolean
          sort_order?: number
          source?: string | null
          source_url?: string | null
          title: string
          unit?: string | null
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          decimals?: number
          description?: string | null
          group_name?: string | null
          published?: boolean
          sort_order?: number
          source?: string | null
          source_url?: string | null
          title?: string
          unit?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      statistic_values: {
        Row: {
          created_at: string
          note: string | null
          series_code: string
          updated_at: string
          value: number
          year: number
        }
        Insert: {
          created_at?: string
          note?: string | null
          series_code: string
          updated_at?: string
          value: number
          year: number
        }
        Update: {
          created_at?: string
          note?: string | null
          series_code?: string
          updated_at?: string
          value?: number
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "statistic_values_series_code_fkey"
            columns: ["series_code"]
            isOneToOne: false
            referencedRelation: "murros_indicator_series"
            referencedColumns: ["legacy_code"]
          },
          {
            foreignKeyName: "statistic_values_series_code_fkey"
            columns: ["series_code"]
            isOneToOne: false
            referencedRelation: "statistic_series"
            referencedColumns: ["code"]
          },
        ]
      }
    }
    Views: {
      infographics_resolved: {
        Row: {
          article_id: string | null
          caption: string | null
          content_summary: string | null
          id: number | null
          purpose: string | null
          sort_order: number | null
          storage_path: string | null
          target_atlas: string | null
          target_id: string | null
          target_title: string | null
          unpublished: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "infographics_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
        ]
      }
      murros_indicator_series: {
        Row: {
          canonical_title: string | null
          data_class: string | null
          end_year: number | null
          group_key: string | null
          indicator_role: string | null
          interpretation: string | null
          legacy_code: string | null
          legacy_title: string | null
          lenses: string[] | null
          match_status: string | null
          pressure_domain: string | null
          quality: Json | null
          rationale: string | null
          series_key: string | null
          start_year: number | null
          unit: string | null
        }
        Relationships: [
          {
            foreignKeyName: "indicator_aliases_series_key_fkey"
            columns: ["series_key"]
            isOneToOne: false
            referencedRelation: "indicator_series"
            referencedColumns: ["series_key"]
          },
        ]
      }
      murros_indicator_values: {
        Row: {
          group_key: string | null
          series_code: string | null
          validation_status: string | null
          value: number | null
          value_kind: string | null
          value_kind_label: string | null
          year: number | null
        }
        Relationships: []
      }
      simulation_statute_effect_matrix: {
        Row: {
          default_intensity: number | null
          effect_direction: number | null
          evidence_status: string | null
          implementation_adjusted_strength: number | null
          implementation_coefficient: number | null
          include_in_composite: boolean | null
          intervention_definition: string | null
          lag_max_years: number | null
          lag_min_years: number | null
          lever_key: string | null
          lever_title: string | null
          methodology_version: string | null
          persistence_years: number | null
          policy_area: string | null
          rationale: string | null
          relationship_type: string | null
          relative_strength: number | null
          series_key: string | null
          series_title: string | null
          statute_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "simulation_statute_effects_series_key_fkey"
            columns: ["series_key"]
            isOneToOne: false
            referencedRelation: "indicator_series"
            referencedColumns: ["series_key"]
          },
          {
            foreignKeyName: "simulation_statute_levers_statute_id_fkey"
            columns: ["statute_id"]
            isOneToOne: true
            referencedRelation: "v_item_statute_candidate_v2"
            referencedColumns: ["statute_id"]
          },
        ]
      }
      v_item_execution_depth: {
        Row: {
          best_statute_id: string | null
          best_statute_title: string | null
          delegation_class: string | null
          delegation_depth_score: number | null
          execution_risk_class: string | null
          execution_risk_score: number | null
          historical_importance_score: number | null
          institutional_system_weight: number | null
          item_id: string | null
          legislative_change_intensity: number | null
          methodology_version: string | null
          structural_risk_score: number | null
          title: string | null
          year_end: number | null
          year_start: number | null
        }
        Relationships: []
      }
      v_item_statute_bridge: {
        Row: {
          bowtie_zone: string | null
          bridge_type: string | null
          budget_combined_eur: number | null
          budget_mappings: number | null
          cofog_mappings: number | null
          confidence: string | null
          delegation_total: number | null
          edges_in: number | null
          edges_out: number | null
          he_amends: number | null
          he_attention: number | null
          he_cites: number | null
          item_id: string | null
          item_title: string | null
          score: number | null
          status: string | null
          statute_id: string | null
          statute_title: string | null
          statute_year: number | null
          systemic_risk_score: number | null
          year_start: number | null
        }
        Relationships: [
          {
            foreignKeyName: "item_statute_links_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "item_statute_links_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "v_item_execution_depth"
            referencedColumns: ["item_id"]
          },
          {
            foreignKeyName: "item_statute_links_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "v_item_statute_candidate_v2"
            referencedColumns: ["item_id"]
          },
          {
            foreignKeyName: "item_statute_links_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "v_item_statute_coverage"
            referencedColumns: ["item_id"]
          },
          {
            foreignKeyName: "item_statute_links_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "v_item_structural_position"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "item_statute_links_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "v_item_structural_risk"
            referencedColumns: ["item_id"]
          },
          {
            foreignKeyName: "item_statute_links_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "v_item_system_map"
            referencedColumns: ["item_id"]
          },
        ]
      }
      v_item_statute_candidate_v2: {
        Row: {
          candidate_score: number | null
          confidence: string | null
          context_similarity: number | null
          item_id: string | null
          rank: number | null
          statute_id: string | null
          title_similarity: number | null
        }
        Relationships: []
      }
      v_item_statute_coverage: {
        Row: {
          best_candidate_score: number | null
          best_link_score: number | null
          candidate_count: number | null
          coverage_status: string | null
          importance: number | null
          item_id: string | null
          link_count: number | null
          title: string | null
          year_start: number | null
        }
        Relationships: []
      }
      v_item_structural_position: {
        Row: {
          best_link_confidence: string | null
          best_statute_id: string | null
          best_statute_title: string | null
          domains: string[] | null
          historical_importance_score: number | null
          id: string | null
          importance: number | null
          institutional_system_weight: number | null
          link_adjusted_weight: number | null
          statute_count: number | null
          structural_position_class: string | null
          title: string | null
          type: string | null
          year_end: number | null
          year_start: number | null
        }
        Relationships: []
      }
      v_item_structural_risk: {
        Row: {
          best_statute_id: string | null
          best_statute_title: string | null
          historical_importance_score: number | null
          importance: number | null
          institutional_system_weight: number | null
          item_id: string | null
          legislative_change_intensity: number | null
          link_adjusted_weight: number | null
          methodology_version: string | null
          stability_class: string | null
          structural_risk_class: string | null
          structural_risk_score: number | null
          title: string | null
          year_end: number | null
          year_start: number | null
        }
        Relationships: []
      }
      v_item_system_map: {
        Row: {
          historical_importance_score: number | null
          institutional_system_weight: number | null
          item_id: string | null
          link_confidence: string | null
          link_score: number | null
          link_source: string | null
          quadrant: string | null
          statute_id: string | null
          statute_title: string | null
          title: string | null
          year_start: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      atlas_indicator_groups: {
        Args: { p_series_key: string }
        Returns: {
          group_key: string
          group_label: string
        }[]
      }
      atlas_replace_links: { Args: { new_links: Json }; Returns: undefined }
      is_atlas_admin: { Args: never; Returns: boolean }
      lakikartta_bulk_insert: {
        Args: { p_rows: Json; p_table: string }
        Returns: number
      }
      lakikartta_claim_import_job: { Args: never; Returns: Json }
      lakikartta_finish_import_job: {
        Args: { p_error?: string; p_id: number; p_inserted: number }
        Returns: undefined
      }
      lakikartta_import_token_hash: { Args: never; Returns: string }
      lakikartta_reset_table: { Args: { p_table: string }; Returns: undefined }
      normalize_fi_text: { Args: { t: string }; Returns: string }
      simulate_statute_scenario: {
        Args: {
          p_end_year?: number
          p_intensities: Json
          p_max_effect_points?: number
          p_reform_year: number
        }
        Returns: {
          active_levers: number
          baseline_score: number
          scenario_delta: number
          scenario_score: number
          series_key: string
          year: number
        }[]
      }
      simulation_temporal_weight: {
        Args: {
          p_lag_max_years: number
          p_lag_min_years: number
          p_persistence_years: number
          p_reform_year: number
          p_target_year: number
        }
        Returns: number
      }
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
