import { Router } from "express";
import {
  createUser,
  deleteUser,
  getMyProfile,
  getUserById,
  getUsers,
  updateMyProfile,
  updateUser,
} from "./user.controller";
import { adminOnly, anyAuthenticatedUser } from "../middleware/bearAuth";

export const userRouter = Router();

// ✅ Logged-in user's routes
userRouter.get("/users/me", anyAuthenticatedUser, getMyProfile);
userRouter.put("/users/me", anyAuthenticatedUser, updateMyProfile);

// ✅ Admin/user routes
userRouter.get("/users", getUsers);
userRouter.get("/users/:id", getUserById);

// ✅ IMPORTANT: Put updateUser BEFORE createUser to avoid route conflict
userRouter.put("/users/:id", updateUser);

// ✅ Create and delete users
userRouter.post("/users", createUser);
userRouter.delete("/users/:id", deleteUser);
