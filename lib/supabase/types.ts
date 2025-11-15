export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string
          name: string
          slug: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          created_at?: string
          updated_at?: string
        }
      }
      users: {
        Row: {
          id: string
          email: string
          full_name: string | null
          organization_id: string
          role: 'owner' | 'admin' | 'member'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          full_name?: string | null
          organization_id: string
          role?: 'owner' | 'admin' | 'member'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          organization_id?: string
          role?: 'owner' | 'admin' | 'member'
          created_at?: string
          updated_at?: string
        }
      }
      cloud_accounts: {
        Row: {
          id: string
          organization_id: string
          provider: 'aws' | 'azure' | 'gcp'
          account_name: string
          account_id: string
          credentials: Json
          is_active: boolean
          last_scan_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          provider: 'aws' | 'azure' | 'gcp'
          account_name: string
          account_id: string
          credentials: Json
          is_active?: boolean
          last_scan_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          provider?: 'aws' | 'azure' | 'gcp'
          account_name?: string
          account_id?: string
          credentials?: Json
          is_active?: boolean
          last_scan_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      scan_results: {
        Row: {
          id: string
          cloud_account_id: string
          scan_type: 'security' | 'cost' | 'compliance'
          status: 'pending' | 'running' | 'completed' | 'failed'
          findings: Json
          recommendations: Json
          severity_counts: Json
          created_at: string
        }
        Insert: {
          id?: string
          cloud_account_id: string
          scan_type: 'security' | 'cost' | 'compliance'
          status?: 'pending' | 'running' | 'completed' | 'failed'
          findings?: Json
          recommendations?: Json
          severity_counts?: Json
          created_at?: string
        }
        Update: {
          id?: string
          cloud_account_id?: string
          scan_type?: 'security' | 'cost' | 'compliance'
          status?: 'pending' | 'running' | 'completed' | 'failed'
          findings?: Json
          recommendations?: Json
          severity_counts?: Json
          created_at?: string
        }
      }
      compliance_reports: {
        Row: {
          id: string
          organization_id: string
          report_type: 'dsgvo' | 'iso27001' | 'soc2'
          status: 'generating' | 'completed' | 'failed'
          report_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          report_type: 'dsgvo' | 'iso27001' | 'soc2'
          status?: 'generating' | 'completed' | 'failed'
          report_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          report_type?: 'dsgvo' | 'iso27001' | 'soc2'
          status?: 'generating' | 'completed' | 'failed'
          report_url?: string | null
          created_at?: string
        }
      }
    }
  }
}