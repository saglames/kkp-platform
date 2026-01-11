import React, { useState, useEffect } from 'react';
import { yariMamulFittingslerAPI } from '../../services/api';
import * as XLSX from 'xlsx';

const Fittingsler = () => {
  const [fittingsler, setFittingsler] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showLogs, setShowLogs] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [addMode, setAddMode] = useState(false);
  const [newItem, setNewItem] = useState({
    urun: '',
    adet: 0,
    kg: 0
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await yariMamulFittingslerAPI.getAll();
      setFittingsler(data);
    } catch (error) {
      console.error('Veri yükleme hatası:', error);
      alert('Veriler yüklenemedi!');
    } finally {
      setLoading(false);
    }
  };

  const fetchLogs = async () => {
    try {
      const data = await yariMamulFittingslerAPI.getLogs();
      setLogs(data);
      setShowLogs(true);
    } catch (error) {
      console.error('Log yükleme hatası:', error);
      alert('Loglar yüklenemedi!');
    }
  };

  const handleEdit = (fittings) => {
    setEditingId(fittings.id);
    setEditData({
      urun: fittings.urun,
      adet: fittings.adet,
      kg: fittings.kg
    });
  };

  const handleSave = async (id) => {
    const yapan = localStorage.getItem('hatali_urunler_user_name') || 'Admin';
    try {
      await yariMamulFittingslerAPI.update(id, { ...editData, yapan });
      alert('Güncelleme başarılı!');
      setEditingId(null);
      fetchData();
    } catch (error) {
      console.error('Güncelleme hatası:', error);
      alert('Güncelleme başarısız: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleDelete = async (id, urun) => {
    if (!window.confirm(`${urun} ürününü silmek istediğinize emin misiniz?`)) return;

    const yapan = localStorage.getItem('hatali_urunler_user_name') || 'Admin';
    try {
      await yariMamulFittingslerAPI.delete(id, yapan);
      alert('Silme başarılı!');
      fetchData();
    } catch (error) {
      console.error('Silme hatası:', error);
      alert('Silme başarısız: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleAdd = async () => {
    const yapan = localStorage.getItem('hatali_urunler_user_name') || 'Admin';
    if (!newItem.urun.trim()) {
      alert('Ürün adı zorunludur!');
      return;
    }

    try {
      await yariMamulFittingslerAPI.add({ ...newItem, yapan });
      alert('Ekleme başarılı!');
      setAddMode(false);
      setNewItem({ urun: '', adet: 0, kg: 0 });
      fetchData();
    } catch (error) {
      console.error('Ekleme hatası:', error);
      alert('Ekleme başarısız: ' + (error.response?.data?.error || error.message));
    }
  };

  const exportLogsToExcel = () => {
    if (logs.length === 0) {
      alert('Export edilecek log yok!');
      return;
    }

    const exportData = logs.map(log => ({
      'İşlem Tipi': log.islem_tipi,
      'Yapan': log.yapan,
      'Tarih': new Date(log.tarih).toLocaleString('tr-TR'),
      'Açıklama': log.aciklama,
      'Eski Veri': JSON.stringify(log.eski_veri),
      'Yeni Veri': JSON.stringify(log.yeni_veri)
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Fittingsler Logları');
    XLSX.writeFile(wb, `fittingsler_log_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const filteredFittingsler = fittingsler.filter(f =>
    f.urun.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTotalKg = () => filteredFittingsler.reduce((sum, f) => sum + parseFloat(f.kg || 0), 0);
  const getTotalAdet = () => filteredFittingsler.reduce((sum, f) => sum + parseInt(f.adet || 0), 0);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Header ve Filtreler */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Fittingsler</h2>

        <div className="flex gap-4 mb-4">
          <input
            type="text"
            placeholder="Ürün ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            onClick={fetchData}
            className="px-6 py-3 bg-blue-500 text-white text-lg font-medium rounded-lg hover:bg-blue-600 transition-colors"
          >
            Yenile
          </button>
          <button
            onClick={() => setAddMode(!addMode)}
            className="px-6 py-3 bg-green-500 text-white text-lg font-medium rounded-lg hover:bg-green-600 transition-colors"
          >
            {addMode ? 'İptal' : '+ Yeni Ekle'}
          </button>
          <button
            onClick={fetchLogs}
            className="px-6 py-3 bg-purple-500 text-white text-lg font-medium rounded-lg hover:bg-purple-600 transition-colors"
          >
            Logları Göster
          </button>
        </div>
      </div>

      {/* Yeni Ekleme Formu */}
      {addMode && (
        <div className="bg-green-50 border border-green-300 rounded-lg p-4 mb-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Yeni Fittings Ekle</h3>
          <div className="grid grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="Ürün"
              value={newItem.urun}
              onChange={(e) => setNewItem({ ...newItem, urun: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg"
            />
            <input
              type="number"
              placeholder="Adet"
              value={newItem.adet}
              onChange={(e) => setNewItem({ ...newItem, adet: parseInt(e.target.value) || 0 })}
              className="px-3 py-2 border border-gray-300 rounded-lg"
            />
            <input
              type="number"
              step="0.001"
              placeholder="KG"
              value={newItem.kg}
              onChange={(e) => setNewItem({ ...newItem, kg: parseFloat(e.target.value) || 0 })}
              className="px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div className="flex gap-2 mt-4">
            <button
              onClick={handleAdd}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Ekle
            </button>
            <button
              onClick={() => {
                setAddMode(false);
                setNewItem({ urun: '', adet: 0, kg: 0 });
              }}
              className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              İptal
            </button>
          </div>
        </div>
      )}

      {/* Tablo */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-300">
          <thead className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
            <tr>
              <th className="px-4 py-4 text-left text-lg font-semibold border-b border-gray-300">Ürün</th>
              <th className="px-4 py-4 text-center text-lg font-semibold border-b border-gray-300">Adet</th>
              <th className="px-4 py-4 text-center text-lg font-semibold border-b border-gray-300">KG</th>
              <th className="px-4 py-4 text-center text-lg font-semibold border-b border-gray-300">İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {filteredFittingsler.length === 0 ? (
              <tr>
                <td colSpan="4" className="px-4 py-8 text-center text-gray-500 text-lg">
                  Ürün bulunamadı
                </td>
              </tr>
            ) : (
              filteredFittingsler.map((fittings) => (
                <tr key={fittings.id} className="border-b hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-4 font-medium text-gray-900 text-lg border-r border-gray-200">
                    {editingId === fittings.id ? (
                      <input
                        type="text"
                        value={editData.urun}
                        onChange={(e) => setEditData({ ...editData, urun: e.target.value })}
                        className="w-full px-2 py-1 border border-gray-300 rounded"
                      />
                    ) : (
                      fittings.urun
                    )}
                  </td>
                  <td className="px-4 py-4 text-center text-lg border-r border-gray-200">
                    {editingId === fittings.id ? (
                      <input
                        type="number"
                        value={editData.adet}
                        onChange={(e) => setEditData({ ...editData, adet: parseInt(e.target.value) || 0 })}
                        className="w-24 px-2 py-1 border border-gray-300 rounded text-center"
                      />
                    ) : (
                      <span className={fittings.adet > 0 ? 'font-bold text-blue-600' : 'text-gray-400'}>
                        {fittings.adet}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-4 text-center text-lg border-r border-gray-200">
                    {editingId === fittings.id ? (
                      <input
                        type="number"
                        step="0.001"
                        value={editData.kg}
                        onChange={(e) => setEditData({ ...editData, kg: parseFloat(e.target.value) || 0 })}
                        className="w-24 px-2 py-1 border border-gray-300 rounded text-center"
                      />
                    ) : (
                      <span className="font-medium text-gray-900">
                        {parseFloat(fittings.kg).toFixed(3)}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-4 text-center">
                    {editingId === fittings.id ? (
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handleSave(fittings.id)}
                          className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg font-medium transition-colors"
                        >
                          Kaydet
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded-lg font-medium transition-colors"
                        >
                          İptal
                        </button>
                      </div>
                    ) : (
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handleEdit(fittings)}
                          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg font-medium transition-colors"
                        >
                          Düzenle
                        </button>
                        <button
                          onClick={() => handleDelete(fittings.id, fittings.urun)}
                          className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg font-medium transition-colors"
                        >
                          Sil
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
            {/* Toplam Satırı */}
            {filteredFittingsler.length > 0 && (
              <tr className="bg-blue-100 font-bold">
                <td className="px-4 py-4 text-lg">TOPLAM</td>
                <td className="px-4 py-4 text-center text-lg">{getTotalAdet()}</td>
                <td className="px-4 py-4 text-center text-lg">{getTotalKg().toFixed(3)}</td>
                <td></td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Log Modal */}
      {showLogs && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-2xl font-bold text-gray-800">Fittingsler İşlem Logları</h3>
                <button
                  onClick={() => setShowLogs(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
                >
                  ×
                </button>
              </div>

              <button
                onClick={exportLogsToExcel}
                className="mb-4 px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
              >
                Excel Olarak İndir
              </button>

              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-300">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Tarih</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">İşlem</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Yapan</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Açıklama</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log) => (
                      <tr key={log.id} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm">
                          {new Date(log.tarih).toLocaleString('tr-TR')}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                            log.islem_tipi === 'ekleme' ? 'bg-green-100 text-green-800' :
                            log.islem_tipi === 'guncelleme' ? 'bg-blue-100 text-blue-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {log.islem_tipi}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm">{log.yapan}</td>
                        <td className="px-4 py-3 text-sm">{log.aciklama}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Fittingsler;
