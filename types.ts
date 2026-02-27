
export enum DefectType {
  Cracks = 'Cracks',
  ConcreteSpalling = 'ConcreteSpalling',
  PlasterAndFinishDefects = 'PlasterAndFinishDefects',
  WindowAndDoorDefects = 'WindowAndDoorDefects',
  FlawedOverallDesign = 'FlawedOverallDesign',
  Other = 'Other'
}

export interface DetectedDefect {
  type: DefectType;
  description: string;
  confidence: number;
}

export interface AnalysisResult {
  overallCondition: 'Normal' | 'Damaged';
  summary: string;
  defects: DetectedDefect[];
}
