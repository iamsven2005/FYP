"use client";

import { User } from "@prisma/client";
import CompanyManagement from "./CompanyManagement";
import UserManagement from "./UserManagement";
import { useEffect, useState } from "react";
import { toast } from "sonner"; // Importing toast for error handling

const roles = ["Admin", "Staff", "Manager", "Client"];
interface Props {
  params: {
    id: string;
  };
}

const Admin = ({ params }: Props) => {
  const [staffUsers, setStaffUsers] = useState<User[]>([]);
  const [managerUsers, setManagerUsers] = useState<User[]>([]);

  useEffect(() => {
    // Fetch users to get staff and managers
    const fetchUsers = async () => {
      try {
        const res = await fetch("/api/users");
        const data = await res.json();
        setStaffUsers(data.users.filter((user: User) => user.role === "Staff"));
        setManagerUsers(data.users.filter((user: User) => user.role === "Manager"));
      } catch (error) {
        toast.error("Failed to fetch users"); // Replacing console.error with toast error
      }
    };
    fetchUsers();
  }, []);

  return (
    <div className="container mx-auto mt-10">
      <h1 className="text-3xl font-bold text-base-content">Admin Dashboard</h1>

      {/* User Management */}
      <UserManagement roles={roles} />

      {/* Company Management */}
      <CompanyManagement staffUsers={staffUsers} managerUsers={managerUsers} />
    </div>
  );
};

export default Admin;
