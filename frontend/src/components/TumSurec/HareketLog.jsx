import React, { useState, useEffect } from 'react';
import { tumSurecAPI } from '../../services/api';
import * as XLSX from 'xlsx';

const HareketLog = () => {
  const [hareketler, setHareketler] = useState([]);
  const [loading, setLoading] = useState(false);
  const [limit, setLimit] = useState(50);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [limit]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await tumSurecAPI.getHareketLog(limit);
      setHareketler(data);
    } catch (error) {
      console.error('Veri yükleme hatası:', error);
      alert('Veri yüklenirken hata oluştu!');
    } finally {
      setLoading(false);
    }
  };

  const getIslemIcon = (islem) => {
    switch (islem) {
      case 'temizlemeye_gonderildi':
        return '➡️';
      case 'temizlemeden_geldi':
        return '⬅️';
      case 'sevke_hazirlandi':
        return '📦';
      case 'sevk_edildi':
        return '🚚';
      default:
        return '📝';
    }
  };

  const getIslemText = (islem) => {
    switch (islem) {
      case 'temizlemeye_gonderildi':
        return 'Temizlemeye Gönderildi';
      case 'temizlemeden_geldi':
        return 'Temizlemeden Geldi';
      case 'sevke_hazirlandi':
        return 'Sevke Hazırlandı';
      case 'sevk_edildi':
        return 'Sevk Edildi';
      default:
        return islem;
    }
  };

  const getIslemColor = (islem) => {
    switch (islem) {
      case 'temizlemeye_gonderildi':
        return 'bg-blue-100 text-blue-800';
      case 'temizlemeden_geldi':
        return 'bg-purple-100 text-purple-800';
      case 'sevke_hazirlandi':
        return 'bg-green-100 text-green-800';
      case 'sevk_edildi':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleExportExcel = () => {
    try {
      // Excel için veri hazırla
      const excelData = hareketler.map(hareket => ({
        'Tarih': new Date(hareket.created_at).toLocaleString('tr-TR'),
        'Tip': hareket.tip || '-',
        'Ürün Kodu': hareket.urun_kodu,
        'İşlem': getIslemText(hareket.islem),
        'Adet': hareket.adet || '-',
        'Kg': hareket.kg || '-',
        'Yapan': hareket.yapan || '-',
        'Açıklama': hareket.aciklama || '-'
      }));

      // Workbook oluştur
      const ws = XLSX.utils.json_to_sheet(excelData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Hareket Logları');

      // Kolon genişliklerini ayarla
      const colWidths = [
        { wch: 20 }, // Tarih
        { wch: 10 }, // Tip
        { wch: 20 }, // Ürün Kodu
        { wch: 25 }, // İşlem
        { wch: 10 }, // Adet
        { wch: 10 }, // Kg
        { wch: 15 }, // Yapan
        { wch: 30 }  // Açıklama
      ];
      ws['!cols'] = colWidths;

      // Dosya adı oluştur
      const fileName = `Hareket_Loglari_${new Date().toISOString().split('T')[0]}.xlsx`;

      // İndir
      XLSX.writeFile(wb, fileName);
    } catch (error) {
      console.error('Excel export hatası:', error);
      alert('Excel dosyası oluşturulurken hata oluştu!');
    }
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
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Hareket Logları</h2>
          <p className="text-gray-600 mt-1">Tüm ürün hareketlerinin geçmişi</p>
        </div>
        <div className="flex gap-3">
          <select
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
            className="px-4 py-2 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value={50}>Son 50</option>
            <option value={100}>Son 100</option>
            <option value={200}>Son 200</option>
            <option value={500}>Son 500</option>
          </select>
          {hareketler.length > 0 && (
            <button
              onClick={handleExportExcel}
              className="px-6 py-3 bg-green-600 text-white text-lg font-medium rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <span>📥</span>
              Excel İndir
            </button>
          )}
          <button
            onClick={fetchData}
            className="px-6 py-3 bg-blue-500 text-white text-lg font-medium rounded-lg hover:bg-blue-600 transition-colors"
          >
            Yenile
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-300">
          <thead className="bg-gradient-to-r from-gray-700 to-gray-800 text-white">
            <tr>
              <th className="px-4 py-4 text-left text-lg font-semibold border-b">Tarih/Saat</th>
              <th className="px-4 py-4 text-left text-lg font-semibold border-b">Ürün Kodu</th>
              <th className="px-4 py-4 text-center text-lg font-semibold border-b">İşlem</th>
              <th className="px-4 py-4 text-center text-lg font-semibold border-b">Adet</th>
              <th className="px-4 py-4 text-center text-lg font-semibold border-b">İşlem Yapan</th>
            </tr>
          </thead>
          <tbody>
            {hareketler.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-4 py-8 text-center text-gray-500 text-lg">
                  Hareket kaydı yok
                </td>
              </tr>
            ) : (
              hareketler.map((hareket) => (
                <tr key={hareket.id} className="border-b hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-4 text-sm text-gray-600 border-r">
                    {new Date(hareket.islem_tarihi).toLocaleString('tr-TR', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit'
                    })}
                  </td>
                  <td className="px-4 py-4 font-medium text-gray-900 text-lg border-r">
                    {hareket.urun_kodu}
                  </td>
                  <td className="px-4 py-4 text-center border-r">
                    <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getIslemColor(hareket.islem)}`}>
                      <span>{getIslemIcon(hareket.islem)}</span>
                      <span>{getIslemText(hareket.islem)}</span>
                    </span>
                  </td>
                  <td className="px-4 py-4 text-center text-lg font-bold border-r">
                    {hareket.adet}
                  </td>
                  <td className="px-4 py-4 text-center text-lg">
                    {hareket.yapan}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Summary Stats */}
      {hareketler.length > 0 && (
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-100 p-4 rounded-lg">
            <div className="text-sm text-gray-600">Temizlemeye Gönderilen</div>
            <div className="text-2xl font-bold text-blue-600">
              {hareketler.filter(h => h.islem === 'temizlemeye_gonderildi').length}
            </div>
          </div>
          <div className="bg-purple-100 p-4 rounded-lg">
            <div className="text-sm text-gray-600">Temizlemeden Gelen</div>
            <div className="text-2xl font-bold text-purple-600">
              {hareketler.filter(h => h.islem === 'temizlemeden_geldi').length}
            </div>
          </div>
          <div className="bg-green-100 p-4 rounded-lg">
            <div className="text-sm text-gray-600">Sevke Hazırlanan</div>
            <div className="text-2xl font-bold text-green-600">
              {hareketler.filter(h => h.islem === 'sevke_hazirlandi').length}
            </div>
          </div>
          <div className="bg-gray-100 p-4 rounded-lg">
            <div className="text-sm text-gray-600">Sevk Edilen</div>
            <div className="text-2xl font-bold text-gray-600">
              {hareketler.filter(h => h.islem === 'sevk_edildi').length}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HareketLog;
