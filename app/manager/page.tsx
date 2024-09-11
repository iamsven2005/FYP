"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button"; 
import { Company } from "@prisma/client";

const ManagerDashboard = () => {
  const [user, setUser] = useState<{ username: string; email: string; id: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [companies, setCompanies] = useState<any[]>([]);
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>(""); // Search query for filtering companies
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Function to decode JWT token
  function parseJwt(token: string) {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  }

  // Effect to handle user authentication
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const decoded = parseJwt(token);
      setUser({ id: decoded.userId, username: decoded.username, email: decoded.email });
    } else {
      router.push("/login"); // Redirect to login if no token is found
    }
    setLoading(false);
  }, [router]);

  // Fetch companies associated with the user (as manager or staff)
  useEffect(() => {
    if (user) {
      fetch(`/api/companies/${user.id}`)
        .then((response) => response.json())
        .then((data) => {
          if (data.error) {
            setError(data.error);
          } else {
            setCompanies(data.companies);
            setFilteredCompanies(data.companies); // Initialize filtered companies
          }
        })
        .catch(() => {
          setError("Failed to load companies");
        });
    }
  }, [user]);

  // Filter companies based on search query
  useEffect(() => {
    if (searchQuery) {
      const filtered = companies.filter((company) =>
        company.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredCompanies(filtered);
    } else {
      setFilteredCompanies(companies);
    }
  }, [searchQuery, companies]);

  // If data is still loading
  if (loading) return <p>Loading...</p>;
  // If no user is found
  if (!user) return <p>No user found</p>;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-3xl font-bold mb-4">Welcome, {user.username}</h1>
      <p className="text-xl mb-2">Email: {user.email}</p>
      <p className="text-xl mb-6">User ID: {user.id}</p>

      {/* Search Input */}
      <input
        type="text"
        placeholder="Search companies..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="mb-4 p-2 border rounded"
      />

      {/* Handle error or display companies */}
      {error ? (
        <p>{error}</p>
      ) : (
        <div className="w-full">
          <table className="table-auto w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-4 py-2">Company Name</th>
                <th className="border border-gray-300 px-4 py-2">Status</th>
                <th className="border border-gray-300 px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCompanies.length > 0 ? (
                filteredCompanies.map((company) => (
                  <tr key={company.id} className="hover:bg-gray-200">
                    <td className="border border-gray-300 px-4 py-2">{company.name}</td>
                    <td className="border border-gray-300 px-4 py-2">
                      {company.archived ? "Archived" : "Active"}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {/* Actions: View Details */}
                      <div className="flex gap-4">
                        <Link href={`/manager/${company.id}`}>
                          <Button className="btn-primary">View Details</Button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="text-center py-4">
                    No companies found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ManagerDashboard;
