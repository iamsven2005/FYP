"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlusCircle, faArchive, faBoxOpen } from "@fortawesome/free-solid-svg-icons";
import { UploadButton } from "@/lib/uploadthing";
import EditCompanyDialog from "./EditCompanyDialog";
import Combobox from "@/components/Combobox";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Archive, PlusCircle, Save } from "lucide-react";
import { Badge } from "@/components/ui/badge";

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
};

const CompanyManagement = ({ staffUsers, managerUsers }: { staffUsers: User[], managerUsers: User[] }) => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([]);
  const [companyName, setCompanyName] = useState<string>("");
  const [companyImgUrl, setCompanyImgUrl] = useState<string>("");
  const [companySearchTerm, setCompanySearchTerm] = useState<string>("");
  const [companyFilter, setCompanyFilter] = useState<"all" | "archived" | "unarchived">("all");
  const [selectedStaff, setSelectedStaff] = useState<string>("");
  const [selectedManager, setSelectedManager] = useState<string>("");

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const res = await fetch("/api/companies");
        const data = await res.json();
        setCompanies(data);
        setFilteredCompanies(data);
      } catch (error) {
        toast.error("Failed to fetch companies");
      }
    };

    fetchCompanies();
  }, []);

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
      const res = await fetch(`/api/companies/${companyId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ archived }),
      });
      if (res.ok) {
        setCompanies((prevCompanies) =>
          prevCompanies.map((company) =>
            company.id === companyId ? { ...company, archived } : company
          )
        );
        toast.success(`Company ${archived ? "archived" : "unarchived"} successfully`);
      } else {
        toast.error("Failed to update company status");
      }
    } catch (error) {
      toast.error("An error occurred while updating company status");
    }
  };

  const createCompany = async () => {
    try {
      const res = await fetch("/api/companies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: companyName,
          imgurl: companyImgUrl,
          staffId: selectedStaff,
          managerId: selectedManager,
        }),
      });
      if (res.ok) {
        toast.success("Company created successfully");
        const newCompany = await res.json();
        setCompanies((prevCompanies) => [...prevCompanies, newCompany]);
        setCompanyName("");
        setCompanyImgUrl("");
        setSelectedStaff("");
        setSelectedManager("");
      } else {
        toast.error("Failed to create company");
      }
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
          <div className="flex flex-col items-center justify-center gap-4 p-4 bg-base-300 hover:bg-base-200">
            <PlusCircle/>
            <p>Create Company</p>
          </div>
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
            <UploadButton
              endpoint="imageUploader"
              onClientUploadComplete={(res: { url: any }[]) => {
                setCompanyImgUrl(res[0]?.url || "");
              }}
              onUploadError={(error: Error) => {
                alert(`ERROR! ${error.message}`);
              }}
            />

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
          <div key={company.id} className="flex flex-col gap-4 px-6 py-8 bg-base-300 hover:bg-base-200">
            <img src={company.imgurl} alt={company.name} className="w-full m-5 rounded-sm mx-auto" />
            <div className="flex">
            <h3 className="text-lg font-bold">{company.name}</h3>
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

            <EditCompanyDialog
              company={company}
              staffUsers={staffUsers}
              managerUsers={managerUsers}
              onCompanyUpdate={(updatedCompany) => {
                setCompanies((prevCompanies) =>
                  prevCompanies.map((comp) => (comp.id === updatedCompany.id ? updatedCompany : comp))
                );
              }}
            />
            </div>

          </div>
        ))}
      </div>


    </div>
  );
};

export default CompanyManagement;
