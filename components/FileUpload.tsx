import React, { useCallback } from 'react';
import Papa from 'papaparse';
import { Upload, FileText, Database } from 'lucide-react';
import { DataPoint } from '../types';
import { SAMPLE_DATASET } from '../constants';

interface FileUploadProps {
  onDataLoaded: (data: DataPoint[]) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onDataLoaded }) => {
  const parseCSV = (file: File | string) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      complete: (results) => {
        if (results.data && results.data.length > 0) {
          onDataLoaded(results.data as DataPoint[]);
        }
      },
      error: (error) => {
        console.error('CSV Parse Error:', error);
        alert('Failed to parse CSV file.');
      }
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      parseCSV(file);
    }
  };

  const loadSample = () => {
    parseCSV(SAMPLE_DATASET);
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-8 bg-white rounded-xl shadow-lg border border-gray-100">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Upload Housing Dataset</h2>
        <p className="text-gray-500">Upload a CSV file to begin your analysis or use our sample data.</p>
      </div>

      <div className="flex flex-col gap-6">
        <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-blue-200 rounded-lg cursor-pointer bg-blue-50 hover:bg-blue-100 transition-colors">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <Upload className="w-10 h-10 mb-3 text-blue-500" />
            <p className="mb-2 text-sm text-gray-700 font-semibold">Click to upload CSV</p>
            <p className="text-xs text-gray-500">CSV files only (Max 5MB)</p>
          </div>
          <input type="file" className="hidden" accept=".csv" onChange={handleFileUpload} />
        </label>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-gray-500">Or</span>
          </div>
        </div>

        <button
          onClick={loadSample}
          className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium shadow-sm"
        >
          <Database className="w-4 h-4" />
          Load Sample Real Estate Data
        </button>
      </div>
    </div>
  );
};