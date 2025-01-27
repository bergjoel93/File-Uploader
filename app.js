// app.js
const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;

const expressSession = require("express-session");
const { PrismaSessionStore } = require("@quixo3/prisma-session-store");
const prisma = require("./db/prisma");

const router = require("./routes/router");
require("dotenv");

const flash = require("connect-flash");

const passport = require("./authentication/passport");

// Serve static files from "public" directory
app.use(express.static("public"));

// Set EJS
app.set("view engine", "ejs");

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); // Parse JSON bodies

// Session Setup

app.use(
  expressSession({
    cookie: {
      maxAge: 7 * 24 * 60 * 60 * 1000, // ms
    },
    secret: process.env.SECRET,
    resave: true,
    saveUninitialized: true,
    store: new PrismaSessionStore(prisma, {
      checkPeriod: 2 * 60 * 1000, //ms
      dbRecordIdIsSessionId: true,
      dbRecordIdFunction: undefined,
    }),
  })
);

// Initialize flash middleware
app.use(flash());

// Pass flash messages to all views
app.use((req, res, next) => {
  res.locals.errorMessages = req.flash("error"); // Attach error messages to locals
  next();
});

// Initialize passport middleware
app.use(passport.initialize());
app.use(passport.session());
app.use((req, res, next) => {
  // console.log(req.session);
  //console.log(req.user);
  //console.log("Authenticated?", req.isAuthenticated());
  next();
});

// Use the indexRouter for root-level routes
app.use("/", router);

app.listen(PORT, () => {
  console.log("Server running on port 3000");
});

// Graceful shutdown logic
const gracefulShutdown = async () => {
  console.log("Shutting down gracefully...");
  try {
    await prisma.$disconnect(); // Close the Prisma database connection
    console.log("Database disconnected.");
    server.close(() => {
      console.log("Server closed.");
      process.exit(0); // Exit the process cleanly
    });
  } catch (error) {
    console.error("Error during shutdown:", error);
    process.exit(1); // Exit with an error code
  }
};

// Listen for termination signals (e.g., Ctrl+C)
process.on("SIGINT", gracefulShutdown); // For Ctrl+C (interrupt signal)
process.on("SIGTERM", gracefulShutdown); // For termination signals (e.g., from a process manager)
