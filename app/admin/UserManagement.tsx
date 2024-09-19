'use client'

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { Trash, ChevronUp, ChevronDown } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { ComboboxDemo } from "@/components/ComboboxDemo"
import axios from "axios"

type User = {
  id: string
  username: string
  role: string
}

type UserManagementProps = {
  roles: string[]
  id: string
}

const rolePriority: { [key: string]: number } = {
  Admin: 1,
  Manager: 2,
  Staff: 3,
  Client: 4,
}

export default function UserManagement({ roles, id }: UserManagementProps) {
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [selectedRoles, setSelectedRoles] = useState<{ [key: string]: string }>({})
  const [loading, setLoading] = useState<{ [key: string]: boolean }>({})
  const [isFetching, setIsFetching] = useState<boolean>(false)
  const [page, setPage] = useState<number>(1)
  const [limit, setLimit] = useState<number>(10)
  const [totalPages, setTotalPages] = useState<number>(1)
  const [sortField, setSortField] = useState<string>("username")
  const [sortDirection, setSortDirection] = useState<string>("asc")

  // Function to get the Authorization header
  const getAuthHeader = () => {
    const token = localStorage.getItem("token");
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  useEffect(() => {
    const fetchUsers = async () => {
      setIsFetching(true)
      try {
        const res = await axios.get(`/api/users?page=${page}&limit=${limit}`, getAuthHeader())  // Add header
        const data = await res.data
        setUsers(data.users)
        setFilteredUsers(data.users)
        setTotalPages(data.totalPages)
        setSelectedRoles(data.users.reduce((acc: any, user: User) => {
          acc[user.id] = user.role
          return acc
        }, {}))
      } catch (error) {
        toast.error("Failed to fetch users")
      } finally {
        setIsFetching(false)
      }
    }

    fetchUsers()
  }, [page, limit])

  useEffect(() => {
    let filtered = users.filter((user) =>
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(searchTerm.toLowerCase())
    )

    filtered = filtered.sort((a, b) => {
      let valueA: string | number = a[sortField as keyof User]
      let valueB: string | number = b[sortField as keyof User]

      if (sortField === "role") {
        valueA = rolePriority[a.role] || 999
        valueB = rolePriority[b.role] || 999
      }

      if (typeof valueA === 'number' && typeof valueB === 'number') {
        return sortDirection === "asc" ? valueA - valueB : valueB - valueA
      } else {
        const stringA = valueA.toString().toLowerCase()
        const stringB = valueB.toString().toLowerCase()
        return sortDirection === "asc" ? stringA.localeCompare(stringB) : stringB.localeCompare(stringA)
      }
    })

    setFilteredUsers(filtered)
  }, [searchTerm, users, sortField, sortDirection])

  const assignRole = async (userId: string, newRole: string) => {
    setLoading((prev) => ({ ...prev, [userId]: true }))
    try {
      const res = await axios.post("/api/roles", {
        userId, 
        rolename: newRole, 
        id,  // This is the ID of the admin or the person assigning the role
      }, getAuthHeader())  // Add header
      toast.success("Role assigned successfully")
      setUsers((prevUsers) =>
        prevUsers.map((user) => (user.id === userId ? { ...user, role: newRole } : user))
      )
      setSelectedRoles((prev) => ({ ...prev, [userId]: newRole }))
    } catch (error) {
      toast.error("An error occurred while assigning the role")
    } finally {
      setLoading((prev) => ({ ...prev, [userId]: false }))
    }
  }
  

  const handleRoleChange = (userId: string, newRole: string ) => {
    setSelectedRoles((prevRoles) => ({ ...prevRoles, [userId]: newRole }))
    assignRole(userId, newRole)
  }

  const handleSortChange = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const deleteUser = async (userId: string) => {
    try {
      const res = await axios.delete(`/api/users/${userId}`, getAuthHeader())  // Add header
        toast.success("User deleted successfully")
        setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId))
    } catch (error) {
      toast.error("An error occurred while deleting the user")
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">User Management</h2>
      <div className="flex justify-end">
        <Input
          type="text"
          placeholder="Search by username or role..."
          className="max-w-xs"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead onClick={() => handleSortChange("username")} className="cursor-pointer">
              Username {sortField === "username" && (sortDirection === "asc" ? <ChevronUp className="inline" /> : <ChevronDown className="inline" />)}
            </TableHead>
            <TableHead onClick={() => handleSortChange("role")} className="cursor-pointer">
              Role {sortField === "role" && (sortDirection === "asc" ? <ChevronUp className="inline" /> : <ChevronDown className="inline" />)}
            </TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredUsers.map((user) => (
            <TableRow key={user.id}>
              <TableCell>{user.username}</TableCell>
              <TableCell>
                <ComboboxDemo
                  items={roles.map(role => ({ label: role, value: role }))}
                  value={selectedRoles[user.id] || user.role}
                  onChange={(value) => handleRoleChange(user.id, value || "staff")}
                />
              </TableCell>
              <TableCell>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm">
                      <Trash className="mr-2 h-4 w-4" /> Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the user account.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => deleteUser(user.id)}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="flex justify-between items-center">
        <Button
          onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
          disabled={page === 1 || isFetching}
        >
          Previous
        </Button>
        <span>Page {page} of {totalPages}</span>
        <Button
          onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={page === totalPages || isFetching}
        >
          Next
        </Button>
        <ComboboxDemo
          items={[
            { label: "10 per page", value: "10" },
            { label: "15 per page", value: "15" },
            { label: "20 per page", value: "20" },
          ]}
          value={limit.toString()}
          onChange={(value) => setLimit(parseInt(value || "10"))}
        />
      </div>
    </div>
  )
}
