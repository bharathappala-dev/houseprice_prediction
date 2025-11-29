import React, { useState } from 'react';
import { Calculator, ArrowRight, DollarSign } from 'lucide-react';
import { ProcessedData, ModelMetrics, DataPoint } from '../types';
import { RegressionService } from '../services/regressionService';

interface PredictionPanelProps {
  processedData: ProcessedData;
  modelMetrics: ModelMetrics;
  onPredict: (value: number) => void;
  rawData: DataPoint[];
}

export const PredictionPanel: React.FC<PredictionPanelProps> = ({ 
  processedData, 
  modelMetrics,
  onPredict,
  rawData
}) => {
  const [inputs, setInputs] = useState<Record<string, string | number>>({});
  const [result, setResult] = useState<number | null>(null);

  const handleInputChange = (feature: string, value: string) => {
    setInputs(prev => ({
      ...prev,
      [feature]: value
    }));
  };

  const handleCalculate = () => {
    const service = new RegressionService([]);
    const predictedValue = service.predict(inputs, processedData, modelMetrics);
    setResult(predictedValue);
    onPredict(predictedValue);
  };

  // Get unique values for categorical dropdowns
  const getOptionsForFeature = (feature: string) => {
    if (processedData.encoders[feature]) {
      const unique = Array.from(new Set(rawData.map(r => String(r[feature]))));
      return unique.sort();
    }
    return null;
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 h-full">
      <div className="flex items-center gap-2 mb-6 text-primary">
        <Calculator className="w-6 h-6" />
        <h3 className="text-xl font-bold text-gray-900">Price Estimator</h3>
      </div>

      <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
        {processedData.features.map(feature => {
          const options = getOptionsForFeature(feature);
          
          return (
            <div key={feature}>
              <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                {feature.replace(/_/g, ' ')}
              </label>
              {options ? (
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  value={inputs[feature] || ''}
                  onChange={(e) => handleInputChange(feature, e.target.value)}
                >
                  <option value="">Select {feature}</option>
                  {options.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              ) : (
                <input
                  type="number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  placeholder={`Enter ${feature}...`}
                  value={inputs[feature] || ''}
                  onChange={(e) => handleInputChange(feature, e.target.value)}
                />
              )}
            </div>
          );
        })}
      </div>

      <button
        onClick={handleCalculate}
        disabled={Object.keys(inputs).length < processedData.features.length}
        className="w-full mt-6 bg-primary text-white py-3 rounded-lg font-semibold hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
      >
        Predict Price
        <ArrowRight className="w-4 h-4" />
      </button>

      {result !== null && (
        <div className="mt-6 p-4 bg-green-50 border border-green-100 rounded-lg text-center animate-fade-in">
          <p className="text-sm text-green-600 font-medium mb-1">Estimated Value</p>
          <div className="text-3xl font-bold text-green-700 flex items-center justify-center">
            <DollarSign className="w-6 h-6 mr-1" />
            {result.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </div>
        </div>
      )}
    </div>
  );
};