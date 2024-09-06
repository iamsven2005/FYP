import { PrismaClient } from '@prisma/client';
import { db } from "@/lib/db";
import bcrypt from 'bcryptjs';

// Run this script to seed the default admin account
async function seed() {
  const email = 'admin@ntuc.com'; // Default admin email
  const password = 'admin123';    // Default admin password
  
  // Check if admin exists
  const existingAdmin = await db.user.findUnique({ where: { email } });
  
  if (!existingAdmin) {
    // Create the admin account
    const hashedPassword = await bcrypt.hash(password, 10);

    const adminUser = await db.user.create({
      data: {
        username: "admin",
        email,
        password: hashedPassword,
      },
    });

    // Assign Admin role to this user
    const adminRole = await db.role.create({
      data: {
        userId: adminUser.id,
        companyId: "default-company-id", // Assign based on your company logic
        rolename: "Admin",
        position: 1, // Priority position
      },
    });

    console.log("Admin created successfully:", adminUser, adminRole);
  } else {
    console.log("Admin already exists");
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
