import { desc, eq } from "drizzle-orm";
import db from "../drizzle/db";
import { TUserInsert, TUserSelect, userTable } from "../drizzle/schema";

//Get all Users
// Define a new return type: user + bookingCount
type TUserWithBookingCount = TUserSelect & { bookingCount: number };

export const getUsersServices = async (): Promise<TUserWithBookingCount[] | null> => {
  const users = await db.query.userTable.findMany({
    with: {
      bookings: true,
    },
    orderBy: [desc(userTable.userId)],
  });

  // Add bookingCount to each user
  return users.map((user) => ({
    ...user,
    bookingCount: user.bookings.length,
  }));
};


//Get user by Id
export const getUserByIdServices = async(userId: number):Promise<TUserSelect | undefined>=> {
      return await db.query.userTable.findFirst({
          where: eq(userTable.userId,userId),
          with:{
        bookings:true
      }
      }) 
}

//create a new user
export const createUserServices = async(user:TUserInsert):Promise<string | null>  => {
    // 1. Check if user with this email already exists
    const existingUser = await db.query.userTable.findFirst({
        where: eq(userTable.email, user.email)
    });
    if (existingUser) {
        // If a user with this email is found, return null or throw a specific error
        return null; // Indicates a conflict
    }
       await db.insert(userTable).values(user).returning();
        return "User Created Successfully 😎"
}

//update an existing user
export const updateUserServices = async(userId: number, user:TUserInsert):Promise<string> => {
    await db.update(userTable).set(user).where(eq(userTable.userId,userId));
    return "User Updated Succeffully 😎";
}

//delete user
export const deleteUserServices = async(userId: number):Promise<string> => {
   await db.delete(userTable).where(eq(userTable.userId,userId));
   return "User Delete Sucessfully";
}