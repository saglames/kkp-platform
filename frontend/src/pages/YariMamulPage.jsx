import React, { useState } from 'react';
import Jointler from '../components/YariMamul/Jointler';
import Fittingsler from '../components/YariMamul/Fittingsler';

const YariMamulPage = () => {
  const [activeTab, setActiveTab] = useState('jointler');

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          Yarı Mamül Joint ve Fittingsler
        </h1>

        {/* Tab Buttons */}
        <div className="flex border-b border-gray-300 mb-6">
          <button
            onClick={() => setActiveTab('jointler')}
            className={`px-8 py-3 text-lg font-medium transition-all ${
              activeTab === 'jointler'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
            }`}
          >
            Jointler
          </button>
          <button
            onClick={() => setActiveTab('fittingsler')}
            className={`px-8 py-3 text-lg font-medium transition-all ${
              activeTab === 'fittingsler'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
            }`}
          >
            Fittingsler
          </button>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'jointler' && <Jointler />}
          {activeTab === 'fittingsler' && <Fittingsler />}
        </div>
      </div>
    </div>
  );
};

export default YariMamulPage;
