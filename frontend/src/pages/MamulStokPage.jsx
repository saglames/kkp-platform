import React, { useState } from 'react';
import IzolasyonTab from '../components/MamulStok/IzolasyonTab';
import KoliTab from '../components/MamulStok/KoliTab';
import KutuTab from '../components/MamulStok/KutuTab';
import TapaTab from '../components/MamulStok/TapaTab';
import HistoryTable from '../components/MamulStok/HistoryTable';

const MamulStokPage = () => {
  const [activeTab, setActiveTab] = useState('izolasyon');

  const tabs = [
    { id: 'izolasyon', label: 'İzolasyon', icon: '🔹' },
    { id: 'koli', label: 'Koli', icon: '📦' },
    { id: 'kutu', label: 'Kutu', icon: '📋' },
    { id: 'tapa', label: 'Tapa', icon: '🔘' },
    { id: 'history', label: 'İşlem Geçmişi', icon: '📜' }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'izolasyon':
        return <IzolasyonTab />;
      case 'koli':
        return <KoliTab />;
      case 'kutu':
        return <KutuTab />;
      case 'tapa':
        return <TapaTab />;
      case 'history':
        return <HistoryTable />;
      default:
        return <IzolasyonTab />;
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Mamül Stok Yönetimi</h1>
        <p className="text-gray-600">İzolasyon, Koli, Kutu ve Tapa stok takibi</p>
      </div>

      <div className="bg-white rounded-lg shadow-md">
        <div className="border-b border-gray-200">
          <div className="flex space-x-1 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  px-6 py-4 text-sm font-medium transition-all duration-200 whitespace-nowrap
                  ${activeTab === tab.id
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                  }
                `}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default MamulStokPage;
