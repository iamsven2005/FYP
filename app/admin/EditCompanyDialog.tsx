"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import Combobox from "@/components/Combobox";
import { Edit, Save } from "lucide-react";
import { Company } from "@prisma/client";

// Define the types for User and Company
type User = {
  id: string;
  username: string;
  role: string;
};



type EditCompanyDialogProps = {
  company: Company;
  staffUsers: User[];
  managerUsers: User[];
  onCompanyUpdate: (updatedCompany: Company) => void;
};

const EditCompanyDialog = ({ company, staffUsers, managerUsers, onCompanyUpdate }: EditCompanyDialogProps) => {
  const [companyName, setCompanyName] = useState(company.name);
  const [companyImgUrl, setCompanyImgUrl] = useState(company.img);
  const [selectedStaff, setSelectedStaff] = useState(company.staff || "");
  const [selectedManager, setSelectedManager] = useState(company.manager || "");
  const [loading, setLoading] = useState(false);

  // Handle image change and convert to Base64
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCompanyImgUrl(reader.result as string); // Set Base64 image to state
      };
      reader.readAsDataURL(file); // Convert the file to Base64
    }
  };

  // Handle company update
  const updateCompany = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/companies?id=${company.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: companyName,
          imgurl: companyImgUrl, // Base64 string will be sent here
          staff: selectedStaff,
          manager: selectedManager,
        }),
      });

      if (res.ok) {
        const updatedCompany = await res.json();
        toast.success("Company updated successfully");
        onCompanyUpdate(updatedCompany); // Trigger the callback to update the parent component
      } else {
        toast.error("Failed to update company");
      }
    } catch (error) {
      toast.error("An error occurred while updating the company");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>
          <Edit /> Edit Company
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Company</DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          <Input
            type="text"
            placeholder="Company Name"
            className="input input-bordered w-full mb-4"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
          />

          {/* Image upload as base64 */}
          <input type="file" accept="image/*" onChange={handleImageChange} />
          {companyImgUrl && <img src={companyImgUrl} alt="Preview" className="mt-4 max-w-full h-auto" />}

          {/* Staff and Manager Comboboxes */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2">Assign Staff and Manager</h3>
            <div className="flex space-x-4">
              <Combobox
                items={staffUsers}
                selectedValue={selectedStaff}
                onSelect={setSelectedStaff}
                placeholder="Select Staff"
              />
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
          <Button className="btn btn-primary" onClick={updateCompany} disabled={loading}>
            <Save />
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditCompanyDialog;
