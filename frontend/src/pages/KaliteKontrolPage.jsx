import React, { useState } from 'react';
import GuncelIsler from '../components/KaliteKontrol/GuncelIsler';
import SiparisHazirlik from '../components/KaliteKontrol/SiparisHazirlik';
import UrunSiparisler from '../components/KaliteKontrol/UrunSiparisler';
import SimulasyonStok from '../components/KaliteKontrol/SimulasyonStok';
import VeriAktarma from '../components/KaliteKontrol/VeriAktarma';
import IslemGecmisi from '../components/KaliteKontrol/IslemGecmisi';

const KaliteKontrolPage = () => {
  const [activeTab, setActiveTab] = useState('guncel-isler');

  const tabs = [
    { id: 'guncel-isler', label: 'Güncel İşler', icon: '✅' },
    { id: 'siparis-hazirlik', label: 'Sipariş Hazırlığı', icon: '📦' },
    { id: 'urun-siparisler', label: 'İç Siparişler', icon: '🛒' },
    { id: 'simulasyon-stok', label: 'Simülasyon Stok', icon: '📊' },
    { id: 'islem-gecmisi', label: 'İşlem Geçmişi', icon: '📋' },
    { id: 'veri-aktarma', label: 'Veri Aktarma', icon: '💾' }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'guncel-isler':
        return <GuncelIsler />;
      case 'siparis-hazirlik':
        return <SiparisHazirlik />;
      case 'urun-siparisler':
        return <UrunSiparisler />;
      case 'simulasyon-stok':
        return <SimulasyonStok />;
      case 'islem-gecmisi':
        return <IslemGecmisi />;
      case 'veri-aktarma':
        return <VeriAktarma />;
      default:
        return <GuncelIsler />;
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Kalite Kontrol</h1>
        <p className="text-gray-600">Görev, sipariş ve stok yönetimi</p>
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

export default KaliteKontrolPage;
