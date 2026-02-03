const usersAdminMakeUserAdmin = document.getElementsByClassName(
  "usersAdminMakeUserAdmin",
);
const usersAdminDeleteUser = document.getElementsByClassName(
  "usersAdminDeleteUser",
);
const usersForm = document.getElementById("usersForm");
const usersAdminTd = document.getElementsByClassName("usersAdminTd");

const navBarMin = document.getElementById("navBarMin");
navBarMin.style.top = "0";

let adminArray = [];
let deleteArray = [];

// Deshabilitar los checkbox eliminar y administrador del usuario admin
for (let i = 0; i < usersAdminTd.length; i++) {
  if (usersAdminTd[i].innerText === "admin@admin.com") {
    usersAdminTd[i].parentElement.children[1].children[0].disabled = "true";
    usersAdminTd[i].parentElement.children[2].children[0].disabled = "true";
  }
}

const generateUsersToDeleteAndMakeAdmin = (HTMLCollection, array) => {
  for (let i = 0; i < HTMLCollection.length; i++) {
    HTMLCollection[i].addEventListener("change", (e) => {
      const userToMakeAdmin = {
        user: e.target.id,
        admin: e.target.checked,
      };
      const userIndex = array.findIndex(
        (user) => user.user === userToMakeAdmin.user,
      );
      if (userIndex === -1) {
        array.push(userToMakeAdmin);
      } else {
        array[userIndex].admin = userToMakeAdmin.admin;
      }
    });
  }
};

usersForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (adminArray.length !== 0) {
    await fetch("/api/userdata/usersadm", {
      method: "PUT",
      body: JSON.stringify(adminArray),
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((json) => {
        toastSuccess(json);
        reload();
      });
  }

  if (deleteArray.length !== 0) {
    const usersToDelete = [];
    deleteArray.map((user) => {
      if (user.admin) {
        usersToDelete.push(user.user.slice(7));
      }
    });
    await fetch("/api/userdata/usersdelete", {
      method: "DELETE",
      body: JSON.stringify(usersToDelete),
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((json) => {
        toastSuccess(json);
        reload();
      });
  }
});

const reload = () => {
  setTimeout(() => {
    usersForm.reset();
    document.location.reload();
  }, 3000);
};

generateUsersToDeleteAndMakeAdmin(usersAdminMakeUserAdmin, adminArray);
generateUsersToDeleteAndMakeAdmin(usersAdminDeleteUser, deleteArray);
