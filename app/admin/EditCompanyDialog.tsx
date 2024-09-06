"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { UploadButton } from "@/lib/uploadthing";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSave, faEdit } from "@fortawesome/free-solid-svg-icons";
import { toast } from "sonner";
import Combobox from "@/components/Combobox";

// Define the types for User and Company
type User = {
  id: string;
  username: string;
  role: string;
};

type Company = {
  id: string;
  name: string;
  archived: boolean;
  imgurl: string;
  staffId?: string;
  managerId?: string;
};

type EditCompanyDialogProps = {
  company: Company;
  staffUsers: User[];
  managerUsers: User[];
  onCompanyUpdate: (updatedCompany: Company) => void;
};

const EditCompanyDialog = ({ company, staffUsers, managerUsers, onCompanyUpdate }: EditCompanyDialogProps) => {
  const [companyName, setCompanyName] = useState(company.name);
  const [companyImgUrl, setCompanyImgUrl] = useState(company.imgurl);
  const [selectedStaff, setSelectedStaff] = useState(company.staffId || "");
  const [selectedManager, setSelectedManager] = useState(company.managerId || "");
  const [loading, setLoading] = useState(false);

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
          imgurl: companyImgUrl,
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
          <FontAwesomeIcon icon={faEdit} className="mr-2" /> Edit Company
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
          <UploadButton
            endpoint="imageUploader"
            onClientUploadComplete={(res: { url: string }[]) => {
              setCompanyImgUrl(res[0]?.url || "");
            }}
            onUploadError={(error: Error) => {
              alert(`ERROR! ${error.message}`);
            }}
          />

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
            <FontAwesomeIcon icon={faSave} className="mr-2" />
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditCompanyDialog;
