document.addEventListener("click", function (e) {
  const link = e.target.closest("a[href]");
  if (!link) return;

  const href = link.getAttribute("href");

  // ignorar casos que no queremos animar
  if (
    href.startsWith("#") ||
    link.target === "_blank" ||
    href.startsWith("http")
  )
    return;

  e.preventDefault();

  document.body.classList.add("fade-out", "no-scroll");

  setTimeout(() => {
    window.location.href = href;
  }, 250);
});
