import db from "../drizzle/db";
import { supportTicketTable } from "../drizzle/schema";
import { sql, eq } from "drizzle-orm";
import { TSupportTicketInsert } from "../drizzle/schema";

// =========================
// Create Ticket with Duplicate Check
// =========================
export const createTicketService = async (ticket: TSupportTicketInsert) => {
  const subject = ticket.subject?.trim();

  if (!subject) {
    return null; // Subject is missing or empty
  }

  const existing = await db
    .select()
    .from(supportTicketTable)
    .where(
      sql`
        LOWER(TRIM(${supportTicketTable.subject})) = LOWER(${subject})
        AND ${supportTicketTable.userId} = ${ticket.userId}
        AND ${supportTicketTable.status} = 'Open'
      `
    )
    .limit(1);

  if (existing.length > 0) {
    return null; // Duplicate found
  }

  const [createdTicket] = await db
    .insert(supportTicketTable)
    .values({ ...ticket, subject }) // Save trimmed subject
    .returning();

  return createdTicket;
};

// =========================
// Get All Tickets
// =========================
export const getAllTicketsService = async () => {
  return await db.query.supportTicketTable.findMany({
    with: {
      user: {
        columns: {
          firstName: true,
          lastName: true,
          email: true,
          contactPhone: true,
          address: true,
          role: true,
        },
      },
    },
  });
};

// =========================
// Get Ticket by ID
// =========================
export const getTicketByIdService = async (ticketId: number) => {
  return await db.query.supportTicketTable.findFirst({
    where: eq(supportTicketTable.ticketId, ticketId),
    with: {
      user: {
        columns: {
          firstName: true,
          lastName: true,
          email: true,
          contactPhone: true,
          address: true,
          role: true,
        },
      },
    },
  });
};

// =========================
// Get Tickets by User ID
// =========================
export const getTicketsByUserIdService = async (userId: number) => {
  return await db.query.supportTicketTable.findMany({
    where: eq(supportTicketTable.userId, userId),
    with: {
      user: {
        columns: {
          firstName: true,
          lastName: true,
          email: true,
          contactPhone: true,
          address: true,
          role: true,
        },
      },
    },
  });
};

// =========================
// Filter Tickets by Status
// =========================
export const getTicketsByStatusService = async (status: string) => {
  if (status !== "Open" && status !== "Resolved") {
    throw new Error("Invalid status. Must be 'Open' or 'Resolved'.");
  }

  return await db.query.supportTicketTable.findMany({
    where: eq(supportTicketTable.status, status as "Open" | "Resolved"),
    with: {
      user: {
        columns: {
          firstName: true,
          lastName: true,
          email: true,
          contactPhone: true,
          address: true,
          role: true,
        },
      },
    },
  });
};

// =========================
// Update Ticket
// =========================
export const updateTicketService = async (
  ticketId: number,
  updates: Partial<TSupportTicketInsert>
) => {
  const updated = await db
    .update(supportTicketTable)
    .set(updates)
    .where(eq(supportTicketTable.ticketId, ticketId))
    .returning();

  return updated.length > 0;
};

// =========================
// Mark ticket as Resolved
// =========================
export const resolveTicketService = async (
  ticketId: number
): Promise<string | null> => {
  const ticket = await db.query.supportTicketTable.findFirst({
    where: eq(supportTicketTable.ticketId, ticketId),
  });

  if (!ticket) return null;
  if (ticket.status === "Resolved") return "ALREADY_RESOLVED";

  await db
    .update(supportTicketTable)
    .set({ status: "Resolved" })
    .where(eq(supportTicketTable.ticketId, ticketId));

  return "Ticket marked as resolved 🎉";
};

// =========================
// Delete Ticket
// =========================
export const deleteTicketService = async (ticketId: number) => {
  const deleted = await db
    .delete(supportTicketTable)
    .where(eq(supportTicketTable.ticketId, ticketId))
    .returning();

  return deleted.length > 0;
};

// =========================
// Reopen a Resolved Ticket
// =========================
export const reopenTicketService = async (
  ticketId: number,
  userId: number
) => {
  const ticket = await db.query.supportTicketTable.findFirst({
    where: eq(supportTicketTable.ticketId, ticketId),
  });

  if (!ticket || ticket.userId !== userId || ticket.status !== "Resolved")
    return null;

  const reopened = await db
    .update(supportTicketTable)
    .set({ status: "Open" })
    .where(eq(supportTicketTable.ticketId, ticketId))
    .returning();

  return reopened.length > 0;
};
