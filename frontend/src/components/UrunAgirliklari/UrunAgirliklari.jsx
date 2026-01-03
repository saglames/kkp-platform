import React, { useState, useEffect } from 'react';
import Anasayfa from './Anasayfa';
import Urunler from './Urunler';
import Fittinglar from './Fittinglar';
import Hesaplama from './Hesaplama';
import HesaplamaLog from './HesaplamaLog';
import KeyboardShortcutsHelp from './shared/KeyboardShortcutsHelp';

// Main Container Component with Tab Navigation
const UrunAgirliklari = () => {
  const [activeTab, setActiveTab] = useState('anasayfa');
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);

  const tabs = [
    { id: 'anasayfa', label: 'Anasayfa', icon: '📊' },
    { id: 'jointler', label: 'Jointler', icon: '📦' },
    { id: 'fittings', label: 'Fittings', icon: '🔧' },
    { id: 'hesaplama', label: 'Hesaplama', icon: '🧮' },
    { id: 'log', label: 'Geçmiş', icon: '📜' },
  ];

  // Global keyboard shortcuts (Feature 7)
  useEffect(() => {
    const handleKeyDown = (e) => {
      // ? key - Show keyboard shortcuts help
      if (e.key === '?' && !e.ctrlKey && !e.altKey && !e.metaKey) {
        // Don't trigger if user is typing in an input
        if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
          e.preventDefault();
          setShowKeyboardHelp(true);
        }
      }

      // F5 - Refresh (let browser handle it naturally)
      // Ctrl+F - Focus search (handled by individual components)
      // Other shortcuts handled by child components
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case 'anasayfa':
        return <Anasayfa />;
      case 'jointler':
        return <Urunler />;
      case 'fittings':
        return <Fittinglar />;
      case 'hesaplama':
        return <Hesaplama />;
      case 'log':
        return <HesaplamaLog />;
      default:
        return <Anasayfa />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <span>⚖️</span>
                Joint ve Fittings Ağırlıkları
              </h1>
              <p className="text-indigo-100 mt-1">
                Joint ve fittings ağırlık hesaplama sistemi
              </p>
            </div>
            <button
              onClick={() => setShowKeyboardHelp(true)}
              className="px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg transition-colors flex items-center gap-2"
              title="Klavye Kısayolları (?)">
              <span>⌨️</span>
              <span className="hidden md:inline">Kısayollar</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="container mx-auto px-4">
          <div className="flex space-x-1 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  px-6 py-4 text-base font-medium transition-all duration-200 whitespace-nowrap
                  ${activeTab === tab.id
                    ? 'bg-white text-indigo-600 rounded-t-lg shadow-lg'
                    : 'text-white hover:bg-white hover:bg-opacity-10 rounded-t-lg'
                  }
                `}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-6">
        {renderContent()}
      </div>

      {/* Keyboard Shortcuts Help Modal */}
      {showKeyboardHelp && (
        <KeyboardShortcutsHelp onClose={() => setShowKeyboardHelp(false)} />
      )}
    </div>
  );
};

export default UrunAgirliklari;
