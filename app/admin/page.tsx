//@ts-nocheck
'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Company, images, User } from '@prisma/client'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import * as XLSX from 'xlsx'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import Verify from '@/components/verify'
import UserManagement from './UserManagement'
import CompanyManagement from './CompanyManagement'
const roles = ["Admin", "Staff", "Manager", "Client"];
interface Props {
  params: {
    id: string
  }
}

interface UserI {
  username: string
  email: string
  id: string
}

const Admin = ({ params }: Props) => {
  const router = useRouter()
  const [images, setImages] = useState<images[]>([])
  const [filteredImages, setFilteredImages] = useState<images[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [companies, setCompanies] = useState<Company[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [currentUser, setCurrentUser] = useState<UserI | null>(null)
  const [loading, setLoading] = useState(true)
  const [ingredientName, setIngredientName] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [staffUsers, setStaffUsers] = useState<User[]>([]);
  const [managerUsers, setManagerUsers] = useState<User[]>([]);
  const [clist, setlist] = useState<Company[]>([]);
  const [user, setUser] = useState<UserI | null>(null);
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      const decoded = parseJwt(token)
      setCurrentUser({ id: decoded.userId, username: decoded.username, email: decoded.email })
    } else {
      router.push('/Login')
    }
    setLoading(false)
  }, [router])

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token')
      const authHeader = { headers: { Authorization: `Bearer ${token}` } }

      const [companiesRes, usersRes, itemsRes] = await Promise.all([
        axios.get('/api/companies', authHeader),
        axios.get('/api/users', authHeader),
        axios.get('/api/items', authHeader)
      ])
      setlist(companiesRes.data);
      setCompanies(companiesRes.data)
      setUsers(usersRes.data.users)
      setImages(itemsRes.data)
      setFilteredImages(itemsRes.data)
      setStaffUsers(usersRes.data.users.filter((user: User) => user.role === "Staff"));
      setManagerUsers(usersRes.data.users.filter((user: User) => user.role === "Manager"));
      setUsers(usersRes.data.users);
    } catch (error) {
      toast.error('Failed to fetch data')
    }
  }

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value.toLowerCase()
    setSearchTerm(value)

    const filtered = images.filter((image) =>
      image.name.toLowerCase().includes(value) ||
      (image.ingredients && image.ingredients.some((ingredient: any) => ingredient.name.toLowerCase().includes(value)))
    )
    setFilteredImages(filtered)
  }

  const countStatuses = (ingredients: { status: string }[]) => {
    return ingredients.reduce((counts, ingredient) => {
      if (ingredient.status === 'Not Safe') counts.notSafe++
      else if (ingredient.status === 'Not Approved') counts.notApproved++
      else counts.approved++
      return counts
    }, { approved: 0, notApproved: 0, notSafe: 0 })
  }

  const exportToExcel = () => {
    const wb = XLSX.utils.book_new()

    const usersData = users.map(user => ({
      id: user.id,
      name: user.username,
      role: user.role,
      email: user.email,
    }))

    const companyData = companies.map(company => ({
      id: company.id,
      name: company.name,
      staff: company.staff,
      manager: company.manager,
      archived: company.archived,
      created: company.createdAt
    }))

    const imagesData = images.map(image => ({
      id: image.id,
      name: image.name,
      companyId: image.companyId,
      status: image.status,
      halal: image.halal ? 'Yes' : 'No',
      healthy: image.healthy ? 'Yes' : 'No',
      ai: image.AI,
      retrieved: image.retrived
    }))

    ;[
      { data: usersData, name: 'Users' },
      { data: companyData, name: 'Company' },
      { data: imagesData, name: 'Images' }
    ].forEach(({ data, name }) => {
      const ws = XLSX.utils.json_to_sheet(data)
      XLSX.utils.book_append_sheet(wb, ws, name)
    })

    XLSX.writeFile(wb, 'data_export.xlsx')
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = event.target.files?.[0]
    setFile(uploadedFile || null)
  }

  const handleSubmitFile = async () => {
    if (!file) {
      toast.error('Please upload a file first')
      return
    }

    const reader = new FileReader()

    reader.onload = async (e) => {
      const data = e.target?.result
      const workbook = XLSX.read(data, { type: 'binary' })
      const sheetName = workbook.SheetNames[2]
      const sheet = workbook.Sheets[sheetName]

      const ingredients = XLSX.utils.sheet_to_json(sheet, { header: 1 }).flat()

      const token = localStorage.getItem('token')
      const authHeader = { headers: { Authorization: `Bearer ${token}` } }

      for (const ingredient of ingredients) {
        if (ingredient) {
          try {
            await axios.post('/api/ingredient', { name: ingredient }, authHeader)
          } catch (error) {
            toast.error(`Failed to submit ingredient: ${ingredient}`)
          }
        }
      }

      toast.success('All ingredients submitted successfully')
    }

    reader.readAsBinaryString(file)
  }

  const handleSubmitIngredient = async () => {
    try {
      const token = localStorage.getItem('token')
      const authHeader = { headers: { Authorization: `Bearer ${token}` } }

      await axios.post('/api/ingredient', { name: ingredientName }, authHeader)
      toast.success('Ingredient submitted successfully')
      setIngredientName('')
    } catch (error) {
      toast.error('Failed to submit ingredient')
    }
  }

  if (loading) return <div>Loading...</div>

  return (
    <div className="container mx-auto mt-10 space-y-8">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      {currentUser && <Verify id={currentUser.id} />}
      
      <Button onClick={exportToExcel} className="bg-green-500 hover:bg-green-600">
        Export to Excel
      </Button>
       {/* Company Management */}
       {currentUser && (
        <div>
      <UserManagement roles={roles} id={currentUser.id}/>
      <CompanyManagement staffUsers={staffUsers} managerUsers={managerUsers} list={clist} id={currentUser.id}/>
        </div>


      )}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Submit a New Ingredient</h2>
        <div className="flex space-x-2">
          <Input
            type="text"
            value={ingredientName}
            onChange={(e) => setIngredientName(e.target.value)}
            placeholder="Enter ingredient name"
          />
          <Button onClick={handleSubmitIngredient}>Submit Ingredient</Button>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Upload Ingredients via XLSX</h2>
        <div className="flex space-x-2">
          <Input type="file" accept=".xlsx" onChange={handleFileUpload} />
          <Button onClick={handleSubmitFile}>Submit Ingredients from File</Button>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Images</h2>
        <Input
          type="text"
          value={searchTerm}
          onChange={handleSearch}
          placeholder="Search for food items or ingredients"
        />
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Image</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Company ID</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Halal</TableHead>
              <TableHead>Healthy</TableHead>
              <TableHead>AI</TableHead>
              <TableHead>Ingredients</TableHead>
              <TableHead>Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredImages.map((image) => {
              const ingredientCounts = image.ingredients ? countStatuses(image.ingredients) : null

              return (
                <TableRow key={image.id}>
                  <TableCell>{image.id}</TableCell>
                  <TableCell>
                    <Dialog>
                      <DialogTrigger>
                        <img src={image.imageurl} alt={image.name} className="h-16 w-16 object-cover cursor-pointer" />
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>{image.name} - Detailed Image View</DialogTitle>
                          <DialogDescription>A closer look at the selected image.</DialogDescription>
                        </DialogHeader>
                        <div className="flex justify-center">
                          <img src={image.imageurl} alt={image.name} className="max-w-full h-auto object-cover" />
                        </div>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                  <TableCell>{image.name}</TableCell>
                  <TableCell>{image.companyId}</TableCell>
                  <TableCell>{image.status}</TableCell>
                  <TableCell>{image.halal ? 'Yes' : 'No'}</TableCell>
                  <TableCell>{image.healthy ? 'Yes' : 'No'}</TableCell>
                  <TableCell>{image.AI}</TableCell>
                  <TableCell>
                    <Dialog>
                      <DialogTrigger className="text-blue-600 underline cursor-pointer">
                        <span className="text-green-600">Approved: {ingredientCounts?.approved || 0}</span>,{' '}
                        <span className="text-yellow-600">Not Approved: {ingredientCounts?.notApproved || 0}</span>,{' '}
                        <span className="text-red-600">Not Safe: {ingredientCounts?.notSafe || 0}</span>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>{image.name} - Ingredient Details</DialogTitle>
                          <DialogDescription>
                            Below is a detailed breakdown of the ingredients for this item.
                          </DialogDescription>
                        </DialogHeader>
                        {['Approved', 'Not Approved', 'Not Safe'].map((status) => (
                          <div key={status} className="mt-4">
                            <h3 className={`font-bold ${status === 'Approved' ? 'text-green-600' : status === 'Not Approved' ? 'text-yellow-600' : 'text-red-600'}`}>
                              {status} Ingredients:
                            </h3>
                            {image.ingredients &&
                              image.ingredients
                                .filter((ingredient) => 
                                  (status === 'Approved' && ingredient.status !== 'Not Safe' && ingredient.status !== 'Not Approved') ||
                                  (status === 'Not Approved' && ingredient.status === 'Not Approved') ||
                                  (status === 'Not Safe' && ingredient.status === 'Not Safe')
                                )
                                .map((ingredient, idx) => (
                                  <div key={idx} className={`rounded-lg px-2 py-1 ${status === 'Approved' ? 'bg-green-500 text-white' : status === 'Not Approved' ? 'bg-yellow-500 text-black' : 'bg-red-500 text-white'}`}>
                                    {ingredient.name}
                                  </div>
                                ))}
                          </div>
                        ))}
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                  <TableCell>{image.retrived}</TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

export default Admin

function parseJwt(token: string) {
  const base64Url = token.split('.')[1]
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
  const jsonPayload = decodeURIComponent(
    atob(base64)
      .split('')
      .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
      .join('')
  )
  return JSON.parse(jsonPayload)
}