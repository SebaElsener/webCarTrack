const userDataForm = document.getElementById("userDataForm");
const nameLastname = document.getElementById("nameLastname");
const direccion = document.getElementById("direccion");
const phone = document.getElementById("phone");
const _id = document.getElementById("_id");
const passChangeBtn = document.getElementById("passChangeBtn");
const passForm = document.getElementById("passForm");
const navBarMin = document.getElementById("navBarMin");
navBarMin.style.top = "0";

userDataForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const userInfoToUpdate = {
    userId: _id.value,
    name: nameLastname.value,
    address: direccion.value,
    phone: phone.value,
  };
  await fetch("/api/userdata/", {
    method: "POST",
    body: JSON.stringify(userInfoToUpdate),
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((res) => res.json())
    .then((json) => {
      toastSuccess("DATOS ACTUALIZADOS CON EXITO");
    });
});

passChangeBtn.addEventListener("click", () => {
  passForm.style.visibility = "visible";
  passForm.style.opacity = "1";
});

passForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const actualUserPass = document.getElementById("actualUserPass");
  const newPassword = document.getElementById("userPass");
  const sendBtn = passForm.querySelector("button[type='submit']");

  const passData = {
    userId: _id.value,
    password: actualUserPass.value,
    newPassword: newPassword.value,
  };

  try {
    sendBtn.disabled = true;
    sendBtn.innerText = "Actualizando...";

    const res = await fetch("/api/userdata/passchange", {
      method: "POST",
      body: JSON.stringify(passData),
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    const { message } = await res.json();

    toastInfo(message);
    sessionStorage.setItem("toastMessage", message);

    if (!res.ok) {
      sendBtn.disabled = false;
      sendBtn.innerText = "Cambiar";
      return;
    }

    passForm.reset();
    passForm.style.visibility = "collapse";

    await fetch("/api/logout", {
      method: "POST",
      credentials: "include",
    });

    setTimeout(async () => {
      window.location.href = "/api/login";
    }, 1500);
  } catch (err) {
    toastInfo("Error inesperado");
    sendBtn.disabled = false;
    sendBtn.innerText = "Cambiar";
  }
});
