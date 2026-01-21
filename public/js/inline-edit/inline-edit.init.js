import areas from "../../utils/areas.json" with { type: "json" };
import averias from "../../utils/averias.json" with { type: "json" };
import gravedades from "../../utils/gravedades.json" with { type: "json" };

const inlineEditor = new InlineEditableDropdown({
  dataSources: {
    area: areas,
    averia: averias,
    gravedad: gravedades,
  },
  updateUrl: "/api/damages/update",
  onSuccess: (item) => {
    console.log("Actualizado:", item);
  },
  onError: () => {
    alert("Error al guardar");
  },
});

document.addEventListener("shown.bs.dropdown", (e) => {
  const dropdown = e.target;
  const menu = dropdown.querySelector(".dropdown-menu");
  const btn = dropdown.querySelector(".dropdown-toggle");

  if (!menu || !btn) return;

  const rect = btn.getBoundingClientRect();

  menu.style.position = "fixed";
  menu.style.top = `${rect.bottom + window.scrollY}px`;
  menu.style.left = `${rect.left + window.scrollX}px`;

  // 🔑 ancho limitado al botón
  menu.style.width = `${rect.width}px`;
  menu.style.maxWidth = `${rect.width}px`;
});
