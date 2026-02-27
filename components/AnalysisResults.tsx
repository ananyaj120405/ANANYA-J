
import React from 'react';
import { AnalysisResult, DetectedDefect, DefectType } from '../types';
import { DefectIcon } from './icons';

const DefectTypeLabels: Record<DefectType, string> = {
  [DefectType.Cracks]: 'Cracks',
  [DefectType.ConcreteSpalling]: 'Concrete Spalling',
  [DefectType.PlasterAndFinishDefects]: 'Plaster & Finish Defects',
  [DefectType.WindowAndDoorDefects]: 'Window & Door Defects',
  [DefectType.FlawedOverallDesign]: 'Flawed Overall Design',
  [DefectType.Other]: 'Other',
};

const DefectCard: React.FC<{ defect: DetectedDefect }> = ({ defect }) => {
    const confidencePercentage = (defect.confidence * 100).toFixed(0);
    const confidenceColor = defect.confidence > 0.7 ? 'bg-emerald-500' : defect.confidence > 0.4 ? 'bg-yellow-500' : 'bg-red-500';

    return (
        <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700 transition-all hover:border-sky-500 hover:bg-slate-800">
            <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                    <DefectIcon type={defect.type} className="h-8 w-8 text-sky-400" />
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-slate-100">{DefectTypeLabels[defect.type]}</h3>
                    <p className="text-sm text-slate-400 mt-1">{defect.description}</p>
                    <div className="mt-3">
                        <div className="flex justify-between mb-1">
                            <span className="text-xs font-medium text-slate-300">Confidence</span>
                            <span className="text-xs font-medium text-slate-300">{confidencePercentage}%</span>
                        </div>
                        <div className="w-full bg-slate-700 rounded-full h-2">
                            <div className={`${confidenceColor} h-2 rounded-full`} style={{ width: `${confidencePercentage}%` }}></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const AnalysisResults: React.FC<{ result: AnalysisResult | null }> = ({ result }) => {
    if (!result) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-slate-500 p-8 text-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 mb-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75" />
                </svg>
                <h3 className="text-xl font-bold text-slate-300">Awaiting Analysis</h3>
                <p className="mt-2 max-w-sm">Upload a building image and click "Analyze" to see the AI-powered defect detection results here.</p>
            </div>
        );
    }

    const isDamaged = result.overallCondition === 'Damaged';

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-sm font-semibold text-sky-400 uppercase tracking-wider">Overall Condition</h2>
                <div className={`mt-2 inline-flex items-center px-4 py-1.5 rounded-full text-lg font-bold ${isDamaged ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
                    {result.overallCondition}
                </div>
                <p className="mt-3 text-slate-300">{result.summary}</p>
            </div>
            
            {result.defects.length > 0 && (
                <div>
                    <h2 className="text-sm font-semibold text-sky-400 uppercase tracking-wider mb-3">Detected Defects</h2>
                    <div className="space-y-4">
                        {result.defects.map((defect, index) => (
                            <DefectCard key={index} defect={defect} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AnalysisResults;
