import React, { useState, useEffect } from 'react';
import { urunAgirliklariAPI } from '../../services/api';
import { formatWeight, formatWeightNoUnit, formatPercent, calculatePercentDiff } from '../../utils/formatters';
import { exportComparisonToPDF } from '../../utils/pdfExport';

// Quality Comparison Tool Component (Feature 9)
const Karsilastirma = () => {
  const [urunler, setUrunler] = useState([]);
  const [selectedUrun, setSelectedUrun] = useState('');
  const [adet, setAdet] = useState('');
  const [comparison, setComparison] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchFilter, setSearchFilter] = useState(''); // Feature 1
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    fetchData();
    loadFavorites();
  }, []);

  // Keyboard shortcuts (Feature 7)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Enter' && selectedUrun && adet) {
        e.preventDefault();
        handleCompare();
      }
      if (e.key === 'Escape') {
        handleClear();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedUrun, adet]);

  const fetchData = async () => {
    try {
      const data = await urunAgirliklariAPI.getUrunler();
      setUrunler(data);
    } catch (error) {
      console.error('Veri yükleme hatası:', error);
    }
  };

  const loadFavorites = () => {
    try {
      const stored = JSON.parse(localStorage.getItem('urun_agirliklari_favorites') || '[]');
      setFavorites(stored.filter(f => f.type === 'product'));
    } catch (error) {
      console.error('Favoriler yüklenemedi:', error);
    }
  };

  const getFilteredUrunler = () => {
    let filtered = [...urunler];
    if (searchFilter) {
      filtered = filtered.filter(u => u.urun_kodu.toLowerCase().includes(searchFilter.toLowerCase()));
    }
    // Favorites first (Feature 3)
    const favoriteIds = favorites.map(f => f.id);
    return filtered.sort((a, b) => {
      const aFav = favoriteIds.includes(a.id) ? 0 : 1;
      const bFav = favoriteIds.includes(b.id) ? 0 : 1;
      return aFav - bFav;
    });
  };

  const handleCompare = async () => {
    if (!selectedUrun || !adet) {
      alert('Lütfen ürün ve adet girin!');
      return;
    }

    setLoading(true);
    try {
      const data = await urunAgirliklariAPI.karsilastir(selectedUrun, adet);
      setComparison(data);
    } catch (error) {
      console.error('Karşılaştırma hatası:', error);
      alert('Karşılaştırma sırasında hata oluştu!');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setSelectedUrun('');
    setAdet('');
    setComparison(null);
  };

  const handleExportPDF = () => {
    if (!comparison) {
      alert('Önce bir karşılaştırma yapın!');
      return;
    }
    exportComparisonToPDF(comparison);
  };

  const getQualityColor = (kalite) => {
    switch (kalite) {
      case 'A': return 'bg-green-500';
      case 'B': return 'bg-blue-500';
      case 'C': return 'bg-orange-500';
      case 'D': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getQualityGradient = (kalite) => {
    switch (kalite) {
      case 'A': return 'from-green-50 to-green-100';
      case 'B': return 'from-blue-50 to-blue-100';
      case 'C': return 'from-orange-50 to-orange-100';
      case 'D': return 'from-red-50 to-red-100';
      default: return 'from-gray-50 to-gray-100';
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Kalite Karşılaştırma</h2>
        <p className="text-gray-600 mt-1">
          Farklı kalite seçeneklerini karşılaştırın ve en uygun kaliteyi belirleyin
        </p>
      </div>

      {/* Input Section */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Product Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ürün Seçin
            </label>
            {/* Search Filter */}
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Ara..."
              className="w-full px-4 py-2 mb-2 border rounded-lg"
            />
            <select
              value={selectedUrun}
              onChange={(e) => setSelectedUrun(e.target.value)}
              className="w-full px-4 py-3 border rounded-lg text-lg"
            >
              <option value="">Seçiniz...</option>
              {getFilteredUrunler().map((urun) => {
                const isFav = favorites.some(f => f.id === urun.id);
                return (
                  <option key={urun.id} value={urun.id}>
                    {isFav ? '⭐ ' : ''}{urun.urun_kodu}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Quantity Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Adet
            </label>
            <input
              type="number"
              value={adet}
              onChange={(e) => setAdet(e.target.value)}
              placeholder="Adet girin"
              className="w-full px-4 py-3 border rounded-lg text-lg mt-8"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex gap-3">
          <button
            onClick={handleCompare}
            disabled={loading}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-lg font-bold rounded-lg hover:from-indigo-600 hover:to-purple-600 transition-all shadow-lg disabled:opacity-50"
          >
            {loading ? 'Karşılaştırılıyor...' : '🔄 Karşılaştır (Enter)'}
          </button>
          <button
            onClick={handleExportPDF}
            className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600"
          >
            📄 PDF
          </button>
          <button
            onClick={handleClear}
            className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
          >
            Temizle (Esc)
          </button>
        </div>
      </div>

      {/* Comparison Results */}
      {comparison && (
        <div className="space-y-6">
          {/* Summary Card */}
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-lg p-6">
            <h3 className="text-xl font-bold text-indigo-900 mb-3">Karşılaştırma Özeti</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-indigo-800">
              <div>
                <p className="text-sm text-indigo-600">Ürün</p>
                <p className="text-lg font-bold">{comparison.urun_kodu}</p>
              </div>
              <div>
                <p className="text-sm text-indigo-600">Adet</p>
                <p className="text-lg font-bold">{comparison.adet}</p>
              </div>
            </div>
          </div>

          {/* Comparison Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full">
              <thead className="bg-gradient-to-r from-gray-700 to-gray-800 text-white">
                <tr>
                  <th className="px-6 py-4 text-left text-lg font-semibold">Kalite</th>
                  <th className="px-6 py-4 text-center text-lg font-semibold">Birim Ağ. (kg)</th>
                  <th className="px-6 py-4 text-center text-lg font-semibold">Toplam Ağ. (kg)</th>
                  <th className="px-6 py-4 text-center text-lg font-semibold">Fark (kg)</th>
                  <th className="px-6 py-4 text-center text-lg font-semibold">Fark (%)</th>
                </tr>
              </thead>
              <tbody>
                {comparison.qualities.map((quality, index) => (
                  <tr
                    key={quality.kalite}
                    className={`border-b bg-gradient-to-r ${getQualityGradient(quality.kalite)} hover:opacity-80 transition-opacity`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className={`w-12 h-12 ${getQualityColor(quality.kalite)} text-white rounded-full flex items-center justify-center text-2xl font-bold`}>
                          {quality.kalite}
                        </span>
                        <span className="text-lg font-bold text-gray-800">
                          {quality.kalite} Kalite
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center font-medium text-gray-900">
                      {formatWeightNoUnit(quality.birim_agirlik)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-2xl font-bold text-gray-900">
                        {formatWeightNoUnit(quality.toplam_agirlik)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center font-medium text-gray-700">
                      {index > 0 ? (
                        <>+{formatWeightNoUnit(quality.fark_kg)}</>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {index > 0 ? (
                        <span className={`inline-block px-3 py-1 rounded-full font-bold ${
                          parseFloat(quality.fark_yuzde) > 0 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                        }`}>
                          {formatPercent(quality.fark_yuzde)}
                        </span>
                      ) : (
                        '-'
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Visual Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Görsel Karşılaştırma</h3>
            <div className="space-y-3">
              {comparison.qualities.map((quality) => {
                const maxWeight = Math.max(...comparison.qualities.map(q => q.toplam_agirlik));
                const percentage = (quality.toplam_agirlik / maxWeight) * 100;

                return (
                  <div key={quality.kalite} className="flex items-center gap-4">
                    <span className={`w-16 h-10 ${getQualityColor(quality.kalite)} text-white rounded flex items-center justify-center font-bold`}>
                      {quality.kalite}
                    </span>
                    <div className="flex-1 bg-gray-200 rounded-full h-10 overflow-hidden">
                      <div
                        className={`h-full ${getQualityColor(quality.kalite)} flex items-center justify-end pr-3 text-white font-bold transition-all duration-1000`}
                        style={{ width: `${percentage}%` }}
                      >
                        {percentage > 20 && formatWeightNoUnit(quality.toplam_agirlik) + ' kg'}
                      </div>
                    </div>
                    <span className="w-32 text-right text-lg font-bold text-gray-700">
                      {formatWeight(quality.toplam_agirlik)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recommendation */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <div className="flex items-start gap-3">
              <span className="text-3xl">💡</span>
              <div>
                <h3 className="font-bold text-lg text-green-900 mb-2">Öneri</h3>
                <p className="text-green-800">
                  <strong>A Kalite</strong> en hafif seçenektir ({formatWeight(comparison.qualities[0].toplam_agirlik)}).
                  <br />
                  <strong>D Kalite</strong> en ağır seçenektir ({formatWeight(comparison.qualities[3].toplam_agirlik)}).
                  <br />
                  A ve D arasındaki fark: <strong>{formatWeight(comparison.qualities[3].toplam_agirlik - comparison.qualities[0].toplam_agirlik)}</strong>
                  {' '}({formatPercent(comparison.qualities[3].fark_yuzde)})
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Info Box */}
      {!comparison && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <span className="text-3xl">ℹ️</span>
            <div>
              <h3 className="font-bold text-lg text-indigo-900 mb-2">Nasıl Kullanılır?</h3>
              <ul className="list-disc list-inside text-indigo-800 space-y-1">
                <li>Karşılaştırmak istediğiniz ürünü seçin</li>
                <li>Adet bilgisini girin (ses komutu da kullanabilirsiniz)</li>
                <li>"Karşılaştır" butonuna tıklayın veya Enter'a basın</li>
                <li>A, B, C, D kaliteler arasındaki farkları görün</li>
                <li>Sonuçları PDF olarak dışa aktarabilirsiniz</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Karsilastirma;
