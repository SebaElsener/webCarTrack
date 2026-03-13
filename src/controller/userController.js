import {
  getByUser,
  updateUserById,
  // updateUserWithCart,
  // purchase,
  //getAllUsers,
  // makeUsersAdmin,
  // deleteUsers,
  passBusiness,
} from "../business/userBusiness.js";

const renderUserData = async (req, res) => {
  const userId = req.user.id;
  const userName = req.user.email;
  const userData = await getByUser(userId);
  res.render("userData", {
    userData: userData[0],
    userName: userName,
  });
};

const getUser = async (req, res) => {
  const userName = req.user.sub;
  res.json(await getByUser(userName));
};

const updateUser = async (req, res) => {
  const userDBid = req.body.userId;
  const userInfoToUpdate = {
    name: req.body.name,
    address: req.body.address,
    phone: req.body.phone,
  };
  res.json(await updateUserById(userDBid, userInfoToUpdate));
};

// const addCartToUser = async (req, res) => {
//   const cartId = { cartId: req.body.cartId };
//   const userId = req.body.userId;
//   res.json(updateUserWithCart(userId, cartId));
// };

// const purchaseOrder = async (req, res) => {
//   const userName = req.user.sub;
//   const orderNbr = await purchase(userName);
//   res.json(`Orden ${orderNbr} generada con exito`);
// };

const usersAdmin = async (req, res) => {
  const allUsers = await getAllUsers();
  const userName = req.user.sub;
  res.render("partials/usersAdmin", {
    allUsers: allUsers,
    userName: userName,
  });
};

// const usersAdm = async (req, res) => {
//   const users = req.body;
//   res.json(await makeUsersAdmin(users));
// };

// const usersDelete = async (req, res) => {
//   const users = req.body;
//   res.json(await deleteUsers(users));
// };

const passChange = async (req, res) => {
  const userEmail = req.user.email;
  const userId = req.user.id;

  const passData = { userEmail, userId, ...req.body };

  try {
    const result = await passBusiness(passData);

    if (!result.ok) {
      return res.status(400).json({ message: result.message });
    }

    res.status(200).json({ message: result.message });
  } catch (error) {
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

export {
  renderUserData,
  getUser,
  updateUser,
  // addCartToUser,
  // purchaseOrder,
  usersAdmin,
  // usersAdm,
  // usersDelete,
  passChange,
};
