// authentication/passport.js
const passport = require("passport");
const LocalStrategy = require("passport-local");
const { validatePassword } = require("./passwordUtils");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const customFields = {
  usernameField: "username",
  passwordField: "password",
};

const verifyCallback = async (username, password, done) => {
  try {
    // Fetch the user by username
    const user = await prisma.user.findUnique({ where: { username } });

    if (!user) {
      return done(null, false, { message: "Username not found." });
    }

    // Validate the provided password against the stored hash and salt
    const isValid = validatePassword(password, user.hash, user.salt);

    if (isValid) {
      return done(null, user);
    } else {
      // password invalid
      return done, null, false, { message: "Incorrect password." };
    }
  } catch (error) {
    return done(error);
  }
};

const strategy = new LocalStrategy(customFields, verifyCallback);

// Register the Local Strategy with Passport
passport.use(strategy);

passport.serializeUser((user, done) => {
  done(null, user.id); // Store the user's ID in the session
});

passport.deserializeUser(async (id, done) => {
  try {
    // Fetch the user by ID
    const user = await prisma.user.findUnique({ where: { id } });

    if (user) {
      done(null, user);
    } else {
      done(null, false, { message: "User not found." });
    }
  } catch (err) {
    done(err);
  }
});

module.exports = passport;
