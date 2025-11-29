import React from 'react';
import { DataPoint } from '../types';

interface DataPreviewProps {
  data: DataPoint[];
}

export const DataPreview: React.FC<DataPreviewProps> = ({ data }) => {
  if (data.length === 0) return null;

  const headers = Object.keys(data[0]);
  const previewRows = data.slice(0, 5);

  return (
    <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
        <h3 className="font-semibold text-gray-800">Dataset Preview</h3>
        <span className="text-xs font-medium text-gray-500 bg-gray-200 px-2 py-1 rounded-full">
          {data.length} rows
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b">
            <tr>
              {headers.map((header) => (
                <th key={header} className="px-6 py-3 font-medium tracking-wider">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {previewRows.map((row, idx) => (
              <tr key={idx} className="hover:bg-gray-50 transition-colors">
                {headers.map((header) => (
                  <td key={`${idx}-${header}`} className="px-6 py-4 whitespace-nowrap text-gray-700">
                    {row[header]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="px-6 py-3 bg-gray-50 text-xs text-gray-500 text-center border-t border-gray-100">
        Showing first 5 rows of {data.length}
      </div>
    </div>
  );
};