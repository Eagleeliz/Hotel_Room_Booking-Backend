import { Request, Response } from "express";
import { createUserServices, deleteUserServices, getUserByIdServices, getUsersServices, updateUserServices } from "./user.service";
import { createUserValidator,userLogInValidator,updateUserValidator } from "../validation/user.validator";

//get users
export const getUsers = async (req: Request, res: Response) => {
    try {
        const allUsers = await getUsersServices();
        if (allUsers == null || allUsers.length == 0) {
          res.status(404).json({ message: "No users found" });
        }else{
     // Remove password from each user object before sending response
            const usersWithoutPasswords = allUsers.map(({ password, ...user }) => user);
            res.status(200).json(usersWithoutPasswords);
                       
        }            
    } catch (error:any) {
        res.status(500).json({ error:error.message || "Failed to fetch users" });
    }
}

//get user by id
export const getUserById = async (req: Request, res: Response) => {
    const userId = parseInt(req.params.id);
    if (isNaN(userId)) {
        res.status(400).json({ error: "Invalid user ID" });
         return; // Prevent further execution
    } 
    try {
        const user = await getUserByIdServices(userId);
        if (user == undefined) {
            res.status(404).json({ message: "User not found" });
        } else {
           // Remove password from each user object before sending response
          const { password, ...userWithoutPassword } = user;
            res.status(200).json(userWithoutPassword);
        }
    } catch (error:any) {
        res.status(500).json({ error:error.message || "Failed to fetch user" });
    }
}

//getuserme


export const getMyProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId; // ✅ comes from your authMiddleware

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return 
    }

    const user = await getUserByIdServices(userId);

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return 
    }

    const { password, ...userWithoutPassword } = user;
res.status(200).json(userWithoutPassword);

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

//update my profile
export const updateMyProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const { firstName, lastName, email, password, contactPhone, address } = req.body;

    // Only include fields that are provided in the request
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
  } catch (err: any) {
    res.status(500).json({ message: err.message || "Update failed" });
  }
};



//create a new user
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
            address
        });

        if (newUserMessage === null) {
            res.status(409).json({ message: "User with this email already exists." });
             return
        } else {
            res.status(201).json({ message: newUserMessage });
            return
        }
    } catch (error: any) {
        console.error("Error creating user:", error);
       res.status(500).json({ error: error.message || "Failed to create user due to an internal error." });
         return
    }
};

//update user
export const updateUser = async (req: Request, res: Response) => {
    const userId = parseInt(req.params.id);
    if (isNaN(userId)) {
        res.status(400).json({ error: "Invalid user ID" });
        return; // Prevent further execution
    }
    const { firstName,lastName, email, password ,contactPhone,address  } = req.body;
    if (!firstName || !lastName || !email || !password || !contactPhone || !address ) {
        res.status(400).json({ error: "All fields are required" });
        return; // Prevent further execution
    }
    try {
        const updatedUser = await updateUserServices(userId, { firstName,lastName, email, password,contactPhone,address });
        if (updatedUser == null) {
            res.status(404).json({ message: "User not found or failed to update" });
        } else {
            res.status(200).json({message:updatedUser});
        }
    } catch (error:any) {
        res.status(500).json({ error:error.message || "Failed to update user" });
    }
}

//delete user
export const deleteUser = async (req: Request, res: Response) => {
    const userId = parseInt(req.params.id);  
    if (isNaN(userId)) {
        res.status(400).json({ error: "Invalid user ID" });
        return; // Prevent further execution
    }
    try {
        const deletedUser = await deleteUserServices(userId);
        if (deletedUser) {
            res.status(200).json({ message: "User deleted successfully" });
        } else {
            res.status(404).json({ message: "User not found" });
        }
    } catch (error:any) {    
        res.status(500).json({ error:error.message || "Failed to delete user" });
    }    
}