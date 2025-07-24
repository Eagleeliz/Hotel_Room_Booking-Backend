// src/routes/supportTicketRoutes.ts
import { Router } from "express";
import {
  createTicket,
  getAllTickets,
  getTicketsByStatus,
  getTicketById,
  updateTicket,
  deleteTicket,
  reopenTicket,
  resolveTicket,
  getTicketsByUserId,
  getMyTickets
} from "../SupportTickets/supportTicket.controller";
import { anyAuthenticatedUser } from "../middleware/bearAuth";

const supportTicketRouter = Router();

supportTicketRouter.get("/tickets", getAllTickets);                  // GET
//  all tickets
supportTicketRouter.patch("/tickets/:id/resolve", resolveTicket);   //Resolve Ticket
supportTicketRouter.get("/tickets/status/:status", getTicketsByStatus); // GET tickets by status
supportTicketRouter.get("/tickets/me",  anyAuthenticatedUser,getMyTickets);
supportTicketRouter.get("/tickets/:id", getTicketById);             // GET ticket by ID
supportTicketRouter.post("/tickets", createTicket);                 // POST new ticket
supportTicketRouter.put("/tickets/:id", updateTicket);              // PUT update ticket by ID
supportTicketRouter.delete("/tickets/:id", deleteTicket);           // DELETE ticket by ID
supportTicketRouter.patch("/tickets/support/:id/reopen", reopenTicket); 
supportTicketRouter.get("/tickets/user/:userId",getTicketsByUserId);  


  // PATCH reopen ticket by ID

export default supportTicketRouter;
