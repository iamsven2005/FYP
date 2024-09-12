"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const Homepage = () => {
  const [user, setUser] = useState<{ username: string; email: string; id: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [companies, setCompanies] = useState<any[]>([]);
  const [filteredCompanies, setFilteredCompanies] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>(""); // State for search query
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

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

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const decoded = parseJwt(token);
      setUser({ id: decoded.userId, username: decoded.username, email: decoded.email });
    } else {
      router.push("/login");
    }
    setLoading(false);
  }, [router]);

  useEffect(() => {
    if (user) {
      fetch(`/api/companies/${user.id}`)
        .then((response) => response.json())
        .then((data) => {
          if (data.error) {
            setError(data.error);
          } else {
            setCompanies(data.companies);
            setFilteredCompanies(data.companies); 
          }
        })
        .catch(() => {
          setError("Failed to load companies");
        });
    }
  }, [user]);

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

  if (loading) return <p>Loading...</p>;
  if (!user) return <p>No user found</p>;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-3xl font-bold mb-4">Welcome, {user.username}</h1>
      <p className="text-xl mb-2">Email: {user.email}</p>
      <p className="text-xl mb-6">User ID: {user.id}</p>

      <input
        type="text"
        placeholder="Search companies..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="mb-4 p-2 border rounded"
      />

      {error ? (
        <p>{error}</p>
      ) : (
        <div>
          {filteredCompanies.length > 0 ? (
            filteredCompanies.map((company) => (
              <div key={company.id} className="flex flex-col gap-4 px-6 py-8 bg-base-300 hover:bg-base-200">
                <img src={company.img} alt={company.name} className="w-full m-5 rounded-sm mx-auto" />
                <div className="flex">
                  <h3 className="text-lg font-bold">{company.name}</h3>
                  <p>{company.archived ? "Archived" : "Active"}</p>
                </div>
                <div className="flex gap-5">
                  <Link href={`/Homepage/${company.id}`}>View</Link> {/* View company images with status */}
                  <Link href={`/Homepage/${company.id}/upload`}>Upload</Link> {/* Upload images for the company */}
                </div>
              </div>
            ))
          ) : (
            <p>No companies found.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default Homepage;
