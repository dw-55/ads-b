const markers = new Map();
const lastSeen = new Map();
const FRESH_MS = 60 * 1000; 
const POLL_MS  = 3000; 

function aircraftId(ac) {
  return ac.icao || ac.flight || null;
}

function upsertMarker(ac) {
  const id = aircraftId(ac);
  if (!id) return;

  if (typeof ac.lat !== 'number' || typeof ac.lon !== 'number') return;

  lastSeen.set(id, Date.now());

  const label = `${ac.flight || ac.icao || 'Unknown'}<br>Alt: ${ac.altitude ?? 'N/A'} ft`;

  if (markers.has(id)) {
    const m = markers.get(id);
    m.setLatLng([ac.lat, ac.lon]);
    m.setPopupContent(label);
  } else {
    const m = L.marker([ac.lat, ac.lon])
      .addTo(window.map)
      .bindPopup(label);
    markers.set(id, m);
  }
}

function pruneStale() {
  const now = Date.now();
  for (const [id, ts] of lastSeen.entries()) {
    if (now - ts > FRESH_MS) {
      const m = markers.get(id);
      if (m) window.map.removeLayer(m);
      markers.delete(id);
      lastSeen.delete(id);
    }
  }
}

async function poll() {
  try {
    const r = await fetch('/adsb');
    const aircraft = await r.json();
    aircraft.forEach(upsertMarker);
    pruneStale();
  } catch (e) {
    console.error('Failed to load /adsb:', e);
  }
}

poll();
setInterval(poll, POLL_MS);