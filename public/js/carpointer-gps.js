let map;
let marker;
let animationMarker;
let puntosGlobales = [];
let mapDragging = false;
window.setVelocidad = (v) => {
  velocidad = v;
};

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

    map.invalidateSize();
  }, 100);
}

export function obtenerPuntosDelViaje(datosTabla) {
  const puntos = [];
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
        scan_id: scan.scan_id,
      });
    } catch (e) {
      console.warn("GPS inválido:", scan.gps_stamp);
    }
  });

  return puntos;
}

export function openMapWithRoute(puntos, scanIdSeleccionado = null) {
  puntosGlobales = puntos;
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

      map.on("dragstart", () => {
        mapDragging = true;
      });

      map.on("dragend", () => {
        mapDragging = false;
      });
    }

    // 🔥 limpiar capas anteriores
    map.eachLayer((layer) => {
      if (
        layer instanceof L.Marker ||
        layer instanceof L.Polyline ||
        layer instanceof L.CircleMarker
      ) {
        map.removeLayer(layer);
      }
    });

    const latlngs = [];
    let puntoSeleccionado = null;
    let markerSeleccionado = null;

    puntos.forEach((p, index) => {
      const lat = Number(p.lat);
      const lon = Number(p.lon);

      if (!lat || !lon) return;

      const numero = index + 1;

      const esActual =
        scanIdSeleccionado && String(p.scan_id) === String(scanIdSeleccionado);

      let bgColor = "#007bff";

      if (esActual) {
        bgColor = "#ffc107"; // 🟡
      } else if (p.movimiento === "CARGA") {
        bgColor = "#28a745"; // 🟢
      } else if (p.movimiento === "DESCARGA") {
        bgColor = "#007bff"; // 🔵
      }

      // ✅ 1. crear icon PRIMERO
      const icon = L.divIcon({
        className: "custom-marker",
        html: `
      <div class="marker-number ${esActual ? "actual" : ""}" style="background:${bgColor}">
        ${numero}
      </div>
    `,
        iconSize: esActual ? [36, 36] : [30, 30],
        iconAnchor: esActual ? [18, 18] : [15, 15],
      });

      // ✅ 2. crear marker DESPUÉS
      const marker = L.marker([lat, lon], { icon }).addTo(map);

      marker.bindPopup(`
    <b>#${numero} - ${p.vin}</b><br>
    ${p.movimiento}<br>
    ${new Date(p.fecha).toLocaleString("es-AR", {
      hour12: false,
    })}
  `);

      // ✅ 3. recién ahora guardás el seleccionado
      if (esActual) {
        puntoSeleccionado = [lat, lon];
        markerSeleccionado = marker;
      }

      latlngs.push([lat, lon]);
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

    if (puntoSeleccionado) {
      setTimeout(() => {
        map.flyTo(puntoSeleccionado, 18, {
          duration: 0.6,
          easeLinearity: 0.25,
        });

        if (markerSeleccionado) {
          markerSeleccionado.openPopup();
        }
      }, 50); // 🔥 clave
    } else {
      map.fitBounds(polyline.getBounds());
    }

    if (markerSeleccionado) {
      markerSeleccionado.openPopup();
    }

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

document.addEventListener("mouseup", () => {
  if (!map) return;

  setTimeout(() => map.invalidateSize(), 50);
  setTimeout(() => map.invalidateSize(), 200);
});

document.getElementById("closeMapModal").addEventListener("click", () => {
  document.getElementById("mapModal").style.display = "none";
});

// document.addEventListener("click", (e) => {
//   const btn = e.target.closest(".open-map");
//   if (!btn) return;

//   try {
//     const gps = JSON.parse(btn.dataset.gps);

//     if (!gps.lat || !gps.lon) return;

//     openMapModal(gps.lat, gps.lon);
//   } catch (err) {
//     console.error("Error parseando GPS:", err);
//   }
// });

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

let animationFrame;
let progreso = 0;
let velocidad = 0.01;

export function animarSuave(puntos) {
  if (!map || puntos.length < 2) return;

  puntos.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

  const latlngs = puntos.map((p) => [Number(p.lat), Number(p.lon)]);

  let segmento = 0;

  if (animationMarker) map.removeLayer(animationMarker);
  animationMarker = L.marker(latlngs[0]).addTo(map);

  function step() {
    if (segmento >= latlngs.length - 1) {
      // 🔥 asegurar posición final
      animationMarker.setLatLng(latlngs[latlngs.length - 1]);

      // 🔥 llevar timeline al 100%
      const timeline = document.getElementById("timeline");
      if (timeline) timeline.value = 100;

      cancelAnimationFrame(animationFrame);
      return;
    }
    progreso += velocidad;

    if (progreso >= 1) {
      progreso = 1; // 🔥 forzamos final exacto
    }

    if (!latlngs[segmento] || !latlngs[segmento + 1]) return;

    const pos = interpolar(latlngs[segmento], latlngs[segmento + 1], progreso);

    if (progreso === 1) {
      segmento++;
      progreso = 0;
    }

    animationMarker.setLatLng(pos);

    // 🔥 seguimiento suave con margen
    const margen = 0.2; // 20% del borde
    const bounds = map.getBounds().pad(-margen);

    if (!mapDragging && !bounds.contains(pos)) {
      map.panTo(pos, {
        animate: true,
        duration: 0.3,
      });
    }

    const timeline = document.getElementById("timeline");

    if (timeline) {
      const progresoGlobal = (segmento + progreso) / (latlngs.length - 1);
      timeline.value = progresoGlobal * 100;
    }

    animationFrame = requestAnimationFrame(step);
  }

  step();
}

function interpolar(p1, p2, t) {
  return [p1[0] + (p2[0] - p1[0]) * t, p1[1] + (p2[1] - p1[1]) * t];
}

export function pausarAnimacion() {
  cancelAnimationFrame(animationFrame);
}

export function playAnimacion(puntos) {
  animarSuave(puntos);
}

document.addEventListener("DOMContentLoaded", () => {
  const timeline = document.getElementById("timeline");

  if (!timeline) return;

  timeline.addEventListener("input", (e) => {
    const value = Number(e.target.value);

    const latlngs = puntosGlobales.map((p) => [Number(p.lat), Number(p.lon)]);

    const total = latlngs.length - 1;
    const index = Math.floor((value / 100) * total);

    const pos = latlngs[index];

    if (animationMarker) {
      animationMarker.setLatLng(pos);
      map.panTo(pos);
    }
  });
});
