import { supabaseRepo } from "../persistence/factory.js";
import { updateDamages } from "./updateDamagesBusiness.js";

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

export {
  getByUser,
  updateUserById,
  updateRoleByUserId,
  getAllUsers,
  passBusiness,
  deleteUser,
};
