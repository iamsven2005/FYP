"use client";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// Define the types for User and Role
type User = {
  id: string;
  username: string;
};

const RoleManagement = () => {
  const [users, setUsers] = useState<User[]>([]); // Explicitly define the type
  const [selectedUser, setSelectedUser] = useState<string>(""); // Define as string
  const [selectedRole, setSelectedRole] = useState<string>(""); // Define as string
  const roles = ["Admin", "Staff", "Manager", "Client"]; // Roles array

  useEffect(() => {
    // Fetch users from your API
    fetch("/api/users")
      .then((res) => res.json())
      .then((data) => setUsers(data));
  }, []);

  const assignRole = async () => {
    if (!selectedUser || !selectedRole) return;

    const res = await fetch("/api/roles", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId: selectedUser, rolename: selectedRole }),
    });

    if (res.ok) {
      alert("Role assigned successfully");
    } else {
      alert("Failed to assign role");
    }
  };

  return (
    <div className="container mx-auto mt-10">
      <h1 className="text-2xl font-bold">Admin Role Management</h1>
      <div className="mt-4 space-y-4">
        {/* Select User */}
        <select
          value={selectedUser}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedUser(e.target.value)}
          className="border p-2 rounded-md"
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
          className="border p-2 rounded-md"
        >
          <option value="">Select Role</option>
          {roles.map((role) => (
            <option key={role} value={role}>
              {role}
            </option>
          ))}
        </select>

        {/* Assign Role Button */}
        <Button className="mt-4" onClick={assignRole}>
          Assign Role
        </Button>
      </div>
    </div>
  );
};

export default RoleManagement;
