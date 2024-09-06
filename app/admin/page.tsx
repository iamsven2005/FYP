"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { Company } from "@prisma/client";
import Link from "next/link";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { UploadButton } from "@/lib/uploadthing";
import { toast } from "sonner";
import { Check, ChevronsUpDown } from "lucide-react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

// Define the types for User
type User = {
  id: string;
  username: string;
  role: string;
};

const roles = [
  { value: "Admin", label: "Admin" },
  { value: "Staff", label: "Staff" },
  { value: "Manager", label: "Manager" }
];

const Admin = () => {
  const [users, setUsers] = useState<User[]>([]); // Store the list of users
  const [editableUser, setEditableUser] = useState<string | null>(null); // Store the user id that is being edited
  const [newUsername, setNewUsername] = useState<{ [key: string]: string }>({}); // Store the updated username for each user
  const [selectedRole, setSelectedRole] = useState<{ [key: string]: string }>({}); // Store the selected role for each user
  const [loading, setLoading] = useState<{ [key: string]: boolean }>({}); // State for loading per user
  const [companies, setCompanies] = useState<any[]>([]);
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([]);
  const [companyName, setCompanyName] = useState("");
  const [imgurl, setImgUrl] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "archived">("all");
  const router = useRouter();

  // Fetch users from the API when the component loads
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch("/api/users");
        const data = await res.json();
        setUsers(data);
      } catch (error) {
        toast.error("Unable to get users");
      }
    };

    fetchUsers();
  }, []);

  // Function to assign a role to a user
  const assignRole = async (userId: string, role: string) => {
    setLoading((prev) => ({ ...prev, [userId]: true })); // Start loading for the user

    try {
      const res = await fetch("/api/roles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId, rolename: role }),
      });

      if (res.ok) {
        toast.success(`Role assigned to user ${userId} successfully`);
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user.id === userId ? { ...user, role } : user
          )
        );
      } else {
        toast.error("Failed to assign role");
      }
    } catch (error) {
      toast.error("An error occurred while assigning the role");
    } finally {
      setLoading((prev) => ({ ...prev, [userId]: false })); // Stop loading for the user
    }
  };

  // Function to update the username
  const updateUsername = async (userId: string, username: string) => {
    setLoading((prev) => ({ ...prev, [userId]: true }));

    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username }),
      });

      if (res.ok) {
        toast.success(`Username updated successfully for user ${userId}`);
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user.id === userId ? { ...user, username } : user
          )
        );
      } else {
        toast.error("Failed to update username");
      }
    } catch (error) {
      toast.error("An error occurred while updating the username");
    } finally {
      setLoading((prev) => ({ ...prev, [userId]: false }));
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
  const fetchCompanies = async () => {
    const res = await fetch("/api/companies");
    const data = await res.json();
    setCompanies(data);
    setFilteredCompanies(data); // Initially show all companies
  };

  const ComboboxRole = ({ userId, role }: { userId: string, role: string }) => {
    const [open, setOpen] = useState(false);
    const [value, setValue] = useState(role);

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-[150px] justify-between p-2"
          >
            {roles.find((r) => r.value === value)?.label || "Select role..."}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[150px] p-0">
          <Command>
            <CommandInput placeholder="Search role..." />
            <CommandList>
              <CommandEmpty>No role found.</CommandEmpty>
              <CommandGroup>
                {roles.map((role) => (
                  <CommandItem
                    key={role.value}
                    value={role.value}
                    onSelect={async (currentValue) => {
                      setValue(currentValue);
                      setSelectedRole((prev) => ({ ...prev, [userId]: currentValue }));
                      await assignRole(userId, currentValue); // Automatically assign role
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === role.value ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {role.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    );
  };

  return (
    <div className="container mx-auto mt-10">
      <h1 className="text-2xl font-bold">Admin Page</h1>

      {/* User Table */}
      <div className="mt-4 space-y-4">
        <h2 className="text-xl font-bold">User Management</h2>
        <table className="table">
          <thead>
            <tr>
              <th>Username</th>
              <th>Role</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>
                  {editableUser === user.id ? (
                    <Input
                      value={newUsername[user.id] || user.username}
                      onChange={(e) => setNewUsername((prev) => ({ ...prev, [user.id]: e.target.value }))}
                      onBlur={() => {
                        setEditableUser(null); // Exit edit mode
                        if (newUsername[user.id] && newUsername[user.id] !== user.username) {
                          updateUsername(user.id, newUsername[user.id]); // Save username if changed
                        }
                      }}
                      className="p-2 border rounded-md"
                      autoFocus
                    />
                  ) : (
                    <span onClick={() => setEditableUser(user.id)} className="w-96 font-bold text">{user.username}</span>
                  )}
                  {loading[user.id] && editableUser === null && <span className="ml-2 text-blue-600">Saving...</span>}
                </td>
                <td>
                  <ComboboxRole userId={user.id} role={user.role} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Dialog for creating a company */}
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" className="mt-8">Create Company</Button>
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
                className="input-ghost"
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
            <img src={company.imgurl} alt={company.name} className="w-24 h-24 mt-2" />
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

export default Admin;
