import {
  getByUser,
  updateUserById,
  updateRoleByUserId,
  getAllUsers,
  deleteUser,
  passBusiness,
  getTransportistasBusiness,
  postTransportistasBusiness,
  putTransportistasBusiness,
  deleteTransportistasBusiness,
} from "../business/userBusiness.js";

/// USUARIOS ///
const renderUserData = async (req, res) => {
  const userId = req.user.id;
  const userName = req.user.email;
  const permissions = req.user.permissions;
  const userData = await getByUser(userId);
  res.render("userData", {
    userData: userData[0],
    permissions: permissions,
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

const usersAdmin = async (req, res) => {
  try {
    const allUsers = await getAllUsers();
    const userName = req.user.email;
    const permissions = req.user.permissions;

    res.render("partials/usersAdmin", {
      userName: userName,
      permissions: permissions,
      users: allUsers.users,
      roles: allUsers.roles,
    });
  } catch (error) {
    console.error("Error al consultar en DB", error);
  }
};

const roleUpdate = async (req, res) => {
  const userId = req.params.userId;
  const roleId = req.body.role_id;
  try {
    const updatedRole = await updateRoleByUserId(userId, roleId);
    res.status(200).json({ updatedRole });
  } catch (error) {
    console.error("Error al actualizar en DB", error);
    res.status(500).json({ message: "Error al actualizar rol de ususario" });
  }
};

const userDelete = async (req, res) => {
  const userId = req.params.userId;

  try {
    if (req.user.id === req.params.userId) {
      return res.status(400).json({
        error: "No podés eliminar tu propio usuario",
      });
    }
    const deletedUser = await deleteUser(userId);
    res.status(200).json({ deletedUser });
  } catch (error) {
    console.error("Error al eliminar usuario en DB", error);
    res.status(500).json({ error: "Error al eliminar el usuario" });
  }
};

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

/// TRANSPORTISTAS ///
const getTransportistasController = async (req, res) => {
  try {
    const data = await getTransportistasBusiness();
    res.json(data);
  } catch (error) {
    console.error("Error al leer DB: ", error);
    res.status(500).json({
      error: "Error interno",
    });
  }
};

const postTransportistasController = async (req, res) => {
  const { transport_nbr, name } = req.body;

  try {
    const data = await postTransportistasBusiness(transport_nbr, name);
    res.json(data);
  } catch (error) {
    if (error.code === "23505") {
      return res.status(400).json({
        error: "El número de transporte ya existe",
        field: "transport_nbr",
      });
    }

    console.error("Error al crear nuevo transportista: ", error);

    res.status(500).json({
      error: "Error interno",
    });
  }
};

const putTransportistasController = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  try {
    const data = await putTransportistasBusiness(id, name);
    res.json(data);
  } catch (error) {
    if (error.code === "23505") {
      return res.status(400).json({
        error: "El número de transporte ya existe",
        field: "transport_nbr",
      });
    }

    console.error("Error al actualizar transportista: ", error);

    res.status(500).json({
      error: "Error interno",
    });
  }
};

const deleteTransportistasController = async (req, res) => {
  const { id } = req.params;
  const data = await deleteTransportistasBusiness(id);
  res.json(data);
  try {
  } catch (error) {
    if (error.code === "NOT_FOUND") {
      return res.status(404).json({
        error: "Transportista no encontrado",
      });
    }

    console.error("Error al eliminar transportista: ", error);

    res.status(500).json({
      error: "Error interno",
    });
  }
};

export {
  renderUserData,
  getUser,
  updateUser,
  roleUpdate,
  usersAdmin,
  userDelete,
  passChange,
  getTransportistasController,
  postTransportistasController,
  putTransportistasController,
  deleteTransportistasController,
};
