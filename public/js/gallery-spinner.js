function showGallerySpinner() {
  const container = document.querySelector(".glightbox-container");
  if (!container) return;

  if (container.querySelector(".gallery-spinner")) return;

  const spinner = document.createElement("div");
  spinner.className = "gallery-spinner";
  spinner.innerHTML = `
    <div class="spinner-border text-light" role="status">
      <span class="visually-hidden">Eliminando...</span>
    </div>
  `;

  container.appendChild(spinner);
}

function hideGallerySpinner() {
  document.querySelectorAll(".gallery-spinner").forEach((el) => el.remove());
}
