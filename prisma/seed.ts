import { PrismaClient } from '@prisma/client';
import { db } from "@/lib/db";
import bcrypt from 'bcryptjs';

// Run this script to seed the default admin, staff, and manager accounts
async function seed() {
  const usersToCreate = [
    { username: "admin", email: 'admin@ntuc.com', password: 'admin123', role: 'Admin' },
    { username: "staff", email: 'staff@ntuc.com', password: 'staff123', role: 'Staff' },
    { username: "manager", email: 'manager@ntuc.com', password: 'manager123', role: 'Manager' }
  ];

  for (const userToCreate of usersToCreate) {
    // Check if user exists
    const existingUser = await db.user.findUnique({ where: { email: userToCreate.email } });

    if (!existingUser) {
      // Create the user account
      const hashedPassword = await bcrypt.hash(userToCreate.password, 10);

      const newUser = await db.user.create({
        data: {
          username: userToCreate.username,
          email: userToCreate.email,
          password: hashedPassword,
        },
      });

      // Assign Role
      await db.role.create({
        data: {
          userId: newUser.id,
          companyId: "default-company-id", // Adjust company ID logic if needed
          rolename: userToCreate.role,
          position: userToCreate.role === "Admin" ? 1 : 2,
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
