import React, { useState } from 'react';
import { veriAktarmaAPI } from '../../services/api';

const VeriAktarma = () => {
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    try {
      setExporting(true);
      const data = await veriAktarmaAPI.exportData();

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `kkp-yedek-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      alert('Veriler başarıyla dışa aktarıldı!');
    } catch (error) {
      console.error('Dışa aktarma hatası:', error);
      alert('Dışa aktarma sırasında bir hata oluştu!');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Veri Aktarma</h3>
        <p className="text-sm text-gray-600">Veritabanındaki tüm verileri yedekleyin veya geri yükleyin.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-lg p-6">
          <div className="flex items-center mb-4">
            <div className="bg-blue-600 text-white rounded-full p-3 mr-4">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </div>
            <div>
              <h4 className="text-lg font-bold text-gray-900">Dışa Aktar</h4>
              <p className="text-sm text-gray-600">Tüm verileri JSON dosyası olarak indir</p>
            </div>
          </div>
          <ul className="space-y-2 mb-6 text-sm text-gray-700">
            <li className="flex items-center">
              <svg className="w-4 h-4 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Mamül Stok (İzolasyon, Koli, Kutu, Tapa)
            </li>
            <li className="flex items-center">
              <svg className="w-4 h-4 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Görevler ve İşlem Geçmişi
            </li>
            <li className="flex items-center">
              <svg className="w-4 h-4 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Sipariş Hazırlığı ve Ürün Siparişleri
            </li>
            <li className="flex items-center">
              <svg className="w-4 h-4 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Simülasyon Stok Verileri
            </li>
          </ul>
          <button
            onClick={handleExport}
            disabled={exporting}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            {exporting ? '⏳ Aktarılıyor...' : '💾 Dışa Aktar'}
          </button>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-amber-100 border-2 border-amber-200 rounded-lg p-6">
          <div className="flex items-center mb-4">
            <div className="bg-amber-600 text-white rounded-full p-3 mr-4">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h4 className="text-lg font-bold text-gray-900">İçe Aktar</h4>
              <p className="text-sm text-gray-600">JSON dosyasından veri geri yükle</p>
            </div>
          </div>
          <div className="bg-amber-200 border border-amber-400 rounded-lg p-4 mb-6">
            <p className="text-sm text-amber-900 font-medium mb-2">⚠️ Önemli Uyarı</p>
            <ul className="text-xs text-amber-800 space-y-1">
              <li>• İçe aktarma işlemi mevcut verileri silecektir</li>
              <li>• İşlem geri alınamaz</li>
              <li>• Önce dışa aktarma yapmanız önerilir</li>
            </ul>
          </div>
          <button
            disabled
            className="w-full bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg cursor-not-allowed"
          >
            🚧 Yakında Gelecek
          </button>
          <p className="text-xs text-gray-500 mt-2 text-center">İçe aktarma özelliği şu anda geliştiriliyor</p>
        </div>
      </div>

      <div className="mt-8 bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h4 className="text-md font-semibold text-gray-800 mb-3">📝 Yedekleme Önerileri</h4>
        <ul className="space-y-2 text-sm text-gray-700">
          <li className="flex items-start">
            <span className="text-blue-600 mr-2">1.</span>
            <span>Düzenli olarak (haftada bir) dışa aktarma yapın</span>
          </li>
          <li className="flex items-start">
            <span className="text-blue-600 mr-2">2.</span>
            <span>Yedek dosyalarını güvenli bir konumda saklayın</span>
          </li>
          <li className="flex items-start">
            <span className="text-blue-600 mr-2">3.</span>
            <span>Büyük değişikliklerden önce yedek alın</span>
          </li>
          <li className="flex items-start">
            <span className="text-blue-600 mr-2">4.</span>
            <span>Dosya adlarında tarih bilgisi bulunur: kkp-yedek-YYYY-MM-DD.json</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default VeriAktarma;
