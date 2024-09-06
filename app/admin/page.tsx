"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faSave, faPlusCircle, faArchive, faBoxOpen } from "@fortawesome/free-solid-svg-icons"; // Import icons
import { confirmAlert } from "react-confirm-alert"; // Import for confirm alert
import "react-confirm-alert/src/react-confirm-alert.css"; // Alert CSS
import { toast } from "sonner";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { UploadButton } from "@/lib/uploadthing";

// Define the types for User and Company
type User = {
  id: string;
  username: string;
  role: string;
};

type Company = {
  id: string;
  name: string;
  archived: boolean;
  imgurl: string;
};

const roles = ["Admin", "Staff", "Manager", "Client"]; // Available roles

const Admin = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedRoles, setSelectedRoles] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState<{ [key: string]: boolean }>({});
  const [isFetching, setIsFetching] = useState<boolean>(false);

  // Pagination state
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(5);
  const [totalPages, setTotalPages] = useState<number>(1);

  // Company management states
  const [companies, setCompanies] = useState<Company[]>([]);
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([]);
  const [companyName, setCompanyName] = useState<string>("");
  const [companyImgUrl, setCompanyImgUrl] = useState<string>("");
  const [companySearchTerm, setCompanySearchTerm] = useState<string>("");

  // Fetch users from the API
  useEffect(() => {
    const fetchUsers = async () => {
      setIsFetching(true);
      try {
        const res = await fetch(`/api/users?page=${page}&limit=${limit}`);
        const data = await res.json();
        setUsers(data.users);
        setFilteredUsers(data.users);
        setTotalPages(data.totalPages);
      } catch (error) {
        toast.error("Failed to fetch users");
      } finally {
        setIsFetching(false);
      }
    };

    fetchUsers();
  }, [page, limit]);

  // Filter users based on the search term
  useEffect(() => {
    const filtered = users.filter((user) =>
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredUsers(filtered);
  }, [searchTerm, users]);

  // Fetch companies from the API
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const res = await fetch("/api/companies");
        const data = await res.json();
        setCompanies(data);
        setFilteredCompanies(data);
      } catch (error) {
        toast.error("Failed to fetch companies");
      }
    };

    fetchCompanies();
  }, []);

  // Filter companies based on the search term
  useEffect(() => {
    const filtered = companies.filter((company) =>
      company.name.toLowerCase().includes(companySearchTerm.toLowerCase())
    );
    setFilteredCompanies(filtered);
  }, [companySearchTerm, companies]);

  // Function to assign a role to a user
  const assignRole = async (userId: string, newRole: string) => {
    setLoading((prev) => ({ ...prev, [userId]: true }));
    try {
      const res = await fetch("/api/roles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId, rolename: newRole }),
      });

      if (res.ok) {
        toast.success("Role assigned successfully");
        setUsers((prevUsers) =>
          prevUsers.map((user) => (user.id === userId ? { ...user, role: newRole } : user))
        );
      } else {
        toast.error("Failed to assign role");
      }
    } catch (error) {
      toast.error("An error occurred while assigning the role");
    } finally {
      setLoading((prev) => ({ ...prev, [userId]: false }));
    }
  };

  // Handle role change in the dropdown
  const handleRoleChange = (userId: string, newRole: string) => {
    setSelectedRoles((prevRoles) => ({
      ...prevRoles,
      [userId]: newRole,
    }));
  };

  // Handle user deletion
  const deleteUser = async (userId: string) => {
    confirmAlert({
      title: "Confirm Deletion",
      message: "Are you sure you want to delete this user?",
      buttons: [
        {
          label: "Yes",
          onClick: async () => {
            try {
              const res = await fetch(`/api/users/${userId}`, {
                method: "DELETE",
              });
              if (res.ok) {
                toast.success("User deleted successfully");
                setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));
              } else {
                toast.error("Failed to delete user");
              }
            } catch (error) {
              toast.error("An error occurred while deleting the user");
            }
          },
        },
        {
          label: "No",
        },
      ],
    });
  };

  // Handle company creation
  const createCompany = async () => {
    try {
      const res = await fetch("/api/companies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: companyName, imgurl: companyImgUrl }),
      });
      if (res.ok) {
        toast.success("Company created successfully");
        const newCompany = await res.json();
        setCompanies((prevCompanies) => [...prevCompanies, newCompany]);
        setCompanyName("");
        setCompanyImgUrl("");
      } else {
        toast.error("Failed to create company");
      }
    } catch (error) {
      toast.error("An error occurred while creating the company");
    }
  };

  // Handle company archiving/unarchiving
  const toggleArchiveCompany = async (companyId: string, archived: boolean) => {
    try {
      const res = await fetch(`/api/companies/${companyId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ archived }),
      });
      if (res.ok) {
        setCompanies((prevCompanies) =>
          prevCompanies.map((company) =>
            company.id === companyId ? { ...company, archived } : company
          )
        );
        toast.success(`Company ${archived ? "archived" : "unarchived"} successfully`);
      } else {
        toast.error("Failed to update company status");
      }
    } catch (error) {
      toast.error("An error occurred while updating company status");
    }
  };

  return (
    <div className="container mx-auto mt-10">
      <h1 className="text-3xl font-bold text-base-content">Admin Dashboard</h1>

      {/* Search Input */}
      <div className="flex justify-end mb-4">
        <Input
          type="text"
          placeholder="Search by username or role..."
          className="input input-bordered w-full max-w-xs"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* User Table */}
      <div className="overflow-x-auto mb-8">
        <h2 className="text-xl font-bold mb-4">User Management</h2>
        <table className="table">
          <thead>
            <tr>
              <th>Username</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.id}>
                <td>{user.username}</td>
                <td>
                  <select
                    value={selectedRoles[user.id] || user.role}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleRoleChange(user.id, e.target.value)}
                    className="select select-bordered"
                  >
                    {roles.map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  <Button
                    className="btn btn-primary mr-2"
                    onClick={() => assignRole(user.id, selectedRoles[user.id] || user.role)}
                    disabled={loading[user.id]}
                  >
                    <FontAwesomeIcon icon={faSave} className="mr-2" /> Save Changes
                  </Button>
                  <Button className="btn btn-error" onClick={() => deleteUser(user.id)}>
                    <FontAwesomeIcon icon={faTrash} className="mr-2" /> Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="flex justify-between mt-4">
        <Button
          className="btn"
          onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
          disabled={page === 1 || isFetching}
        >
          Previous
        </Button>

        <span>
          Page {page} of {totalPages}
        </span>

        <Button
          className="btn"
          onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={page === totalPages || isFetching}
        >
          Next
        </Button>
      </div>

      {/* Page Size Select */}
      <div className="flex justify-end mt-2">
        <select
          className="select select-bordered w-32"
          value={limit}
          onChange={(e) => setLimit(parseInt(e.target.value))}
        >
          <option value={5}>5 per page</option>
          <option value={10}>10 per page</option>
          <option value={20}>20 per page</option>
        </select>
      </div>

      {/* Company Section */}
      <div className="my-10">
        <h2 className="text-xl font-bold mb-4">Company Management</h2>

        {/* Company Search */}
        <div className="flex justify-end mb-4">
          <Input
            type="text"
            placeholder="Search companies..."
            className="input input-bordered w-full max-w-xs"
            value={companySearchTerm}
            onChange={(e) => setCompanySearchTerm(e.target.value)}
          />
        </div>

        {/* Company Table */}
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
              <th>Logo</th>
                <th>Company Name</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCompanies.map((company) => (
                <tr key={company.id}>
                                    <td><img src={company.imgurl} className="h-full rounded-sm"/></td>

                  <td>{company.name}</td>
                  <td>{company.archived ? "Archived" : "Active"}</td>
                  <td>
                    <Button
                      className={`btn ${company.archived ? "btn-secondary" : "btn-primary"} mr-2`}
                      onClick={() => toggleArchiveCompany(company.id, !company.archived)}
                    >
                      <FontAwesomeIcon icon={company.archived ? faBoxOpen : faArchive} className="mr-2" />
                      {company.archived ? "Unarchive" : "Archive"}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Create Company Dialog */}
        <Dialog>
          <DialogTrigger asChild>
            <Button className="mt-4">
              <FontAwesomeIcon icon={faPlusCircle} className="mr-2" /> Create Company
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create a Company</DialogTitle>
            </DialogHeader>
            <div className="mt-4">
              <Input
                type="text"
                placeholder="Company Name"
                className="input input-bordered w-full mb-4"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
              />
              <UploadButton
                endpoint="imageUploader"
                onClientUploadComplete={(res: { url: any; }[]) => {
                  setCompanyImgUrl(res[0]?.url || "");
                }}
                onUploadError={(error: Error) => {
                  alert(`ERROR! ${error.message}`);
                }}
              />
            </div>
            <DialogFooter>
              <Button className="btn btn-primary" onClick={createCompany}>
                <FontAwesomeIcon icon={faSave} className="mr-2" /> Save
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Admin;
