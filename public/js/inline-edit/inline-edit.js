class InlineEditableDropdown {
  constructor({ dataSources, updateUrl }) {
    this.dataSources = dataSources;
    this.updateUrl = updateUrl;
    this.pendingChanges = new Map();

    document.addEventListener("click", this.handleClick.bind(this));
  }

  handleClick(e) {
    const cell = e.target.closest(".editable-cell");
    if (!cell || cell.classList.contains("editing")) return;
    this.activate(cell);
  }

  activate(cell) {
    cell.classList.add("editing");

    const field = cell.dataset.field;
    const scanId = cell.dataset.scanId;
    const damageId = cell.dataset.damageId;
    const originalText = cell.textContent.trim();

    // OBSERVACIÓN (input texto)
    if (field === "observacion") {
      this.activateTextInput({ cell, scanId, damageId, originalText });
      return;
    }

    const mountId = `inline-${Date.now()}`;
    cell.innerHTML = `<div id="${mountId}"></div>`;

    createSearchableDropdown({
      mountId,
      data: this.dataSources[field],
      placeholder: "Seleccionar",
      onSelect: (item) => {
        this.commit({
          cell,
          field,
          scanId,
          damageId,
          item,
          originalText,
        });
      },
    });

    const esc = (e) => {
      // 🔒 ESC solo funciona mientras está editando
      if (
        (e.key === "Escape" && cell.classList.contains("editing")) ||
        cell.classList.contains("pending-change")
      ) {
        this.cancel(cell, originalText);
        document.removeEventListener("keydown", esc);
      }
    };

    document.addEventListener("keydown", esc);
  }

  commit({ cell, field, scanId, damageId, item, originalText }) {
    // 🔥 matar ESC pendiente
    if (cell._escListener) {
      document.removeEventListener("keydown", cell._escListener);
      delete cell._escListener;
    }
    cell.classList.remove("editing");
    cell.innerHTML = "";

    // icono delete (solo área y con damageId)
    if (field === "area" && damageId) {
      const icon = document.createElement("span");
      icon.className = "damage-delete-icon d-none";
      icon.dataset.damageId = damageId;
      icon.title = "Eliminar daño";
      icon.innerHTML = `<i class="mdi mdi-trash-can-outline"></i>`;
      cell.appendChild(icon);
    }

    const span = document.createElement("span");
    span.className = "cell-value";
    span.textContent = item.descripcion;
    cell.appendChild(span);

    const key = `${scanId}_${damageId}_${field}`;

    this.pendingChanges.set(key, {
      scanId,
      damageId,
      field,
      newValue: item.id,
      originalText,
      displayValue: item.descripcion,
      cell,
    });

    // 🔑 acá se pinta
    cell.classList.add("pending-change");
  }

  cancel(cell, originalText) {
    cell.classList.remove("editing");
    cell.innerHTML = `<span class="cell-value">${originalText}</span>`;

    // 🔥 eliminar cambio pendiente asociado a esta celda
    for (const [key, change] of this.pendingChanges.entries()) {
      if (change.cell === cell) {
        this.pendingChanges.delete(key);
        cell.classList.remove("pending-change", "saving");
        break;
      }
    }
  }

  activateTextInput({ cell, scanId, damageId, originalText }) {
    let committed = false;

    const input = document.createElement("input");
    input.type = "text";
    input.className = "form-control form-control-sm";
    input.value = originalText;

    cell.innerHTML = "";
    cell.appendChild(input);
    input.focus();

    const commitOnce = () => {
      if (committed) return;
      committed = true;

      const newValue = input.value.trim();
      if (newValue === originalText) {
        this.cancel(cell, originalText);
        return;
      }

      this.commitText({
        cell,
        scanId,
        damageId,
        value: newValue,
        originalText,
      });
    };

    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") commitOnce();
      if (e.key === "Escape") {
        committed = true;
        this.cancel(cell, originalText);
      }
    });

    input.addEventListener("blur", commitOnce);
  }

  commitText({ cell, scanId, damageId, value, originalText }) {
    cell.classList.remove("editing");
    cell.innerHTML = `<span class="cell-value">${value}</span>`;

    const key = `${scanId}_${damageId}_obs`;

    this.pendingChanges.set(key, {
      scanId,
      damageId,
      field: "obs",
      newValue: value,
      originalText,
      displayValue: value,
      cell,
    });

    cell.classList.add("pending-change");
  }

  async saveAll() {
    if (!this.pendingChanges.size) {
      toastInfo("No hay cambios para guardar");
      return;
    }

    const btn = document.getElementById("btnUpdateDamages");

    const payload = Array.from(this.pendingChanges.values()).map((c) => ({
      scanId: c.scanId,
      damageId: c.damageId || null,
      field: c.field,
      value: c.newValue,
    }));

    this.pendingChanges.forEach((c) => {
      // quitar estilos de pendiente
      c.cell.classList.remove("pending-change", "saving");

      // 🔑 el valor guardado pasa a ser el nuevo baseline
      const span = c.cell.querySelector(".cell-value");
      if (span) {
        span.textContent = c.displayValue;
      }

      // 🔥 actualizar originalText
      c.originalText = c.displayValue;
    });
    setButtonLoading(btn, true);

    try {
      const res = await fetch(this.updateUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ changes: payload }),
      });

      if (!res.ok) throw new Error();
      const json = await res.json();

      // 🔥 cerrar cualquier edición activa y matar ESC pendientes
      document.querySelectorAll(".editable-cell.editing").forEach((cell) => {
        cell.classList.remove("editing");
        this.removeEsc(cell);
      });

      this.pendingChanges.forEach((c) => {
        c.cell.classList.remove("pending-change", "saving");

        // 🔥 el valor guardado pasa a ser el nuevo baseline
        const span = c.cell.querySelector(".cell-value");
        if (span) {
          span.textContent = c.displayValue;
        }

        c.originalText = c.displayValue;

        // 🔥 eliminar ESC residual
        if (c.cell._escListener) {
          document.removeEventListener("keydown", c.cell._escListener);
          delete c.cell._escListener;
        }
      });

      this.pendingChanges.clear();

      toastSuccess(json.message || "Cambios guardados");
    } catch {
      this.pendingChanges.forEach((c) => {
        c.cell.innerHTML = `<span class="cell-value">${c.originalText}</span>`;
        c.cell.classList.remove("pending-change", "saving");
      });
      this.pendingChanges.clear();
      toastError("No se pudieron guardar los cambios");
    } finally {
      setButtonLoading(btn, false);
    }
  }
}
