"use client";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// Define the types for User and Role
type User = {
  id: string;
  username: string;
};

const Admin = () => {
  const [users, setUsers] = useState<User[]>([]); // Store the list of users
  const [selectedUser, setSelectedUser] = useState<string>(""); // Store the selected user
  const [selectedRole, setSelectedRole] = useState<string>(""); // Store the selected role
  const [message, setMessage] = useState<string>(""); // Message for success or failure
  const [loading, setLoading] = useState<boolean>(false); // State for button loading

  const roles = ["Admin", "Staff", "Manager", "Client"]; // Available roles

  // Fetch users from the API when the component loads
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch("/api/users");
        const data = await res.json();
        setUsers(data);
      } catch (error) {
        setMessage("Failed to fetch users");
      }
    };

    fetchUsers();
  }, []);

  // Function to assign a role to a user
  const assignRole = async () => {
    if (!selectedUser || !selectedRole) {
      setMessage("Please select a user and role");
      return;
    }

    setLoading(true); // Start loading state

    try {
      const res = await fetch("/api/roles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: selectedUser, rolename: selectedRole }),
      });

      if (res.ok) {
        setMessage("Role assigned successfully");
      } else {
        setMessage("Failed to assign role");
      }
    } catch (error) {
      setMessage("An error occurred while assigning the role");
    } finally {
      setLoading(false); // Stop loading state
    }
  };

  return (
    <div className="container mx-auto mt-10">
      <h1 className="text-2xl font-bold">Admin Page</h1>
      
      {/* Success or Error Message */}
      {message && <p className={`mt-4 ${message.includes("successfully") ? "text-green-500" : "text-red-500"}`}>{message}</p>}

      <div className="mt-4 space-y-4">
        {/* Select User */}
        <select
          value={selectedUser}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedUser(e.target.value)}
          className="border p-2 rounded-md w-full"
        >
          <option value="">Select User</option>
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.username}
            </option>
          ))}
        </select>

        {/* Select Role */}
        <select
          value={selectedRole}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedRole(e.target.value)}
          className="border p-2 rounded-md w-full"
        >
          <option value="">Select Role</option>
          {roles.map((role) => (
            <option key={role} value={role}>
              {role}
            </option>
          ))}
        </select>

        {/* Assign Role Button */}
        <Button
          className="mt-4 w-full bg-blue-600"
          onClick={assignRole}
          disabled={loading}
        >
          {loading ? "Assigning..." : "Assign Role"}
        </Button>
      </div>
    </div>
  );
};

export default Admin;
