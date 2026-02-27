
import React, { useRef } from 'react';
import { UploadIcon } from './icons';

interface ImageUploaderProps {
    onImageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    imageUrl: string | null;
    isAnalyzing: boolean;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageChange, imageUrl, isAnalyzing }) => {
    const inputRef = useRef<HTMLInputElement>(null);

    const handleContainerClick = () => {
        if (!isAnalyzing) {
            inputRef.current?.click();
        }
    };

    return (
        <div className="w-full">
            <label htmlFor="file-upload" className="sr-only">Upload an image</label>
            <div
                onClick={handleContainerClick}
                className={`relative group flex justify-center items-center w-full aspect-video rounded-lg border-2 border-dashed border-slate-600 hover:border-sky-500 transition-colors duration-300 ${isAnalyzing ? 'cursor-not-allowed' : 'cursor-pointer'}`}
            >
                {imageUrl ? (
                    <>
                        <img src={imageUrl} alt="Building preview" className="w-full h-full object-cover rounded-lg" />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 flex items-center justify-center transition-opacity duration-300 rounded-lg">
                           {!isAnalyzing && <p className="text-white opacity-0 group-hover:opacity-100 font-semibold">Click to change image</p>}
                        </div>
                    </>
                ) : (
                    <div className="text-center text-slate-400">
                        <UploadIcon className="mx-auto h-12 w-12" />
                        <p className="mt-2 font-semibold">Click to upload an image</p>
                        <p className="text-xs text-slate-500">PNG, JPG, or WEBP</p>
                    </div>
                )}
                <input
                    ref={inputRef}
                    id="file-upload"
                    name="file-upload"
                    type="file"
                    className="hidden"
                    accept="image/png, image/jpeg, image/webp"
                    onChange={onImageChange}
                    disabled={isAnalyzing}
                />
            </div>
        </div>
    );
};

export default ImageUploader;
