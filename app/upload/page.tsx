"use client";

import React, { useState } from "react";
import * as tmImage from "@teachablemachine/image";
import "@tensorflow/tfjs";

export default function TeachableMachineImage() {
    const [halalModel, setHalalModel] = useState<tmImage.CustomMobileNet | null>(null);
    const [healthyModel, setHealthyModel] = useState<tmImage.CustomMobileNet | null>(null);
    const [labelContainer, setLabelContainer] = useState<string[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [result, setResult] = useState<{ halal: string; healthy: string }>({
        halal: "",
        healthy: "",
    });

    // Load both models (Halal and Healthy)
    const init = async () => {
        const halalModelURL = "/halal/model.json"; // Path to your Halal model.json file
        const halalMetadataURL = "/halal/metadata.json"; // Path to your Halal metadata.json file

        const healthyModelURL = "/healthy/model.json"; // Path to your Healthy model.json file
        const healthyMetadataURL = "/healthy/metadata.json"; // Path to your Healthy metadata.json file

        const loadedHalalModel = await tmImage.load(halalModelURL, halalMetadataURL);
        const loadedHealthyModel = await tmImage.load(healthyModelURL, healthyMetadataURL);

        setHalalModel(loadedHalalModel);
        setHealthyModel(loadedHealthyModel);
    };

    // Handle Image Upload and Prediction for both models
    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !halalModel || !healthyModel) return;

        setLoading(true);

        // Load the uploaded image into an HTML image element
        const imgElement = new Image();
        imgElement.src = URL.createObjectURL(file);
        imgElement.onload = async () => {
            // Run predictions on the Halal model
            const halalPrediction = await halalModel.predict(imgElement);
            const halalResult =
                halalPrediction.length >= 2 && halalPrediction[0].probability > halalPrediction[1].probability
                    ? "Not Halal"
                    : " Halal";

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
        <div>
            <h1>Teachable Machine Image Models (Halal & Healthy)</h1>
            <button onClick={init}>Load Models</button>
            <input type="file" accept="image/*" onChange={handleImageUpload} disabled={!halalModel || !healthyModel} />
            
            {loading ? (
                <p>Loading...</p>
            ) : (
                <>
                    {/* Display the Halal and Healthy results */}
                    <h2>Halal: {result.halal}</h2>
                    <h2>Healthy: {result.healthy}</h2>
                    
                    {/* Display all prediction labels */}
                    <div id="label-container">
                        {labelContainer.map((label, idx) => (
                            <div key={idx}>{label}</div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
