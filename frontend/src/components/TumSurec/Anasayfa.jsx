import React, { useState, useEffect } from 'react';
import { tumSurecAPI } from '../../services/api';

const Anasayfa = () => {
  const [urunler, setUrunler] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTip, setFilterTip] = useState('all');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await tumSurecAPI.getAnasayfa();
      setUrunler(data);
    } catch (error) {
      console.error('Veri yükleme hatası:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUrunler = urunler.filter(urun => {
    const matchesSearch = urun.urun_kodu.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTip = filterTip === 'all' || urun.tip === filterTip;
    return matchesSearch && matchesTip;
  });

  const getRowColor = (urun) => {
    const toplam = urun.temizlemeye_gidecek + urun.temizlemede_olan +
                   urun.temizlemeden_gelen + urun.sevke_hazir + urun.kalan;
    if (toplam === 0) return 'bg-gray-50';
    if (urun.sevke_hazir > 0) return 'bg-green-50';
    if (urun.temizlemede_olan > 0) return 'bg-yellow-50';
    return 'bg-blue-50';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Süreç Özeti</h2>

        {/* Filters */}
        <div className="flex gap-4 mb-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Ürün kodu ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={filterTip}
            onChange={(e) => setFilterTip(e.target.value)}
            className="px-6 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Tüm Tipler</option>
            <option value="A">A Kalite</option>
            <option value="B">B Kalite</option>
          </select>
          <button
            onClick={fetchData}
            className="px-6 py-3 bg-blue-500 text-white text-lg font-medium rounded-lg hover:bg-blue-600 transition-colors"
          >
            Yenile
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-300">
          <thead className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
            <tr>
              <th className="px-4 py-4 text-left text-lg font-semibold border-b border-gray-300">Tip</th>
              <th className="px-4 py-4 text-left text-lg font-semibold border-b border-gray-300">Ürün Kodu</th>
              <th className="px-4 py-4 text-center text-lg font-semibold border-b border-gray-300">Temizlemeye Gidecek</th>
              <th className="px-4 py-4 text-center text-lg font-semibold border-b border-gray-300">Temizlemede Olan</th>
              <th className="px-4 py-4 text-center text-lg font-semibold border-b border-gray-300">Temizlemeden Gelen</th>
              <th className="px-4 py-4 text-center text-lg font-semibold border-b border-gray-300">Sevke Hazır</th>
              <th className="px-4 py-4 text-center text-lg font-semibold border-b border-gray-300">Kalan</th>
              <th className="px-4 py-4 text-center text-lg font-semibold border-b border-gray-300 bg-blue-800">TOPLAM</th>
            </tr>
          </thead>
          <tbody>
            {filteredUrunler.length === 0 ? (
              <tr>
                <td colSpan="8" className="px-4 py-8 text-center text-gray-500 text-lg">
                  Ürün bulunamadı
                </td>
              </tr>
            ) : (
              filteredUrunler.map((urun) => {
                const toplam = urun.temizlemeye_gidecek + urun.temizlemede_olan +
                               urun.temizlemeden_gelen + urun.sevke_hazir + urun.kalan;
                return (
                  <tr key={urun.id} className={`${getRowColor(urun)} border-b hover:bg-gray-100 transition-colors`}>
                    <td className="px-4 py-4 text-center border-r border-gray-200">
                      <span className={`inline-block px-3 py-1 rounded-full text-lg font-bold ${
                        urun.tip === 'A' ? 'bg-green-500 text-white' : 'bg-orange-500 text-white'
                      }`}>
                        {urun.tip}
                      </span>
                    </td>
                    <td className="px-4 py-4 font-medium text-gray-900 text-lg border-r border-gray-200">
                      {urun.urun_kodu}
                    </td>
                    <td className="px-4 py-4 text-center text-lg border-r border-gray-200">
                      <span className={urun.temizlemeye_gidecek > 0 ? 'font-bold text-blue-600' : 'text-gray-400'}>
                        {urun.temizlemeye_gidecek}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center text-lg border-r border-gray-200">
                      <span className={urun.temizlemede_olan > 0 ? 'font-bold text-yellow-600' : 'text-gray-400'}>
                        {urun.temizlemede_olan}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center text-lg border-r border-gray-200">
                      <span className={urun.temizlemeden_gelen > 0 ? 'font-bold text-purple-600' : 'text-gray-400'}>
                        {urun.temizlemeden_gelen}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center text-lg border-r border-gray-200">
                      <span className={urun.sevke_hazir > 0 ? 'font-bold text-green-600' : 'text-gray-400'}>
                        {urun.sevke_hazir}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center text-lg border-r border-gray-200">
                      <span className={urun.kalan > 0 ? 'font-bold text-red-600' : 'text-gray-400'}>
                        {urun.kalan}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center text-lg font-bold bg-blue-50">
                      {toplam}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Summary Stats */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-blue-100 p-4 rounded-lg">
          <div className="text-sm text-gray-600">Toplam Ürün</div>
          <div className="text-2xl font-bold text-blue-600">{filteredUrunler.length}</div>
        </div>
        <div className="bg-green-100 p-4 rounded-lg">
          <div className="text-sm text-gray-600">A Kalite</div>
          <div className="text-2xl font-bold text-green-600">
            {filteredUrunler.filter(u => u.tip === 'A').length}
          </div>
        </div>
        <div className="bg-orange-100 p-4 rounded-lg">
          <div className="text-sm text-gray-600">B Kalite</div>
          <div className="text-2xl font-bold text-orange-600">
            {filteredUrunler.filter(u => u.tip === 'B').length}
          </div>
        </div>
        <div className="bg-purple-100 p-4 rounded-lg">
          <div className="text-sm text-gray-600">Toplam Adet</div>
          <div className="text-2xl font-bold text-purple-600">
            {filteredUrunler.reduce((sum, u) => sum + u.temizlemeye_gidecek + u.temizlemede_olan +
              u.temizlemeden_gelen + u.sevke_hazir + u.kalan, 0)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Anasayfa;
