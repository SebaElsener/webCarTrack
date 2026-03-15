import { supabaseRepo } from "../persistence/factory.js";

const regController = async (req, res) => {
  const newUser = req.body;
  try {
    const createdUser = await supabaseRepo.createUser(newUser);
    res.status(200).json({ message: createdUser.message });
  } catch (error) {
    console.error("Error al crear nuevo usuario", error);
    res.status(500).json({ message: "ERROR AL CREAR USUARIO EN DB" });
  }
};

export { regController };
