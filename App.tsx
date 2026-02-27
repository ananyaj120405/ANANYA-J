
import React, { useState, useCallback, useEffect } from 'react';
import ImageUploader from './components/ImageUploader';
import AnalysisResults from './components/AnalysisResults';
import Spinner from './components/Spinner';
import { analyzeBuildingImage } from './services/geminiService';
import { AnalysisResult } from './types';

const App: React.FC = () => {
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Clean up the object URL when the component unmounts or the image changes
        return () => {
            if (imageUrl) {
                URL.revokeObjectURL(imageUrl);
            }
        };
    }, [imageUrl]);

    const handleImageChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            const file = event.target.files[0];
            if (file.size > 4 * 1024 * 1024) { // 4MB limit
                setError("File is too large. Please upload an image under 4MB.");
                return;
            }
            setImageFile(file);
            if (imageUrl) {
                URL.revokeObjectURL(imageUrl);
            }
            setImageUrl(URL.createObjectURL(file));
            setAnalysisResult(null); // Clear previous results
            setError(null);
        }
    }, [imageUrl]);

    const handleAnalyzeClick = async () => {
        if (!imageFile) {
            setError("Please upload an image first.");
            return;
        }
        setIsLoading(true);
        setError(null);
        setAnalysisResult(null);

        try {
            const result = await analyzeBuildingImage(imageFile);
            setAnalysisResult(result);
        } catch (err) {
            console.error(err);
            const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
            setError(`Analysis failed: ${errorMessage}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 text-slate-100 font-sans">
            <header className="bg-slate-900/70 backdrop-blur-lg border-b border-slate-800 sticky top-0 z-10">
                <div className="container mx-auto px-4 py-4">
                    <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                        <span className="text-sky-400">AI</span> Building Defect Detector
                    </h1>
                    <p className="text-sm text-slate-400 mt-1">Upload an image to analyze for structural and cosmetic defects.</p>
                </div>
            </header>
            
            <main className="container mx-auto p-4 md:p-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                    {/* Left Column: Uploader & Controls */}
                    <div className="space-y-6">
                        <h2 className="text-xl font-semibold border-b-2 border-slate-700 pb-2">1. Upload Image</h2>
                        <ImageUploader 
                            onImageChange={handleImageChange} 
                            imageUrl={imageUrl} 
                            isAnalyzing={isLoading}
                        />
                        <button
                            onClick={handleAnalyzeClick}
                            disabled={!imageFile || isLoading}
                            className="w-full flex items-center justify-center gap-2 bg-sky-600 hover:bg-sky-500 disabled:bg-slate-700 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-colors duration-300 text-lg"
                        >
                            {isLoading ? <><Spinner /> Analyzing...</> : "Analyze Building"}
                        </button>
                        {error && (
                            <div className="bg-red-500/20 border border-red-500/50 text-red-300 text-sm rounded-lg p-3 text-center">
                                {error}
                            </div>
                        )}
                    </div>

                    {/* Right Column: Analysis Results */}
                    <div className="space-y-6">
                        <h2 className="text-xl font-semibold border-b-2 border-slate-700 pb-2">2. Analysis Report</h2>
                        <div className="bg-slate-800/20 border border-slate-800 rounded-lg p-6 min-h-[300px]">
                           {isLoading ? (
                               <div className="flex flex-col items-center justify-center h-full text-slate-400 animate-pulse">
                                  <svg className="w-16 h-16 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><path fill="currentColor" d="M16.12,16.12a7.5,7.5,0,1,0-8.24-8.24A7.5,7.5,0,0,0,16.12,16.12ZM12,3a9,9,0,1,1-9,9,9,9,0,0,1,9-9Z" opacity=".4"/><path fill="currentColor" d="M12,3a9,9,0,0,1,9,9H21A9,9,0,0,0,3,12H3A9,9,0,0,1,12,3Z"/></svg>
                                  <p className="text-lg font-semibold">Analyzing Image...</p>
                                   <p className="text-sm">AI is inspecting the building, please wait.</p>
                               </div>
                           ) : (
                               <AnalysisResults result={analysisResult} />
                           )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default App;
