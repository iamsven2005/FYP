"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import EditCompanyDialog from "./EditCompanyDialog";
import Combobox from "@/components/Combobox";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Archive, PlusCircle, Save } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Company, User } from "@prisma/client";
import { Card, CardTitle } from "@/components/ui/card";
import axios from "axios";

const CompanyManagement = ({ staffUsers, managerUsers, list, id }: { staffUsers: User[], managerUsers: User[], list: Company[], id: string }) => {
  const [companies, setCompanies] = useState<Company[]>(list);
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>(list);
  const [companyName, setCompanyName] = useState<string>("");
  const [companyImgUrl, setCompanyImgUrl] = useState<string>("");
  const [companySearchTerm, setCompanySearchTerm] = useState<string>("");
  const [companyFilter, setCompanyFilter] = useState<"all" | "archived" | "unarchived">("all");
  const [selectedStaff, setSelectedStaff] = useState<string>("");
  const [selectedManager, setSelectedManager] = useState<string>("");

  // Log the list prop for debugging
  console.log("List prop passed to CompanyManagement:", list);

  // Set the companies state from the list prop when the component mounts
  useEffect(() => {
    console.log("Setting companies from list...");
    setCompanies(list);
    setFilteredCompanies(list);
  }, [list]); // This effect runs when the list prop changes

  // Filter companies based on the search term and filter type
  useEffect(() => {
    let filtered = companies;

    if (companyFilter === "archived") {
      filtered = companies.filter((company) => company.archived);
    } else if (companyFilter === "unarchived") {
      filtered = companies.filter((company) => !company.archived);
    }

    filtered = filtered.filter((company) =>
      company.name.toLowerCase().includes(companySearchTerm.toLowerCase())
    );
    
    setFilteredCompanies(filtered);
  }, [companySearchTerm, companyFilter, companies]);

  const toggleArchiveCompany = async (companyId: string, archived: boolean) => {
    try {
      const res = await axios.patch(`/api/companies/${companyId}`, {
        archived, // No need for `data` wrapper
      });
      
      setCompanies((prevCompanies) =>
        prevCompanies.map((company) =>
          company.id === companyId ? { ...company, archived } : company
        )
      );
      toast.success(`Company ${archived ? "archived" : "unarchived"} successfully`);
    } catch (error) {
      toast.error("An error occurred while updating company status");
    }
  };
  

  // Convert image to base64
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCompanyImgUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const createCompany = async () => {
    // Added validation checks for empty fields
    if (!companyName || !companyImgUrl || !selectedStaff || !selectedManager) {
      toast.error("Please fill out all fields before creating the company");
      return;
    }
  
    try {
      // Log the payload for debugging
      console.log({
        name: companyName,
        imgurl: companyImgUrl,  // Image is passed here
        staffId: selectedStaff,
        managerId: selectedManager,
        id
      });
  
      const res = await axios.post("/api/companies", {
        name: companyName,
        imgurl: companyImgUrl,
        staffId: selectedStaff,
        managerId: selectedManager,
        id
      });
  
      toast.success("Company created successfully");
      const newCompany = await res.data;
      setCompanies((prevCompanies) => [...prevCompanies, newCompany]); // Update companies state
      setCompanyName("");
      setCompanyImgUrl("");
      setSelectedStaff("");
      setSelectedManager("");
    } catch (error) {
      toast.error("An error occurred while creating the company");
    }
  };
  

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Company Management</h2>

      {/* Search and Filters */}
      <div className="flex justify-between mb-4">
        <Input
          type="text"
          placeholder="Search companies..."
          className="input input-bordered w-full max-w-xs"
          value={companySearchTerm}
          onChange={(e) => setCompanySearchTerm(e.target.value)}
        />
        <div className="flex space-x-2">
          <Button
            className={`btn ${companyFilter === "all" ? "btn-primary" : "btn-secondary"}`}
            onClick={() => setCompanyFilter("all")}
          >
            All
          </Button>
          <Button
            className={`btn ${companyFilter === "unarchived" ? "btn-primary" : "btn-secondary"}`}
            onClick={() => setCompanyFilter("unarchived")}
          >
            Unarchived
          </Button>
          <Button
            className={`btn ${companyFilter === "archived" ? "btn-primary" : "btn-secondary"}`}
            onClick={() => setCompanyFilter("archived")}
          >
            Archived
          </Button>
        </div>
      </div>

      {/* Company Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Create Company Dialog */}
        <Dialog>
          <DialogTrigger asChild>
            <Card className="flex flex-col items-center justify-center gap-4 p-4">
              <PlusCircle/>
              <CardTitle>Create Company</CardTitle>
            </Card>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create a Company</DialogTitle>
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
              <div className="mt-10">
                <h2 className="text-xl font-bold mb-4">Select Staff and Manager</h2>
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
              <Button className="btn btn-primary" onClick={createCompany}>
                <Save/>Save
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        {filteredCompanies.map((company) => (
          <Card key={company.id} className="flex flex-col gap-4 px-6 py-8">
            <img src={company.img} alt={company.name} className="w-full m-5 rounded-sm mx-auto" />
            <div className="flex justify-between">
              <CardTitle>{company.name}</CardTitle>
              <Badge>{company.archived ? "Archived" : "Active"}</Badge>
            </div>
            <div className="flex gap-5">
              <Button
                className={`${company.archived ? "btn-secondary" : "btn-primary"}`}
                onClick={() => toggleArchiveCompany(company.id, !company.archived)}
              >
                <Archive/>
                {company.archived ? "Unarchive" : "Archive"}
              </Button>
              <Button asChild>
                <Link href={`/admin/${company.id}`}>View</Link>
              </Button>
              <EditCompanyDialog
                company={company}
                staffUsers={staffUsers}
                managerUsers={managerUsers}
                onCompanyUpdate={(updatedCompany) => {
                  setCompanies((prevCompanies) =>
                    prevCompanies.map((comp) => (comp.id === updatedCompany.id ? updatedCompany : comp))
                  );
                }}
                id={id}
              />
              
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default CompanyManagement;
