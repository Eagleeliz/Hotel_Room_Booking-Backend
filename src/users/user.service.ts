import { desc, eq } from "drizzle-orm";
import db from "../drizzle/db";
import { TUserInsert, TUserSelect, userTable } from "../drizzle/schema";

// Return type: user + bookingCount
type TUserWithBookingCount = TUserSelect & { bookingCount: number };

// Get all users with booking count
export const getUsersServices = async (): Promise<TUserWithBookingCount[] | null> => {
  const users = await db.query.userTable.findMany({
    with: {
      bookings: true,
    },
    orderBy: [desc(userTable.userId)],
  });

  return users.map((user) => ({
    ...user,
    bookingCount: user.bookings.length,
  }));
};

// Get single user by ID
export const getUserByIdServices = async (userId: number): Promise<TUserSelect | undefined> => {
  return await db.query.userTable.findFirst({
    where: eq(userTable.userId, userId),
    with: {
      bookings: true,
    },
  });
};

// Create new user
export const createUserServices = async (user: TUserInsert): Promise<string | null> => {
  const existingUser = await db.query.userTable.findFirst({
    where: eq(userTable.email, user.email),
  });

  if (existingUser) {
    return null;
  }

  await db.insert(userTable).values(user).returning();
  return "User Created Successfully 😎";
};

// : Allow partial updates
export const updateUserServices = async (
  userId: number,
  user: Partial<TUserInsert>
): Promise<string> => {
  if (Object.keys(user).length === 0) {
    throw new Error("No fields provided to update");
  }

  await db.update(userTable).set(user).where(eq(userTable.userId, userId));
  return "User Updated Successfully 😎";
};

// Delete user
export const deleteUserServices = async (userId: number): Promise<string> => {
  await db.delete(userTable).where(eq(userTable.userId, userId));
  return "User Deleted Successfully";
};
