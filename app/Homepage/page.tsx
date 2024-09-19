"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner"; // Import toast for notifications
import Verify from "@/components/verify";
import axios from "axios"; // Import axios

interface User {
  username: string;
  email: string;
  id: string;
}

interface Company {
  id: string;
  name: string;
  img: string;
  archived: boolean;
}

export default function Homepage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
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
      window.location.reload();
      router.push("/login");
    }
    setLoading(false);
  }, [router]);

  useEffect(() => {
    if (user) {
      axios
        .get(`/api/companies/${user.id}`)
        .then((response) => {
          const data = response.data;
          if (data.error) {
            toast.error(data.error); // Replaced setError with toast.error
          } else {
            setCompanies(data.companies);
            setFilteredCompanies(data.companies);
          }
        })
        .catch(() => {
          toast.error("Failed to load companies"); // Replaced setError with toast.error
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

  if (loading) return <p className="text-center p-8">Loading...</p>;
  if (!user) router.push("/");

  return (
    <div className="container mx-auto px-4 py-8">
      {user && (
      <Verify id={user.id} />
      )}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-4">Welcome, {user?.username}</h1>
        <p className="text-xl mb-2">Email: {user?.email}</p>
        <p className="text-xl mb-6">User ID: {user?.id}</p>
      </div>

      <Input
        type="text"
        placeholder="Search companies..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="mb-8 max-w-md mx-auto"
      />

      {error ? (
        <p className="text-center text-red-500">{error}</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCompanies.length > 0 ? (
            filteredCompanies.map((company) => (
              <Card key={company.id} className="overflow-hidden">
                <img
                  src={company.img}
                  alt={company.name}
                  className="w-full h-48 object-cover"
                />
                <CardContent className="p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-bold">{company.name}</h3>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        company.archived
                          ? "bg-gray-200 text-gray-700"
                          : "bg-green-200 text-green-700"
                      }`}
                    >
                      {company.archived ? "Archived" : "Active"}
                    </span>
                  </div>
                </CardContent>
                <CardFooter className="bg-gray-50 p-4">
                  <div className="flex justify-between w-full">
                    <Link
                      href={`/Homepage/${company.id}`}
                      className="text-blue-600 hover:underline"
                    >
                      View
                    </Link>
                    <Link
                      href={`/Homepage/${company.id}/upload2`}
                      className="text-blue-600 hover:underline"
                    >
                      Upload
                    </Link>
                  </div>
                </CardFooter>
              </Card>
            ))
          ) : (
            <p className="text-center col-span-full">No companies found.</p>
          )}
        </div>
      )}
    </div>
  );
}
