// =====================================================
// database.types.ts
// -----------------------------------------------------
// Este archivo normalmente se GENERA con la CLI de Supabase:
//   npm run supabase:types
// Aquí se incluye una versión escrita a mano que refleja el
// schema de las migrations, suficiente para el Bloque 1.
// Reemplázalo por el archivo generado cuando tu proyecto de
// Supabase esté en línea.
// =====================================================

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

type Timestamps = {
  created_at: string;
  updated_at: string;
};

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string;
          role: Database['public']['Enums']['role_type'];
          phone: string | null;
          active: boolean;
        } & Timestamps;
        Insert: {
          id: string;
          full_name: string;
          role: Database['public']['Enums']['role_type'];
          phone?: string | null;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>;
        Relationships: [];
      };
      plants: {
        Row: {
          id: string;
          name: string;
          address: string | null;
          contact_name: string | null;
          contact_phone: string | null;
          latitude: number | null;
          longitude: number | null;
          active: boolean;
        } & Timestamps;
        Insert: {
          id?: string;
          name: string;
          address?: string | null;
          contact_name?: string | null;
          contact_phone?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['plants']['Insert']>;
        Relationships: [];
      };
      criteria_catalog: {
        Row: {
          id: string;
          version: number;
          module: Database['public']['Enums']['criteria_module'];
          section_key: string;
          section_title: string;
          item_index: number;
          item_text: string;
          suggested_time: string | null;
          active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          version: number;
          module: Database['public']['Enums']['criteria_module'];
          section_key: string;
          section_title: string;
          item_index: number;
          item_text: string;
          suggested_time?: string | null;
          active?: boolean;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['criteria_catalog']['Insert']>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      current_role: {
        Args: Record<string, never>;
        Returns: Database['public']['Enums']['role_type'];
      };
    };
    Enums: {
      role_type: 'supervisor' | 'segurista' | 'auditor' | 'admin';
      turno_type: 'Matutino' | 'Vespertino' | 'Nocturno';
      report_status: 'borrador' | 'enviado' | 'aprobado';
      semaforo_type: 'verde' | 'amarillo' | 'rojo' | 'sin-datos';
      attendance_status:
        | 'Asistió'
        | 'Retardo'
        | 'Falta justificada'
        | 'Falta injustificada'
        | 'Permiso'
        | 'Incapacidad';
      activity_status:
        | 'Pendiente'
        | 'En proceso'
        | 'Cerrado'
        | 'Cerrado con observación'
        | 'No realizado'
        | 'Reprogramado'
        | 'Detenido';
      incident_cause: 'Material' | 'Cliente' | 'Personal' | 'Clima' | 'Acceso' | 'Otro';
      permit_type_enum:
        | 'Trabajo en altura'
        | 'Trabajo en caliente'
        | 'Espacios confinados'
        | 'Eléctrico (LOTO)'
        | 'Izaje'
        | 'Excavación'
        | 'General';
      incident_type:
        | 'Accidente'
        | 'Incidente'
        | 'Near-miss'
        | 'Condición insegura'
        | 'Acto inseguro'
        | 'Observación de mejora';
      criteria_module: 'supervisor_checklist' | 'safety_checklist' | 'audit';
      response_type: 'C' | 'NC' | 'NA';
      action_status: 'abierto' | 'en_proceso' | 'cerrado' | 'cancelado';
      severity_type: 'Alta' | 'Media' | 'Baja';
    };
    CompositeTypes: Record<string, never>;
  };
};
