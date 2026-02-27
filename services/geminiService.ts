
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, DefectType } from '../types';

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // remove "data:image/jpeg;base64,"
      resolve(result.split(',')[1]);
    };
    reader.onerror = (error) => reject(error);
  });
};

const PROMPT = `You are an expert structural engineer specializing in building inspection and defect detection. Your task is to analyze the provided image of a building and identify any potential defects.

Based on your analysis, provide a JSON response that strictly adheres to the provided schema.

The possible defect categories are: "Cracks", "ConcreteSpalling", "PlasterAndFinishDefects", "WindowAndDoorDefects", "FlawedOverallDesign", "Other".

First, determine the 'overallCondition' of the building in the image, which can be either "Normal" or "Damaged".
Provide a concise 'summary' of your findings.
Then, for each defect you identify, create an object in the 'defects' array with the 'type', 'description', and your 'confidence' level (from 0.0 to 1.0).

If the building appears to be in normal condition with no visible defects, return "Normal" for 'overallCondition', a summary stating it's in good condition, and an empty 'defects' array.`;

export const analyzeBuildingImage = async (imageFile: File): Promise<AnalysisResult> => {
    if (!process.env.API_KEY) {
        throw new Error("API_KEY environment variable not set");
    }

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const base64Image = await fileToBase64(imageFile);

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: {
            parts: [
                {
                    inlineData: {
                        mimeType: imageFile.type,
                        data: base64Image,
                    },
                },
                {
                    text: PROMPT,
                },
            ],
        },
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    overallCondition: {
                        type: Type.STRING,
                        enum: ['Normal', 'Damaged'],
                        description: "The overall condition of the building."
                    },
                    summary: {
                        type: Type.STRING,
                        description: "A brief summary of the findings."
                    },
                    defects: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                type: {
                                    type: Type.STRING,
                                    enum: Object.values(DefectType),
                                    description: "The category of the defect."
                                },
                                description: {
                                    type: Type.STRING,
                                    description: "A detailed description of the observed defect."
                                },
                                confidence: {
                                    type: Type.NUMBER,
                                    description: "Confidence score from 0.0 to 1.0."
                                }
                            },
                             required: ['type', 'description', 'confidence']
                        }
                    }
                },
                required: ['overallCondition', 'summary', 'defects']
            }
        }
    });

    const text = response.text.trim();
    try {
        // Gemini might wrap the JSON in ```json ... ```, so we clean it.
        const cleanJson = text.replace(/^```json\s*|```$/g, '');
        return JSON.parse(cleanJson) as AnalysisResult;
    } catch (e) {
        console.error("Failed to parse JSON response:", text);
        throw new Error("The API returned an invalid response format.");
    }
};
