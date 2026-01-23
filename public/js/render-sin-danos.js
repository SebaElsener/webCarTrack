function renderSinDaniosCascada() {
  const rows = Array.from(document.querySelectorAll(".resultadosVINtr"));

  if (!rows.length) return;

  const mainRow = rows[0];
  const extraRows = rows.slice(1);

  const STEP_DELAY = 120; // ms entre filas

  // 1️⃣ colapsar filas extra en cascada (de abajo hacia arriba)
  extraRows.reverse().forEach((row, i) => {
    setTimeout(() => {
      row.classList.add("row-collapsing");

      setTimeout(() => {
        row.remove();
      }, 220);
    }, i * STEP_DELAY);
  });

  // 2️⃣ cuando termina la cascada → transformar fila principal
  const totalDelay = extraRows.length * STEP_DELAY + 160;

  setTimeout(() => {
    const editableCells = mainRow.querySelectorAll(".editable-cell");
    if (!editableCells.length) return;

    // fade out actual
    editableCells.forEach((cell) => {
      cell.classList.add("cell-fade");
      cell.style.opacity = "0";
    });

    setTimeout(() => {
      const sinDaniosTd = document.createElement("td");
      sinDaniosTd.className = "editable-cell text-center";
      sinDaniosTd.colSpan = editableCells.length;
      sinDaniosTd.textContent = "Sin daños";
      sinDaniosTd.style.opacity = "0";

      editableCells[0].replaceWith(sinDaniosTd);
      editableCells.forEach((cell, i) => {
        if (i > 0) cell.remove();
      });

      requestAnimationFrame(() => {
        sinDaniosTd.classList.add("cell-fade");
        sinDaniosTd.style.opacity = "1";
      });
    }, 160);
  }, totalDelay);
}
