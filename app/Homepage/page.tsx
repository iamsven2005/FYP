"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { UploadButton } from "@/lib/uploadthing";
import Link from "next/link";
import { Company } from "@prisma/client";

function parseJwt(token: string) {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(
    atob(base64)
      .split('')
      .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
      .join('')
  );
  return JSON.parse(jsonPayload);
}

const Homepage = () => {
  const [user, setUser] = useState<{ username: string; email: string } | null>(null);
  const [companies, setCompanies] = useState<any[]>([]);
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([]);
  const [companyName, setCompanyName] = useState("");
  const [imgurl, setImgUrl] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "archived">("all");
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const decoded = parseJwt(token);
      setUser({ username: decoded.username, email: decoded.email });
    } else {
      router.push("/login");
    }
    
    // Fetch companies on page load
    fetchCompanies();
  }, [router]);

  const fetchCompanies = async () => {
    const res = await fetch("/api/companies");
    const data = await res.json();
    setCompanies(data);
    setFilteredCompanies(data); // Initially show all companies
  };

  const createCompany = async () => {
    const res = await fetch("/api/companies", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: companyName, imgurl }),
    });
    if (res.ok) {
      fetchCompanies(); // Refresh the company list
      setCompanyName("");
      setImgUrl("");
    }
  };

  const archiveCompany = async (id: string, archived: boolean) => {
    await fetch("/api/companies", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, archived }),
    });
    fetchCompanies(); // Refresh the list after archiving/unarchiving
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    filterCompanies(e.target.value, filter);
  };

  const filterCompanies = (searchTerm: string, filter: "all" | "active" | "archived") => {
    let filtered = companies;

    // Filter based on active or archived status
    if (filter === "active") {
      filtered = companies.filter((company) => !company.archived);
    } else if (filter === "archived") {
      filtered = companies.filter((company) => company.archived);
    }

    // Further filter based on search term
    if (searchTerm) {
      filtered = filtered.filter((company) =>
        company.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredCompanies(filtered);
  };

  const handleFilterChange = (newFilter: "all" | "active" | "archived") => {
    setFilter(newFilter);
    filterCompanies(searchTerm, newFilter);
  };

  if (!user) return <p>Loading...</p>;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-3xl font-bold mb-4">Welcome, {user.username}</h1>
      <p className="text-xl mb-6">Email: {user.email}</p>

      {/* Dialog for creating a company */}
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline">Create Company</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create a Company</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="companyName" className="text-right">Name</label>
              <Input
                id="companyName"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="col-span-3"
              />
            </div>
            <UploadButton
              endpoint="imageUploader"
              onClientUploadComplete={(res: { url: any; }[]) => {
                setImgUrl(res[0]?.url || "");
              }}
              onUploadError={(error: Error) => {
                alert(`ERROR! ${error.message}`);
              }}
            />
          </div>
          <DialogFooter>
            <Button type="submit" onClick={createCompany}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Search Bar */}
      <Input
        type="text"
        placeholder="Search companies..."
        value={searchTerm}
        onChange={handleSearch}
        className="my-4 max-w-md"
      />

      {/* Filter Buttons */}
      <div className="flex space-x-4 mb-4">
        <Button onClick={() => handleFilterChange("all")}>All</Button>
        <Button onClick={() => handleFilterChange("active")}>Active</Button>
        <Button onClick={() => handleFilterChange("archived")}>Archived</Button>
      </div>

      {/* List of Companies */}
      <div className="mt-10">
        <h2 className="text-2xl font-bold mb-4">Companies</h2>
        {filteredCompanies.map((company) => (
          <div key={company.id} className="border p-4 mb-4 rounded-lg w-full max-w-md">
            <h3 className="text-xl font-semibold">{company.name}</h3>
            <img src={company.imgurl} alt={company.name} className="w-24 h-24 mt-2"/>
            <Link href={`/Homepage/${company.id}`} className="btn btn-link">Company Page</Link>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => archiveCompany(company.id, !company.archived)}
            >
              {company.archived ? "Unarchive" : "Archive"}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Homepage;
