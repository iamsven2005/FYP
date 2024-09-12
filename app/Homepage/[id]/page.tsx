import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card"
import { db } from "@/lib/db"

interface Props {
  params: {
    id: string
  }
}

interface Image {
  id: string
  imageurl: string
  name: string
  retrived: string
  AI: string
  status: string
}

export default async function Page({ params }: Props) {
  const images = await db.images.findMany({
    where: {
      companyId: params.id,
    },
  }) as Image[]

  return (
    <div className="container mx-auto py-8">
      {images.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {images.map((image) => (
            <Card key={image.id} className="overflow-hidden">
              <CardContent className="p-0">
                <img src={image.imageurl} alt={image.name} className="w-full h-48 object-cover" />
                <div className="p-4 space-y-2">
                  <CardTitle className="text-lg font-semibold">{image.name}</CardTitle>
                  <CardDescription>
                    <span className="font-medium">Retrieved:</span> {image.retrived}
                  </CardDescription>
                  <CardDescription>
                    <span className="font-medium">AI Advisory:</span> {image.AI}
                  </CardDescription>
                  <CardDescription>
                    <span className="font-medium">Status:</span> {image.status}
                  </CardDescription>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500">No images found.</p>
      )}
    </div>
  )
}