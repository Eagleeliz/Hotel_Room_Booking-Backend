import { Router } from "express";
import { loginUser, passwordReset, updatePassword } from "./auth.controller";
import  {registerUser}  from '../auth/auth.controller';

export const authRouter = Router();

// Auth routes definition
// Register a new user
authRouter.post('/auth/register', registerUser);
authRouter.post('/auth/login', loginUser); 
authRouter.post("/auth/password-reset", passwordReset);
authRouter.post("/auth/reset/:token", updatePassword);