//@ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db, db as prisma } from "@/lib/db"; // Prisma client import
import { createJWT } from "@/lib/session";
import nodemailer from "nodemailer";
import crypto from "crypto";
import { toast } from "sonner"; // Import toast
import { redirect } from "next/dist/server/api-utils";
import { User } from "@prisma/client";

// Nodemailer setup for OTP
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST,
  port: Number(process.env.EMAIL_SERVER_PORT),
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
});

// Define accounts that bypass OTP
const bypassOtpAccounts = [
  { email: 'admin@ntuc.com', role: 'Admin', redirectTo: '/admin' },
  { email: 'staff@ntuc.com', role: 'Staff', redirectTo: '/Homepage' },
  { email: 'manager@ntuc.com', role: 'Manager', redirectTo: '/manager' },
  { email: 'client@ntuc.com', role: 'Client', redirectTo: '/Homepage' },
];

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    // Validate input
    if (!email || !password) {
      return NextResponse.json({ message: "Email and Password are required" }, { status: 400 });
    }

    // Check if the user exists
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ message: "User does not exist" }, { status: 404 }); // Return 404 if the user doesn't exist
    }

    // Check if the password is valid
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return NextResponse.json({ message: "Invalid email or password" }, { status: 401 });
    }

    // Bypass OTP for default accounts (admin, staff, manager, client)
    const bypassAccount = bypassOtpAccounts.find(acc => acc.email === email);
    if (bypassAccount) {
      const token = createJWT(user.id, user.email, bypassAccount.role);

      // Send the token to the client to store it in localStorage
      return NextResponse.json({
        message: "Login successful",
        redirectTo: bypassAccount.redirectTo,
        token: token // Pass the token in the response body
      }, { status: 200 });
    }

    // For non-default users, generate OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    const otpExpires = new Date();
    otpExpires.setMinutes(otpExpires.getMinutes() + 10); // OTP expires in 10 minutes

    // Save OTP and its expiration to the database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        otp,
        otpExpires,
      },
    });

    const htmlContent = `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
    <!-- Header without NTUC Logo -->
    <div style="text-align: center; padding: 10px; background-color: #007bff; border-top-left-radius: 8px; border-top-right-radius: 8px;">
      <h2 style="color: #fff; margin: 0; font-size: 24px;">NTUC - One-Time Password</h2>
    </div>

    <!-- OTP Box -->
    <div style="padding: 20px; text-align: center;">
      <p style="font-size: 16px; color: #333;">
        Hello,
      </p>
      <p style="font-size: 16px; color: #333;">
        Please use the following OTP to complete your login. The OTP will expire in <strong>10 minutes</strong>.
      </p>
      <div style="display: inline-block; padding: 10px 20px; font-size: 24px; background-color: #f7f7f7; border: 2px solid #007bff; border-radius: 8px; margin: 20px auto; font-weight: bold; color: #333;">
        ${otp}
      </div>
    </div>

    <!-- Footer Message -->
    <div style="padding: 20px; text-align: center;">
      <p style="font-size: 14px; color: #666;">
        If you didn't request a password reset, please ignore this email. For any assistance, please contact NTUC support.
      </p>
      <p style="font-size: 12px; color: #999;">
        © NTUC - All Rights Reserved
      </p>
    </div>
  </div>
`;


    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: user.email,
      subject: "Your OTP Code - NTUC",
      html: htmlContent,
    });
    const reminders = await db.images.findMany({
      where: {
        status: "PENDING"
      },
      include: {
        company: true
      }
    });
  
    // Fetch the manager for each company
    const reminderWithManagers = await Promise.all(reminders.map(async (reminder) => {
      const manager = await db.user.findFirst({
        where: {
          id: reminder.company.manager
        }
      });
      return {
        ...reminder,
        manager
      };
    }));
  
    // Filter unique managers and remove any null values
    const uniqueManagers = Array.from(new Set(reminderWithManagers.map(item => item.manager?.id)))
      .map(id => reminderWithManagers.find(item => item.manager?.id === id).manager)
      .filter(manager => manager !== null);
  
    // Send emails to all managers with pending items
    await sendPendingReminderEmails(uniqueManagers);
  

    return NextResponse.json({ message: "OTP sent to your email", userId: user.id }, { status: 200 });

  } catch (error: any) {
    console.log(error)
    return NextResponse.json({ message: error }, { status: 500 });
  }
}
const sendPendingReminderEmails = async (managers: User) => {
  const managerEmails = managers.map(manager => manager.email).filter(email => email); // Get all valid manager emails

  // Generate email content
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
      <div style="text-align: center; padding: 10px; background-color: #007bff; border-top-left-radius: 8px; border-top-right-radius: 8px;">
        <h2 style="color: #fff; margin: 0; font-size: 24px;">NTUC - Pending Items Reminder</h2>
      </div>
      <div style="padding: 20px;">
        <p>Hello Manager,</p>
        <p>There are pending items under your supervision that require attention. Please log in to your account to review them.</p>
      </div>
      <div style="padding: 20px; text-align: center;">
        <a href="${process.env.BASE_URL}/Login" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Login to Your Account</a>
      </div>
      <div style="padding: 20px; text-align: center; font-size: 12px; color: #999;">
        © NTUC - All Rights Reserved
      </div>
    </div>
  `;

  // Send email to all managers
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: managerEmails.join(','), // Join emails with commas
    subject: "Pending Items Reminder - NTUC",
    html: htmlContent,
  });

  console.log('Emails sent to all managers with pending items.');
};
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id'); 
    if(!id){
      return NextResponse.redirect("/")
    }
    const user = await db.user.findFirst({
      where: { id },
    });
    if (user?.role == 'Admin') {
      var role = "admin"
    } else if (user?.role == 'Staff') {
      var role = "staff"
    } else if (user?.role == 'Manager') {
      var role = "manager"
    } else {
      var role = "others"
    }
    console.log(role)
    return NextResponse.json(role, { status: 200 });

  } catch (error) {
    console.log('Verify error:', error);
    return NextResponse.json({ message: 'Failed to verify user' }, { status: 500 });
  }
}