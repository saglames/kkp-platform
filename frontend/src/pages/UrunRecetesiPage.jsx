import React, { useState } from 'react';
import UrunRecetesi from '../components/UrunRecetesi/UrunRecetesi';
import SiparisHesaplama from '../components/UrunRecetesi/SiparisHesaplama';

const UrunRecetesiPage = () => {
  const [activeTab, setActiveTab] = useState('receteler');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex space-x-1">
            <button
              onClick={() => setActiveTab('receteler')}
              className={`px-6 py-4 text-sm font-medium transition-all duration-200 ${
                activeTab === 'receteler'
                  ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50'
                  : 'text-gray-600 hover:text-purple-600 hover:bg-gray-50'
              }`}
            >
              <span className="mr-2">📋</span>
              Ürün Reçeteleri
            </button>
            <button
              onClick={() => setActiveTab('hesaplama')}
              className={`px-6 py-4 text-sm font-medium transition-all duration-200 ${
                activeTab === 'hesaplama'
                  ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50'
                  : 'text-gray-600 hover:text-purple-600 hover:bg-gray-50'
              }`}
            >
              <span className="mr-2">🧮</span>
              Sipariş Hesaplama
            </button>
          </div>
        </div>
      </div>

      <div>
        {activeTab === 'receteler' && <UrunRecetesi />}
        {activeTab === 'hesaplama' && <SiparisHesaplama />}
      </div>
    </div>
  );
};

export default UrunRecetesiPage;
