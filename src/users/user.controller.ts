import { Request, Response } from "express";
import {
  createUserServices,
  deleteUserServices,
  getUserByIdServices,
  getUsersServices,
  updateUserServices,
} from "./user.service";

// ✅ Get all users
export const getUsers = async (req: Request, res: Response) => {
  try {
    const allUsers = await getUsersServices();
    if (!allUsers || allUsers.length === 0) {
      res.status(404).json({ message: "No users found" });
      return;
    }

    const usersWithoutPasswords = allUsers.map(({ password, ...rest }) => rest);
    res.status(200).json(usersWithoutPasswords);
    return;
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to fetch users" });
    return;
  }
};

// ✅ Get user by ID
export const getUserById = async (req: Request, res: Response) => {
  const userId = parseInt(req.params.id);
  if (isNaN(userId)) {
    res.status(400).json({ error: "Invalid user ID" });
    return;
  }

  try {
    const user = await getUserByIdServices(userId);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const { password, ...userWithoutPassword } = user;
    res.status(200).json(userWithoutPassword);
    return;
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to fetch user" });
    return;
  }
};

// ✅ Get logged-in user profile
export const getMyProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const user = await getUserByIdServices(userId);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const { password, ...userWithoutPassword } = user;
    res.status(200).json(userWithoutPassword);
    return;
  } catch (err) {
    res.status(500).json({ message: "Server error" });
    return;
  }
};

// ✅ Update logged-in user profile
export const updateMyProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const { firstName, lastName, email, password, contactPhone, address } = req.body;

    const updatedFields: any = {};
    if (firstName) updatedFields.firstName = firstName;
    if (lastName) updatedFields.lastName = lastName;
    if (email) updatedFields.email = email;
    if (password) updatedFields.password = password;
    if (contactPhone) updatedFields.contactPhone = contactPhone;
    if (address) updatedFields.address = address;

    if (Object.keys(updatedFields).length === 0) {
      res.status(400).json({ message: "No fields provided to update." });
      return;
    }

    const updatedMessage = await updateUserServices(userId, updatedFields);
    res.status(200).json({ message: updatedMessage });
    return;
  } catch (err: any) {
    res.status(500).json({ message: err.message || "Update failed" });
    return;
  }
};

// ✅ Create new user
export const createUser = async (req: Request, res: Response) => {
  const { firstName, lastName, email, password, contactPhone, address } = req.body;

  if (!firstName || !lastName || !email || !password || !contactPhone || !address) {
    res.status(400).json({ error: "All fields are required" });
    return;
  }

  try {
    const newUserMessage = await createUserServices({
      firstName,
      lastName,
      email,
      password,
      contactPhone,
      address,
    });

    if (newUserMessage === null) {
      res.status(409).json({ message: "User with this email already exists." });
      return;
    }

    res.status(201).json({ message: newUserMessage });
    return;
  } catch (error: any) {
    res.status(500).json({
      error: error.message || "Failed to create user due to an internal error.",
    });
    return;
  }
};

// ✅ Update ANY user (admin)
export const updateUser = async (req: Request, res: Response) => {
  const userId = parseInt(req.params.id);
  if (isNaN(userId)) {
    res.status(400).json({ error: "Invalid user ID" });
    return;
  }

  const { firstName, lastName, email, password, contactPhone, address, role } = req.body;

  const updatedFields: any = {};
  if (firstName) updatedFields.firstName = firstName;
  if (lastName) updatedFields.lastName = lastName;
  if (email) updatedFields.email = email;
  if (password) updatedFields.password = password;
  if (contactPhone) updatedFields.contactPhone = contactPhone;
  if (address) updatedFields.address = address;
  if (role) updatedFields.role = role;

  if (Object.keys(updatedFields).length === 0) {
    res.status(400).json({ error: "No fields provided to update" });
    return;
  }

  try {
    const updatedUser = await updateUserServices(userId, updatedFields);
    res.status(200).json({ message: updatedUser });
    return;
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to update user" });
    return;
  }
};

// ✅ Delete user
export const deleteUser = async (req: Request, res: Response) => {
  const userId = parseInt(req.params.id);
  if (isNaN(userId)) {
    res.status(400).json({ error: "Invalid user ID" });
    return;
  }

  try {
    const deletedUser = await deleteUserServices(userId);
    if (deletedUser) {
      res.status(200).json({ message: "User deleted successfully" });
    } else {
      res.status(404).json({ message: "User not found" });
    }
    return;
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to delete user" });
    return;
  }
};
