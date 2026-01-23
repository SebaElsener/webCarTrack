class InlineEditableDropdown {
  constructor({ dataSources, updateUrl, onSuccess, onError }) {
    this.dataSources = dataSources;
    this.updateUrl = updateUrl;
    this.onSuccess = onSuccess;
    this.onError = onError;

    this.pendingChanges = new Map();

    document.addEventListener("click", this.handleClick.bind(this));
  }

  handleClick(e) {
    const cell = e.target.closest(".editable-cell");
    if (!cell || cell.classList.contains("editing")) return;

    this.activate(cell);
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

    // feedback visual
    this.pendingChanges.forEach((c) => {
      c.cell.classList.add("saving");
    });

    // 🔄 BOTÓN → loading
    setButtonLoading(btn, true);

    await fetch(this.updateUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ changes: payload }),
    })
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((json) => {
        // limpiar estado
        this.pendingChanges.forEach((c) => {
          c.cell.classList.remove("pending-change", "saving");
        });
        this.pendingChanges.clear();

        toastSuccess(json.message || "Cambios guardados correctamente");
      })
      .catch(() => {
        // rollback completo
        this.pendingChanges.forEach((c) => {
          c.cell.innerHTML = `<span class="cell-value">${c.originalText}</span>`;
          c.cell.classList.remove("pending-change", "saving");
        });
        this.pendingChanges.clear();
        toastError("No se pudieron guardar los cambios");
      })
      .finally(() => {
        // 🔁 BOTÓN → normal
        setButtonLoading(btn, false);
      });
  }

  activate(cell) {
    cell.classList.add("editing");

    const field = cell.dataset.field;
    const scanId = cell.dataset.scanId;
    const damageId = cell.dataset.damageId;
    const originalText = cell.textContent.trim();

    if (field === "observacion") {
      this.activateTextInput({
        cell,
        scanId,
        damageId,
        originalText,
      });
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

    this.attachEsc(cell, originalText);
  }

  attachEsc(cell, originalText) {
    const esc = (e) => {
      if (e.key === "Escape") {
        this.cancel(cell, originalText);
        document.removeEventListener("keydown", esc);
      }
    };
    document.addEventListener("keydown", esc);
  }

  commit({ cell, field, scanId, damageId, item, originalText }) {
    cell.classList.remove("editing");
    cell.innerHTML = `<span class="cell-value">${item.descripcion}</span>`;

    const key = `${scanId}_${damageId}_${field}`;

    this.pendingChanges.set(key, {
      scanId,
      damageId,
      field,
      newValue: item.id,
      originalText,
      cell,
      displayValue: item.descripcion,
    });

    cell.classList.add("pending-change");
  }

  cancel(cell, text) {
    cell.classList.remove("editing");
    cell.innerHTML = `<span class="cell-value">${text}</span>`;
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

  async commitText({ cell, scanId, damageId, value, originalText }) {
    cell.classList.remove("editing");
    cell.innerHTML = `<span class="cell-value">${value}</span>`;

    const key = `${scanId}_${damageId}_obs`;

    this.pendingChanges.set(key, {
      scanId,
      damageId,
      field: "obs",
      newValue: value,
      originalText,
      cell,
      displayValue: value,
    });

    cell.classList.add("pending-change");
  }

  async deleteDamages() {
    const btn = document.getElementById("btnDeleteDamages");

    const payload = Array.from(this.pendingChanges.values()).map((c) => ({
      damageId: c.damageId || null,
    }));

    // 🔄 BOTÓN → loading
    setButtonLoading(btn, true);

    await fetch(this.updateUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ changes: payload }),
    })
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((json) => {
        // limpiar estado
        this.pendingChanges.forEach((c) => {
          c.cell.classList.remove("pending-change", "saving");
        });
        this.pendingChanges.clear();

        toastSuccess(json.message || "Cambios guardados correctamente");
      })
      .catch(() => {
        // rollback completo
        this.pendingChanges.forEach((c) => {
          c.cell.innerHTML = `<span class="cell-value">${c.originalText}</span>`;
          c.cell.classList.remove("pending-change", "saving");
        });
        this.pendingChanges.clear();
        toastError("No se pudieron guardar los cambios");
      })
      .finally(() => {
        // 🔁 BOTÓN → normal
        setButtonLoading(btn, false);
      });
  }
}
