import React, { useState, useMemo } from 'react';
import { FileUpload } from './components/FileUpload';
import { DataPreview } from './components/DataPreview';
import { PredictionPanel } from './components/PredictionPanel';
import { Visualization } from './components/Visualization';
import { RegressionService } from './services/regressionService';
import { DataPoint, ProcessedData, ModelMetrics, FeatureImportance, AppState } from './types';
import { ChevronRight, LayoutDashboard, Settings, ArrowLeft } from 'lucide-react';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.UPLOAD);
  const [data, setData] = useState<DataPoint[]>([]);
  const [targetColumn, setTargetColumn] = useState<string>('');
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [processedData, setProcessedData] = useState<ProcessedData | null>(null);
  const [metrics, setMetrics] = useState<ModelMetrics | null>(null);
  const [featureImportance, setFeatureImportance] = useState<FeatureImportance[]>([]);

  // Derive columns from data
  const columns = useMemo(() => {
    return data.length > 0 ? Object.keys(data[0]) : [];
  }, [data]);

  const handleDataLoaded = (loadedData: DataPoint[]) => {
    setData(loadedData);
    setAppState(AppState.CONFIG);
  };

  const toggleFeature = (col: string) => {
    setSelectedFeatures(prev => 
      prev.includes(col) ? prev.filter(c => c !== col) : [...prev, col]
    );
  };

  const trainModel = () => {
    try {
      const service = new RegressionService(data);
      const processed = service.preprocess(targetColumn, selectedFeatures);
      const result = service.train(processed);

      // Calculate feature importance for visualization
      const imp = processed.featureNamesAfterEncoding.map((name, idx) => ({
        name,
        importance: result.coefficients[idx]
      })).sort((a, b) => Math.abs(b.importance) - Math.abs(a.importance)); // Sort by magnitude

      setProcessedData(processed);
      setMetrics(result);
      setFeatureImportance(imp);
      setAppState(AppState.DASHBOARD);
    } catch (e) {
      alert((e as Error).message);
    }
  };

  const reset = () => {
    setAppState(AppState.UPLOAD);
    setData([]);
    setTargetColumn('');
    setSelectedFeatures([]);
    setMetrics(null);
  };

  const handleBackToConfig = () => {
    setAppState(AppState.CONFIG);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={reset}>
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white">
              <LayoutDashboard size={20} />
            </div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">HousePriceAI</h1>
          </div>
          <div className="flex items-center gap-4 text-sm font-medium text-gray-500">
             <button 
                onClick={reset}
                className={`hover:text-primary transition-colors ${appState === AppState.UPLOAD ? 'text-primary font-bold' : ''}`}
             >
               1. Upload
             </button>
             <ChevronRight size={14} />
             <button
                onClick={() => appState === AppState.DASHBOARD && handleBackToConfig()}
                disabled={appState === AppState.UPLOAD}
                className={`transition-colors ${appState === AppState.CONFIG ? 'text-primary font-bold' : (appState === AppState.DASHBOARD ? 'hover:text-primary cursor-pointer' : 'cursor-default')}`}
             >
               2. Configure
             </button>
             <ChevronRight size={14} />
             <span className={appState === AppState.DASHBOARD ? 'text-primary font-bold' : ''}>3. Dashboard</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Upload State */}
        {appState === AppState.UPLOAD && (
          <div className="animate-fade-in">
             <div className="text-center max-w-2xl mx-auto mb-12">
               <h1 className="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">
                 Predict Real Estate Values with AI
               </h1>
               <p className="text-lg text-gray-600">
                 A professional-grade linear regression tool running entirely in your browser. 
                 Upload your dataset, select features, and get instant predictions.
               </p>
             </div>
             <FileUpload onDataLoaded={handleDataLoaded} />
          </div>
        )}

        {/* Config State */}
        {appState === AppState.CONFIG && (
          <div className="animate-fade-in max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Settings className="text-gray-400" />
              Configure Model
            </h2>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8">
              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Select Target Variable (Y)
                </label>
                <p className="text-sm text-gray-500 mb-3">This is the value you want to predict (e.g., price).</p>
                <div className="flex flex-wrap gap-2">
                  {columns.map(col => (
                    <button
                      key={col}
                      onClick={() => setTargetColumn(col)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors border ${
                        targetColumn === col 
                        ? 'bg-blue-100 text-blue-700 border-blue-200 ring-2 ring-blue-500 ring-offset-1' 
                        : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      {col}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-8">
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Select Features (X)
                </label>
                <p className="text-sm text-gray-500 mb-3">These attributes will be used to make the prediction.</p>
                <div className="flex flex-wrap gap-2">
                  {columns.filter(c => c !== targetColumn).map(col => (
                    <button
                      key={col}
                      onClick={() => toggleFeature(col)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors border ${
                        selectedFeatures.includes(col)
                        ? 'bg-green-100 text-green-700 border-green-200' 
                        : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      {col}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-4 mt-8">
                <button
                  onClick={reset}
                  className="flex items-center justify-center gap-2 px-6 py-4 rounded-lg font-semibold text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 transition-colors"
                >
                  <ArrowLeft size={20} />
                  Back
                </button>
                <button
                  onClick={trainModel}
                  disabled={!targetColumn || selectedFeatures.length === 0}
                  className="flex-1 bg-primary text-white py-4 rounded-lg font-bold text-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-200 transition-all transform active:scale-[0.99]"
                >
                  Train Model
                </button>
              </div>
            </div>
            
            <DataPreview data={data} />
          </div>
        )}

        {/* Dashboard State */}
        {appState === AppState.DASHBOARD && metrics && processedData && (
          <div className="animate-fade-in space-y-8">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-800">Performance Dashboard</h2>
                <button 
                  onClick={handleBackToConfig}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-primary transition-colors shadow-sm"
                >
                  <Settings size={16} />
                  Configure Model
                </button>
            </div>

            <div className="flex flex-col md:flex-row gap-8">
              {/* Left Column: Charts */}
              <div className="flex-1 space-y-8">
                <Visualization 
                  metrics={metrics} 
                  featureImportance={featureImportance} 
                  processedData={processedData}
                />
              </div>

              {/* Right Column: Prediction Tool */}
              <div className="w-full md:w-96 shrink-0">
                <div className="sticky top-24">
                  <PredictionPanel 
                    processedData={processedData} 
                    modelMetrics={metrics}
                    onPredict={() => {}} 
                    rawData={data}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;