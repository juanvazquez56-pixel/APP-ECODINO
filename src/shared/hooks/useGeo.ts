export type GeoResult = { lat: number; lng: number; accuracy: number } | null;

/**
 * Versión imperativa (no-hook) para usarse dentro de stores/acciones al enviar.
 */
export function captureGeo(): Promise<GeoResult> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) return resolve(null);
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude, accuracy: pos.coords.accuracy }),
      () => resolve(null),
      { timeout: 8000, maximumAge: 60000 },
    );
  });
}

/**
 * Captura silenciosa de geolocalización. Se usa SOLO al enviar el formulario,
 * nunca al abrir la pantalla, y el resultado nunca se muestra al usuario
 * operativo. Si el usuario niega el permiso, resuelve `null` sin error visible.
 */
export function useGeo() {
  const capture = (): Promise<GeoResult> => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) return resolve(null);
      navigator.geolocation.getCurrentPosition(
        (pos) =>
          resolve({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
          }),
        () => resolve(null),
        { timeout: 8000, maximumAge: 60000 },
      );
    });
  };
  return { capture };
}
