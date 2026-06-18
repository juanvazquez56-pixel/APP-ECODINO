-- =====================================================
-- BLOQUE 2/3 — Bucket de Storage para fotos y firmas
-- Migración 0005
-- -----------------------------------------------------
-- Crea el bucket privado "reports-photos" y las políticas de acceso sobre
-- storage.objects, exactamente como se documenta en el README §13.1.
--
-- Alcance de las políticas: cualquier usuario AUTENTICADO de la app puede
-- subir, leer y actualizar objetos de este bucket (es el comportamiento del
-- README §13.1). El bucket es PRIVADO: no se sirve públicamente; el acceso
-- siempre pasa por la sesión del usuario (URLs firmadas en el cliente).
--
-- Nota de orden: esta migración solo depende del esquema `storage` (siempre
-- presente en Supabase), no de las tablas de la app, así que puede ejecutarse
-- en cualquier momento sin importar el orden respecto a las demás migraciones.
-- Es idempotente: puede correrse más de una vez sin error.
-- =====================================================

-- =====================================================
-- 1. BUCKET PRIVADO "reports-photos"
-- =====================================================
insert into storage.buckets (id, name, public)
values ('reports-photos', 'reports-photos', false)
on conflict (id) do nothing;

-- =====================================================
-- 2. POLÍTICAS RLS sobre storage.objects
--    (RLS ya viene habilitado por Supabase en storage.objects)
--    Se eliminan primero por si ya existían, para poder re-ejecutar.
-- =====================================================
drop policy if exists "auth_upload_reports_photos" on storage.objects;
drop policy if exists "auth_read_reports_photos"   on storage.objects;
drop policy if exists "auth_update_reports_photos"  on storage.objects;

-- Subir fotos/firmas: solo usuarios autenticados, solo a este bucket
create policy "auth_upload_reports_photos"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'reports-photos');

-- Leer fotos/firmas: solo usuarios autenticados, solo de este bucket
create policy "auth_read_reports_photos"
  on storage.objects for select to authenticated
  using (bucket_id = 'reports-photos');

-- Actualizar (re-subir con upsert): solo usuarios autenticados, solo este bucket
create policy "auth_update_reports_photos"
  on storage.objects for update to authenticated
  using (bucket_id = 'reports-photos');

-- =====================================================
-- VERIFICACIÓN: pega estos SELECT en el SQL Editor para confirmar.
-- =====================================================
-- 1) El bucket debe aparecer como privado (public = false):
--    select id, name, public from storage.buckets where id = 'reports-photos';
--
-- 2) Deben aparecer las 3 políticas creadas sobre storage.objects:
--    select policyname, cmd
--      from pg_policies
--     where schemaname = 'storage'
--       and tablename  = 'objects'
--       and policyname like '%reports_photos%'
--     order by policyname;
