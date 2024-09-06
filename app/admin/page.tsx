"use client";

import { User } from "@prisma/client";
import CompanyManagement from "./CompanyManagement";
import UserManagement from "./UserManagement";
import { useEffect, useState } from "react";


const roles = ["Admin", "Staff", "Manager", "Client"];

const Admin = () => {
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
        console.error("Failed to fetch users", error);
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
