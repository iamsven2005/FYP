"use client"
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { DndContext, closestCenter } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { SortableItem } from '@/components/SortableItem';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { ComboboxDemo } from "@/components/ComboboxDemo";
import { Role, User } from "@prisma/client";

interface Props {
  params: {
    id: string;
  };
}




const CompanyPage = ({ params }: Props) => {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [roleName, setRoleName] = useState("");
  const router = useRouter();

  useEffect(() => {
    // Fetch users
    const fetchUsers = async () => {
      const res = await fetch("/api/users"); // Create an API route to fetch all users
      const data = await res.json();
      setUsers(data);
    };

    // Fetch roles
    const fetchRoles = async () => {
      const res = await fetch(`/api/companies/${params.id}/roles`); // Create an API route to fetch roles for a specific company
      const data = await res.json();
      setRoles(data);
    };

    fetchUsers();
    fetchRoles();
  }, [params.id]);

  const createRole = async () => {
    if (!selectedUser || !roleName) {
      alert("Please select a user and enter a role name");
      return;
    }

    const res = await fetch(`/api/companies/${params.id}/roles`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: selectedUser,
        rolename: roleName,
      }),
    });

    if (res.ok) {
      const newRole = await res.json();
      setRoles([...roles, newRole]);
      setRoleName("");
      setSelectedUser(null);
    }
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const oldIndex = roles.findIndex((role) => role.id === active.id);
      const newIndex = roles.findIndex((role) => role.id === over.id);

      const newOrder = arrayMove(roles, oldIndex, newIndex);
      setRoles(newOrder);

      // Update the position in the database
      newOrder.forEach(async (role, index) => {
        await fetch(`/api/companies/${role.id}/position`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ position: index + 1 }),
        });
      });
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Manage Roles for Company</h1>

      <div className="mb-6">
        <label className="block mb-2">Role Name</label>
        <input
          type="text"
          value={roleName}
          onChange={(e) => setRoleName(e.target.value)}
          className="border p-2 w-full mb-4"
        />

        <ComboboxDemo
          items={users.map((user) => ({
            value: user.id,
            label: user.username,
          }))}
          value={selectedUser}
          onChange={(value) => setSelectedUser(value)}
        />

        <Button onClick={createRole} className="mt-4">
          Create Role
        </Button>
      </div>

      <DndContext
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
        modifiers={[restrictToVerticalAxis]}
      >
        <SortableContext
          items={roles.map((role) => role.id)}
        >
          {roles.map((role) => (
            <SortableItem key={role.id} id={role.id}>
              <div className="border p-4 mb-2 rounded-md flex items-center justify-between">
                <span>{role.rolename} - {role.userId}</span>
              </div>
            </SortableItem>
          ))}
        </SortableContext>
      </DndContext>
    </div>
  );
};

export default CompanyPage;
