"use client";

import React, { useState, useRef, useEffect } from "react";
import * as tmImage from "@teachablemachine/image";
import "@tensorflow/tfjs";
import Tesseract from "tesseract.js";
import { BsImageFill } from "react-icons/bs";

export default function TeachableMachineWithOCR() {
  const [halalModel, setHalalModel] = useState<tmImage.CustomMobileNet | null>(null);
  const [healthyModel, setHealthyModel] = useState<tmImage.CustomMobileNet | null>(null);
  const [labelContainer, setLabelContainer] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<{ halal: string; healthy: string }>({
    halal: "",
    healthy: "",
  });
  const [texts, setTexts] = useState<Array<string>>([]);
  const [processing, setProcessing] = useState<boolean>(false);
  const imageInputRef = useRef<HTMLInputElement | null>(null);

  // Preload models on component mount
  useEffect(() => {
    const loadModels = async () => {
      const halalModelURL = "/halal/model.json"; // Path to your Halal model.json file
      const halalMetadataURL = "/halal/metadata.json"; // Path to your Halal metadata.json file

      const healthyModelURL = "/healthy/model.json"; // Path to your Healthy model.json file
      const healthyMetadataURL = "/healthy/metadata.json"; // Path to your Healthy metadata.json file

      const loadedHalalModel = await tmImage.load(halalModelURL, halalMetadataURL);
      const loadedHealthyModel = await tmImage.load(healthyModelURL, healthyMetadataURL);

      setHalalModel(loadedHalalModel);
      setHealthyModel(loadedHealthyModel);
    };

    loadModels(); // Call the function to load models on mount
  }, []); // Empty dependency array ensures this runs only once when the component is mounted

  // Open file input dialog
  const openBrowseImage = async () => {
    await imageInputRef.current?.click();
  };

  // Convert image to text using Tesseract.js (OCR)
  const convert = async (url: string): Promise<void> => {
    if (url.length) {
      setProcessing(true);
      try {
        const { data: { text } } = await Tesseract.recognize(url, 'eng');
        setTexts((prevTexts) => [...prevTexts, text]);
      } catch (error) {
        console.error("Error during conversion", error);
      } finally {
        setProcessing(false);
      }
    }
  };

  // Handle Image Upload and Prediction for both models, plus OCR
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !halalModel || !healthyModel) return;

    setLoading(true);
    const imageUrl = URL.createObjectURL(file);

    // Load the uploaded image into an HTML image element
    const imgElement = new Image();
    imgElement.src = imageUrl;

    imgElement.onload = async () => {
      // Run OCR (Text extraction)
      await convert(imageUrl);

      // Run predictions on the Halal model
      const halalPrediction = await halalModel.predict(imgElement);
      const halalResult =
        halalPrediction.length >= 2 && halalPrediction[0].probability > halalPrediction[1].probability
          ? "Not Halal"
          : "Halal";

      // Run predictions on the Healthy model
      const healthyPrediction = await healthyModel.predict(imgElement);
      const healthyResult =
        healthyPrediction.length >= 2 && healthyPrediction[0].probability > healthyPrediction[1].probability
          ? "Not Healthy"
          : "Healthy";

      // Update the result for both models
      setResult({ halal: halalResult, healthy: healthyResult });

      // Update the label container with all results from both models
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

  return (
    <div className="min-h-[90vh]">
      <h1 className="text-white text-4xl md:text-6xl text-center px-5 pt-5 font-[800]">
        Built With{" "}
        <span className="bg-gradient-to-r from-blue-600 via-green-500 to-indigo-400 inline-block text-transparent bg-clip-text">
          Teachable Machine & Tesseract.js
        </span>
      </h1>

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
            <h2 className="text-xl md:text-2xl text-white">Halal: {result.halal}</h2>
            <h2 className="text-xl md:text-2xl text-white">Healthy: {result.healthy}</h2>

            {/* Display all prediction labels */}
            <div id="label-container">
              {labelContainer.map((label, idx) => (
                <div key={idx} className="text-white">{label}</div>
              ))}
            </div>
          </>
        )}

        {/* Display extracted text */}
        <div className="w-full mt-5">
          {texts.map((t, i) => (
            <div key={i} className="text-white bg-gray-800 p-4 rounded-md mb-4">
              <h3>Extracted Text:</h3>
              <p>{t}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
