document.addEventListener("click", (e) => {
  const link = e.target.closest("a[href]");
  if (!link) return;

  const href = link.getAttribute("href");
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

window.addEventListener("pageshow", () => {
  document.body.classList.remove("fade-out", "no-scroll");
  document.body.style.opacity = "1";
});
