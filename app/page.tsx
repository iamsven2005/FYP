import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/ui/Navbar";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const MainPage = async () => {
  return (
    <>
      <Navbar />  {/* Ensure this is correctly rendered */}
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <Card className="w-full max-w-md bg-white shadow-md rounded-lg overflow-hidden">
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
            <Link href="/api/auth/signin">
              <Button variant="default">Login</Button>
            </Link>
            <Link href="/register">
              <Button variant="secondary">Register</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    </>
  );
}

export default MainPage;
