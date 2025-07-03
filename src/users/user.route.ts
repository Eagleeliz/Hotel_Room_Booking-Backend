import { Router } from "express";
import { createUser, deleteUser, getUserById, getUsers, updateUser } from "./user.controller";
import { adminOnly, anyAuthenticatedUser } from "../middleware/bearAuth";
// import { adminRoleAuth,} from "../middleware/bearAuth";

export const userRouter = Router();

// User routes definition


// Get all users
userRouter.get('/users', getUsers);

// Get user by ID
userRouter.get('/users/:id', getUserById);

// Create a new user
userRouter.post('/users', createUser);

// Update an existing user
userRouter.put('/users/:id',anyAuthenticatedUser,updateUser);


// Delete an existing user
userRouter.delete('/users/:id', adminOnly,deleteUser);