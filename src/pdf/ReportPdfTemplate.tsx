import { Document, Page, Text, View, Image, StyleSheet } from '@react-pdf/renderer';
import type { PdfDoc } from './pdfData';

const navy = '#1F3864';
const slate = '#475569';

const styles = StyleSheet.create({
  page: { padding: 28, fontSize: 9, color: '#0F172A', fontFamily: 'Helvetica' },
  header: { borderBottom: `2 solid ${navy}`, paddingBottom: 8, marginBottom: 12 },
  company: { fontSize: 14, fontWeight: 'bold', color: navy },
  title: { fontSize: 11, color: slate, marginTop: 2 },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 6 },
  metaItem: { width: '50%', marginBottom: 2 },
  metaLabel: { color: slate, fontSize: 8 },
  metaValue: { fontSize: 9 },
  pill: { marginTop: 6, alignSelf: 'flex-start', paddingVertical: 3, paddingHorizontal: 8, borderRadius: 10, fontSize: 10, fontWeight: 'bold' },
  sectionTitle: { fontSize: 11, fontWeight: 'bold', color: navy, marginTop: 12, marginBottom: 4 },
  subTitle: { fontSize: 9, fontWeight: 'bold', color: slate, marginTop: 6, marginBottom: 2 },
  checkRow: { flexDirection: 'row', justifyContent: 'space-between', borderBottom: '0.5 solid #E2E8F0', paddingVertical: 2 },
  checkText: { width: '78%' },
  checkVal: { width: '22%', textAlign: 'right', color: slate },
  table: { marginTop: 4, borderTop: '0.5 solid #CBD5E1' },
  trHead: { flexDirection: 'row', backgroundColor: '#F1F5F9' },
  tr: { flexDirection: 'row', borderBottom: '0.5 solid #E2E8F0' },
  th: { padding: 3, fontSize: 8, fontWeight: 'bold', color: slate },
  td: { padding: 3, fontSize: 8 },
  finding: { borderLeft: `2 solid ${navy}`, paddingLeft: 6, marginBottom: 6 },
  signatures: { flexDirection: 'row', marginTop: 14, gap: 16 },
  sigBox: { width: 160 },
  sigImg: { height: 70, objectFit: 'contain', border: '0.5 solid #CBD5E1' },
  footer: { position: 'absolute', bottom: 18, left: 28, right: 28, flexDirection: 'row', justifyContent: 'space-between', borderTop: '0.5 solid #CBD5E1', paddingTop: 4, fontSize: 7, color: slate },
});

const semColor: Record<string, { bg: string; fg: string }> = {
  verde: { bg: '#DCFCE7', fg: '#14532D' },
  amarillo: { bg: '#FEF3C7', fg: '#78350F' },
  rojo: { bg: '#FEE2E2', fg: '#7F1D1D' },
  'sin-datos': { bg: '#F1F5F9', fg: '#475569' },
};

export function ReportPdfTemplate({ doc }: { doc: PdfDoc }) {
  const generated = new Date().toLocaleString('es-MX');
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Encabezado */}
        <View style={styles.header}>
          <Text style={styles.company}>Auditoría Operativa</Text>
          <Text style={styles.title}>{doc.title}</Text>
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Planta</Text>
              <Text style={styles.metaValue}>{doc.plantName}</Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Fecha</Text>
              <Text style={styles.metaValue}>{doc.date}</Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Autor</Text>
              <Text style={styles.metaValue}>{doc.authorName}</Text>
            </View>
            {doc.meta.map((m) => (
              <View key={m.label} style={styles.metaItem}>
                <Text style={styles.metaLabel}>{m.label}</Text>
                <Text style={styles.metaValue}>{m.value}</Text>
              </View>
            ))}
          </View>
          {doc.compliance && (
            <Text
              style={[
                styles.pill,
                {
                  backgroundColor: semColor[doc.compliance.semaforo]?.bg ?? '#F1F5F9',
                  color: semColor[doc.compliance.semaforo]?.fg ?? slate,
                },
              ]}
            >
              Cumplimiento: {doc.compliance.pct != null ? `${doc.compliance.pct}%` : 'sin datos'} ·{' '}
              {doc.compliance.semaforo.toUpperCase()}
            </Text>
          )}
        </View>

        {/* Checklist / criterios */}
        {doc.checklist.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>Criterios</Text>
            {doc.checklist.map((sec) => (
              <View key={sec.title} wrap={false}>
                <Text style={styles.subTitle}>{sec.title}</Text>
                {sec.items.map((it, i) => (
                  <View key={i} style={styles.checkRow}>
                    <Text style={styles.checkText}>{it.text}</Text>
                    <Text style={styles.checkVal}>{it.value}</Text>
                  </View>
                ))}
              </View>
            ))}
          </View>
        )}

        {/* Tablas */}
        {doc.tables
          .filter((t) => t.rows.length > 0)
          .map((t) => (
            <View key={t.title} wrap={false}>
              <Text style={styles.sectionTitle}>{t.title}</Text>
              <View style={styles.table}>
                <View style={styles.trHead}>
                  {t.columns.map((col) => (
                    <Text key={col} style={[styles.th, { width: `${100 / t.columns.length}%` }]}>
                      {col}
                    </Text>
                  ))}
                </View>
                {t.rows.map((row, ri) => (
                  <View key={ri} style={styles.tr}>
                    {row.map((cell, ci) => (
                      <Text key={ci} style={[styles.td, { width: `${100 / t.columns.length}%` }]}>
                        {cell}
                      </Text>
                    ))}
                  </View>
                ))}
              </View>
            </View>
          ))}

        {/* Hallazgos */}
        {doc.findings.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>Hallazgos y acciones correctivas</Text>
            {doc.findings.map((f, i) => (
              <View key={i} style={styles.finding} wrap={false}>
                <Text>
                  [{f.severity}] {f.description}
                </Text>
                <Text style={{ color: slate, fontSize: 8 }}>
                  Categoría: {f.category} · Acción: {f.action} · Estado: {f.status}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Firmas */}
        {doc.signatures.length > 0 && (
          <View style={styles.signatures} wrap={false}>
            {doc.signatures.map((s) => (
              <View key={s.label} style={styles.sigBox}>
                <Image src={s.url} style={styles.sigImg} />
                <Text style={{ fontSize: 8, color: slate, marginTop: 2 }}>{s.label}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Pie */}
        <View style={styles.footer} fixed>
          <Text>Generado: {generated}</Text>
          <Text>Folio: {doc.folio}</Text>
        </View>
      </Page>
    </Document>
  );
}
