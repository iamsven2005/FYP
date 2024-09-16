"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ImageIcon } from "lucide-react"
import { useRef, useState } from "react"
import { toast } from "sonner"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

interface Props {
  params: {
    id: string
  }
}

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = (error) => reject(error)
  })
}

export default function Component({ params }: Props) {
  const [loading, setLoading] = useState<boolean>(false)
  const [itemName, setItemName] = useState<string>("")
  const [processedImageBase64, setProcessedImageBase64] = useState<string | null>(null)
  const [openAIResult, setOpenAIResult] = useState<string>("")
  const imageInputRef = useRef<HTMLInputElement | null>(null)
  const [processing, setProcessing] = useState<boolean>(false)

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setLoading(true)
    toast.success("Uploading and processing image...")

    const base64Image = await fileToBase64(file)
    setProcessedImageBase64(base64Image)

    await handleOpenAICheck(base64Image)
  }

  const handleOpenAICheck = async (inputText: string | null = processedImageBase64) => {
    if (!inputText) {
      toast.error("No image found.")
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/openaiCheck", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ imagePath: inputText }),
      })

      if (response.ok) {
        const data = await response.json()
        console.log(data)
        setOpenAIResult(data.result.choices[0].message.content)
        toast.success("OpenAI classification completed.")
      } else {
        toast.error("Failed to get OpenAI classification.")
      }
    } catch (error) {
      toast.error("Error in OpenAI request")
    } finally {
      setLoading(false)
    }
  }

  const handlePost = async () => {
    if (!processedImageBase64 || !itemName.trim()) {
      toast.error("Please provide both an image and the item name.")
      return
    }

    setLoading(true)
    const openAIData = openAIResult ? JSON.parse(openAIResult) : null;

    const isHalal = openAIData?.halal?.toLowerCase() === "yes" ? true : false;
    const isHealthy = openAIData?.healthy?.toLowerCase() === "yes" ? true : false;
    const AI = openAIData?.Ingredients;
    const texts = openAIData?.warning;

    const dataToSend = {
      imageurl: processedImageBase64,
      name: itemName,
      companyId: params.id,
      status: "PENDING",
      retrived: texts,
      halal: isHalal,
      healthy: isHealthy,
      AI: AI,
    }

    try {
      const response = await fetch("/api/saveImage", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToSend),
      })

      if (response.ok) {
        const data = await response.json()
        toast.success("Image processed and saved successfully!")
      } else {
        toast.error("Failed to save the image.")
      }
    } catch (error) {
      toast.error("Error sending image to API.")
    } finally {
      setLoading(false)
    }
  }

  const openBrowseImage = async () => {
    await imageInputRef.current?.click()
  }

  const openAIData = openAIResult ? JSON.parse(openAIResult) : null

  return (
    <div className="container mx-auto p-6 space-y-8">
      <input
        onChange={handleImageUpload}
        ref={imageInputRef}
        type="file"
        hidden
        required
        accept="image/*"
      />
      <div
        onClick={openBrowseImage}
        className="w-full min-h-[30vh] md:min-h-[50vh] p-8 bg-secondary cursor-pointer rounded-xl flex items-center justify-center"
      >
        <div className="w-full flex items-center justify-center flex-col gap-4">
          <p className="text-2xl md:text-3xl text-center text-muted-foreground font-bold">
            {processing ? "Processing Image..." : "Browse or Drop Your Image Here"}
          </p>
          <span className="text-8xl md:text-[150px] block text-muted-foreground">
            <ImageIcon />
          </span>
        </div>
      </div>

      {processedImageBase64 && (
        <div className="space-y-4">
          <Label>Image Preview:</Label>
          <img
            src={processedImageBase64}
            alt="Uploaded Preview"
            className="max-w-full h-auto rounded-lg shadow-lg"
          />
        </div>
      )}

      <div className="space-y-4">
        <Label htmlFor="item-name">Item Name (required):</Label>
        <Input
          id="item-name"
          type="text"
          value={itemName}
          onChange={(e) => setItemName(e.target.value)}
          required
        />
      </div>

      {openAIData && (
        <div className="space-y-4">
          {openAIData.halal && (
            <div>
              <Label>Halal Status:</Label>
              <p>{openAIData.halal}</p>
            </div>
          )}

          {openAIData.healthy && (
            <div>
              <Label>Healthy Status:</Label>
              <p>{openAIData.healthy}</p>
            </div>
          )}

          {openAIData.Ingredients && (
            <div>
              <Label>Ingredients:</Label>
              <p>{openAIData.Ingredients}</p>
            </div>
          )}

          {openAIData.warning && (
            <div>
              <Label>Warning:</Label>
              <p>{openAIData.warning}</p>
            </div>
          )}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-4">
        <Button onClick={() => handleOpenAICheck()} disabled={loading} className="flex-1">
          {loading ? "Processing..." : "Recheck with OpenAI"}
        </Button>
        <Button onClick={handlePost} disabled={loading} className="flex-1">
          {loading ? "Posting..." : "Post Processed Image"}
        </Button>
      </div>
    </div>
  )
}
