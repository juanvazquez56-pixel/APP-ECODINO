# Bloque 3 — Instrucciones paso a paso (para no programadores)

Esta guía cubre 4 cosas, en orden:
1. Instalar las dependencias nuevas.
2. Correr la migración SQL en Supabase.
3. Desplegar en Vercel.
4. Verificar que todo quedó bien.

> Copia y pega **un comando a la vez**. Si algo pide confirmación, acepta.

---

## 1. Instalar dependencias nuevas

Abre una terminal en la carpeta del proyecto y pega esto:

```
npm install recharts @react-pdf/renderer
```

Luego, para confirmar que el proyecto compila:

```
npm run build
```

Si termina sin errores en rojo, vas bien.

---

## 2. Correr la migración SQL en Supabase

La migración crea las **vistas y funciones** que alimentan el dashboard. No borra
ni cambia nada de lo que ya tienes.

1. Entra a tu proyecto en **https://app.supabase.com**.
2. En el menú de la izquierda haz clic en **SQL Editor**.
3. Haz clic en **+ New query** (arriba a la derecha).
4. Abre el archivo `supabase/migrations/0004_dashboard_kpis.sql` de este proyecto,
   **copia todo su contenido** y pégalo en el editor.
5. Haz clic en **Run** (botón verde abajo a la derecha, o `Ctrl/Cmd + Enter`).
6. Debe decir **Success. No rows returned**. Eso es correcto.

### Verificar que las funciones devuelven datos

En el mismo SQL Editor, abre otra query nueva y pega (uno a la vez):

```sql
select * from admin_kpi_headline(current_date - 30, current_date, null);
```

```sql
select * from admin_semaforo_dist(date_trunc('year', current_date)::date, current_date, null);
```

```sql
select * from admin_compliance_by_plant(current_date - 90, current_date);
```

Si tienes datos en ese periodo, verás filas. Si no, devuelven vacío (también es
válido; significa que aún no hay auditorías en ese rango).

> **Recordatorio del Bloque 2**: si todavía no creaste el bucket de Storage
> **`reports-photos`**, créalo (Storage → New bucket, privado). Las firmas del
> PDF se leen de ahí. Las políticas SQL están en el README, sección 13.1.

---

## 3. Desplegar en Vercel

### 3.1 Conectar el repositorio

1. Entra a **https://vercel.com** e inicia sesión (puedes usar tu cuenta de GitHub).
2. Haz clic en **Add New…** → **Project**.
3. En **Import Git Repository**, busca el repo **APP-ECODINO** y haz clic en **Import**.

### 3.2 Configurar el proyecto

En la pantalla de configuración:

1. **Framework Preset**: debe detectar **Vite** automáticamente. Si no, selecciónalo.
2. **Build Command**: `npm run build` (déjalo así).
3. **Output Directory**: `dist` (déjalo así).
4. Abre la sección **Environment Variables** y agrega estas dos (las mismas de tu
   archivo `.env.local`). Para cada una: escribe el **Name**, pega el **Value** y
   haz clic en **Add**:

   | Name | Value |
   | --- | --- |
   | `VITE_SUPABASE_URL` | tu URL de Supabase (ej. `https://xxxx.supabase.co`) |
   | `VITE_SUPABASE_ANON_KEY` | tu **anon/publishable key** de Supabase |

   > Opcional: `VITE_APP_VERSION` = `1.0.0`.

5. Haz clic en **Deploy** y espera a que termine (1–2 minutos).

### 3.3 Las rutas profundas no dan 404

El archivo **`vercel.json`** ya está incluido en el proyecto y le dice a Vercel
que cualquier ruta (por ejemplo `/admin/registros/auditorias`) debe servir la app.
No tienes que configurar nada manualmente: solo asegúrate de que el archivo
`vercel.json` esté en la raíz del repo (ya lo está).

### 3.4 Verificar que la PWA sigue siendo instalable

1. Abre la URL que te dio Vercel (algo como `https://app-ecodino.vercel.app`) en
   **Chrome** (en computadora o en la tablet Android).
2. En computadora: aparece un ícono de **instalar** en la barra de direcciones.
   En Android: menú **⋮** → **Agregar a pantalla principal** / **Instalar app**.
3. Si aparece la opción, la PWA quedó bien.

### 3.5 Si el login funciona en local pero NO en producción

Casi siempre es por las URLs de redirección de Auth en Supabase. Para arreglarlo:

1. En Supabase, menú izquierdo → **Authentication** → **URL Configuration**.
2. En **Site URL**, pega la URL de tu deploy de Vercel, por ejemplo:
   `https://app-ecodino.vercel.app`
3. En **Redirect URLs**, haz clic en **Add URL** y agrega:
   `https://app-ecodino.vercel.app/**`
   (el `/**` al final permite todas las rutas, incluida la de recuperar contraseña).
4. Haz clic en **Save**.
5. Vuelve a intentar iniciar sesión en producción.

---

## 4. Checklist de verificación manual

Inicia sesión como **admin@auditoria.demo** y comprueba:

- [ ] Te lleva a **/admin/home** y ves las 4 tarjetas de KPIs y las 2 gráficas
      (o el mensaje "sin datos" si el periodo está vacío).
- [ ] Cambias el **rango de fechas** arriba y los números/gráficas se actualizan.
- [ ] En **Registros**, las 3 sub-pestañas (Auditorías / Supervisor / Segurista)
      cargan. Recargar la página estando en una sub-pestaña **no** rompe; el botón
      **atrás** del navegador funciona.
- [ ] Abres un registro (clic en una fila) y descargas su **PDF** con el botón
      "Descargar PDF". Pruébalo con los 3 tipos.
- [ ] En **Hallazgos**, cambias el **estado** de un hallazgo y se guarda; ves su
      acción correctiva; los vencidos salen marcados en rojo.
- [ ] En **Catálogos → Plantas**, creas/editas una planta y la activas/desactivas.
- [ ] En **Catálogos → Personal**, cambias el **rol** de un usuario.

Como **supervisor** o **segurista**, en día hábil (L–V) entre 8:00 y 17:30 y sin
haber enviado tu reporte del día:

- [ ] Ves el banner **"Te falta tu reporte de hoy"** con enlace al formulario.
- [ ] Si lo descartas, no reaparece en la misma sesión.
- [ ] Fuera de horario o en fin de semana, el banner **no** aparece.

---

## Resumen de lo que se agregó en el Bloque 3

- `supabase/migrations/0004_dashboard_kpis.sql` — vistas y funciones de KPIs.
- Dashboard admin en `/admin/*` (Home, Registros, Hallazgos, Catálogos) con
  rutas direccionables.
- Gráficas con **recharts** y PDF con **@react-pdf/renderer** (carga diferida).
- Banner de recordatorio in-app por rol y horario.
- `vercel.json` para que la SPA/PWA funcione con rutas profundas.

**No** se modificaron los formularios, el motor de sincronización ni el esquema
de las 16 tablas existentes. Sin Edge Functions y sin notificaciones push.
