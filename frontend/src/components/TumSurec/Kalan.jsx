import React, { useState, useEffect } from 'react';
import { tumSurecAPI } from '../../services/api';

const Kalan = () => {
  const [urunler, setUrunler] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [notlar, setNotlar] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUrun, setSelectedUrun] = useState(null);
  const [editAdet, setEditAdet] = useState('');
  const [editTip, setEditTip] = useState('');
  const [formData, setFormData] = useState({
    tip: 'Joint',
    urun_kodu: '',
    adet: '',
    created_by: 'esat'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await tumSurecAPI.getKalan();
      setUrunler(data);
    } catch (error) {
      console.error('Veri yükleme hatası:', error);
      alert('Veri yüklenirken hata oluştu!');
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (urun) => {
    setEditingId(urun.urun_id);
    setNotlar(urun.notlar || '');
  };

  const handleSaveNotlar = async (urunId) => {
    try {
      await tumSurecAPI.updateKalanNotlar(urunId, { notlar: notlar.trim() });
      alert('Notlar güncellendi!');
      setEditingId(null);
      fetchData();
    } catch (error) {
      console.error('Güncelleme hatası:', error);
      alert('Notlar güncellenirken hata oluştu!');
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setNotlar('');
  };

  const handleAdd = () => {
    setFormData({
      tip: 'Joint',
      urun_kodu: '',
      adet: '',
      created_by: 'esat'
    });
    setShowAddModal(true);
  };

  const handleSubmitAdd = async (e) => {
    e.preventDefault();
    if (!formData.urun_kodu || !formData.adet) {
      alert('Ürün kodu ve adet zorunludur!');
      return;
    }
    try {
      await tumSurecAPI.addKalan(formData);
      alert('Ürün eklendi!');
      setShowAddModal(false);
      fetchData();
    } catch (error) {
      console.error('Ekleme hatası:', error);
      alert('Ekleme işlemi sırasında hata oluştu!');
    }
  };

  const handleEditAdetClick = (urun) => {
    setSelectedUrun(urun);
    setEditAdet(urun.adet.toString());
    setEditTip(urun.tip);
    setShowEditModal(true);
  };

  const handleUpdateAdet = async () => {
    if (!editAdet || !editTip) {
      alert('Lütfen tüm alanları giriniz!');
      return;
    }
    const adet = parseInt(editAdet);
    if (isNaN(adet) || adet < 0) {
      alert('Geçerli bir adet girin!');
      return;
    }
    try {
      await tumSurecAPI.updateKalan(selectedUrun.id, { adet, tip: editTip });
      alert('Ürün güncellendi!');
      setShowEditModal(false);
      fetchData();
    } catch (error) {
      console.error('Güncelleme hatası:', error);
      alert('Güncelleme sırasında hata oluştu!');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bu ürünü silmek istediğinizden emin misiniz?')) {
      return;
    }
    try {
      await tumSurecAPI.deleteKalan(id);
      alert('Ürün silindi!');
      fetchData();
    } catch (error) {
      console.error('Silme hatası:', error);
      alert('Silme işlemi sırasında hata oluştu!');
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
          <h2 className="text-2xl font-bold text-gray-800">Kalan Ürünler</h2>
          <p className="text-gray-600 mt-1">Süreçte kalan veya bekleyen ürünler</p>
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

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-300">
          <thead className="bg-gradient-to-r from-red-600 to-red-700 text-white">
            <tr>
              <th className="px-4 py-4 text-left text-lg font-semibold border-b">Tip</th>
              <th className="px-4 py-4 text-left text-lg font-semibold border-b">Ürün Kodu</th>
              <th className="px-4 py-4 text-center text-lg font-semibold border-b">Adet</th>
              <th className="px-4 py-4 text-left text-lg font-semibold border-b">Notlar</th>
              <th className="px-4 py-4 text-center text-lg font-semibold border-b">Güncelleme</th>
              <th className="px-4 py-4 text-center text-lg font-semibold border-b">İşlem</th>
            </tr>
          </thead>
          <tbody>
            {urunler.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-4 py-8 text-center text-gray-500 text-lg">
                  Kalan ürün yok
                </td>
              </tr>
            ) : (
              urunler.map((urun) => (
                <tr key={urun.id} className="border-b hover:bg-red-50 transition-colors">
                  <td className="px-4 py-4 text-center border-r">
                    <span className={`inline-block px-3 py-1 rounded-full text-lg font-bold ${
                      urun.tip === 'A' ? 'bg-green-500 text-white' : 'bg-orange-500 text-white'
                    }`}>
                      {urun.tip}
                    </span>
                  </td>
                  <td className="px-4 py-4 font-medium text-gray-900 text-lg border-r">
                    {urun.urun_kodu}
                  </td>
                  <td className="px-4 py-4 text-center text-lg font-bold text-red-600 border-r">
                    {urun.adet}
                  </td>
                  <td className="px-4 py-4 border-r">
                    {editingId === urun.urun_id ? (
                      <textarea
                        value={notlar}
                        onChange={(e) => setNotlar(e.target.value)}
                        className="w-full px-3 py-2 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                        rows="2"
                        placeholder="Not ekleyin..."
                      />
                    ) : (
                      <div className="text-gray-700 text-base">
                        {urun.notlar || <span className="text-gray-400 italic">Not yok</span>}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-4 text-center text-sm text-gray-600 border-r">
                    {new Date(urun.updated_at).toLocaleString('tr-TR')}
                  </td>
                  <td className="px-4 py-4 text-center">
                    {editingId === urun.urun_id ? (
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() => handleSaveNotlar(urun.urun_id)}
                          className="px-4 py-2 bg-green-500 text-white text-sm font-medium rounded-lg hover:bg-green-600 transition-colors"
                        >
                          Kaydet
                        </button>
                        <button
                          onClick={handleCancel}
                          className="px-4 py-2 bg-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-400 transition-colors"
                        >
                          İptal
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() => handleEditAdetClick(urun)}
                          className="px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors"
                        >
                          Düzenle
                        </button>
                        <button
                          onClick={() => handleDelete(urun.id)}
                          className="px-4 py-2 bg-red-500 text-white text-sm font-medium rounded-lg hover:bg-red-600 transition-colors"
                        >
                          Sil
                        </button>
                        <button
                          onClick={() => handleEditClick(urun)}
                          className="px-4 py-2 bg-yellow-500 text-white text-sm font-medium rounded-lg hover:bg-yellow-600 transition-colors"
                        >
                          Not Düzenle
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {showEditModal && selectedUrun && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <h3 className="text-2xl font-bold mb-6 text-gray-800">Adet Düzenle</h3>

            <div className="mb-4">
              <div className="text-lg text-gray-700 mb-2">
                <strong>Ürün:</strong> {selectedUrun.urun_kodu}
              </div>
              <div className="text-lg text-gray-700 mb-4">
                <strong>Mevcut Adet:</strong> <span className="text-red-600 font-bold">{selectedUrun.adet}</span>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-lg font-medium text-gray-700 mb-2">Tip</label>
              <select
                value={editTip}
                onChange={(e) => setEditTip(e.target.value)}
                className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
              >
                <option value="A">A</option>
                <option value="Joint">Joint</option>
              </select>
            </div>

            <div className="mb-6">
              <label className="block text-lg font-medium text-gray-700 mb-2">
                Yeni Adet
              </label>
              <input
                type="number"
                min="0"
                value={editAdet}
                onChange={(e) => setEditAdet(e.target.value)}
                className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                placeholder="Yeni adet girin"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowEditModal(false)}
                className="flex-1 px-6 py-3 bg-gray-300 text-gray-700 text-lg font-medium rounded-lg hover:bg-gray-400 transition-colors"
              >
                İptal
              </button>
              <button
                onClick={handleUpdateAdet}
                className="flex-1 px-6 py-3 bg-red-500 text-white text-lg font-medium rounded-lg hover:bg-red-600 transition-colors"
              >
                Kaydet
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
            <h3 className="text-xl font-bold mb-4">Yeni Ürün Ekle</h3>
            <form onSubmit={handleSubmitAdd}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Tip</label>
                  <input
                    type="text"
                    value={formData.tip}
                    onChange={(e) => setFormData({...formData, tip: e.target.value})}
                    className="w-full px-3 py-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Ürün Kodu *</label>
                  <input
                    type="text"
                    required
                    value={formData.urun_kodu}
                    onChange={(e) => setFormData({...formData, urun_kodu: e.target.value})}
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

      {/* Info Box */}
      <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <span className="text-2xl">⚠️</span>
          <div>
            <h3 className="font-bold text-lg text-gray-800 mb-1">Bilgi</h3>
            <p className="text-gray-700">
              Bu tabloda süreçte kalan veya bekleyen ürünler gösterilir.
              Ürünlere not ekleyerek durumlarını takip edebilirsiniz.
            </p>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      {urunler.length > 0 && (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-red-100 p-4 rounded-lg">
            <div className="text-sm text-gray-600">Toplam Kalan Ürün</div>
            <div className="text-2xl font-bold text-red-600">{urunler.length}</div>
          </div>
          <div className="bg-green-100 p-4 rounded-lg">
            <div className="text-sm text-gray-600">A Kalite</div>
            <div className="text-2xl font-bold text-green-600">
              {urunler.filter(u => u.tip === 'A').length}
            </div>
          </div>
          <div className="bg-orange-100 p-4 rounded-lg">
            <div className="text-sm text-gray-600">B Kalite</div>
            <div className="text-2xl font-bold text-orange-600">
              {urunler.filter(u => u.tip === 'B').length}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Kalan;
