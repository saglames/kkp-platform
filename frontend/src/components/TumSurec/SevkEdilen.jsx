import React, { useState, useEffect } from 'react';
import { tumSurecAPI } from '../../services/api';

const SevkEdilen = () => {
  const [sevkiyatlar, setSevkiyatlar] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    tip: 'Joint',
    urun_kodu_base: '',
    tarih: new Date().toISOString().split('T')[0],
    adet: '',
    gonderildigi_yer: '',
    irsaliye_numarasi: '',
    notlar: '',
    created_by: 'esat'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await tumSurecAPI.getSevkEdilen();
      setSevkiyatlar(data);
    } catch (error) {
      console.error('Veri yükleme hatası:', error);
      alert('Veri yüklenirken hata oluştu!');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setFormData({
      tip: 'Joint',
      urun_kodu_base: '',
      tarih: new Date().toISOString().split('T')[0],
      adet: '',
      gonderildigi_yer: 'Fabrika Kamyonet',
      irsaliye_numarasi: '',
      notlar: '',
      created_by: 'esat'
    });
    setShowAddModal(true);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      tip: item.tip || 'Joint',
      urun_kodu_base: item.urun_kodu_base,
      tarih: item.tarih,
      adet: item.adet,
      gonderildigi_yer: item.gonderildigi_yer || '',
      irsaliye_numarasi: item.irsaliye_numarasi || '',
      notlar: item.notlar || '',
      created_by: item.created_by || 'esat'
    });
    setShowEditModal(true);
  };

  const handleSubmitAdd = async (e) => {
    e.preventDefault();

    if (!formData.urun_kodu_base || !formData.adet) {
      alert('Ürün kodu ve adet zorunludur!');
      return;
    }

    try {
      await tumSurecAPI.addSevkEdilen(formData);
      alert('Sevkiyat kaydı eklendi!');
      setShowAddModal(false);
      fetchData();
    } catch (error) {
      console.error('Ekleme hatası:', error);
      alert('Ekleme işlemi sırasında hata oluştu!');
    }
  };

  const handleSubmitEdit = async (e) => {
    e.preventDefault();

    try {
      await tumSurecAPI.updateSevkEdilen(editingItem.id, formData);
      alert('Sevkiyat kaydı güncellendi!');
      setShowEditModal(false);
      fetchData();
    } catch (error) {
      console.error('Güncelleme hatası:', error);
      alert('Güncelleme işlemi sırasında hata oluştu!');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bu sevkiyat kaydını silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      await tumSurecAPI.deleteSevkEdilen(id);
      alert('Sevkiyat kaydı silindi!');
      fetchData();
    } catch (error) {
      console.error('Silme hatası:', error);
      alert('Silme işlemi sırasında hata oluştu!');
    }
  };

  // Arama filtresi
  const filteredUrunler = sevkiyatlar.filter(urun =>
    urun.urun_kodu_base.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <h2 className="text-2xl font-bold text-gray-800">Sevk Edilen Ürünler</h2>
          <p className="text-gray-600 mt-1">Tamamlanan sevkiyat kayıtları</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleAdd}
            className="px-6 py-3 bg-green-600 text-white text-lg font-medium rounded-lg hover:bg-green-700 transition-colors"
          >
            + Yeni Ekle
          </button>
          <button
            onClick={fetchData}
            className="px-6 py-3 bg-blue-500 text-white text-lg font-medium rounded-lg hover:bg-blue-600 transition-colors"
          >
            Yenile
          </button>
        </div>
      </div>

      {/* Arama Çubuğu */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Ürün kodu ara... (örn: MXJ)"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-300">
          <thead className="bg-gradient-to-r from-green-600 to-green-700 text-white">
            <tr>
              <th className="px-4 py-4 text-left text-sm font-semibold border-b">Tip</th>
              <th className="px-4 py-4 text-left text-sm font-semibold border-b">Ürün Kodu</th>
              <th className="px-4 py-4 text-center text-sm font-semibold border-b">Tarih</th>
              <th className="px-4 py-4 text-center text-sm font-semibold border-b">Adet</th>
              <th className="px-4 py-4 text-left text-sm font-semibold border-b">Gönderildiği Yer</th>
              <th className="px-4 py-4 text-left text-sm font-semibold border-b">İrsaliye Numarası</th>
              <th className="px-4 py-4 text-center text-sm font-semibold border-b">İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {sevkiyatlar.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-4 py-8 text-center text-gray-500 text-lg">
                  Sevk edilen ürün yok
                </td>
              </tr>
            ) : (
              filteredUrunler.map((sevk) => (
                <tr key={sevk.id} className="border-b hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-sm border-r">{sevk.tip || 'Joint'}</td>
                  <td className="px-4 py-3 font-medium text-gray-900 text-sm border-r">
                    {sevk.urun_kodu_base}
                  </td>
                  <td className="px-4 py-3 text-center text-sm border-r">
                    {sevk.tarih ? new Date(sevk.tarih).toLocaleDateString('tr-TR') : '-'}
                  </td>
                  <td className="px-4 py-3 text-center text-sm font-bold text-green-600 border-r">
                    {sevk.adet}
                  </td>
                  <td className="px-4 py-3 text-sm border-r bg-green-50">
                    {sevk.gonderildigi_yer || '-'}
                  </td>
                  <td className="px-4 py-3 text-sm border-r">
                    {sevk.irsaliye_numarasi || '-'}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => handleEdit(sevk)}
                      className="px-3 py-1 bg-blue-500 text-white text-sm rounded mr-2 hover:bg-blue-600"
                    >
                      Düzenle
                    </button>
                    <button
                      onClick={() => handleDelete(sevk.id)}
                      className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
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

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
            <h3 className="text-xl font-bold mb-4">Yeni Sevkiyat Ekle</h3>
            <form onSubmit={handleSubmitAdd}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Tip</label>
                  <select
                    value={formData.tip}
                    onChange={(e) => setFormData({...formData, tip: e.target.value})}
                    className="w-full px-3 py-2 border rounded"
                  >
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="Joint">Joint</option>
                    <option value="Fittings">Fittings</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Ürün Kodu *</label>
                  <input
                    type="text"
                    required
                    value={formData.urun_kodu_base}
                    onChange={(e) => setFormData({...formData, urun_kodu_base: e.target.value})}
                    className="w-full px-3 py-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Tarih</label>
                  <input
                    type="date"
                    value={formData.tarih}
                    onChange={(e) => setFormData({...formData, tarih: e.target.value})}
                    className="w-full px-3 py-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Adet *</label>
                  <input
                    type="number"
                    required
                    value={formData.adet}
                    onChange={(e) => setFormData({...formData, adet: e.target.value})}
                    className="w-full px-3 py-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Gönderildiği Yer</label>
                  <input
                    type="text"
                    value={formData.gonderildigi_yer}
                    onChange={(e) => setFormData({...formData, gonderildigi_yer: e.target.value})}
                    className="w-full px-3 py-2 border rounded"
                    placeholder="Fabrika Kamyonet"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">İrsaliye Numarası</label>
                  <input
                    type="text"
                    value={formData.irsaliye_numarasi}
                    onChange={(e) => setFormData({...formData, irsaliye_numarasi: e.target.value})}
                    className="w-full px-3 py-2 border rounded"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">Notlar</label>
                  <textarea
                    value={formData.notlar}
                    onChange={(e) => setFormData({...formData, notlar: e.target.value})}
                    className="w-full px-3 py-2 border rounded"
                    rows="2"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border rounded hover:bg-gray-100"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Ekle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
            <h3 className="text-xl font-bold mb-4">Sevkiyat Düzenle</h3>
            <form onSubmit={handleSubmitEdit}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Tip</label>
                  <select
                    value={formData.tip}
                    onChange={(e) => setFormData({...formData, tip: e.target.value})}
                    className="w-full px-3 py-2 border rounded"
                  >
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="Joint">Joint</option>
                    <option value="Fittings">Fittings</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Ürün Kodu *</label>
                  <input
                    type="text"
                    required
                    value={formData.urun_kodu_base}
                    onChange={(e) => setFormData({...formData, urun_kodu_base: e.target.value})}
                    className="w-full px-3 py-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Tarih</label>
                  <input
                    type="date"
                    value={formData.tarih}
                    onChange={(e) => setFormData({...formData, tarih: e.target.value})}
                    className="w-full px-3 py-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Adet *</label>
                  <input
                    type="number"
                    required
                    value={formData.adet}
                    onChange={(e) => setFormData({...formData, adet: e.target.value})}
                    className="w-full px-3 py-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Gönderildiği Yer</label>
                  <input
                    type="text"
                    value={formData.gonderildigi_yer}
                    onChange={(e) => setFormData({...formData, gonderildigi_yer: e.target.value})}
                    className="w-full px-3 py-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">İrsaliye Numarası</label>
                  <input
                    type="text"
                    value={formData.irsaliye_numarasi}
                    onChange={(e) => setFormData({...formData, irsaliye_numarasi: e.target.value})}
                    className="w-full px-3 py-2 border rounded"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">Notlar</label>
                  <textarea
                    value={formData.notlar}
                    onChange={(e) => setFormData({...formData, notlar: e.target.value})}
                    className="w-full px-3 py-2 border rounded"
                    rows="2"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 border rounded hover:bg-gray-100"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Güncelle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Summary Stats */}
      {sevkiyatlar.length > 0 && (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-green-100 p-4 rounded-lg">
            <div className="text-sm text-gray-600">Toplam Sevkiyat</div>
            <div className="text-2xl font-bold text-green-600">{sevkiyatlar.length}</div>
          </div>
          <div className="bg-blue-100 p-4 rounded-lg">
            <div className="text-sm text-gray-600">Toplam Adet</div>
            <div className="text-2xl font-bold text-blue-600">
              {sevkiyatlar.reduce((sum, s) => sum + s.adet, 0)}
            </div>
          </div>
          <div className="bg-purple-100 p-4 rounded-lg">
            <div className="text-sm text-gray-600">Farklı Ürün</div>
            <div className="text-2xl font-bold text-purple-600">
              {new Set(sevkiyatlar.map(s => s.urun_kodu_base)).size}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SevkEdilen;
