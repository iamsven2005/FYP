"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

type StaffRequest = {
  id: string;
  username: string;
  email: string;
  status: string; // e.g., "pending", "approved", "rejected"
};

const ManagerPage = () => {
  const [staffRequests, setStaffRequests] = useState<StaffRequest[]>([]);
  const [message, setMessage] = useState<string>("");

  // Fetch staff requests from the API when the component loads
  useEffect(() => {
    const fetchStaffRequests = async () => {
      try {
        const res = await fetch("/api/staff-requests");
        const data = await res.json();

        // Check if the data is an array, otherwise set an empty array
        if (Array.isArray(data)) {
          setStaffRequests(data);
        } else {
          setStaffRequests([]);
        }
      } catch (error) {
        setMessage("Failed to fetch staff requests");
      }
    };

    fetchStaffRequests();
  }, []);

  // Function to approve or reject a staff request
  const handleApproval = async (id: string, approve: boolean) => {
    try {
      const res = await fetch(`/api/staff-requests/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: approve ? "approved" : "rejected" }),
      });

      if (res.ok) {
        setMessage(`Request ${approve ? "approved" : "rejected"} successfully`);
        setStaffRequests((prevRequests) =>
          prevRequests.map((req) =>
            req.id === id ? { ...req, status: approve ? "approved" : "rejected" } : req
          )
        );
      } else {
        setMessage("Failed to process the request");
      }
    } catch (error) {
      setMessage("An error occurred while processing the request");
    }
  };

  return (
    <div className="container mx-auto mt-10">
      <h1 className="text-2xl font-bold">Manager Dashboard</h1>

      {/* Success or Error Message */}
      {message && <p className={`mt-4 ${message.includes("successfully") ? "text-green-500" : "text-red-500"}`}>{message}</p>}

      <div className="mt-4 space-y-4">
        {staffRequests.length === 0 ? (
          <p>No pending staff requests</p>
        ) : (
          staffRequests.map((request) => (
            <div key={request.id} className="border p-4 rounded-md">
              <h3 className="text-xl font-semibold">{request.username}</h3>
              <p>{request.email}</p>
              <p>Status: {request.status}</p>

              {request.status === "pending" && (
                <div className="mt-4 space-x-2">
                  <Button
                    onClick={() => handleApproval(request.id, true)}
                    className="bg-green-600"
                  >
                    Approve
                  </Button>
                  <Button
                    onClick={() => handleApproval(request.id, false)}
                    className="bg-red-600"
                  >
                    Reject
                  </Button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ManagerPage;
