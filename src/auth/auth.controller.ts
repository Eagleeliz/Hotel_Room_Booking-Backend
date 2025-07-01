import { Request, Response } from "express";
import { getUserByEmailService, getUserById, registerUserService
    , updateUserPasswordService,
    //  updateVerificationStatusService 
} from "./auth.service";
import { createUserValidator, userLogInValidator } from "../validation/user.validator";
import { sendNotificationEmail } from "../middleware/googlemailer";

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken"
//  import { sendNotificationEmail } from "../middleware/nodeMailer";


//register user
export const registerUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const parseResult = createUserValidator.safeParse(req.body);
    console.log("Register payload", req.body);

    if (!parseResult.success) {
      res.status(400).json({ error: parseResult.error.issues });
      return;
    }

    const user = parseResult.data;

    const existingUser = await getUserByEmailService(user.email);
    if (existingUser) {
      res.status(400).json({ error: "User with this email already exists" });
      return;
    }

    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(user.password, salt);
    user.password = hashedPassword;

    const newUser = await registerUserService(user);

    const fullName = `${user.firstName} ${user.lastName}`;

    let emailNotification;
    try {
      emailNotification = await sendNotificationEmail(
        user.email,
        fullName,
        "Account Created Successfully 🌟",
        "Welcome to our Food Services!"
      );
    } catch (emailError: any) {
      console.error("Email send failed:", emailError.message);
      emailNotification = "Email sending failed";
    }

    res.status(201).json({
      message: "User created ✅. Check your email 📩 for confirmation.",
      user: newUser,
      emailNotification,
    });

  } catch (error: any) {
    console.error("Register error:", error.message);
    res.status(500).json({ error: error.message || "Failed to register user" });
  }
};


//LOGIN USER
export const loginUser = async(req: Request, res:Response) => {
    try{

    const parseResult= userLogInValidator.safeParse(req.body)

    if(!parseResult.success){
        res.status(404).json({error: parseResult.error.issues})
        return;
    }
    const user =parseResult.data;
    //if user exists

    const userExists = await getUserByEmailService(user.email);
     if(!userExists){
        res.status(404).json({error: " User does not exist"})
        return;
     }
     //if email is verified

    //  if (userExists.emailVerified === false){
    //     res.status(404).json({error: "Please Verify Email"})
    //     return;
    //  }

     //to check is passwords match
     const isMatch = bcrypt.compareSync(user.password,userExists.password);
     if(!isMatch){
        res.status(404).json({error:"Invalid password"})
     }

     //generate token

     const payload= {
        userId:userExists.userId,
        userEmail:userExists.email,
        role:userExists.role,
        firstName: userExists.firstName, 
        lastName: userExists.lastName,
        contactPhone:userExists.contactPhone,
        address:userExists.address,
        //expiry 
        exp: Math.floor(Date.now() / 1000) + (60 * 60)
     }
      let secret = process.env.JWT_SECRET as string;

        //check if sending is good
        console.log("LoginUser - Secret used for signing:", secret);
        console.log("LoginUser - Is secret empty or undefined?", !secret);
        
        const token = jwt.sign(payload, secret);
            //
            console.log("LoginUser - Generated token (first 30 chars):", token.substring(0, 30) + '...');
        res.status(200).json({ token,
             userId: userExists.userId, 
             email: userExists.email, 
              role: userExists.role,
             firstName: userExists.firstName,
             lastName: userExists.lastName,
             contactPhone:userExists.contactPhone,
              address:userExists.address 
            });
              } catch (error:any) {
        res.status(500).json({ error:error.message || "Failed to login user" });
    }
}

//password reset
export const passwordReset = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({ error: "Email is required" });
      return;
    }

    const user = await getUserByEmailService(email);
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const secret = process.env.JWT_SECRET as string;
    const resetToken = jwt.sign({ userId: user.userId }, secret, { expiresIn: "1h" });

    const results = await sendNotificationEmail(
      email,
      user.firstName ?? "User",
      "Password Reset",
      `Click the link to reset your password: <a href="http://localhost:5000/api/auth/reset/${resetToken}">Reset Password</a>`
    );

    if (!results) {
      res.status(500).json({ error: "Failed to send reset email" });
      return;
    }

    res.status(200).json({
      message: "Password reset email sent successfully",
      resetToken
    });

  } catch (error: any) {
    console.error("Password reset error:", error.message);
    res.status(500).json({
      error: error.message || "Failed to reset password"
    });
  }
};



//updatePassword
export const updatePassword = async (req: Request, res: Response) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        if (!token) {
            res.status(400).json({ error: "Token is required" });
            return;
        }

        if (!password) {
            res.status(400).json({ error: "Password is required" });
            return;
        }

        const secret = process.env.JWT_SECRET as string;
        const payload: any = jwt.verify(token, secret);

        // Fetch user by ID from getUserById service
        const user = await getUserById(payload.userId);

        console.log(user);

        if (!user) {
            res.status(404).json({ error: "User not found" });
            return;
        }

        const salt = bcrypt.genSaltSync(10);
        const hashedPassword = bcrypt.hashSync(password, salt);

        // Now use the user's email from DB
         await updateUserPasswordService(user.email, hashedPassword);

        // res.status(200).json({ message: "Password has been reset successfully" });

    } catch (error: any) {
        res.status(500).json({ error: error.message || "Invalid or expired token" });
    }
};
//EmailVerfication
