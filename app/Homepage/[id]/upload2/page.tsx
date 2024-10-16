"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ImageIcon } from "lucide-react";
import { useRef, useState, useEffect } from "react";
import { toast } from "sonner";
import axios from "axios";

import { checkIngredients } from "@/lib/ingredientChecker"; // External function
// Import the IngredientList component
import IngredientList from "@/components/IngredientList";

interface IngredientStatus {
  name: string;
  status: "Approved" | "Not Approved" | "Not Safe";
}

interface Props {
  params: {
    id: string;
  };
}

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

// Helper function to get Authorization header
const getAuthHeader = () => {
  const token = localStorage.getItem("token");
  return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
};

export default function Component({ params }: Props) {
  const [loading, setLoading] = useState<boolean>(false);
  const [itemName, setItemName] = useState<string>("");
  const [processedImageBase64, setProcessedImageBase64] = useState<string | null>(null);
  const [openAIResult, setOpenAIResult] = useState<string>("");

  // New state to hold the parsed result from OpenAI
  const [openAIData, setOpenAIData] = useState<any>(null);

  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const [processing, setProcessing] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState(false); // Tracks if ingredients are being edited
  const [editableIngredients, setEditableIngredients] = useState<string>(""); // Holds the ingredients in editable form
  const [checkedIngredients, setCheckedIngredients] = useState<IngredientStatus[]>([]); // State to hold checked ingredients

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    toast.success("Uploading and processing image...");

    const base64Image = await fileToBase64(file);
    setProcessedImageBase64(base64Image);

    await handleOpenAICheck(base64Image);
  };

  const handleOpenAICheck = async (inputText: string | null = processedImageBase64) => {
    if (!inputText) {
      toast.error("No image found.");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.patch("/api/openaiCheck", { imagePath: inputText }, getAuthHeader()); // Add headers

      if (response.status === 200) {
        const result = response.data.result.choices[0].message.content;

        // Set the OpenAI result in the state
        setOpenAIResult(result);

        // Parse the result and set openAIData
        const cleanedResult = result.replace(/```json\n?/g, "").replace(/```/g, "");
        const parsedData = JSON.parse(cleanedResult);

        setOpenAIData(parsedData); // Set parsed data to the state
        toast.success("OpenAI classification completed.");
      } else {
        toast.error("Failed to get OpenAI classification.");
      }
    } catch (error) {
      console.log(error);
      toast.error("Error in OpenAI request");
    } finally {
      setLoading(false);
    }
  };

  // Function to parse ingredients string into an array
  const parseIngredients = (ingredientsText: string): string[] => {
    const textWithoutParentheses = ingredientsText.replace(/\s*\([^)]*\)/g, "");
    const standardizedText = textWithoutParentheses.replace(/\band\b/gi, ",");
    const ingredientsArray = standardizedText
      .split(/[;,]\s*|\s+and\s+/)
      .map((ingredient) => ingredient.trim().toLowerCase())
      .filter((ingredient) => ingredient !== "");

    // Capitalize each ingredient
    return ingredientsArray.map((ingredient) =>
      ingredient.charAt(0).toUpperCase() + ingredient.slice(1)
    );
  };

  // Function to check ingredients using the ingredientChecker
  const getIngredientStatuses = async (ingredients: string[]): Promise<IngredientStatus[]> => {
    const checkedIngredients: IngredientStatus[] = [];

    for (const ingredient of ingredients) {
      const [ingredientStatus] = await checkIngredients([ingredient]); // checkIngredients returns an array
      checkedIngredients.push({ name: ingredient, status: ingredientStatus.status }); // Use the status from the result
    }

    return checkedIngredients;
  };

  useEffect(() => {
    const checkAndSetIngredients = async () => {
      if (openAIData?.Ingredients) {
        const ingredientsText = openAIData.Ingredients;
        const ingredientsArray = parseIngredients(ingredientsText);

        // Check ingredients asynchronously
        const ingredientsWithStatus = await getIngredientStatuses(ingredientsArray);
        setCheckedIngredients(ingredientsWithStatus);
      }
    };

    checkAndSetIngredients();
  }, [openAIData]);

  // Function to calculate recommendation based on ingredient statuses
  const calculateRecommendation = (ingredients: IngredientStatus[]): string => {
    if (ingredients.length === 0) return "Pending"; // Ensure there's a recommendation even if no ingredients exist
  
    const approvedIngredients = ingredients.filter((ingredient) => ingredient.status === "Approved").length;
    const notSafeIngredients = ingredients.some((ingredient) => ingredient.status === "Not Safe");
    const approvedPercentage = (approvedIngredients / ingredients.length) * 100;
  
    if (notSafeIngredients || approvedPercentage < 80) {
      return "Reject";
    }
    return "Approve";
  };  

  // Function to handle posting the image along with its details
  const handlePost = async () => {
    if (!processedImageBase64 || !itemName.trim()) {
      toast.error("Please provide both an image and the item name.");
      return;
    }

    setLoading(true);

    const isHalal = openAIData?.halal?.toLowerCase() === "yes";
    const isHealthy = openAIData?.healthy?.toLowerCase() === "yes";
    const isGrade = openAIData?.grade?.toLowerCase();
    const AI = openAIData?.Ingredients;
    const texts = openAIData?.warning;

    // Calculate the recommendation based on checked ingredients
    const recommendation = calculateRecommendation(checkedIngredients);

    const dataToSend = {
      imageurl: processedImageBase64,
      name: itemName,
      companyId: params.id,
      status: "PENDING",
      retrived: texts,
      halal: isHalal,
      healthy: isHealthy,
      grade: isGrade,
      AI: AI,
      ingredients: checkedIngredients, // Include the ingredients with statuses
      recommendation: recommendation, // Include the recommendation
    };

    try {
      const response = await axios.post("/api/saveImage", dataToSend, getAuthHeader()); // Add headers

      if (response.status === 200) {
        toast.success("Image processed and saved successfully!");
      } else {
        toast.error("Failed to save the image.");
      }
    } catch (error) {
      toast.error("Error sending image to API.");
    } finally {
      setLoading(false);
    }
  };

  const toggleEditMode = () => {
    if (!isEditing) {
      const ingredientNames = checkedIngredients.map((ingredient) => ingredient.name).join(", ");
      setEditableIngredients(ingredientNames);
    }
    setIsEditing(!isEditing);
  };

  const handleSaveIngredients = async () => {
    const ingredientsArray = parseIngredients(editableIngredients);
    const updatedIngredientsWithStatus = await getIngredientStatuses(ingredientsArray);
    setCheckedIngredients(updatedIngredientsWithStatus);
    setIsEditing(false);
  };

  const openBrowseImage = async () => {
    await imageInputRef.current?.click();
  };

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
        <Label htmlFor="item-name">Product Name (required):</Label>
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
          {openAIData.grade && (
            <div>
              <Label>Nutri-grade:</Label>
              <p>{openAIData.grade}</p>
            </div>
          )}
          {openAIData.Ingredients && (
            <div>
              <Label>Ingredients:</Label>
              {isEditing ? (
                <>
                  <textarea
                    value={editableIngredients}
                    onChange={(e) => setEditableIngredients(e.target.value)}
                    className="w-full h-32 p-2 border rounded"
                  />
                  <Button onClick={handleSaveIngredients} className="mt-2">
                    Save
                  </Button>
                </>
              ) : (
                <>
                  <IngredientList ingredients={checkedIngredients} />
                  <Button onClick={toggleEditMode} className="mt-2">
                    Edit Ingredients
                  </Button>
                </>
              )}
            </div>
          )}
          {checkedIngredients.length > 0 && (
            <div>
              <Label>Recommendation:</Label>
              <p className="font-bold">{calculateRecommendation(checkedIngredients)}</p>
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
  );
}
