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
  const appRoot = document.getElementById("app-root");
  appRoot.classList.add("fade-out", "no-scroll");

  setTimeout(() => {
    window.location.href = href;
  }, 250);
});

window.addEventListener("pageshow", () => {
  const appRoot = document.getElementById("app-root");
  appRoot.classList.remove("fade-out", "no-scroll");
  appRoot.style.opacity = "1";
});

// Listener link logout en header
document.addEventListener("click", async (e) => {
  const logoutLink = e.target.closest("#logoutLink");
  if (!logoutLink) return;

  e.preventDefault();

  await fetch("/api/logout", {
    method: "POST",
    credentials: "include",
  });

  window.location.href = "/api/logout";
});
