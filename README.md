# Auditoría Operativa — Sistema de Auditoría y Control Operativo

PWA responsive y **offline-first** para una empresa de mantenimiento industrial.
Atiende 3 roles operativos (**supervisor**, **segurista**, **auditor**) y 1 rol
administrativo (**gerencia/admin**). Todo en **español (México)**.

> **Horario operativo**: lunes a viernes de 8:00 a 17:30 hrs.

Este repositorio corresponde al **Bloque 1 de 3**: fundación del proyecto
(setup, base de datos, autenticación, routing por rol y layout base). Los
bloques 2 y 3 (captura de formularios, sync offline, dashboard, edge functions)
se entregan después.

---

## 1. Stack

- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS
- **PWA**: vite-plugin-pwa (Workbox)
- **Estado**: Zustand
- **Formularios**: React Hook Form + Zod
- **Routing**: React Router 6
- **Iconos**: lucide-react
- **Base local (futuro)**: Dexie.js sobre IndexedDB
- **Backend**: Supabase (PostgreSQL + Auth + Storage + Edge Functions + Realtime)
- **Deploy**: Vercel

---

## 2. Crear el proyecto en Supabase Cloud

1. Entra a [app.supabase.com](https://app.supabase.com) y crea un nuevo proyecto.
2. Anota la **Project URL** y la **anon public key** (Settings → API).
3. Copia esos valores a tu `.env.local` (ver sección 7).
4. (Opcional para trabajo local) Instala la **Supabase CLI**:
   ```bash
   npm install -g supabase
   supabase login
   supabase link --project-ref <tu-project-ref>
   ```

---

## 3. Correr las migrations

Las migrations viven en `supabase/migrations/` y se ejecutan en orden:

| Archivo | Contenido |
| --- | --- |
| `20260101000000_initial_schema.sql` | Extensiones, enums, tablas e índices |
| `20260101000001_triggers.sql` | Triggers (`updated_at`, `submitted_at`, semáforo, alta de profile) |
| `20260101000002_rls_policies.sql` | RLS + políticas por rol |

Aplica las migrations al proyecto enlazado:

```bash
supabase db push
```

> También puedes pegar el contenido de cada archivo, **en orden**, en el
> **SQL Editor** del dashboard de Supabase.

---

## 4. Ejecutar el seed

El archivo `supabase/seed.sql` inserta:
- 3 **plantas** demo.
- 67 **criterios** del catálogo versión 1 (28 supervisor + 28 segurista + 32 auditor).

Opciones:

```bash
# Opción A: reset local (corre migrations + seed)
supabase db reset

# Opción B: aplicar el seed directamente vía psql
psql "$DATABASE_URL" -f supabase/seed.sql
```

> También puedes pegar `supabase/seed.sql` en el **SQL Editor** del dashboard.

---

## 5. Generar tipos TypeScript

```bash
npm run supabase:types
```

Esto sobreescribe `src/types/database.types.ts` con los tipos generados a partir
del schema. (El repo incluye una versión escrita a mano para que el proyecto
compile sin tener Supabase en línea.)

---

## 6. Crear los usuarios demo

En el dashboard de Supabase → **Authentication → Users → Add user**, crea:

| Correo | Contraseña | Rol |
| --- | --- | --- |
| `admin@auditoria.demo` | `Admin123!` | admin |
| `supervisor@auditoria.demo` | `Super123!` | supervisor |
| `segurista@auditoria.demo` | `Segur123!` | segurista |
| `auditor@auditoria.demo` | `Audit123!` | auditor |

El trigger `handle_new_user` crea automáticamente el `profile` (con rol
`supervisor` por defecto). Luego asigna el rol correcto ejecutando en el SQL
Editor los `UPDATE` que están al final de `supabase/seed.sql`, por ejemplo:

```sql
update profiles set role = 'admin', full_name = 'Administrador Demo'
where id = (select id from auth.users where email = 'admin@auditoria.demo');
```

> Tip: también puedes pasar `full_name` y `role` en el campo **User Metadata**
> (`{"full_name": "...", "role": "admin"}`) al crear el usuario, y el trigger los
> tomará directamente.

---

## 7. Correr en desarrollo

```bash
# 1. Variables de entorno
cp .env.example .env.local
# edita .env.local con tu VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY

# 2. Instalar dependencias y arrancar
npm install
npm run dev
```

La app queda en `http://localhost:5173`.

Variables de entorno (`.env.local`):

```env
VITE_SUPABASE_URL=https://yourprojectid.supabase.co
VITE_SUPABASE_ANON_KEY=eyJxxxxx
VITE_APP_VERSION=1.0.0
```

---

## 8. Construir para producción

```bash
npm run build      # tsc + vite build  → genera /dist
npm run preview    # sirve /dist localmente para verificar
```

---

## 9. Deploy a Vercel

1. Importa el repositorio en [vercel.com](https://vercel.com).
2. **Framework preset**: Vite. **Build command**: `npm run build`. **Output**: `dist`.
3. Agrega las variables de entorno (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`,
   `VITE_APP_VERSION`) en **Project Settings → Environment Variables**.
4. Deploy. Vercel detecta la SPA; el routing del cliente se sirve sobre `index.html`.

---

## 10. Instalar la PWA en una tablet Android

1. Abre la URL desplegada en **Chrome**.
2. Menú (⋮) → **Agregar a pantalla principal** / **Instalar app**.
3. Confirma. La app se instala con el ícono de marca y se abre en modo
   `standalone` (sin barra del navegador), con `theme_color` `#1F3864`.

---

## 11. Estructura del proyecto

```
src/
├── app/         App, router, providers, RoleRedirect
├── auth/        login, recuperación, store Zustand, ProtectedRoute
├── shared/      componentes (Button, Field, Card, Banner, Loading,
│                EmptyState, Header, BottomBar), hooks y utils
├── modules/     homes placeholder por rol (supervisor/segurista/auditor/admin)
├── db/          cliente de Supabase
├── types/       tipos de dominio y tipos generados de la BD
└── styles.css   Tailwind + utilidades safe-area

supabase/
├── migrations/  schema, triggers y RLS
└── seed.sql     catálogos v1 + plantas demo
```

---

## 12. Estado del proyecto

**Bloque 1 — Fundación** ✅
- Setup Vite + React + TS + Tailwind + PWA.
- Schema de Supabase + triggers + RLS + seed (67 criterios, 3 plantas).
- Autenticación (login + recuperación) y routing por rol con guards.
- Layout base mobile-first y componentes compartidos.
- Homes placeholder por rol.

**Bloque 2** (pendiente): captura de checklists, asistencia, actividades, EPP,
permisos, auditorías; sync offline con Dexie; fotos y firmas.

**Bloque 3** (pendiente): dashboard administrativo con KPIs/gráficas y Edge
Functions (PDF, notificaciones, KPIs).
