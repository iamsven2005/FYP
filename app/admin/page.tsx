//@ts-nocheck
"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner"; // Importing toast for error handling
import { Company, images, User } from "@prisma/client";
import CompanyManagement from "./CompanyManagement";
import UserManagement from "./UserManagement";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"; // shadcn table components
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"; // shadcn dialog components
import * as XLSX from "xlsx"; 
import { useRouter } from "next/navigation";

const roles = ["Admin", "Staff", "Manager", "Client"];
interface Props {
  params: {
    id: string;
  };
}
interface User {
  username: string;
  email: string;
  id: string;
}
const Admin = ({ params }: Props) => {
  const router = useRouter()
  const [staffUsers, setStaffUsers] = useState<User[]>([]);
  const [managerUsers, setManagerUsers] = useState<User[]>([]);
  const [images, setImages] = useState<images[]>([]);
  const [filteredImages, setFilteredImages] = useState<images[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [clist, setlist] = useState<Company[]>([]);
  const [AUsers, setUsers] = useState<User[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

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
    // Fetch users to get staff and managers
    const fetchUsers = async () => {
      try {
        const companies = await fetch("/api/companies");
        const res = await fetch("/api/users");
        const items = await fetch("/api/items");
        const data = await res.json();
        const item = await items.json();
        const list = await companies.json();
        setlist(list)
        setImages(item); // Setting images
        setFilteredImages(item);
        setUsers(data.users)
        setStaffUsers(data.users.filter((user: User) => user.role === "Staff"));
        setManagerUsers(data.users.filter((user: User) => user.role === "Manager"));
      } catch (error) {
        toast.error("Failed to fetch users"); // Replacing console.error with toast error
      }
    };
    fetchUsers();
  }, []);

  // Function to handle the search input and filter the images
  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value.toLowerCase();
    setSearchTerm(value);

    const filtered = images.filter((image) =>
      image.name.toLowerCase().includes(value) || // Search by name
      (image.ingredients && image.ingredients.some((ingredient: any) => ingredient.name.toLowerCase().includes(value))) // Search by ingredients
    );
    setFilteredImages(filtered);
  };

  // Function to count ingredients statuses
  const countStatuses = (ingredients: { status: string }[]) => {
    const counts = { approved: 0, notApproved: 0, notSafe: 0 };
    ingredients.forEach((ingredient) => {
      if (ingredient.status === "Not Safe") counts.notSafe++;
      else if (ingredient.status === "Not Approved") counts.notApproved++;
      else counts.approved++;
    });
    return counts;
  };

  // Function to export data to Excel
  const exportToExcel = () => {
    // Prepare the data for each section
    const usersData = AUsers.concat(AUsers).map(user => ({
      id: user.id,
      name: user.name,
      role: user.role,
      email: user.email,
    }));

    const companyData = clist.concat(clist).map(data => ({
      id: data.id,
      name: data.name,
      staff: data.staff,
      manager: data.manager,
      archived: data.archived,
      create: data.createdAt
    }));

    const imagesData = images.map(image => ({
      id: image.id,
      name: image.name,
      companyId: image.companyId,
      status: image.status,
      halal: image.halal ? "Yes" : "No",
      healthy: image.healthy ? "Yes" : "No",
      ai: image.AI,
      retrived: image.retrived

    }));

    // Create a new workbook
    const wb = XLSX.utils.book_new();

    // Add users sheet
    const wsUsers = XLSX.utils.json_to_sheet(usersData);
    XLSX.utils.book_append_sheet(wb, wsUsers, "Users");

    // Add company sheet
    const wsCompany = XLSX.utils.json_to_sheet(companyData);
    XLSX.utils.book_append_sheet(wb, wsCompany, "Company");

    // Add images sheet
    const wsImages = XLSX.utils.json_to_sheet(imagesData);
    XLSX.utils.book_append_sheet(wb, wsImages, "Images");

    // Export the workbook
    XLSX.writeFile(wb, "data_export.xlsx");
  };

  return (
    <div className="container mx-auto mt-10">
      <h1 className="text-3xl font-bold text-base-content">Admin Dashboard</h1>

      {/* Export to Excel Button */}
      <div className="mb-4">
        <button onClick={exportToExcel} className="bg-green-500 text-white p-2 rounded">
          Export to Excel
        </button>
      </div>
      Logged In as: {user?.username}
      {/* User Management */}
      <UserManagement roles={roles} id={user?.id}/>

      {/* Company Management */}
      <CompanyManagement staffUsers={staffUsers} managerUsers={managerUsers} list={clist} id={user?.id}/>

      {/* Images Table */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Images</h2>
        {/* Search Bar */}
        <div className="mb-4">
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearch}
            placeholder="Search for food items or ingredients"
            className="border p-2 rounded-lg w-full"
          />
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Image URL</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Company ID</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Halal</TableHead>
              <TableHead>Healthy</TableHead>
              <TableHead>AI</TableHead>
              <TableHead>Ingredients</TableHead>
              <TableHead>Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredImages.map((image) => {
              const ingredientCounts = image.ingredients ? countStatuses(image.ingredients) : null;

              return (
                <TableRow key={image.id}>
                  <TableCell>{image.id}</TableCell>

                  {/* Dialog for Detailed Image */}
                  <TableCell>
                    <Dialog>
                      <DialogTrigger>
                        <img src={image.imageurl} alt={image.name} className="h-16 w-16 object-cover cursor-pointer" />
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>{image.name} - Detailed Image View</DialogTitle>
                          <DialogDescription>
                            A closer look at the selected image.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="flex justify-center">
                          <img src={image.imageurl} alt={image.name} className="max-w-full h-auto object-cover" />
                        </div>
                      </DialogContent>
                    </Dialog>
                  </TableCell>

                  <TableCell>{image.name}</TableCell>
                  <TableCell>{image.companyId}</TableCell>
                  <TableCell>{image.status}</TableCell>
                  <TableCell>{image.halal ? "Yes" : "No"}</TableCell>
                  <TableCell>{image.healthy ? "Yes" : "No"}</TableCell>
                  <TableCell>{image.AI}</TableCell>
                  <TableCell>
                    {/* Dialog Trigger for Detailed Ingredients */}
                    <Dialog>
                      <DialogTrigger className="text-blue-600 underline cursor-pointer">
                        <span className="text-green-600">Approved: {ingredientCounts?.approved || 0}</span>,{" "}
                        <span className="text-yellow-600">Not Approved: {ingredientCounts?.notApproved || 0}</span>,{" "}
                        <span className="text-red-600">Not Safe: {ingredientCounts?.notSafe || 0}</span>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>{image.name} - Ingredient Details</DialogTitle>
                          <DialogDescription>
                            Below is a detailed breakdown of the ingredients for this item.
                          </DialogDescription>
                        </DialogHeader>
                        {/* Approved Ingredients */}
                        <div className="mt-4">
                          <h3 className="font-bold text-green-600">Approved Ingredients:</h3>
                          {image.ingredients &&
                            image.ingredients
                              .filter((ingredient) => ingredient.status !== "Not Safe" && ingredient.status !== "Not Approved")
                              .map((ingredient, idx) => (
                                <div key={idx} className="rounded-lg px-2 py-1 bg-green-500 text-white">
                                  {ingredient.name}
                                </div>
                              ))}
                        </div>
                        {/* Not Approved Ingredients */}
                        <div className="mt-4">
                          <h3 className="font-bold text-yellow-600">Not Approved Ingredients:</h3>
                          {image.ingredients &&
                            image.ingredients
                              .filter((ingredient) => ingredient.status === "Not Approved")
                              .map((ingredient, idx) => (
                                <div key={idx} className="rounded-lg px-2 py-1 bg-yellow-500 text-black">
                                  {ingredient.name}
                                </div>
                              ))}
                        </div>
                        {/* Not Safe Ingredients */}
                        <div className="mt-4">
                          <h3 className="font-bold text-red-600">Not Safe Ingredients:</h3>
                          {image.ingredients &&
                            image.ingredients
                              .filter((ingredient) => ingredient.status === "Not Safe")
                              .map((ingredient, idx) => (
                                <div key={idx} className="rounded-lg px-2 py-1 bg-red-500 text-white">
                                  {ingredient.name}
                                </div>
                              ))}
                        </div>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                  <TableCell>{image.retrived}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default Admin;
