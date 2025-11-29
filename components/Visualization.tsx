import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  ZAxis,
  ReferenceLine
} from 'recharts';
import { ModelMetrics, FeatureImportance, ProcessedData } from '../types';

interface VisualizationProps {
  metrics: ModelMetrics;
  featureImportance: FeatureImportance[];
  processedData: ProcessedData;
}

export const Visualization: React.FC<VisualizationProps> = ({ 
  metrics, 
  featureImportance,
  processedData 
}) => {
  // Prepare data for Actual vs Predicted scatter plot
  // We'll calculate predictions for a subset of data to avoid performance hit on large datasets
  const scatterData = processedData.data.slice(0, 100).map((row, idx) => {
    // Reconstruct prediction manually: dot(row, coef) + intercept
    // row has [1, x1, x2...] if bias was added, but processedData.data is raw X without bias col (bias handled in training)
    // Wait, processedData.data excludes bias. training added it locally.
    const prediction = row.reduce((sum, val, i) => sum + val * metrics.coefficients[i], 0) + metrics.intercept;
    return {
      id: idx,
      actual: processedData.labels[idx],
      predicted: prediction
    };
  });

  return (
    <div className="space-y-8">
      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-sm text-gray-500 font-medium uppercase tracking-wide">R-Squared Score</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{metrics.r2.toFixed(4)}</p>
          <p className="text-xs text-gray-400 mt-1">1.0 is a perfect fit</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-sm text-gray-500 font-medium uppercase tracking-wide">RMSE</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{Math.round(metrics.rmse).toLocaleString()}</p>
          <p className="text-xs text-gray-400 mt-1">Average error in target units</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-sm text-gray-500 font-medium uppercase tracking-wide">Features Used</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{featureImportance.length}</p>
          <p className="text-xs text-gray-400 mt-1">Including encoded categories</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Feature Importance Chart */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm h-[400px]">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Feature Impact</h3>
          <ResponsiveContainer width="100%" height="90%">
            <BarChart
              data={featureImportance}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={true} stroke="#f0f0f0" />
              <XAxis type="number" />
              <YAxis 
                dataKey="name" 
                type="category" 
                width={100} 
                tick={{fontSize: 12}}
                interval={0}
              />
              <Tooltip 
                cursor={{fill: 'transparent'}}
                formatter={(value: number) => [value.toFixed(2), 'Coefficient']}
              />
              <Bar dataKey="importance" fill="#2563eb" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Actual vs Predicted Chart */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm h-[400px]">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Actual vs Predicted Price</h3>
          <ResponsiveContainer width="100%" height="90%">
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                type="number" 
                dataKey="actual" 
                name="Actual Price" 
                unit="$" 
                tickFormatter={(val) => `${val/1000}k`}
              />
              <YAxis 
                type="number" 
                dataKey="predicted" 
                name="Predicted Price" 
                unit="$"
                tickFormatter={(val) => `${val/1000}k`}
              />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} />
              <ReferenceLine segment={[{ x: 0, y: 0 }, { x: 1000000, y: 1000000 }]} stroke="#ccc" />
              <Scatter name="Houses" data={scatterData} fill="#10b981" fillOpacity={0.6} />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};