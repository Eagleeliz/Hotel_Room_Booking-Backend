import db from "../drizzle/db";
import { TUserInsert, TUserSelect, userTable } from "../drizzle/schema";
import { eq } from "drizzle-orm";


//register user
export const registerUserService = async(user: TUserInsert): Promise<string> => {
    await db.insert(userTable).values({
       firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        password: user.password,
        role: user.role,
        contactPhone:user.contactPhone,
        address:user.address
        // confirmationCode: user.confirmationCode,  // ✅ explicitly added
    });

    return "User registered successfully";
}

//getUserByEmail
export const getUserByEmailService = async(email: string): Promise<TUserSelect | undefined> => {
    const user = await db.query.userTable.findFirst({
        where: eq(userTable.email, email)
    });
    return user;
}

//updateUserPassword
export const updateUserPasswordService = async (email: string, newPassword: string): Promise<string> => {
    const result = await db.update(userTable)
        .set({ password: newPassword })
        .where(eq(userTable.email, email))
        .returning();

    if (result.length === 0) {
        throw new Error("User not found or password update failed");
    }
    
    return "Password updated successfully";
}

//getUserById
export const getUserById = async(id: number):Promise<TUserSelect | undefined> => {
    const user = await db.query.userTable.findFirst({
        where: eq(userTable.userId, id)
    });

    return user;

}

