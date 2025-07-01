// drizzle/schema.ts
import {
  pgTable,
  serial,
  varchar,
  text,
  timestamp,
  integer,
  boolean,
  numeric,
  date,
  pgEnum
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
// ============================
// Enums
// ============================

export const userRole = pgEnum("userRole", ["user", "admin"]);
export const bookingStatus = pgEnum("bookingStatus", ["Pending", "Confirmed", "Cancelled"]);
export const paymentStatus = pgEnum("paymentStatus", ["Pending", "Completed", "Failed"]);
export const ticketStatus = pgEnum("ticketStatus", ["Open", "Resolved"]);

// ============================
// Users Table
// ============================

export const userTable = pgTable("users", {
  userId: serial("userId").primaryKey(),
  firstName: varchar("firstName", { length: 100 }),
  lastName: varchar("lastName", { length: 100 }),
  email: varchar("email", { length: 255 }).unique().notNull(),
  password: varchar("password", { length: 255 }).notNull(),
  contactPhone: varchar("contactPhone", { length: 20 }),
  address: text("address"),
  role: userRole("role").default("user"),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow()
});

// ============================
// Hotels Table
// ============================

export const hotelTable = pgTable("hotels", {
  hotelId: serial("hotelId").primaryKey(),
  name: varchar("name", { length: 150 }).notNull(),
  location: varchar("location", { length: 100 }).notNull(),
  address: text("address"),
  contactPhone: varchar("contactPhone", { length: 20 }),
  category: varchar("category", { length: 50 }),
  rating: integer("rating"),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow()
});

// ============================
// Rooms Table
// ============================

export const roomTable = pgTable("rooms", {
  roomId: serial("roomId").primaryKey(),
  hotelId: integer("hotelId")
    .references(() => hotelTable.hotelId, { onDelete: "cascade" })
    .notNull(),
  roomType: varchar("roomType", { length: 100 }),
  pricePerNight: numeric("pricePerNight", { precision: 10, scale: 2 }),
  capacity: integer("capacity"),
  amenities: text("amenities"),
  isAvailable: boolean("isAvailable").default(true),
  createdAt: timestamp("createdAt").defaultNow()
});

// ============================
// Bookings Table
// ============================

export const bookingTable = pgTable("bookings", {
  bookingId: serial("bookingId").primaryKey(),
  userId: integer("userId")
    .references(() => userTable.userId, { onDelete: "cascade" }),
  roomId: integer("roomId")
    .references(() => roomTable.roomId, { onDelete: "cascade" }),
  checkInDate: date("checkInDate").notNull(),
  checkOutDate: date("checkOutDate").notNull(),
  totalAmount: numeric("totalAmount", { precision: 10, scale: 2 }),
  bookingStatus: bookingStatus("bookingStatus").default("Pending"),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow()
});

// ============================
// Payments Table
// ============================

export const paymentTable = pgTable("payments", {
  paymentId: serial("paymentId").primaryKey(),
  bookingId: integer("bookingId")
    .references(() => bookingTable.bookingId, { onDelete: "cascade" }),
  amount: numeric("amount", { precision: 10, scale: 2 }),
  paymentStatus: paymentStatus("paymentStatus").default("Pending"),
  paymentMethod: varchar("paymentMethod", { length: 50 }),
  transactionId: varchar("transactionId", { length: 255 }),
  paymentDate: timestamp("paymentDate").defaultNow(),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow()
});

// ============================
// Support Tickets Table
// ============================

export const supportTicketTable = pgTable("supportTickets", {
  ticketId: serial("ticketId").primaryKey(),
  userId: integer("userId")
    .references(() => userTable.userId, { onDelete: "cascade" }),
  subject: varchar("subject", { length: 200 }),
  description: text("description"),
  status: ticketStatus("status").default("Open"),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow()
});

// ============================
// Relations
// ============================

export const userRelations = relations(userTable, ({ many }) => ({
  bookings: many(bookingTable),
  supportTickets: many(supportTicketTable)
}));

export const hotelRelations = relations(hotelTable, ({ many }) => ({
  rooms: many(roomTable)
}));

export const roomRelations = relations(roomTable, ({ one, many }) => ({
  hotel: one(hotelTable, {
    fields: [roomTable.hotelId],
    references: [hotelTable.hotelId]
  }),
  bookings: many(bookingTable)
}));

export const bookingRelations = relations(bookingTable, ({ one }) => ({
  user: one(userTable, {
    fields: [bookingTable.userId],
    references: [userTable.userId]
  }),
  room: one(roomTable, {
    fields: [bookingTable.roomId],
    references: [roomTable.roomId]
  }),
  payment: one(paymentTable, {
    fields: [bookingTable.bookingId],
    references: [paymentTable.bookingId]
  })
}));

export const paymentRelations = relations(paymentTable, ({ one }) => ({
  booking: one(bookingTable, {
    fields: [paymentTable.bookingId],
    references: [bookingTable.bookingId]
  })
}));

export const supportTicketRelations = relations(supportTicketTable, ({ one }) => ({
  user: one(userTable, {
    fields: [supportTicketTable.userId],
    references: [userTable.userId]
  })
}));

// ============================
// Infer Types (TNameInsert/Select)
// ============================

export type TUserInsert = typeof userTable.$inferInsert;
export type TUserSelect = typeof userTable.$inferSelect;

export type THotelInsert = typeof hotelTable.$inferInsert;
export type THotelSelect = typeof hotelTable.$inferSelect;

export type TRoomInsert = typeof roomTable.$inferInsert;
export type TRoomSelect = typeof roomTable.$inferSelect;

export type TBookingInsert = typeof bookingTable.$inferInsert;
export type TBookingSelect = typeof bookingTable.$inferSelect;

export type TPaymentInsert = typeof paymentTable.$inferInsert;
export type TPaymentSelect = typeof paymentTable.$inferSelect;

export type TSupportTicketInsert = typeof supportTicketTable.$inferInsert;
export type TSupportTicketSelect = typeof supportTicketTable.$inferSelect;
