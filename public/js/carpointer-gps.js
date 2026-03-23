let map;
let marker;

function openMapModal(lat, lon) {
  const modal = document.getElementById("mapModal");
  modal.style.display = "block";

  setTimeout(() => {
    if (!map) {
      map = L.map("map").setView([lat, lon], 15);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap",
      }).addTo(map);
    } else {
      map.setView([lat, lon], 15);
    }

    if (marker) {
      marker.setLatLng([lat, lon]);
    } else {
      marker = L.marker([lat, lon]).addTo(map);
    }

    map.invalidateSize(); // 🔥 clave en modales
  }, 100);
}

export function obtenerPuntosDelViaje(datosTabla) {
  const puntos = [];
  console.log(datosTabla);
  datosTabla.forEach((scan) => {
    if (!scan.gps_stamp) return;

    try {
      const gps = JSON.parse(scan.gps_stamp);

      if (!gps.lat || !gps.lon) return;

      puntos.push({
        lat: gps.lat,
        lon: gps.lon,
        movimiento: scan.movimiento,
        vin: scan.vin,
        fecha: scan.scan_date,
      });
    } catch (e) {
      console.warn("GPS inválido:", scan.gps_stamp);
    }
  });

  return puntos;
}

export function openMapWithRoute(puntos) {
  puntos.sort(
    (a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime(),
  );
  const modal = document.getElementById("mapModal");
  modal.style.display = "block";

  setTimeout(() => {
    if (!map) {
      map = L.map("map").setView([puntos[0].lat, puntos[0].lon], 6);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap",
      }).addTo(map);
    }

    // 🔥 limpiar capas anteriores
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker || layer instanceof L.Polyline) {
        map.removeLayer(layer);
      }
    });

    const latlngs = [];

    puntos.forEach((p) => {
      const color = p.movimiento === "CARGA" ? "green" : "red";

      const marker = L.circleMarker([p.lat, p.lon], {
        radius: 6,
        color,
        fillColor: color,
        fillOpacity: 0.8,
      }).addTo(map);

      marker.bindPopup(`
        <b>${p.vin}</b><br>
        ${p.movimiento}<br>
        ${new Date(p.fecha).toLocaleString("es-AR", {
          year: "2-digit",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        })}
        `);

      latlngs.push([p.lat, p.lon]);
    });

    // 🔥 línea del recorrido
    const polyline = L.polyline(latlngs, {
      color: "blue",
      weight: 3,
    }).addTo(map);

    // 🔥 manejar inicio / fin / único punto
    if (latlngs.length === 1) {
      L.marker(latlngs[0]).addTo(map).bindPopup("Único punto");
    } else {
      L.marker(latlngs[0]).addTo(map).bindPopup("Inicio");
      L.marker(latlngs[latlngs.length - 1])
        .addTo(map)
        .bindPopup("Fin");
    }

    // 🔥 ajustar vista
    map.fitBounds(polyline.getBounds());

    map.invalidateSize();
  }, 100);
}

// cerrar modal
document.addEventListener("click", (e) => {
  const modal = document.getElementById("mapModal");

  if (e.target === modal) {
    modal.style.display = "none";
  }
});

document.getElementById("closeMapModal").addEventListener("click", () => {
  document.getElementById("mapModal").style.display = "none";
});

document.addEventListener("click", (e) => {
  const btn = e.target.closest(".open-map");
  if (!btn) return;

  try {
    const gps = JSON.parse(btn.dataset.gps);

    if (!gps.lat || !gps.lon) return;

    openMapModal(gps.lat, gps.lon);
  } catch (err) {
    console.error("Error parseando GPS:", err);
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const modal = document.querySelector(".map-modal-content");
  const header = document.getElementById("mapHeader");

  let isDragging = false;
  let offsetX, offsetY;

  header.addEventListener("mousedown", (e) => {
    isDragging = true;

    const rect = modal.getBoundingClientRect();
    offsetX = e.clientX - rect.left;
    offsetY = e.clientY - rect.top;

    modal.style.transform = "none"; // (rompe el centering por transform)
  });

  document.addEventListener("mousemove", (e) => {
    if (!isDragging) return;

    modal.style.left = e.clientX - offsetX + "px";
    modal.style.top = e.clientY - offsetY + "px";
  });

  document.addEventListener("mouseup", () => {
    isDragging = false;
  });
});
