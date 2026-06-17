-- =====================================================
-- PLANTAS DEMO
-- =====================================================
insert into plants (id, name, address, contact_name, contact_phone, active) values
  ('11111111-1111-1111-1111-111111111111', 'Kellanova Planta Querétaro', 'Carr. Querétaro-México km 12, Querétaro, MX', 'Ing. Cliente Demo', '442-000-0001', true),
  ('22222222-2222-2222-2222-222222222222', 'Cliente Demo 2', 'Av. Industrial 100, Querétaro, MX', 'Lic. Contacto 2', '442-000-0002', true),
  ('33333333-3333-3333-3333-333333333333', 'Cliente Demo 3', 'Blvd. Norte 250, Querétaro, MX', 'Ing. Contacto 3', '442-000-0003', true);

-- =====================================================
-- CRITERIOS DEL SUPERVISOR (Checklist) — Versión 1
-- Turno L-V 8:00 a 17:30
-- =====================================================

-- Inicio de turno (9 items)
insert into criteria_catalog (version, module, section_key, section_title, item_index, item_text, suggested_time) values
  (1, 'supervisor_checklist', 'inicio_turno', 'Inicio de turno', 0, 'Llegar mínimo 15 min antes que el personal', 'Antes 8:00'),
  (1, 'supervisor_checklist', 'inicio_turno', 'Inicio de turno', 1, 'Pasar lista de asistencia. Registrar entradas y firmas', '8:00'),
  (1, 'supervisor_checklist', 'inicio_turno', 'Inicio de turno', 2, 'Marcar retardos / faltas y avisar al jefe directo', '8:05'),
  (1, 'supervisor_checklist', 'inicio_turno', 'Inicio de turno', 3, 'Asignar actividades del día por trabajador (verbal y por escrito)', '8:10'),
  (1, 'supervisor_checklist', 'inicio_turno', 'Inicio de turno', 4, 'Coordinar con el segurista: confirmar que EPP y permisos están entregados', '8:15'),
  (1, 'supervisor_checklist', 'inicio_turno', 'Inicio de turno', 5, 'Participar en la charla pre-operacional que da el segurista', '8:20'),
  (1, 'supervisor_checklist', 'inicio_turno', 'Inicio de turno', 6, 'Confirmar que cada trabajador tiene herramienta y material para su actividad', '8:25'),
  (1, 'supervisor_checklist', 'inicio_turno', 'Inicio de turno', 7, 'Revisar pendientes del día anterior y comunicar prioridades del día', '8:30'),
  (1, 'supervisor_checklist', 'inicio_turno', 'Inicio de turno', 8, 'Coordinarse con el contacto del cliente: confirmar accesos y prioridades', '8:30');

-- Durante el turno (9 items)
insert into criteria_catalog (version, module, section_key, section_title, item_index, item_text, suggested_time) values
  (1, 'supervisor_checklist', 'durante_turno', 'Durante el turno', 0, 'Recorrer todas las áreas y validar inicio de actividades', '1ª ronda'),
  (1, 'supervisor_checklist', 'durante_turno', 'Durante el turno', 1, 'Tomar foto ANTES de iniciar cada actividad', 'Por trabajo'),
  (1, 'supervisor_checklist', 'durante_turno', 'Durante el turno', 2, 'Supervisar avance, calidad y comportamiento del personal', 'Continuo'),
  (1, 'supervisor_checklist', 'durante_turno', 'Durante el turno', 3, 'Validar que actividades en proceso van conforme a lo previsto', '2ª ronda'),
  (1, 'supervisor_checklist', 'durante_turno', 'Durante el turno', 4, 'Tomar foto DURANTE el trabajo (si la naturaleza lo permite)', 'Por trabajo'),
  (1, 'supervisor_checklist', 'durante_turno', 'Durante el turno', 5, 'Registrar de inmediato cualquier incidencia operativa o queja del cliente', 'Cuando ocurra'),
  (1, 'supervisor_checklist', 'durante_turno', 'Durante el turno', 6, 'Comunicar al segurista cualquier riesgo o acto inseguro que observes', 'Cuando ocurra'),
  (1, 'supervisor_checklist', 'durante_turno', 'Durante el turno', 7, 'Confirmar abastecimiento de materiales y herramienta', 'Continuo'),
  (1, 'supervisor_checklist', 'durante_turno', 'Durante el turno', 8, 'Validar avance previo al cierre de turno', '3ª ronda');

-- Cierre de turno (10 items)
insert into criteria_catalog (version, module, section_key, section_title, item_index, item_text, suggested_time) values
  (1, 'supervisor_checklist', 'cierre_turno', 'Cierre de turno', 0, 'Recorrer cada trabajo y verificar calidad de terminado', '16:30'),
  (1, 'supervisor_checklist', 'cierre_turno', 'Cierre de turno', 1, 'Tomar foto DESPUÉS de cada actividad cerrada', 'Por trabajo'),
  (1, 'supervisor_checklist', 'cierre_turno', 'Cierre de turno', 2, 'Validar que no haya daño colateral (paredes, equipos, pisos)', '16:45'),
  (1, 'supervisor_checklist', 'cierre_turno', 'Cierre de turno', 3, 'Confirmar limpieza de áreas intervenidas', '16:50'),
  (1, 'supervisor_checklist', 'cierre_turno', 'Cierre de turno', 4, 'Recoger y resguardar herramienta. Verificar inventario', '16:55'),
  (1, 'supervisor_checklist', 'cierre_turno', 'Cierre de turno', 5, 'Llenar el REPORTE DIARIO OPERATIVO', '17:00'),
  (1, 'supervisor_checklist', 'cierre_turno', 'Cierre de turno', 6, 'Hacer cierre conjunto con el SEGURISTA: cruzar incidencias y pendientes', '17:05'),
  (1, 'supervisor_checklist', 'cierre_turno', 'Cierre de turno', 7, 'Pasar lista de salida y registrar horas', '17:10'),
  (1, 'supervisor_checklist', 'cierre_turno', 'Cierre de turno', 8, 'Subir o enviar evidencia fotográfica al canal acordado', '17:20'),
  (1, 'supervisor_checklist', 'cierre_turno', 'Cierre de turno', 9, 'Enviar resumen del día al jefe directo', '17:30');

-- =====================================================
-- CRITERIOS DEL SEGURISTA — Versión 1
-- Llega 30 min antes (7:30) y se queda al cierre
-- =====================================================

-- Inicio de turno (10 items)
insert into criteria_catalog (version, module, section_key, section_title, item_index, item_text, suggested_time) values
  (1, 'safety_checklist', 'inicio_turno', 'Inicio de turno', 0, 'Llegar 30 min antes que el personal', 'Antes 7:30'),
  (1, 'safety_checklist', 'inicio_turno', 'Inicio de turno', 1, 'Revisar instalaciones: extintores, salidas de emergencia, botiquín, señalización', '7:35'),
  (1, 'safety_checklist', 'inicio_turno', 'Inicio de turno', 2, 'Recibir personal y hacer inspección de EPP por trabajador', '8:00'),
  (1, 'safety_checklist', 'inicio_turno', 'Inicio de turno', 3, 'Canjear o complementar EPP defectuoso. Registrar entregas', '8:10'),
  (1, 'safety_checklist', 'inicio_turno', 'Inicio de turno', 4, 'Revisar y firmar permisos de trabajo del día (vigentes y completos)', '8:15'),
  (1, 'safety_checklist', 'inicio_turno', 'Inicio de turno', 5, 'Elaborar / revisar Análisis de Trabajo Seguro (ATS) por actividad de riesgo', '8:20'),
  (1, 'safety_checklist', 'inicio_turno', 'Inicio de turno', 6, 'Charla pre-operacional de 5 minutos (tema, riesgos del día, recordatorios)', '8:25'),
  (1, 'safety_checklist', 'inicio_turno', 'Inicio de turno', 7, 'Recolectar firmas de asistencia a la charla', '8:30'),
  (1, 'safety_checklist', 'inicio_turno', 'Inicio de turno', 8, 'Identificar y señalizar áreas de riesgo del día (cintas, conos, letreros)', '8:35'),
  (1, 'safety_checklist', 'inicio_turno', 'Inicio de turno', 9, 'Confirmar con el SUPERVISOR que ya se pueden iniciar actividades', '8:40');

-- Durante el turno (9 items)
insert into criteria_catalog (version, module, section_key, section_title, item_index, item_text, suggested_time) values
  (1, 'safety_checklist', 'durante_turno', 'Durante el turno', 0, 'Verificar uso correcto y constante de EPP en todas las áreas', '1ª ronda'),
  (1, 'safety_checklist', 'durante_turno', 'Durante el turno', 1, 'Vigilar cumplimiento de procedimientos de trabajo seguro', 'Continuo'),
  (1, 'safety_checklist', 'durante_turno', 'Durante el turno', 2, 'DETENER de inmediato cualquier acto o condición insegura', 'Cuando ocurra'),
  (1, 'safety_checklist', 'durante_turno', 'Durante el turno', 3, 'Validar bloqueo de energía (LOTO), trabajo en altura, espacios confinados, trabajo en caliente cuando aplique', 'Por trabajo'),
  (1, 'safety_checklist', 'durante_turno', 'Durante el turno', 4, 'Inspección de herramientas en uso (cables, filos, agarres)', '2ª ronda'),
  (1, 'safety_checklist', 'durante_turno', 'Durante el turno', 5, 'Registrar near-misses (casi-accidentes) en bitácora', 'Continuo'),
  (1, 'safety_checklist', 'durante_turno', 'Durante el turno', 6, 'Atender de inmediato cualquier accidente o incidente. Aplicar primeros auxilios si aplica', 'Cuando ocurra'),
  (1, 'safety_checklist', 'durante_turno', 'Durante el turno', 7, 'Coordinarse con personal de seguridad del cliente cuando aplique', 'Continuo'),
  (1, 'safety_checklist', 'durante_turno', 'Durante el turno', 8, 'Validación de seguridad previo al cierre', '3ª ronda');

-- Cierre de turno (9 items)
insert into criteria_catalog (version, module, section_key, section_title, item_index, item_text, suggested_time) values
  (1, 'safety_checklist', 'cierre_turno', 'Cierre de turno', 0, 'Recoger y revisar EPP de uso compartido', '16:30'),
  (1, 'safety_checklist', 'cierre_turno', 'Cierre de turno', 1, 'Verificar que las áreas queden seguras (sin riesgos remanentes, cables, herramientas)', '16:40'),
  (1, 'safety_checklist', 'cierre_turno', 'Cierre de turno', 2, 'Confirmar entrega de herramienta de seguridad (arneses, guantes especiales, etc.)', '16:50'),
  (1, 'safety_checklist', 'cierre_turno', 'Cierre de turno', 3, 'Llenar el REPORTE DIARIO DE SEGURIDAD', '17:00'),
  (1, 'safety_checklist', 'cierre_turno', 'Cierre de turno', 4, 'Cierre conjunto con el SUPERVISOR: cruzar incidentes y pendientes', '17:05'),
  (1, 'safety_checklist', 'cierre_turno', 'Cierre de turno', 5, 'Archivar permisos y ATS firmados en la carpeta semanal de seguridad', '17:10'),
  (1, 'safety_checklist', 'cierre_turno', 'Cierre de turno', 6, 'Subir evidencia fotográfica de seguridad al canal acordado', '17:20'),
  (1, 'safety_checklist', 'cierre_turno', 'Cierre de turno', 7, 'Si hubo incidente: iniciar reporte formal de investigación', '17:25'),
  (1, 'safety_checklist', 'cierre_turno', 'Cierre de turno', 8, 'Enviar resumen del día al jefe directo (incidentes, near-misses, condiciones inseguras)', '17:30');

-- =====================================================
-- CRITERIOS DE AUDITORÍA — Versión 1
-- =====================================================

-- Bloque A — Inspección Física
-- A.1 Personal en sitio (4)
insert into criteria_catalog (version, module, section_key, section_title, item_index, item_text) values
  (1, 'audit', 'A.1', 'Personal en sitio', 0, 'Personal físicamente presente coincide con lista de asistencia'),
  (1, 'audit', 'A.1', 'Personal en sitio', 1, 'Todos portan uniforme completo'),
  (1, 'audit', 'A.1', 'Personal en sitio', 2, 'Todos portan EPP correspondiente al trabajo (casco, guantes, lentes, etc.)'),
  (1, 'audit', 'A.1', 'Personal en sitio', 3, 'Personal trabajando en el área asignada');

-- A.2 Trabajos en ejecución (4)
insert into criteria_catalog (version, module, section_key, section_title, item_index, item_text) values
  (1, 'audit', 'A.2', 'Trabajos en ejecución', 0, 'Las actividades reportadas como "en proceso" sí se están ejecutando'),
  (1, 'audit', 'A.2', 'Trabajos en ejecución', 1, 'Trabajadores cuentan con la herramienta adecuada'),
  (1, 'audit', 'A.2', 'Trabajos en ejecución', 2, 'Trabajadores cuentan con el material necesario'),
  (1, 'audit', 'A.2', 'Trabajos en ejecución', 3, 'Permiso de trabajo visible o disponible en sitio (cuando aplica)');

-- A.3 Trabajos cerrados (5)
insert into criteria_catalog (version, module, section_key, section_title, item_index, item_text) values
  (1, 'audit', 'A.3', 'Trabajos cerrados — verificación física', 0, 'Trabajo terminado coincide con lo reportado por el supervisor'),
  (1, 'audit', 'A.3', 'Trabajos cerrados — verificación física', 1, 'Calidad visible aceptable, sin retrabajo evidente'),
  (1, 'audit', 'A.3', 'Trabajos cerrados — verificación física', 2, 'Área limpia tras la intervención'),
  (1, 'audit', 'A.3', 'Trabajos cerrados — verificación física', 3, 'Sin daño colateral (paredes, equipos, pisos, instalaciones)'),
  (1, 'audit', 'A.3', 'Trabajos cerrados — verificación física', 4, 'Cliente interno conforme (validación verbal o firma)');

-- A.4 Seguridad y orden (4)
insert into criteria_catalog (version, module, section_key, section_title, item_index, item_text) values
  (1, 'audit', 'A.4', 'Seguridad y orden del área', 0, 'Áreas de trabajo señalizadas (cintas, conos, letreros)'),
  (1, 'audit', 'A.4', 'Seguridad y orden del área', 1, 'Sin riesgos eléctricos o mecánicos expuestos'),
  (1, 'audit', 'A.4', 'Seguridad y orden del área', 2, 'Herramientas guardadas u ordenadas al final del turno'),
  (1, 'audit', 'A.4', 'Seguridad y orden del área', 3, 'Sin residuos o material acumulado fuera de lugar');

-- Bloque B — Revisión Administrativa
-- B.1 Reporte del supervisor (4)
insert into criteria_catalog (version, module, section_key, section_title, item_index, item_text) values
  (1, 'audit', 'B.1', 'Reporte diario del supervisor', 0, 'Reporte entregado en tiempo (antes del horario acordado)'),
  (1, 'audit', 'B.1', 'Reporte diario del supervisor', 1, 'Reporte completo: asistencia + actividades + evidencias + observaciones'),
  (1, 'audit', 'B.1', 'Reporte diario del supervisor', 2, 'Llenado legible, sin tachones ni correcciones sin firma'),
  (1, 'audit', 'B.1', 'Reporte diario del supervisor', 3, 'Resumen del día enviado por el canal acordado');

-- B.2 Lista de asistencia (4)
insert into criteria_catalog (version, module, section_key, section_title, item_index, item_text) values
  (1, 'audit', 'B.2', 'Lista de asistencia', 0, 'Lista del día firmada por cada trabajador'),
  (1, 'audit', 'B.2', 'Lista de asistencia', 1, 'Horas de entrada y salida registradas'),
  (1, 'audit', 'B.2', 'Lista de asistencia', 2, 'Faltas y retardos marcados con su causa'),
  (1, 'audit', 'B.2', 'Lista de asistencia', 3, 'Total de asistentes coincide con personal observado en planta');

-- B.3 Permisos (4)
insert into criteria_catalog (version, module, section_key, section_title, item_index, item_text) values
  (1, 'audit', 'B.3', 'Permisos de trabajo', 0, 'Permisos del día vigentes y firmados'),
  (1, 'audit', 'B.3', 'Permisos de trabajo', 1, 'Permisos archivados en carpeta semanal'),
  (1, 'audit', 'B.3', 'Permisos de trabajo', 2, 'Permisos firmados/sellados por el cliente cuando aplica'),
  (1, 'audit', 'B.3', 'Permisos de trabajo', 3, 'Sin permisos extraviados de días anteriores');

-- B.4 Evidencia fotográfica (4)
insert into criteria_catalog (version, module, section_key, section_title, item_index, item_text) values
  (1, 'audit', 'B.4', 'Evidencia fotográfica', 0, 'Cada actividad cerrada tiene foto antes y después'),
  (1, 'audit', 'B.4', 'Evidencia fotográfica', 1, 'Fotos etiquetadas o nombradas con fecha / área / actividad'),
  (1, 'audit', 'B.4', 'Evidencia fotográfica', 2, 'Carpeta digital o física del día organizada'),
  (1, 'audit', 'B.4', 'Evidencia fotográfica', 3, 'Sin actividades "cerradas" sin respaldo fotográfico');

-- B.5 Bitácora (4)
insert into criteria_catalog (version, module, section_key, section_title, item_index, item_text) values
  (1, 'audit', 'B.5', 'Bitácora de incidencias y pendientes', 0, 'Incidencias del día registradas (faltas, retrasos, accidentes, quejas)'),
  (1, 'audit', 'B.5', 'Bitácora de incidencias y pendientes', 1, 'Pendientes con causa documentada (material, permiso, cliente, etc.)'),
  (1, 'audit', 'B.5', 'Bitácora de incidencias y pendientes', 2, 'Pendientes de días previos con seguimiento al día'),
  (1, 'audit', 'B.5', 'Bitácora de incidencias y pendientes', 3, 'Acciones correctivas anteriores cerradas o en curso');

-- B.6 Materiales y herramienta (3)
insert into criteria_catalog (version, module, section_key, section_title, item_index, item_text) values
  (1, 'audit', 'B.6', 'Control de materiales y herramienta', 0, 'Solicitudes de material del día documentadas'),
  (1, 'audit', 'B.6', 'Control de materiales y herramienta', 1, 'Herramienta entregada y devuelta con vale o registro'),
  (1, 'audit', 'B.6', 'Control de materiales y herramienta', 2, 'Sin pérdidas o faltantes reportados sin investigar');

-- =====================================================
-- USUARIOS DEMO
-- Nota: en Supabase Cloud creas los usuarios desde el dashboard de Auth
-- con estos correos, y el trigger handle_new_user creará el profile.
-- Luego ejecuta los UPDATE para asignar el rol correcto:
-- =====================================================
-- Sugerencia de cuentas demo a crear desde Supabase Dashboard:
--   admin@auditoria.demo / Admin123!  (rol: admin)
--   supervisor@auditoria.demo / Super123!  (rol: supervisor)
--   segurista@auditoria.demo / Segur123!  (rol: segurista)
--   auditor@auditoria.demo / Audit123!  (rol: auditor)
--
-- Después actualiza el rol con:
-- update profiles set role = 'admin', full_name = 'Administrador Demo' where id = (select id from auth.users where email = 'admin@auditoria.demo');
-- update profiles set role = 'supervisor', full_name = 'Juan Pérez (Supervisor)' where id = (select id from auth.users where email = 'supervisor@auditoria.demo');
-- update profiles set role = 'segurista', full_name = 'Luis López (Segurista)' where id = (select id from auth.users where email = 'segurista@auditoria.demo');
-- update profiles set role = 'auditor', full_name = 'Auditor Demo' where id = (select id from auth.users where email = 'auditor@auditoria.demo');
