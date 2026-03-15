const regForm = document.getElementById("regForm");

regForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const userName = document.getElementById("nameLastname");
  const password = document.getElementById("userPass");
  const address = document.getElementById("direccion");
  const phone = document.getElementById("phone");
  const email = document.getElementById("userName");
  const sendBtn = regForm.querySelector("button[type='submit']");

  const newUser = {
    userName: userName.value,
    email: email.value,
    password: password.value,
    address: address.value,
    phone: phone.value,
  };

  try {
    sendBtn.disabled = true;
    sendBtn.innerText = "Enviando solicitud...";

    const res = await fetch("/api/register", {
      method: "POST",
      body: JSON.stringify(newUser),
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    const { message } = await res.json();

    toastInfo(message);

    if (!res.ok) {
      sendBtn.disabled = false;
      sendBtn.innerText = "Enviar";
      return;
    }

    regForm.reset();
  } catch (err) {
    toastInfo("Error inesperado");
    sendBtn.disabled = false;
    sendBtn.innerText = "Enviar";
  } finally {
    sendBtn.disabled = false;
    sendBtn.innerText = "Enviar";
  }
});
