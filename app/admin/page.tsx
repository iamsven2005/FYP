"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Define the types for User
type User = {
  id: string;
  username: string;
  role: string;
};

const Admin = () => {
  const [users, setUsers] = useState<User[]>([]); // Store the list of users
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]); // Store filtered users based on search
  const [searchTerm, setSearchTerm] = useState<string>(""); // Search term for filtering users
  const [message, setMessage] = useState<string>(""); // Message for success or failure
  const [selectedRoles, setSelectedRoles] = useState<{ [key: string]: string }>({}); // Store the selected role per user
  const [loading, setLoading] = useState<{ [key: string]: boolean }>({}); // Store the loading state for each user

  // Pagination state
  const [page, setPage] = useState<number>(1); // Current page
  const [limit, setLimit] = useState<number>(5); // Users per page
  const [totalPages, setTotalPages] = useState<number>(1); // Total number of pages
  const [isFetching, setIsFetching] = useState<boolean>(false); // Loading state for data fetching

  const roles = ["Admin", "Staff", "Manager", "Client"]; // Available roles

  // Fetch users from the API when the component loads
  useEffect(() => {
    const fetchUsers = async () => {
      setIsFetching(true);
      try {
        const res = await fetch(`/api/users?page=${page}&limit=${limit}`);
        const data = await res.json();
        setUsers(data.users);
        setFilteredUsers(data.users); // Initialize filteredUsers with all users
        setTotalPages(data.totalPages); // Set total number of pages
      } catch (error) {
        setMessage("Failed to fetch users");
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

  // Function to assign a role to a user
  const assignRole = async (userId: string, newRole: string) => {
    setLoading((prev) => ({ ...prev, [userId]: true })); // Set loading for the specific user
    try {
      const res = await fetch("/api/roles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId, rolename: newRole }), // Use "rolename" instead of "role"
      });

      if (res.ok) {
        setMessage("Role assigned successfully");
        // Update the user's role locally after a successful role assignment
        setUsers((prevUsers) =>
          prevUsers.map((user) => (user.id === userId ? { ...user, role: newRole } : user))
        );
      } else {
        setMessage("Failed to assign role");
      }
    } catch (error) {
      setMessage("An error occurred while assigning the role");
    } finally {
      setLoading((prev) => ({ ...prev, [userId]: false })); // Stop loading for the specific user
    }
  };

  // Handle role change in the dropdown
  const handleRoleChange = (userId: string, newRole: string) => {
    setSelectedRoles((prevRoles) => ({
      ...prevRoles,
      [userId]: newRole,
    }));
  };

  // Handle page change
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  return (
    <div className="container mx-auto mt-10">
      <h1 className="text-2xl font-bold">Admin Page</h1>

      {/* Success or Error Message */}
      {message && (
        <p className={`mt-4 ${message.includes("successfully") ? "text-green-500" : "text-red-500"}`}>
          {message}
        </p>
      )}

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
      <div className="overflow-x-auto">
        <table className="table table-zebra w-full">
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
                    className="btn btn-primary"
                    onClick={() => assignRole(user.id, selectedRoles[user.id] || user.role)}
                    disabled={loading[user.id]} // Disable only for the specific user
                  >
                    {loading[user.id] ? "Assigning..." : "Assign Role"}
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
          onClick={() => setPage((prev) => Math.max(prev - 1, 1))} // Previous page
          disabled={page === 1 || isFetching}
        >
          Previous
        </Button>

        <span>
          Page {page} of {totalPages}
        </span>

        <Button
          className="btn"
          onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))} // Next page
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
    </div>
  );
};

export default Admin;
