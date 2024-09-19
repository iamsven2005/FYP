"use client";

import { useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

interface Props {
  id: string;
}

const Verify = ({ id }: Props) => {
  const router = useRouter();

  useEffect(() => {
    const verifyUser = async () => {
      try {
        // Get the token from localStorage
        const token = localStorage.getItem("token");

        // Check if the token exists before making the request
        if (!token) {
          console.error("No token found, redirecting to login.");
          router.push("/login");
          return;
        }

        // Send the request with Authorization header
        const response = await axios.get(`/api/login`, {
          params: { id },
          headers: {
            Authorization: `Bearer ${token}`, // Include the token in the Authorization header
            "Content-Type": "application/json",
          },
        });

        console.log(response.data); // Debugging: Check what the API returns

        // Compare response data and use router.push for client-side navigation
        if (response.data === "staff") {
          router.push("/Homepage");
        } else if (response.data === "manager") {
          router.push("/manager");
        } else if (response.data === "admin") {
          router.push("/admin");
        } else {
          router.push("/login");
        }
      } catch (error) {
        console.error("Verification failed:", error);
        router.push("/login"); 
      }
    };

    verifyUser();
  }, [id, router]);

  return <></>;
};

export default Verify;
