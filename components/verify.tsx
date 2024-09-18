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
        const response = await axios.get(`/api/login`, {
          params: { id },
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
