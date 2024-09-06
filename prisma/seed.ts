import { PrismaClient } from '@prisma/client';
import { db } from "@/lib/db";
import bcrypt from 'bcryptjs';

// Run this script to seed the default admin, staff, manager, and client accounts
async function seed() {
  const usersToCreate = [
    { username: "admin", email: 'admin@ntuc.com', password: 'admin123', role: 'Admin' },
    { username: "staff", email: 'staff@ntuc.com', password: 'staff123', role: 'Staff' },
    { username: "manager", email: 'manager@ntuc.com', password: 'manager123', role: 'Manager' },
    { username: "client", email: 'client@ntuc.com', password: 'client123', role: 'Client' },
  ];

  for (const userToCreate of usersToCreate) {
    // Check if user exists
    const existingUser = await db.user.findUnique({ where: { email: userToCreate.email } });

    if (!existingUser) {
      // Create the user account with the role directly in the User table
      const hashedPassword = await bcrypt.hash(userToCreate.password, 10);

      const newUser = await db.user.create({
        data: {
          username: userToCreate.username,
          email: userToCreate.email,
          password: hashedPassword,
          role: userToCreate.role, // Assign role directly in the User table
        },
      });

      console.log(`${userToCreate.role} created successfully:`, newUser);
    } else {
      console.log(`${userToCreate.role} already exists`);
    }
  }
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    process.exit();
  });
