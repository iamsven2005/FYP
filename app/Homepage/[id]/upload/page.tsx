"use client";

import React, { useState, useRef, useEffect } from "react";
import * as tmImage from "@teachablemachine/image";
import "@tensorflow/tfjs";
import Tesseract from "tesseract.js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ImageIcon } from "lucide-react";
import { toast } from "sonner"; // Importing toast for notifications

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

interface Props {
  params: {
    id: string;
  };
}

export default function TeachableMachineWithOCR({ params }: Props) {
  const [halalModel, setHalalModel] = useState<tmImage.CustomMobileNet | null>(null);
  const [healthyModel, setHealthyModel] = useState<tmImage.CustomMobileNet | null>(null);
  const [labelContainer, setLabelContainer] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<{ halal: string; healthy: string }>({
    halal: "",
    healthy: "",
  });
  const [texts, setTexts] = useState<string>("");
  const [processing, setProcessing] = useState<boolean>(false);
  const [itemName, setItemName] = useState<string>("");
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const [processedImageBase64, setProcessedImageBase64] = useState<string | null>(null);
  const [openAIResult, setOpenAIResult] = useState<string>("");

  useEffect(() => {
    const loadModels = async () => {
      const halalModelURL = "/halal/model.json";
      const halalMetadataURL = "/halal/metadata.json";
      const healthyModelURL = "/healthy/model.json";
      const healthyMetadataURL = "/healthy/metadata.json";

      const loadedHalalModel = await tmImage.load(halalModelURL, halalMetadataURL);
      const loadedHealthyModel = await tmImage.load(healthyModelURL, healthyMetadataURL);

      setHalalModel(loadedHalalModel);
      setHealthyModel(loadedHealthyModel);
    };

    loadModels();
  }, []);

  const openBrowseImage = async () => {
    await imageInputRef.current?.click();
  };

  const convert = async (url: string): Promise<void> => {
    if (url.length) {
      setProcessing(true);
      try {
        const { data: { text } } = await Tesseract.recognize(url, 'eng');
        setTexts(text);
        await handleOpenAICheck(text);
      } catch (error) {
        toast.error("Error during OCR processing");
      } finally {
        setProcessing(false);
      }
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !halalModel || !healthyModel) return;

    setLoading(true);

    const base64Image = await fileToBase64(file);
    setProcessedImageBase64(base64Image);

    const imageUrl = URL.createObjectURL(file);
    const imgElement = new Image();
    imgElement.src = imageUrl;

    imgElement.onload = async () => {
      await convert(imageUrl);

      const halalPrediction = await halalModel.predict(imgElement);
      const halalResult =
        halalPrediction.length >= 2 && halalPrediction[0].probability > halalPrediction[1].probability
          ? "Not Halal"
          : "Halal";

      const healthyPrediction = await healthyModel.predict(imgElement);
      const healthyResult =
        healthyPrediction.length >= 2 && healthyPrediction[0].probability > healthyPrediction[1].probability
          ? "Not Healthy"
          : "Healthy";

      setResult({ halal: halalResult, healthy: healthyResult });

      const halalResults = halalPrediction.map(
        (pred) => `Halal Model - ${pred.className}: ${pred.probability.toFixed(2)}`
      );
      const healthyResults = healthyPrediction.map(
        (pred) => `Healthy Model - ${pred.className}: ${pred.probability.toFixed(2)}`
      );
      setLabelContainer([...halalResults, ...healthyResults]);

      setLoading(false);
    };
  };

  const handleOpenAICheck = async (inputText: string = texts) => {
    if (!inputText) {
      toast.error("No text extracted from the image.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/openaiCheck', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: inputText }),
      });

      if (response.ok) {
        const data = await response.json();
        setOpenAIResult(data.classification);
        toast.success("OpenAI classification completed.");
      } else {
        toast.error("Failed to get OpenAI classification.");
      }
    } catch (error) {
      toast.error("Error in OpenAI request");
    } finally {
      setLoading(false);
    }
  };

  const handlePost = async () => {
    if (!processedImageBase64 || !itemName.trim()) {
      toast.error("Please provide both an image and the item name.");
      return;
    }

    setLoading(true);

    const dataToSend = {
      imageurl: processedImageBase64,
      name: itemName,
      companyId: params.id,
      status: "PENDING",
      retrived: texts,
      halal: result.halal === "Halal",
      healthy: result.healthy === "Healthy",
      AI: openAIResult || "TeachableMachine & Tesseract.js",
    };

    try {
      const response = await fetch("/api/saveImage", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToSend),
      });

      if (response.ok) {
        const data = await response.json();
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

  return (
    <div className="container mx-auto px-4 py-8">
      <input
        onChange={handleImageUpload}
        ref={imageInputRef}
        type="file"
        hidden
        required
        accept="image/*"
      />
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Image Upload and Processing</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            onClick={openBrowseImage}
            className="w-full min-h-[30vh] md:min-h-[50vh] p-5 bg-secondary cursor-pointer rounded-xl flex items-center justify-center mb-6"
          >
            <div className="w-full flex items-center justify-center flex-col gap-3">
              <p className="text-2xl md:text-3xl text-center text-muted-foreground font-bold">
                {processing ? "Processing Image..." : "Browse or Drop Your Image Here"}
              </p>
              <span className="text-8xl md:text-[150px] block text-muted-foreground">
                <ImageIcon />
              </span>
            </div>
          </div>

          {loading ? (
            <p className="text-center">Loading...</p>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <h2 className="text-xl md:text-2xl font-semibold mb-2">Halal: {result.halal}</h2>
                  <h2 className="text-xl md:text-2xl font-semibold">Healthy: {result.healthy}</h2>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Prediction Labels:</h3>
                  <div id="label-container" className="text-sm">
                    {labelContainer.map((label, idx) => (
                      <div key={idx}>{label}</div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          <div className="space-y-4">
            <div>
              <Label htmlFor="extracted-text">Edit Extracted Text:</Label>
              <Textarea
                id="extracted-text"
                className="w-full h-32"
                value={texts}
                onChange={(e) => setTexts(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="item-name">Item Name (required):</Label>
              <Input
                id="item-name"
                type="text"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                required
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button onClick={handlePost} disabled={loading} className="flex-1">
                {loading ? "Posting..." : "Post Processed Image"}
              </Button>
              <Button onClick={() => handleOpenAICheck()} disabled={loading} className="flex-1">
                {loading ? "Processing..." : "Recheck with OpenAI"}
              </Button>
            </div>

            {openAIResult && (
              <div className="p-4 rounded-md mt-4">
                <h3 className="font-semibold mb-2">OpenAI Classification:</h3>
                <p>{openAIResult}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
