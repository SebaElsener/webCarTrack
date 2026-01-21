class InlineEditableDropdown {
  constructor({ dataSources, updateUrl, onSuccess, onError }) {
    this.dataSources = dataSources;
    this.updateUrl = updateUrl;
    this.onSuccess = onSuccess;
    this.onError = onError;

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
    //const scanId = cell.dataset.scanId;
    const damageId = cell.dataset.damageId;
    const originalText = cell.textContent.trim();

    if (field === "observacion") {
      this.activateTextInput({
        cell,
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

  async commit({ cell, field, scanId, damageId, item, originalText }) {
    cell.classList.remove("editing");
    cell.innerHTML = `<span class="cell-value">${item.id + " - " + item.descripcion}</span>`;

    await fetch(this.updateUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        scanId,
        damageId,
        field,
        value: item.id,
      }),
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        this.onSuccess?.(data);
      })
      .catch(() => {
        this.cancel(cell, originalText);
        this.onError?.();
      });
  }

  cancel(cell, text) {
    cell.classList.remove("editing");
    cell.innerHTML = `<span class="cell-value">${text}</span>`;
  }

  activateTextInput({ cell, scanId, damageId, originalText }) {
    const input = document.createElement("input");
    input.type = "text";
    input.className = "form-control form-control-sm";
    input.value = originalText;
    input.autofocus = true;

    cell.innerHTML = "";
    cell.appendChild(input);
    input.focus();

    const commit = () => {
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
      if (e.key === "Enter") commit();
      if (e.key === "Escape") this.cancel(cell, originalText);
    });

    input.addEventListener("blur", commit);
  }

  async commitText({ cell, scanId, damageId, value, originalText }) {
    cell.innerHTML = `<span class="spinner-border spinner-border-sm"></span>`;

    await fetch(this.updateUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        scanId,
        damageId,
        field: "observacion",
        value,
      }),
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        this.onSuccess?.(data);
      })
      .catch(() => {
        this.cancel(cell, originalText);
        this.onError?.();
      });
    //   .then((res) => {
    //     if (!res.ok) throw new Error();
    //     return res.json();
    //   })
    //   .then(() => {
    //     cell.classList.remove("editing");
    //     cell.innerHTML = `<span class="cell-value">${value}</span>`;
    //   })
    //   .catch(() => {
    //     this.cancel(cell, originalText);
    //   });
  }
}
