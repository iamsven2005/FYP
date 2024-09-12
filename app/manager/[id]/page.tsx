"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface Company {
  id: string
  name: string
  archived: boolean
  img: string | null
}

interface Item {
  id: string
  name: string
  imageurl: string
  halal: boolean
  healthy: boolean
  retrived: string
  AI: string
  status: string
}

export default function CompanyDetails({ params }: { params: { id: string } }) {
  const [company, setCompany] = useState<Company | null>(null)
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    fetch(`/api/companies/${params.id}/approve`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.error)
        } else {
          setCompany(data.company)
          setItems(data.items)
        }
        setLoading(false)
      })
      .catch(() => {
        setError("Failed to fetch company details")
        setLoading(false)
      })
  }, [params.id])

  const handleApprove = async (itemId: string) => {
    try {
      const response = await fetch(`/api/items/${itemId}/approve`, {
        method: "PATCH",
      })
      if (response.ok) {
        alert("Item approved successfully!")
        setItems((prevItems) =>
          prevItems.map((item) =>
            item.id === itemId ? { ...item, status: "APPROVED" } : item
          )
        )
      } else {
        console.error("Failed to approve item")
      }
    } catch (error) {
      console.error("Error approving item:", error)
    }
  }

  const handleReject = async (itemId: string) => {
    try {
      const response = await fetch(`/api/items/${itemId}/reject`, {
        method: "PATCH",
      })
      if (response.ok) {
        alert("Item rejected successfully!")
        setItems((prevItems) =>
          prevItems.map((item) =>
            item.id === itemId ? { ...item, status: "REJECTED" } : item
          )
        )
      } else {
        console.error("Failed to reject item")
      }
    } catch (error) {
      console.error("Error rejecting item:", error)
    }
  }

  if (loading) return <p className="text-center p-8">Loading...</p>
  if (error) return <p className="text-center p-8 text-red-500">{error}</p>
  if (!company) return <p className="text-center p-8">No company details found.</p>

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-3xl">{company.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <Badge variant={company.archived ? "secondary" : "default"}>
            {company.archived ? "Archived" : "Active"}
          </Badge>
          {company.img && (
            <img src={company.img} alt={company.name} className="mt-4 w-full h-auto rounded-lg" />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Uploaded Items for Review</CardTitle>
        </CardHeader>
        <CardContent>
          {items.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map((item) => (
                <Card key={item.id}>
                  <CardContent className="p-4">
                    <img src={item.imageurl} alt={item.name} className="w-full h-48 object-cover rounded-md mb-4" />
                    <h3 className="text-xl font-bold mb-2">{item.name}</h3>
                    <div className="space-y-2 mb-4">
                      <Badge variant={item.halal ? "secondary" : "destructive"}>
                        {item.halal ? "Halal" : "Not Halal"}
                      </Badge>
                      <Badge variant={item.healthy ? "secondary" : "destructive"}>
                        {item.healthy ? "Healthy" : "Not Healthy"}
                      </Badge>
                      <Badge variant="outline">{item.status}</Badge>
                    </div>
                    <p className="text-sm mb-2">Extracted Text: {item.retrived}</p>
                    <p className="text-sm mb-4">AI Advisory: {item.AI}</p>
                    <div className="flex gap-2">
                      <Button onClick={() => handleApprove(item.id)} size="sm" className="flex-1">
                        Approve
                      </Button>
                      <Button onClick={() => handleReject(item.id)} variant="destructive" size="sm" className="flex-1">
                        Reject
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <p>No items found for review.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}