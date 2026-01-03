import React, { useState } from 'react';
import Anasayfa from './Anasayfa';
import TemizlemeyeGidecek from './TemizlemeyeGidecek';
import TemizlemedOlan from './TemizlemedOlan';
import TemizlemedenGelen from './TemizlemedenGelen';
import SevkeHazir from './SevkeHazir';
import SevkEdilen from './SevkEdilen';
import Kalan from './Kalan';
import HareketLog from './HareketLog';

const TumSurec = () => {
  const [activeTab, setActiveTab] = useState('anasayfa');

  const tabs = [
    { id: 'anasayfa', label: 'Anasayfa', icon: '🏠' },
    { id: 'temizlemeye-gidecek', label: 'Temizlemeye Gidecek', icon: '📋' },
    { id: 'temizlemede-olan', label: 'Temizlemede Olan', icon: '🧹' },
    { id: 'temizlemeden-gelen', label: 'Temizlemeden Gelen', icon: '✅' },
    { id: 'sevke-hazir', label: 'Sevke Hazır', icon: '📦' },
    { id: 'sevk-edilen', label: 'Sevk Edilen', icon: '🚚' },
    { id: 'kalan', label: 'Kalan', icon: '📊' },
    { id: 'hareket-log', label: 'Hareket Log', icon: '📝' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'anasayfa':
        return <Anasayfa />;
      case 'temizlemeye-gidecek':
        return <TemizlemeyeGidecek />;
      case 'temizlemede-olan':
        return <TemizlemedOlan />;
      case 'temizlemeden-gelen':
        return <TemizlemedenGelen />;
      case 'sevke-hazir':
        return <SevkeHazir />;
      case 'sevk-edilen':
        return <SevkEdilen />;
      case 'kalan':
        return <Kalan />;
      case 'hareket-log':
        return <HareketLog />;
      default:
        return <Anasayfa />;
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">Tüm Süreç Yönetimi</h1>
        <p className="text-gray-600">Ürünlerin temizlik ve sevkiyat süreçlerini takip edin</p>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6 bg-white rounded-lg shadow-md overflow-hidden">
        <div className="flex flex-wrap border-b">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-4 text-base font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-blue-500 text-white border-b-2 border-blue-600'
                  : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
              }`}
            >
              <span className="text-xl">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="bg-white rounded-lg shadow-md p-6">
        {renderContent()}
      </div>
    </div>
  );
};

export default TumSurec;
