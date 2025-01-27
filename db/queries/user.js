// queries/user.js
const prisma = require("../prisma");

class User {
  async findUserByUsername(username) {
    return await prisma.user.findUnique({
      where: { username },
    });
  }

  async createUser(username, fullName, salt, hash) {
    return await prisma.user.create({
      data: {
        username,
        fullName,
        salt,
        hash,
      },
    });
  }

  // Delete a user by ID
  async deleteUser(userId) {
    try {
      return await prisma.user.delete({
        where: { id: userId },
      });
    } catch (error) {
      console.error("Error deleting user:", error);
      throw error; // Rethrow the error for further handling
    }
  }

  // Edit a user's details
  async editUser(userId, updates) {
    try {
      return await prisma.user.update({
        where: { id: userId },
        data: updates, // Pass an object with the fields you want to update
      });
    } catch (error) {
      console.error("Error editing user:", error);
      throw error; // Rethrow the error for further handling
    }
  }
}

module.exports = new User();
