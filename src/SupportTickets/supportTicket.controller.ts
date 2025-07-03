import { Request, Response } from "express";
import {
  createTicketService,
  getAllTicketsService,
  getTicketByIdService,
  getTicketsByStatusService,
  updateTicketService,
  deleteTicketService,
  reopenTicketService,
  resolveTicketService
} from "../SupportTickets/supportTicket.service";
import { supportTicketValidator } from "../validation/supportTicket.validator";

// ===============================
// Create Ticket
// ===============================
export const createTicket = async (req: Request, res: Response) => {
  try {
    const validated = supportTicketValidator.parse(req.body);
    const ticket = await createTicketService(validated);

    if (!ticket) {
      res.status(409).json({
        message: "A similar open ticket already exists. Please wait for it to be resolved."
      });

       return;
    }

    res.status(201).json({
      message: "Support ticket created successfully 🎫",
      ticket
    }); return
  } catch (error: any) {
     res.status(400).json({
      error: error.message || "Failed to create ticket"
    });
    return;
  }
};

// ===============================
// Get All Tickets
// ===============================
export const getAllTickets = async (_req: Request, res: Response) => {
  try {
    const tickets = await getAllTicketsService();
    if (!tickets || tickets.length === 0) {
       res.status(404).json({ message: "No support tickets found" });
       return
    }
    res.status(200).json({
      message: "Tickets retrieved successfully ✅",
      tickets
    });
     return
  } catch (error: any) {
    res.status(500).json({
      error: error.message || "Failed to fetch tickets"
    });
    return
  }
};

// ===============================
// Get Ticket by ID
// ===============================
export const getTicketById = async (req: Request, res: Response) => {
  const ticketId = parseInt(req.params.id);
  if (isNaN(ticketId)) {
    res.status(400).json({ error: "Invalid ticket ID" });
     return
  }

  try {
    const ticket = await getTicketByIdService(ticketId);
    if (!ticket) {
      res.status(404).json({ message: "Ticket not found" });
      return 
    }
    res.status(200).json({ message: "Ticket retrieved successfully ✅", ticket });
    return 
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to get ticket" });
     return
  }
};

// ===============================
// Filter Tickets by Status
// ===============================
export const getTicketsByStatus = async (req: Request, res: Response) => {
  const status = req.params.status;

  if (status !== "Open" && status !== "Resolved") {
    res.status(400).json({
      message: "Invalid status. Use either 'Open' or 'Resolved'."
    });
     return
  }

  try {
    const tickets = await getTicketsByStatusService(status);
    if (!tickets || tickets.length === 0) {
       res.status(404).json({ message: `No '${status}' tickets found` });
       return
    }

    res.status(200).json({
      message: `Tickets with status '${status}' retrieved successfully ✅`,
      tickets
    });
     return
  } catch (error: any) {
     res.status(500).json({ error: error.message || "Failed to filter tickets" });
      return
  }
};

// ===============================
// Update Ticket
// ===============================
export const updateTicket = async (req: Request, res: Response) => {
  const ticketId = parseInt(req.params.id);
  if (isNaN(ticketId)) {
     res.status(400).json({ error: "Invalid ticket ID" });
      return
  }

  try {
    const updated = await updateTicketService(ticketId, req.body);
    if (!updated) {
      res.status(404).json({ message: "Ticket not found or not updated" });
       return
    }

     res.status(200).json({ message: "Ticket updated successfully ✅" });
      return
  } catch (error: any) {
     res.status(500).json({ error: error.message || "Failed to update ticket" });
      return
  }
};
  //resolve ticket
export const resolveTicket = async (req: Request, res: Response) => {
  const ticketId = parseInt(req.params.id);

  if (isNaN(ticketId)) {
     res.status(400).json({ message: "Invalid ticket ID" });
     return;
  }

  try {
    const result = await resolveTicketService(ticketId);

    if (result === null) {
       res.status(404).json({ message: "Ticket not found" });
       return
    }

    if (result === "ALREADY_RESOLVED") {
      res.status(409).json({ message: "Ticket is already resolved" });
      return
    }

    res.status(200).json({ message: result });
    return
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to resolve ticket" });
    return
  }
};
  
// ===============================
// Delete Ticket
// ===============================
export const deleteTicket = async (req: Request, res: Response) => {
  const ticketId = parseInt(req.params.id);
  if (isNaN(ticketId)) {
   res.status(400).json({ error: "Invalid ticket ID" });
    return
  }

  try {
    const deleted = await deleteTicketService(ticketId);
    if (!deleted) {
      res.status(404).json({ message: "Ticket not found or already deleted" });
       return
    }

  res.status(200).json({ message: "Ticket deleted successfully 🗑️" });
   return
  } catch (error: any) {
     res.status(500).json({ error: error.message || "Failed to delete ticket" });
      return
  }
};

// ===============================
// Reopen Ticket
// ===============================
export const reopenTicket = async (req: Request, res: Response) => {
  const ticketId = parseInt(req.params.id);
  const userId = req.user?.userId;

  if (isNaN(ticketId) || !userId) {
     res.status(400).json({ error: "Invalid ticket ID or userId" });
      return
  }

  try {
    const reopened = await reopenTicketService(ticketId, userId);
    if (!reopened) {
      res.status(403).json({
        message: "You can only reopen your own resolved tickets."
      });
       return
    }

     res.status(200).json({ message: "Ticket reopened successfully 🔄" });
      return
  } catch (error: any) {
   res.status(500).json({ error: error.message || "Failed to reopen ticket" });
    return
  }

};
