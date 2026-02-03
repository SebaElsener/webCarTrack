const userDataForm = document.getElementById("userDataForm");
const nameLastname = document.getElementById("nameLastname");
const direccion = document.getElementById("direccion");
const age = document.getElementById("age");
const phone = document.getElementById("phone");
const avatar = document.getElementById("avatar");
const _id = document.getElementById("_id");
const passChangeBtn = document.getElementById("passChangeBtn");
const passForm = document.getElementById("passForm");
const navBarMin = document.getElementById("navBarMin");
navBarMin.style.top = "0";

userDataForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const userInfoToUpdate = {
    userDBid: _id.value,
    name: nameLastname.value,
    address: direccion.value,
    age: age.value,
    phone: phone.value,
    avatar: avatar.value,
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
  const newPassword = await createHash(userPass.value);
  const passData = {
    userId: _id.value,
    password: actualUserPass.value,
    newPassword: newPassword,
  };
  await fetch("/api/userdata/passchange", {
    method: "POST",
    body: JSON.stringify(passData),
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((res) => res.json())
    .then((json) => {
      passForm.reset();
      passForm.style.visibility = "collapse";
      toastInfo(json);
    });
});

const createHash = async (passToHash) => {
  bcrypt = dcodeIO.bcrypt;
  const saltRounds = 10;
  return await bcrypt.hash(passToHash, saltRounds);
};
