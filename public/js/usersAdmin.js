// const usersAdminMakeUserAdmin = document.getElementsByClassName(
//   "usersAdminMakeUserAdmin",
// );
// const usersAdminDeleteUser = document.getElementsByClassName(
//   "usersAdminDeleteUser",
// );
// const usersForm = document.getElementById("usersForm");
// const usersAdminTd = document.getElementsByClassName("usersAdminTd");

// const navBarMin = document.getElementById("navBarMin");
// navBarMin.style.top = "0";

// let adminArray = [];
// let deleteArray = [];

// // Deshabilitar los checkbox eliminar y administrador del usuario admin
// for (let i = 0; i < usersAdminTd.length; i++) {
//   if (usersAdminTd[i].innerText === "admin@admin.com") {
//     usersAdminTd[i].parentElement.children[1].children[0].disabled = "true";
//     usersAdminTd[i].parentElement.children[2].children[0].disabled = "true";
//   }
// }

// const generateUsersToDeleteAndMakeAdmin = (HTMLCollection, array) => {
//   for (let i = 0; i < HTMLCollection.length; i++) {
//     HTMLCollection[i].addEventListener("change", (e) => {
//       const userToMakeAdmin = {
//         user: e.target.id,
//         admin: e.target.checked,
//       };
//       const userIndex = array.findIndex(
//         (user) => user.user === userToMakeAdmin.user,
//       );
//       if (userIndex === -1) {
//         array.push(userToMakeAdmin);
//       } else {
//         array[userIndex].admin = userToMakeAdmin.admin;
//       }
//     });
//   }
// };

// usersForm.addEventListener("submit", async (e) => {
//   e.preventDefault();
//   if (adminArray.length !== 0) {
//     await fetch("/api/userdata/usersadm", {
//       method: "PUT",
//       body: JSON.stringify(adminArray),
//       headers: {
//         "Content-Type": "application/json",
//       },
//     })
//       .then((res) => res.json())
//       .then((json) => {
//         toastSuccess(json);
//         reload();
//       });
//   }

//   if (deleteArray.length !== 0) {
//     const usersToDelete = [];
//     deleteArray.map((user) => {
//       if (user.admin) {
//         usersToDelete.push(user.user.slice(7));
//       }
//     });
//     await fetch("/api/userdata/usersdelete", {
//       method: "DELETE",
//       body: JSON.stringify(usersToDelete),
//       headers: {
//         "Content-Type": "application/json",
//       },
//     })
//       .then((res) => res.json())
//       .then((json) => {
//         toastSuccess(json);
//         reload();
//       });
//   }
// });

// const reload = () => {
//   setTimeout(() => {
//     usersForm.reset();
//     document.location.reload();
//   }, 3000);
// };

// generateUsersToDeleteAndMakeAdmin(usersAdminMakeUserAdmin, adminArray);
// generateUsersToDeleteAndMakeAdmin(usersAdminDeleteUser, deleteArray);

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
      const res = await fetch(`/api/users/${userId}/role`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role_id: roleId }),
      });

      if (!res.ok) throw new Error();

      showToast({
        text: "Rol actualizado",
        type: "success",
      });
    } catch {
      showToast({
        text: "Error actualizando rol",
        type: "error",
      });
    }

    spinner.classList.add("d-none");
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
      const res = await fetch(`/api/users/${userId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error();

      row.remove();

      showToast({
        text: "Usuario eliminado",
        type: "success",
      });
    } catch {
      showToast({
        text: "Error eliminando usuario",
        type: "error",
      });
    }
  });
});
