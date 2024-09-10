"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faSave } from "@fortawesome/free-solid-svg-icons";
import { confirmAlert } from "react-confirm-alert";
import { toast } from "sonner";
import { Trash } from "lucide-react";

type User = {
  id: string;
  username: string;
  role: string;
};

type UserManagementProps = {
  roles: string[];
};

const UserManagement = ({ roles }: UserManagementProps) => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedRoles, setSelectedRoles] = useState<{ [key: string]: string }>({});
  const [previousRoles, setPreviousRoles] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState<{ [key: string]: boolean }>({});
  const [isFetching, setIsFetching] = useState<boolean>(false);

  // Pagination state
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [totalPages, setTotalPages] = useState<number>(1);

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
        // Initialize previousRoles with the current roles
        const initialRoles = data.users.reduce((acc: any, user: User) => {
          acc[user.id] = user.role;
          return acc;
        }, {});
        setPreviousRoles(initialRoles);
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
        setPreviousRoles((prev) => ({
          ...prev,
          [userId]: newRole,
        }));
      } else {
        toast.error("Failed to assign role");
      }
    } catch (error) {
      toast.error("An error occurred while assigning the role");
    } finally {
      setLoading((prev) => ({ ...prev, [userId]: false }));
    }
  };

  const handleRoleChange = (userId: string, newRole: string) => {
    setSelectedRoles((prevRoles) => ({
      ...prevRoles,
      [userId]: newRole,
    }));
    assignRole(userId, newRole); // Auto-save on select
  };

  const handleEscapeKey = (userId: string) => {
    if (previousRoles[userId]) {
      setSelectedRoles((prev) => ({
        ...prev,
        [userId]: previousRoles[userId],
      }));
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLSelectElement>, userId: string) => {
    if (event.key === "Escape") {
      handleEscapeKey(userId); // Revert to the previous role on escape
    }
  };

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

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">User Management</h2>

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
                  onChange={(e) => handleRoleChange(user.id, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, user.id)} // Handle Escape key to revert changes
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
                <Button className="btn btn-error" onClick={() => deleteUser(user.id)}>
                  <Trash/> Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination Controls */}
      <div className="flex justify-between mt-4">
        <Button
          className="btn"
          onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
          disabled={page === 1 || isFetching}
        >
          Previous
        </Button>
        <span>Page {page} of {totalPages}</span>
        <Button
          className="btn"
          onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={page === totalPages || isFetching}
        >
          Next
        </Button>
      </div>
      <div className="flex justify-end mt-2">
        <select
          className="select select-bordered w-32"
          value={limit}
          onChange={(e) => setLimit(parseInt(e.target.value))}
        >
          <option value={10}>10 per page</option>
          <option value={15}>15 per page</option>
          <option value={20}>20 per page</option>
        </select>
      </div>
    </div>
  );
};

export default UserManagement;
