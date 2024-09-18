"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import Combobox from "@/components/Combobox"
import { Edit, Save, Upload } from "lucide-react"
import { Company } from "@prisma/client"
import { Card, CardContent } from "@/components/ui/card"
import axios from "axios"

type User = {
  id: string
  username: string
  role: string
}

type EditCompanyDialogProps = {
  company: Company
  staffUsers: User[]
  managerUsers: User[]
  onCompanyUpdate: (updatedCompany: Company) => void
  id: string
}

export default function EditCompanyDialog({
  company,
  staffUsers,
  managerUsers,
  onCompanyUpdate,
  id
}: EditCompanyDialogProps) {
  const [companyName, setCompanyName] = useState(company.name)
  const [companyImgUrl, setCompanyImgUrl] = useState(company.img)
  const [selectedStaff, setSelectedStaff] = useState(company.staff || "")
  const [selectedManager, setSelectedManager] = useState(company.manager || "")
  const [loading, setLoading] = useState(false)

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setCompanyImgUrl(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const updateCompany = async () => {
    // Validation checks before updating
    if (!companyName || !companyImgUrl || !selectedStaff || !selectedManager) {
      toast.error("Please fill out all fields before updating the company")
      return
    }

    setLoading(true)
    try {
      const res = await axios.patch(`/api/companies?id=${company.id}`, {
        data:{
          name: companyName,
          img: companyImgUrl,
          staff: selectedStaff,
          manager: selectedManager,
          id
        },
      })
        toast.success("Company updated successfully")
        onCompanyUpdate(res.data)
    } catch (error) {
      toast.error("An error occurred while updating the company")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>
          <Edit className="mr-2 h-4 w-4" /> Edit Company
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Company</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              id="name"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="image" className="text-right">
              Image
            </Label>
            <div className="col-span-3">
              <Input
                id="image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
              <Label htmlFor="image" className="cursor-pointer">
                <Card>
                  <CardContent className="flex items-center justify-center p-6">
                    {companyImgUrl ? (
                      <img src={companyImgUrl} alt="Preview" className="max-w-full h-auto" />
                    ) : (
                      <div className="flex flex-col items-center">
                        <Upload className="h-8 w-8 mb-2" />
                        <span>Upload Image</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Label>
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="staff" className="text-right">
              Staff
            </Label>
            <div className="col-span-3">
              <Combobox
                items={staffUsers}
                selectedValue={selectedStaff}
                onSelect={setSelectedStaff}
                placeholder="Select Staff"
              />
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="manager" className="text-right">
              Manager
            </Label>
            <div className="col-span-3">
              <Combobox
                items={managerUsers}
                selectedValue={selectedManager}
                onSelect={setSelectedManager}
                placeholder="Select Manager"
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={updateCompany} disabled={loading}>
            <Save className="mr-2 h-4 w-4" />
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
