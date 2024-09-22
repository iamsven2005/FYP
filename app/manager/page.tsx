"use client";

import { useEffect, useState } from "react";
import { redirect, useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner"; // Import toast for notifications
import Verify from "@/components/verify";

interface User {
  username: string;
  email: string;
  id: string;
}

interface Company {
  id: string;
  name: string;
  archived: boolean;
}

export default function ManagerDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Helper function to get Authorization header
  const getAuthHeader = () => {
    const token = localStorage.getItem("token");
    return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
  };

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
      redirect("/Login");
    }
    setLoading(false);
  }, [router]);

  useEffect(() => {
    const loadCompanies = async () => {
      try {
        if (user) {
          // Make an API request with the Authorization header
          const response = await axios.get(`/api/companies/${user.id}`, getAuthHeader());
          const data = response.data;

          if (data.error) {
            toast.error(data.error);
            setError(data.error);
          } else {
            setCompanies(data.companies);
            setFilteredCompanies(data.companies);
            toast.success("Companies loaded successfully");
          }
        }
      } catch (error) {
        toast.error("Failed to load companies");
        setError("Failed to load companies");
      }
    };

    if (user) {
      loadCompanies();
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
  if (!user) return redirect("/");

  return (
    <div className="container mx-auto px-4 py-8">
      <Verify id={user.id} />
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-3xl">Welcome, {user.username}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xl mb-2">Email: {user.email}</p>
          <p className="text-xl">User ID: {user.id}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Managed Companies</CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            type="text"
            placeholder="Search companies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="mb-4"
          />

          {error ? (
            <p className="text-red-500">{error}</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Company Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCompanies.length > 0 ? (
                    filteredCompanies.map((company) => (
                      <TableRow key={company.id}>
                        <TableCell className="font-medium">{company.name}</TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
                              company.archived
                                ? "bg-red-100 text-red-800"
                                : "bg-green-100 text-green-800"
                            }`}
                          >
                            {company.archived ? "Archived" : "Active"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Link href={`/manager/${company.id}`}>
                            <Button size="sm">View Details</Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center">
                        No companies found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
