import { supabaseRepo } from "../persistence/factory.js";

/// USUARIOS ///

const getByUser = async (userName) => {
  const user = await supabaseRepo.getByUser(userName);
  return user;
};

const getAllUsers = async () => {
  const getUsers = await supabaseRepo.getAllUsers();
  const getRoles = await supabaseRepo.getRoles();
  return { users: getUsers, roles: getRoles };
};

const updateUserById = async (userId, userInfoToUpdate) => {
  return await supabaseRepo.updateUserById(userId, userInfoToUpdate);
};

const updateRoleByUserId = async (userId, roleId) => {
  const updateUserRole = await supabaseRepo.updateRoleByUserId(userId, roleId);
  return updateUserRole;
};

const passBusiness = async (passData) => {
  const validPassword = await supabaseRepo.passChange(passData);
  return validPassword;
};

const deleteUser = async (userId) => {
  const deleteResult = await supabaseRepo.deleteUserById(userId);
  return deleteResult;
};

/// TRANSPORTISTAS ///
const getTransportistasBusiness = async () => {
  return await supabaseRepo.getTransportistas();
};

const postTransportistasBusiness = async (transport_nbr, name) => {
  return await supabaseRepo.postNewTransportista(transport_nbr, name);
};

const putTransportistasBusiness = async (id, name) => {
  return await supabaseRepo.updateTransportista(id, name);
};

const deleteTransportistasBusiness = async (id) => {
  return await supabaseRepo.deleteTransportista(id);
};

export {
  getByUser,
  updateUserById,
  updateRoleByUserId,
  getAllUsers,
  passBusiness,
  deleteUser,
  getTransportistasBusiness,
  postTransportistasBusiness,
  putTransportistasBusiness,
  deleteTransportistasBusiness,
};
