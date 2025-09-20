import { GoogleGenAI, Type } from '@google/genai';
import type { AnalysisResult } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const responseSchema = {
    type: Type.OBJECT,
    properties: {
        relevanceScore: { 
            type: Type.INTEGER,
            description: "A score from 0 to 100 representing the resume's relevance to the job description."
        },
        verdict: { 
            type: Type.STRING,
            enum: ['High', 'Medium', 'Low'],
            description: "The final verdict on the candidate's suitability."
        },
        summary: { 
            type: Type.STRING,
            description: "A concise two-sentence summary of the candidate's fit for the role."
        },
        missingSkills: {
            type: Type.OBJECT,
            properties: {
                mustHave: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "A list of essential 'must-have' skills from the JD that are missing in the resume."
                },
                niceToHave: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "A list of 'nice-to-have' skills from the JD that are missing in the resume."
                }
            },
            required: ['mustHave', 'niceToHave']
        },
        improvementSuggestions: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "A list of 2-3 personalized, actionable suggestions for the candidate to improve their resume for this specific job."
        },
        alternativeRoles: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "A list of 1-2 alternative job titles that might be a better fit for the candidate if their relevance for the current role is low (score < 50)."
        }
    },
    required: ['relevanceScore', 'verdict', 'summary', 'missingSkills', 'improvementSuggestions']
};


export const getRelevanceAnalysis = async (
  jobDescription: string,
  resumeText: string
): Promise<AnalysisResult> => {
  const prompt = `
    You are an expert AI recruitment assistant. Your task is to analyze the provided resume against the job description and return a structured JSON object with your findings.

    **Job Description:**
    ---
    ${jobDescription}
    ---

    **Resume Text:**
    ---
    ${resumeText}
    ---

    Please perform the following analysis and provide the output ONLY in the specified JSON format.
    1.  **Relevance Score:** Calculate a score from 0-100 based on how well the resume matches the job requirements (skills, experience, education).
    2.  **Verdict:** Based on the score, give a verdict of "High", "Medium", or "Low" relevance.
    3.  **Summary:** Write a brief, 2-sentence summary of the analysis.
    4.  **Missing Skills:** Identify key skills mentioned in the job description that are absent from the resume. Categorize them into 'must-have' and 'nice-to-have'.
    5.  **Improvement Suggestions:** Provide 2-3 specific, actionable recommendations for the candidate to improve their resume for this role.
    6.  **Alternative Role Suggestions:** If, and only if, the relevance score is below 50, analyze the resume for other potential roles it might be a strong fit for. If you find any, suggest 1-2 alternative job titles. If the score is 50 or above, or if no clear alternatives exist, return an empty array for this field.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      },
    });

    const jsonText = response.text.trim();
    const result = JSON.parse(jsonText);

    // Basic validation to ensure the result matches the expected structure
    if (
      typeof result.relevanceScore !== 'number' ||
      !['High', 'Medium', 'Low'].includes(result.verdict)
    ) {
      throw new Error('Received malformed data from API');
    }
    
    return result as AnalysisResult;

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Failed to get analysis from Gemini API.");
  }
};


export const getChatbotResponse = async (
  analysisContext: AnalysisResult,
  question: string
): Promise<string> => {
  const prompt = `
    You are a helpful AI career assistant. Your user has just received an analysis of their resume against a job description.
    Your task is to answer the user's follow-up questions based ONLY on the JSON data provided below. Do not invent any information.
    Keep your answers concise and directly related to the user's question and the provided data.

    **Analysis Data:**
    ---
    ${JSON.stringify(analysisContext, null, 2)}
    ---

    **User's Question:**
    "${question}"

    Please provide a helpful and direct answer.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error calling Gemini API for chatbot:", error);
    throw new Error("Failed to get chatbot response from Gemini API.");
  }
};

export const getChatbotResponseStream = async (
  analysisContext: AnalysisResult,
  question: string
) => {
  const prompt = `
    You are a helpful AI career assistant. Your user has just received an analysis of their resume against a job description.
    Your task is to answer the user's follow-up questions based ONLY on the JSON data provided below. Do not invent any information.
    Keep your answers conversational, concise, and directly related to the user's question and the provided data.

    **Analysis Data:**
    ---
    ${JSON.stringify(analysisContext, null, 2)}
    ---

    **User's Question:**
    "${question}"

    Please provide a helpful and direct answer.
  `;

  try {
    const responseStream = await ai.models.generateContentStream({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    return responseStream;
  } catch (error) {
    console.error("Error calling Gemini API for chatbot stream:", error);
    throw new Error("Failed to get chatbot stream from Gemini API.");
  }
};