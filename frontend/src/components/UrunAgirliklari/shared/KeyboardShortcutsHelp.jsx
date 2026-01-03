import React from 'react';

// Feature 7: Keyboard Shortcuts Help Panel
const KeyboardShortcutsHelp = ({ onClose }) => {
  const shortcuts = [
    { key: 'Enter', description: 'Hesaplamayı çalıştır' },
    { key: 'Esc', description: 'Formu temizle / Modalı kapat' },
    { key: 'Ctrl + F', description: 'Arama kutusuna odaklan' },
    { key: 'Ctrl + N', description: 'Yeni hesaplama (formu temizle)' },
    { key: 'Ctrl + S', description: 'Hesaplamayı kaydet' },
    { key: 'Ctrl + P', description: 'Yazdır / PDF olarak kaydet' },
    { key: 'F5', description: 'Verileri yenile' },
    { key: '?', description: 'Bu yardım panelini aç' },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <span>⌨️</span>
                Klavye Kısayolları
              </h2>
              <p className="text-blue-100 mt-1">
                Daha hızlı çalışmak için klavye kısayollarını kullanın
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Shortcuts List */}
        <div className="p-6">
          <div className="grid gap-3">
            {shortcuts.map((shortcut, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200"
              >
                <span className="text-gray-700 text-lg">{shortcut.description}</span>
                <kbd className="px-4 py-2 bg-white border border-gray-300 rounded-lg font-mono text-sm font-bold text-gray-800 shadow-sm">
                  {shortcut.key}
                </kbd>
              </div>
            ))}
          </div>

          {/* Tips */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-bold text-blue-800 mb-2 flex items-center gap-2">
              <span>💡</span>
              İpuçları
            </h3>
            <ul className="space-y-2 text-sm text-blue-700">
              <li>• Hesaplama formlarında Enter tuşuna basarak hızlıca hesaplama yapabilirsiniz</li>
              <li>• Ctrl + F ile arama kutusuna hızlıca geçiş yapabilirsiniz</li>
              <li>• Modal açıkken Esc tuşu ile kapatabilirsiniz</li>
              <li>• F5 ile verileri yenileyebilirsiniz</li>
            </ul>
          </div>

          {/* Browser Note */}
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h3 className="font-bold text-yellow-800 mb-2 flex items-center gap-2">
              <span>⚠️</span>
              Not
            </h3>
            <p className="text-sm text-yellow-700">
              Bazı kısayollar tarayıcınızın kendi kısayollarıyla çakışabilir. Bu durumda
              tarayıcı kısayolu öncelik alır.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 p-4 rounded-b-lg border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all"
          >
            Anladım
          </button>
        </div>
      </div>
    </div>
  );
};

export default KeyboardShortcutsHelp;
