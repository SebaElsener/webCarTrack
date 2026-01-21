function createSearchableDropdown({
  mountId,
  data,
  placeholder = "Seleccionar",
  onSelect,
}) {
  const container = document.getElementById(mountId);

  data = [...data].sort((a, b) =>
    a.descripcion.localeCompare(b.descripcion, "es", { sensitivity: "base" }),
  );

  container.innerHTML = `
    <div class="dropdown w-100">
      <button
        class="btn btn-outline-secondary dropdown-toggle w-100 text-start"
        type="button"
        data-bs-toggle="dropdown"
        aria-expanded="false"
      >
        ${placeholder}
      </button>

      <ul class="dropdown-menu w-100 p-2">
        <li>
          <input
            type="text"
            class="form-control mb-2"
            placeholder="Buscar..."
            autocomplete="off"
          />
        </li>
        <li>
          <ul class="list-unstyled mb-0 options"></ul>
        </li>
      </ul>
    </div>
  `;

  const btn = container.querySelector("button");
  const menu = container.querySelector(".dropdown-menu");
  const search = container.querySelector("input");
  const optionsEl = container.querySelector(".options");

  renderOptions(data);

  search.addEventListener("input", () => {
    const value = search.value.trim().toLowerCase();

    if (!value) return renderOptions(data);

    const filtered = data.filter((d) => {
      const firstWord = d.descripcion.split(/[\s/-]+/)[0].toLowerCase();

      return firstWord.startsWith(value);
    });

    renderOptions(filtered);
  });

  function renderOptions(list) {
    optionsEl.innerHTML = "";

    if (!list.length) {
      optionsEl.innerHTML = `
        <li class="dropdown-item text-muted">Sin resultados</li>
      `;
      return;
    }

    list.forEach((item) => {
      const li = document.createElement("li");
      li.innerHTML = `
        <button type="button" class="dropdown-item">
          ${item.id + " - " + item.descripcion}
        </button>
      `;

      li.querySelector("button").addEventListener("click", () => {
        btn.textContent = item.descripcion;
        btn.dataset.value = item.id;
        search.value = "";

        // cierre automático
        bootstrap.Dropdown.getOrCreateInstance(btn).hide();

        onSelect?.(item);
      });

      optionsEl.appendChild(li);
    });
  }
}
