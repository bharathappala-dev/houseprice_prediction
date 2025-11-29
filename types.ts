export interface DataPoint {
  [key: string]: string | number;
}

export interface ProcessedData {
  features: string[];
  target: string;
  data: number[][]; // X matrix
  labels: number[]; // y vector
  encoders: Record<string, (val: string) => number[]>; // Map categorical feature name to encoding function
  featureNamesAfterEncoding: string[];
}

export interface ModelMetrics {
  mse: number;
  r2: number;
  rmse: number;
  coefficients: number[];
  intercept: number;
}

export interface FeatureImportance {
  name: string;
  importance: number;
}

export interface PredictionResult {
  predictedValue: number;
  features: Record<string, string | number>;
}

export enum AppState {
  UPLOAD = 'UPLOAD',
  CONFIG = 'CONFIG',
  DASHBOARD = 'DASHBOARD',
}