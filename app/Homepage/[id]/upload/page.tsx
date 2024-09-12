"use client";

import React, { useState, useRef, useEffect } from "react";
import * as tmImage from "@teachablemachine/image";
import "@tensorflow/tfjs";
import Tesseract from "tesseract.js";
import { BsImageFill } from "react-icons/bs";
import { Button } from "@/components/ui/button";

// Helper function to convert a file to base64
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
  const [texts, setTexts] = useState<string>(""); // Single string for editable text
  const [processing, setProcessing] = useState<boolean>(false);
  const [itemName, setItemName] = useState<string>(""); // New state for item name
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const [processedImageBase64, setProcessedImageBase64] = useState<string | null>(null); // Hold base64 string
  const [openAIResult, setOpenAIResult] = useState<string>(""); // State for OpenAI response

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
        setTexts(text); // Save the extracted text in state
        await handleOpenAICheck(text); // Automatically process the text with AI
      } catch (error) {
        console.error("Error during conversion", error);
      } finally {
        setProcessing(false);
      }
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !halalModel || !healthyModel) return;

    setLoading(true);

    // Convert the uploaded file to base64
    const base64Image = await fileToBase64(file);
    setProcessedImageBase64(base64Image);

    const imageUrl = URL.createObjectURL(file); // Still use this for predictions and OCR
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
      alert("No text extracted from the image.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/openaiCheck', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: inputText }), // Send text to OpenAI
      });

      if (response.ok) {
        const data = await response.json();
        setOpenAIResult(data.classification); // Set the OpenAI response
      } else {
        console.error("Failed to get OpenAI classification.");
      }
    } catch (error) {
      console.error("Error in OpenAI request:", error);
    } finally {
      setLoading(false);
    }
  };

  // Function to save processed image (base64) and OpenAI results
  const handlePost = async () => {
    if (!processedImageBase64 || !itemName.trim()) {
      alert("Please provide both an image and the item name.");
      return;
    }

    setLoading(true);

    const dataToSend = {
      imageurl: processedImageBase64, // Send base64 image
      name: itemName, // Send item name from textbox
      companyId: params.id,
      status: "PENDING", // Change this to status and set it to PENDING
      retrived: texts, // Send the edited text
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
        alert("Image processed and saved successfully!");
        console.log("API response:", data);
      } else {
        console.error("API request failed.");
      }
    } catch (error) {
      console.error("Error sending image to API:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[90vh]">
      <input
        onChange={handleImageUpload}
        ref={imageInputRef}
        type="file"
        hidden
        required
        accept="image/*"
      />
      <div className="relative w-full flex flex-col gap-10 items-center justify-center p-5">
        <div
          onClick={openBrowseImage}
          className="w-full min-h-[30vh] md:min-h-[50vh] p-5 bg-[#202020] cursor-pointer rounded-xl flex items-center justify-center"
        >
          <div className="w-full flex items-center justify-center flex-col gap-3">
            <p className="text-2xl md:text-3xl text-center text-[#707070] font-[800]">
              {processing ? "Processing Image..." : "Browse or Drop Your Image Here"}
            </p>
            <span className="text-8xl md:text-[150px] block text-[#5f5f5f]">
              <BsImageFill className={processing ? "animate-pulse" : ""} />
            </span>
          </div>
        </div>

        {loading ? (
          <p>Loading...</p>
        ) : (
          <>
            <h2 className="text-xl md:text-2xl">Halal: {result.halal}</h2>
            <h2 className="text-xl md:text-2xl">Healthy: {result.healthy}</h2>

            {/* Display all prediction labels */}
            <div id="label-container">
              {labelContainer.map((label, idx) => (
                <div key={idx}>{label}</div>
              ))}
            </div>
          </>
        )}

        {/* Editable Text Area for OCR extracted text */}
        <div className="w-full mt-5">
          <h3>Edit Extracted Text:</h3>
          <textarea
            className="w-full h-32 bg-gray-800 text-white p-4 rounded-md"
            value={texts}
            onChange={(e) => setTexts(e.target.value)} // Allow editing
          />
        </div>

        {/* Textbox to input item name */}
        <div className="w-full mt-5">
          <h3 className="text-white">Item Name (required):</h3>
          <input
            type="text"
            className="w-full p-4 bg-gray-800 text-white rounded-md"
            value={itemName}
            onChange={(e) => setItemName(e.target.value)} // Update item name state
            required
          />
        </div>

        {/* Add Post Button */}
        <Button onClick={handlePost} className="mt-4" disabled={loading}>
          {loading ? "Posting..." : "Post Processed Image"}
        </Button>

        {/* Button to send edited text to OpenAI */}
        <Button onClick={() => handleOpenAICheck()} className="mt-4" disabled={loading}>
          {loading ? "Processing..." : "Recheck with OpenAI"}
        </Button>

        {/* Display OpenAI result */}
        {openAIResult && (
          <div className="text-white bg-green-700 p-4 rounded-md mt-4">
            <h3>OpenAI Classification:</h3>
            <p>{openAIResult}</p>
          </div>
        )}
      </div>
    </div>
  );
}
