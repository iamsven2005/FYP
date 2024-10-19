//@ts-nocheck
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { db } from "@/lib/db";
import nodemailer from 'nodemailer'; // Import nodemailer
import { User } from "@prisma/client";

// Nodemailer setup
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST,
  port: Number(process.env.EMAIL_SERVER_PORT),
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
});

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

const MainPage = async () => {
  // Query all reminders with "PENDING" status, including their company details
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

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <Card className="w-full max-w-md shadow-md rounded-lg overflow-hidden">
        <CardHeader>
          <CardTitle>Welcome to NTUC</CardTitle>
          <CardDescription>Your one-stop solution for enhanced food label compliance and safety monitoring.</CardDescription>
        </CardHeader>
        <CardContent>
          <Image
            src="/NTUC-Fairprice-Logo.png"
            alt="NTUC Logo"
            width={200}
            height={100}
            className="mx-auto mb-4"
          />
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>About NTUC</AccordionTrigger>
              <AccordionContent>
                NTUC provides a range of services to ensure food safety and compliance with industry standards.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>Our Services</AccordionTrigger>
              <AccordionContent>
                We offer comprehensive monitoring and compliance services tailored to meet the needs of modern food businesses.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Link href="/Login">
            <Button variant="link">Login</Button>
          </Link>
          <Link href="/Register">
            <Button variant="secondary">Register</Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}

export default MainPage;
