const navBarMin = document.getElementById("navBarMin");
navBarMin.style.top = "0";

const search = document.getElementById("userSearch");

search.addEventListener("input", () => {
  const term = search.value.toLowerCase();

  document.querySelectorAll("tbody tr").forEach((row) => {
    const email = row.children[0].textContent.toLowerCase();

    row.style.display = email.includes(term) ? "" : "none";
  });
});

document.querySelectorAll(".roleSelect").forEach((select) => {
  select.addEventListener("change", async (e) => {
    const row = e.target.closest("tr");
    const userId = row.dataset.id;
    const roleId = e.target.value;

    const spinner = row.querySelector(".roleSpinner");

    spinner.classList.remove("d-none");

    try {
      const res = await fetch(`/api/userdata/${userId}/role`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role_id: roleId }),
      });

      if (!res.ok) {
        throw new Error();
      }

      showToast({
        text: "Rol actualizado",
        type: "success",
      });
    } catch (err) {
      console.error(err);

      showToast({
        text: "Error actualizando rol",
        type: "error",
      });
    } finally {
      spinner.classList.add("d-none");
    }
  });
});

document.querySelectorAll(".deleteUserBtn").forEach((btn) => {
  btn.addEventListener("click", async (e) => {
    const row = e.target.closest("tr");
    const userId = row.dataset.id;
    const email = row.children[0].textContent;

    const confirmed = await confirmModal({
      title: "Eliminar usuario",
      body: `Se eliminará el usuario <b>${email}</b><br><br>Esta acción no se puede deshacer.`,
      confirmText: "Eliminar usuario",
      confirmClass: "btn-danger",
    });

    if (!confirmed) return;

    try {
      const res = await fetch(`/api/userdata/${userId}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Error eliminando usuario");
      }

      row.remove();

      showToast({
        text: "Usuario eliminado",
        type: "success",
      });
    } catch (error) {
      showToast({
        text: error.message,
        type: "error",
      });
    }
  });
});
