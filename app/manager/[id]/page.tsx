"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button"; // Assuming you have this UI component
import { Company } from "@prisma/client";

const CompanyDetails = ({ params }: { params: { id: string } }) => {
  const [company, setCompany] = useState<Company | null>(null);
  const [items, setItems] = useState<any[]>([]); // Holds uploaded items for review
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Fetch company details and uploaded items (images, etc.)
  useEffect(() => {
    fetch(`/api/companies/${params.id}/approve`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          setCompany(data.company);
          setItems(data.items); // Fetch the uploaded items as well
        }
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to fetch company details");
        setLoading(false);
      });
  }, [params.id]);

  // Approve item
  const handleApprove = async (itemId: string) => {
    try {
      const response = await fetch(`/api/items/${itemId}/approve`, {
        method: "PATCH",
      });
      if (response.ok) {
        alert("Item approved successfully!");
        // Optionally refresh the list of items
      } else {
        console.error("Failed to approve item");
      }
    } catch (error) {
      console.error("Error approving item:", error);
    }
  };

  // Reject item
  const handleReject = async (itemId: string) => {
    try {
      const response = await fetch(`/api/items/${itemId}/reject`, {
        method: "PATCH",
      });
      if (response.ok) {
        alert("Item rejected successfully!");
        // Optionally refresh the list of items
      } else {
        console.error("Failed to reject item");
      }
    } catch (error) {
      console.error("Error rejecting item:", error);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  if (!company) return <p>No company details found.</p>; // This handles when company is null or undefined

  return (
    <div className="company-details">
      <h1 className="text-3xl font-bold mb-4">{company.name}</h1>
      <p>Status: {company.archived ? "Archived" : "Active"}</p>
      {company.img && <img src={company.img} alt={company.name} className="mt-4" />} {/* Only render if img exists */}

      {/* Display Uploaded Items */}
      <div className="uploaded-items mt-6">
        <h2 className="text-2xl font-bold">Uploaded Items for Review</h2>
        {items.length > 0 ? (
          items.map((item) => (
            <div key={item.id} className="bg-gray-100 p-4 rounded-md my-4">
              <img src={item.imageurl} alt={item.name} className="w-full h-auto rounded-md" />
              <h3 className="text-xl font-bold">{item.name}</h3>
              <p>Halal Status: {item.halal ? "Halal" : "Not Halal"}</p>
              <p>Healthy Status: {item.healthy ? "Healthy" : "Not Healthy"}</p>
              <p>Extracted Text: {item.retrived}</p>
              <p>AI Advisory: {item.AI}</p>

              {/* Approve and Reject Buttons */}
              <div className="flex gap-4 mt-4">
                <Button onClick={() => handleApprove(item.id)} className="btn-primary">Approve</Button>
                <Button onClick={() => handleReject(item.id)} className="btn-error">Reject</Button>
              </div>
            </div>
          ))
        ) : (
          <p>No items found for review.</p>
        )}
      </div>
    </div>
  );
};

export default CompanyDetails;
