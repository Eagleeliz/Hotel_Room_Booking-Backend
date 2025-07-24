import { Router } from "express";
import { createUser, deleteUser, getMyProfile, getUserById, getUsers, updateMyProfile, updateUser } from "./user.controller";
import { adminOnly, anyAuthenticatedUser } from "../middleware/bearAuth";
// import { adminRoleAuth,} from "../middleware/bearAuth";

export const userRouter = Router();

// User routes definition

userRouter.get("/users/me", anyAuthenticatedUser, getMyProfile);
//update my profile
userRouter.put("/users/me", anyAuthenticatedUser, updateMyProfile);

// Get all users
userRouter.get('/users', getUsers);


// Get user by ID
userRouter.get('/users/:id', getUserById);

// Create a new user
userRouter.post('/users', createUser);

// Update an existing user
userRouter.put('/users/:id',updateUser);


// Delete an existing user
userRouter.delete('/users/:id',deleteUser);