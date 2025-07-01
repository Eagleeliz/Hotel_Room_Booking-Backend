import express, { Application,Response } from 'express';
import dotenv from 'dotenv';
import { userRouter } from './users/user.route';
import { authRouter } from './auth/auth.route';
import cors from "cors"
import { hotelRouter } from './hotels/hotel.route';
import roomRouter from './Rooms/room.route';

dotenv.config();

const app: Application = express();

// Basic Middleware
app.use(cors())
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


//default route
app.get('/', (req, res:Response) => {
  res.send("Welcome to Express API Backend WIth Drizzle ORM and PostgreSQL");
});

//import route

app.use('/api',userRouter);
app.use('/api', authRouter);
app.use('/api',hotelRouter);
app.use('/api',roomRouter);
// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

export default app;