'use client'

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Bell, CheckCircle, Loader2 } from "lucide-react"
import { Notification } from "@prisma/client"
import Name from "./name"

interface User {
  username: string
  email: string
  id: string
}

export default function NotificationsPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (token) {
      const decoded = parseJwt(token)
      setUser({ id: decoded.userId, username: decoded.username, email: decoded.email })
    } else {
      router.push("/Login")
    }
    setLoading(false)
  }, [router])

  useEffect(() => {
    if (user?.id) {
      fetchNotifications()
    }
  }, [user])

  const getAuthHeader = () => {
    const token = localStorage.getItem("token")
    return token ? { Authorization: `Bearer ${token}` } : {}
  }

  const fetchNotifications = async () => {
    try {
      const { data } = await axios.get(`/api/items/${user!.id}/notify`, {
        headers: getAuthHeader(), // Add Authorization header here
      })
      setNotifications(data)
    } catch (error) {
      toast.error("Failed to fetch notifications")
    }
  }

  const handleRead = async (id: string) => {
    try {
      await axios.post(`/api/items/${id}/notify`, {}, {
        headers: getAuthHeader(), // Add Authorization header here
      })
      setNotifications((prevNotifications) =>
        prevNotifications.filter((notification) => notification.id !== id)
      )
      toast.success("Notification marked as read")
    } catch (error) {
      toast.error("Failed to mark notification as read")
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  return (
    <Card className="w-full max-w-2xl mx-auto mt-8">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Notifications</CardTitle>
        <CardDescription>Stay updated with your latest notifications</CardDescription>
      </CardHeader>
      <CardContent>
        {notifications.length === 0 ? (
          <div className="text-center py-8">
            <Bell className="w-12 h-12 mx-auto text-gray-400" />
            <p className="mt-4 text-lg font-medium text-gray-900">No new notifications</p>
            <p className="mt-1 text-sm text-gray-500">You&apos;re all caught up!</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {notifications.map((notification) => (
              <li key={notification.id} className="py-4">
                <div className="flex items-start space-x-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{notification.body}</p>
                    <Name id={notification.user_from} />
                    <p className="text-sm text-gray-500">
                      {new Date(notification.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <Button
                    onClick={() => handleRead(notification.id)}
                    size="sm"
                    className="flex items-center space-x-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Mark as Read</span>
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}

function parseJwt(token: string) {
  const base64Url = token.split(".")[1]
  const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/")
  const jsonPayload = decodeURIComponent(
    atob(base64)
      .split("")
      .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
      .join("")
  )
  return JSON.parse(jsonPayload)
}
