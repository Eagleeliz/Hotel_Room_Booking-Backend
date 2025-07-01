CREATE TYPE "public"."bookingStatus" AS ENUM('Pending', 'Confirmed', 'Cancelled');--> statement-breakpoint
CREATE TYPE "public"."paymentStatus" AS ENUM('Pending', 'Completed', 'Failed');--> statement-breakpoint
CREATE TYPE "public"."ticketStatus" AS ENUM('Open', 'Resolved');--> statement-breakpoint
CREATE TYPE "public"."userRole" AS ENUM('user', 'admin');--> statement-breakpoint
CREATE TABLE "bookings" (
	"bookingId" serial PRIMARY KEY NOT NULL,
	"userId" integer,
	"roomId" integer,
	"checkInDate" date NOT NULL,
	"checkOutDate" date NOT NULL,
	"totalAmount" numeric(10, 2),
	"bookingStatus" "bookingStatus" DEFAULT 'Pending',
	"createdAt" timestamp DEFAULT now(),
	"updatedAt" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "hotels" (
	"hotelId" serial PRIMARY KEY NOT NULL,
	"name" varchar(150) NOT NULL,
	"location" varchar(100) NOT NULL,
	"address" text,
	"contactPhone" varchar(20),
	"category" varchar(50),
	"rating" integer,
	"createdAt" timestamp DEFAULT now(),
	"updatedAt" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"paymentId" serial PRIMARY KEY NOT NULL,
	"bookingId" integer,
	"amount" numeric(10, 2),
	"paymentStatus" "paymentStatus" DEFAULT 'Pending',
	"paymentMethod" varchar(50),
	"transactionId" varchar(255),
	"paymentDate" timestamp DEFAULT now(),
	"createdAt" timestamp DEFAULT now(),
	"updatedAt" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "rooms" (
	"roomId" serial PRIMARY KEY NOT NULL,
	"hotelId" integer NOT NULL,
	"roomType" varchar(100),
	"pricePerNight" numeric(10, 2),
	"capacity" integer,
	"amenities" text,
	"isAvailable" boolean DEFAULT true,
	"createdAt" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "supportTickets" (
	"ticketId" serial PRIMARY KEY NOT NULL,
	"userId" integer,
	"subject" varchar(200),
	"description" text,
	"status" "ticketStatus" DEFAULT 'Open',
	"createdAt" timestamp DEFAULT now(),
	"updatedAt" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"userId" serial PRIMARY KEY NOT NULL,
	"firstName" varchar(100),
	"lastName" varchar(100),
	"email" varchar(255) NOT NULL,
	"password" varchar(255) NOT NULL,
	"contactPhone" varchar(20),
	"address" text,
	"role" "userRole" DEFAULT 'user',
	"createdAt" timestamp DEFAULT now(),
	"updatedAt" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_userId_users_userId_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("userId") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_roomId_rooms_roomId_fk" FOREIGN KEY ("roomId") REFERENCES "public"."rooms"("roomId") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_bookingId_bookings_bookingId_fk" FOREIGN KEY ("bookingId") REFERENCES "public"."bookings"("bookingId") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rooms" ADD CONSTRAINT "rooms_hotelId_hotels_hotelId_fk" FOREIGN KEY ("hotelId") REFERENCES "public"."hotels"("hotelId") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "supportTickets" ADD CONSTRAINT "supportTickets_userId_users_userId_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("userId") ON DELETE cascade ON UPDATE no action;