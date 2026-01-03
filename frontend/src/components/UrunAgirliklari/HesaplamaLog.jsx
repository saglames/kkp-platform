import React, { useState, useEffect, useRef } from 'react';
import { urunAgirliklariAPI } from '../../services/api';
import { formatWeight, formatDateTime } from '../../utils/formatters';
import { exportHistoryToPDF } from '../../utils/pdfExport';

// Calculation History Component
const HesaplamaLog = () => {
  const [hesaplamalar, setHesaplamalar] = useState([]);
  const [filteredHesaplamalar, setFilteredHesaplamalar] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState(''); // Feature 1
  const [filterTip, setFilterTip] = useState('');
  const searchInputRef = useRef(null);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterData();
  }, [searchQuery, filterTip, hesaplamalar]);

  // Keyboard shortcuts (Feature 7)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.key === 'f') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if (e.key === 'Escape') {
        setSearchQuery('');
      }
      if (e.key === 'F5') {
        e.preventDefault();
        fetchData();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await urunAgirliklariAPI.getHesaplamalar();
      setHesaplamalar(data);
    } catch (error) {
      console.error('Veri yükleme hatası:', error);
      alert('Veriler yüklenirken hata oluştu!');
    } finally {
      setLoading(false);
    }
  };

  const filterData = () => {
    let filtered = [...hesaplamalar];

    // Search filter (Feature 1)
    if (searchQuery) {
      filtered = filtered.filter(h =>
        h.urun_kodu?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        h.yapan?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Type filter
    if (filterTip) {
      filtered = filtered.filter(h => h.hesaplama_tipi === filterTip);
    }

    setFilteredHesaplamalar(filtered);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bu hesaplamayı silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      await urunAgirliklariAPI.deleteHesaplama(id);
      alert('Hesaplama silindi!');
      fetchData();
    } catch (error) {
      console.error('Silme hatası:', error);
      alert('Silme sırasında hata oluştu!');
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm('TÜM hesaplamaları silmek istediğinizden emin misiniz? Bu işlem geri alınamaz!')) {
      return;
    }

    try {
      await urunAgirliklariAPI.clearHesaplamalar();
      alert('Tüm hesaplamalar silindi!');
      fetchData();
    } catch (error) {
      console.error('Temizleme hatası:', error);
      alert('Temizleme sırasında hata oluştu!');
    }
  };

  const handleExportPDF = () => {
    if (filteredHesaplamalar.length === 0) {
      alert('Dışa aktarılacak hesaplama yok!');
      return;
    }

    exportHistoryToPDF(filteredHesaplamalar);
  };

  const handleRowClick = (calc) => {
    // Feature 2: Click to repeat calculation
    const message = `Hesaplama Detayları:\n\n` +
      `Ürün: ${calc.urun_kodu}\n` +
      `${calc.kalite ? `Kalite: ${calc.kalite}\n` : ''}` +
      `Adet: ${calc.adet}\n` +
      `Birim Ağırlık: ${formatWeight(calc.birim_agirlik)}\n` +
      `Toplam Ağırlık: ${formatWeight(calc.toplam_agirlik)}\n` +
      `İşlemi Yapan: ${calc.yapan || '-'}`;

    alert(message);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-500"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Hesaplama Geçmişi</h2>
          <p className="text-gray-600 mt-1">
            {filteredHesaplamalar.length} hesaplama gösteriliyor
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleExportPDF}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
          >
            📄 PDF
          </button>
          <button
            onClick={handleClearAll}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
          >
            🗑️ Tümünü Sil
          </button>
          <button
            onClick={fetchData}
            className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium"
          >
            Yenile (F5)
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Search (Feature 1) */}
        <div className="relative">
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Ara... (Ctrl+F)"
            className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500"
          />
          <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl">
            🔍
          </span>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          )}
        </div>

        {/* Type Filter */}
        <div>
          <select
            value={filterTip}
            onChange={(e) => setFilterTip(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500"
          >
            <option value="">Tüm Tipler</option>
            <option value="Ürün">Joint</option>
            <option value="Fitting">Fittings</option>
            <option value="A+B Toplam">A+B Toplam</option>
            <option value="Toplu">Toplu</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full">
          <thead className="bg-gradient-to-r from-gray-600 to-gray-700 text-white">
            <tr>
              <th className="px-4 py-4 text-left text-sm font-semibold">Tarih</th>
              <th className="px-4 py-4 text-left text-sm font-semibold">Tip</th>
              <th className="px-4 py-4 text-left text-sm font-semibold">Joint/Fittings</th>
              <th className="px-4 py-4 text-center text-sm font-semibold">Kalite</th>
              <th className="px-4 py-4 text-center text-sm font-semibold">Adet</th>
              <th className="px-4 py-4 text-center text-sm font-semibold">Birim Ağ.</th>
              <th className="px-4 py-4 text-center text-sm font-semibold">Toplam Ağ.</th>
              <th className="px-4 py-4 text-center text-sm font-semibold">Yapan</th>
              <th className="px-4 py-4 text-center text-sm font-semibold">İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {filteredHesaplamalar.length === 0 ? (
              <tr>
                <td colSpan="9" className="px-4 py-8 text-center text-gray-500">
                  {searchQuery || filterTip ? 'Sonuç bulunamadı' : 'Henüz hesaplama yok'}
                </td>
              </tr>
            ) : (
              filteredHesaplamalar.map((calc) => (
                <tr
                  key={calc.id}
                  onClick={() => handleRowClick(calc)}
                  className="border-b hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {formatDateTime(calc.created_at)}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                      calc.hesaplama_tipi === 'Ürün' ? 'bg-blue-100 text-blue-700' :
                      calc.hesaplama_tipi === 'Fitting' ? 'bg-purple-100 text-purple-700' :
                      calc.hesaplama_tipi === 'A+B Toplam' ? 'bg-orange-100 text-orange-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {calc.hesaplama_tipi}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {calc.urun_kodu}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {calc.kalite ? (
                      <span className="inline-block px-2 py-1 bg-gray-200 text-gray-700 rounded font-bold">
                        {calc.kalite}
                      </span>
                    ) : '-'}
                  </td>
                  <td className="px-4 py-3 text-center font-medium">
                    {calc.adet}
                  </td>
                  <td className="px-4 py-3 text-center text-sm">
                    {formatWeight(calc.birim_agirlik)}
                  </td>
                  <td className="px-4 py-3 text-center font-bold text-green-600">
                    {formatWeight(calc.toplam_agirlik)}
                  </td>
                  <td className="px-4 py-3 text-center text-sm">
                    {calc.yapan || '-'}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(calc.id);
                      }}
                      className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition-colors"
                    >
                      Sil
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Info */}
      <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <span className="text-2xl">💡</span>
          <div>
            <h3 className="font-bold text-lg text-gray-800 mb-1">İpucu</h3>
            <p className="text-gray-700">
              Bir hesaplamaya tıklayarak detaylarını görebilirsiniz.
              Ctrl+F ile arama yapabilir, F5 ile listeyi yenileyebilirsiniz.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HesaplamaLog;
