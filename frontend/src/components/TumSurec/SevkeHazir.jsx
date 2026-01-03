import React, { useState, useEffect } from 'react';
import { tumSurecAPI } from '../../services/api';

const SevkeHazir = () => {
  const [urunler, setUrunler] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUrun, setSelectedUrun] = useState(null);
  const [transferAdet, setTransferAdet] = useState('');
  const [editAdet, setEditAdet] = useState('');
  const [yapan, setYapan] = useState('');
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
      const data = await tumSurecAPI.getSevkeHazir();
      setUrunler(data);
    } catch (error) {
      console.error('Veri yükleme hatası:', error);
      alert('Veri yüklenirken hata oluştu!');
    } finally {
      setLoading(false);
    }
  };

  const handleSevkEtClick = (urun) => {
    setSelectedUrun(urun);
    setTransferAdet('');
    setYapan('');
    setShowModal(true);
  };

  const handleSevkEt = async () => {
    if (!transferAdet || !yapan) {
      alert('Lütfen tüm alanları doldurun!');
      return;
    }

    const adet = parseInt(transferAdet);
    if (isNaN(adet) || adet <= 0) {
      alert('Geçerli bir adet girin!');
      return;
    }

    if (adet > selectedUrun.adet) {
      alert(`Maksimum ${selectedUrun.adet} adet sevk edilebilir!`);
      return;
    }

    try {
      await tumSurecAPI.sevkEt({
        urun_kodu_base: selectedUrun.urun_kodu_base,
        adet: adet,
        yapan: yapan.trim()
      });
      alert('Ürün sevk edildi!');
      setShowModal(false);
      fetchData();
    } catch (error) {
      console.error('Sevk hatası:', error);
      alert('Sevk sırasında hata oluştu!');
    }
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
      await tumSurecAPI.addSevkeHazir(formData);
      alert('Ürün eklendi!');
      setShowAddModal(false);
      fetchData();
    } catch (error) {
      console.error('Ekleme hatası:', error);
      alert('Ekleme işlemi sırasında hata oluştu!');
    }
  };

  const handleEditClick = (urun) => {
    setSelectedUrun(urun);
    setEditAdet(urun.toplam_adet.toString());
    setYapan('');
    setShowEditModal(true);
  };

  const handleEdit = async () => {
    if (!editAdet || !yapan) {
      alert('Lütfen tüm alanları doldurun!');
      return;
    }
    const adet = parseInt(editAdet);
    if (isNaN(adet) || adet < 0) {
      alert('Geçerli bir adet girin!');
      return;
    }
    try {
      await tumSurecAPI.updateSevkeHazir(selectedUrun.urun_id, {
        adet: adet,
        yapan: yapan.trim()
      });
      alert('Adet güncellendi!');
      setShowEditModal(false);
      fetchData();
    } catch (error) {
      console.error('Güncelleme hatası:', error);
      alert('Güncelleme sırasında hata oluştu!');
    }
  };

  const handleDelete = async (urun_id) => {
    if (!window.confirm('Bu ürünü silmek istediğinizden emin misiniz?')) {
      return;
    }
    try {
      await tumSurecAPI.deleteSevkeHazir(urun_id);
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
          <h2 className="text-2xl font-bold text-gray-800">Sevke Hazır Ürünler</h2>
          <p className="text-gray-600 mt-1">A ve B kalite ürünler birleştirilmiş halde</p>
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
          <thead className="bg-gradient-to-r from-green-600 to-green-700 text-white">
            <tr>
              <th className="px-4 py-4 text-left text-lg font-semibold border-b">Ürün Kodu</th>
              <th className="px-4 py-4 text-center text-lg font-semibold border-b">Toplam Adet</th>
              <th className="px-4 py-4 text-center text-lg font-semibold border-b">A Kalite</th>
              <th className="px-4 py-4 text-center text-lg font-semibold border-b">B Kalite</th>
              <th className="px-4 py-4 text-center text-lg font-semibold border-b">Son Güncelleme</th>
              <th className="px-4 py-4 text-center text-lg font-semibold border-b">İşlem</th>
            </tr>
          </thead>
          <tbody>
            {urunler.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-4 py-8 text-center text-gray-500 text-lg">
                  Sevke hazır ürün yok
                </td>
              </tr>
            ) : (
              urunler.map((urun) => (
                <tr key={urun.urun_kodu_base} className="border-b hover:bg-green-50 transition-colors">
                  <td className="px-4 py-4 font-medium text-gray-900 text-lg border-r">
                    {urun.urun_kodu_base}
                  </td>
                  <td className="px-4 py-4 text-center text-xl font-bold text-green-600 border-r">
                    {urun.adet}
                  </td>
                  <td className="px-4 py-4 text-center text-lg border-r">
                    <span className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full font-semibold">
                      {urun.a_adet || 0}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-center text-lg border-r">
                    <span className="inline-block px-3 py-1 bg-orange-100 text-orange-800 rounded-full font-semibold">
                      {urun.b_adet || 0}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-center text-sm text-gray-600 border-r">
                    {new Date(urun.updated_at).toLocaleString('tr-TR')}
                  </td>
                  <td className="px-4 py-4 text-center">
                    <div className="flex gap-2 justify-center">
                      <button
                        onClick={() => handleEditClick(urun)}
                        className="px-4 py-2 bg-yellow-500 text-white text-sm font-medium rounded-lg hover:bg-yellow-600 transition-colors"
                      >
                        Düzenle
                      </button>
                      <button
                        onClick={() => handleDelete(urun.urun_id)}
                        className="px-4 py-2 bg-red-500 text-white text-sm font-medium rounded-lg hover:bg-red-600 transition-colors"
                      >
                        Sil
                      </button>
                      <button
                        onClick={() => handleSevkEtClick(urun)}
                        disabled={urun.adet <= 0}
                        className={`px-6 py-2 text-sm font-medium rounded-lg transition-colors ${
                          urun.adet > 0
                            ? 'bg-blue-500 text-white hover:bg-blue-600'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        Sevk Et
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Info Box */}
      <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <span className="text-2xl">ℹ️</span>
          <div>
            <h3 className="font-bold text-lg text-gray-800 mb-1">Bilgi</h3>
            <p className="text-gray-700">
              Bu tabloda A ve B kalite ürünler birleştirilmiş halde gösterilir.
              Sevk işlemi yapıldığında her iki kalite de sevk edilmiş olarak işaretlenir.
            </p>
          </div>
        </div>
      </div>

      {/* Sevk Modal */}
      {showModal && selectedUrun && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <h3 className="text-2xl font-bold mb-6 text-gray-800">Sevk Et</h3>

            <div className="mb-4">
              <div className="text-lg text-gray-700 mb-2">
                <strong>Ürün:</strong> {selectedUrun.urun_kodu_base}
              </div>
              <div className="text-lg text-gray-700 mb-2">
                <strong>Toplam Adet:</strong> <span className="text-green-600 font-bold">{selectedUrun.adet}</span>
              </div>
              <div className="flex gap-4 mb-4">
                <div className="text-gray-700">
                  <span className="font-medium">A Kalite:</span> <span className="text-green-600 font-semibold">{selectedUrun.a_adet || 0}</span>
                </div>
                <div className="text-gray-700">
                  <span className="font-medium">B Kalite:</span> <span className="text-orange-600 font-semibold">{selectedUrun.b_adet || 0}</span>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-lg font-medium text-gray-700 mb-2">
                Sevk Edilecek Adet
              </label>
              <input
                type="number"
                min="1"
                max={selectedUrun.adet}
                value={transferAdet}
                onChange={(e) => setTransferAdet(e.target.value)}
                className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                placeholder="Adet girin"
              />
            </div>

            <div className="mb-6">
              <label className="block text-lg font-medium text-gray-700 mb-2">
                İşlemi Yapan
              </label>
              <input
                type="text"
                value={yapan}
                onChange={(e) => setYapan(e.target.value)}
                className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                placeholder="Adınızı girin"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-6 py-3 bg-gray-300 text-gray-700 text-lg font-medium rounded-lg hover:bg-gray-400 transition-colors"
              >
                İptal
              </button>
              <button
                onClick={handleSevkEt}
                className="flex-1 px-6 py-3 bg-blue-500 text-white text-lg font-medium rounded-lg hover:bg-blue-600 transition-colors"
              >
                Sevk Et
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedUrun && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <h3 className="text-2xl font-bold mb-6 text-gray-800">Adet Düzenle</h3>
            <div className="mb-4">
              <div className="text-lg text-gray-700 mb-2">
                <strong>Ürün:</strong> {selectedUrun.urun_kodu_base}
              </div>
              <div className="text-lg text-gray-700 mb-4">
                <strong>Mevcut Adet:</strong> <span className="text-green-600 font-bold">{selectedUrun.toplam_adet}</span>
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-lg font-medium text-gray-700 mb-2">Yeni Adet</label>
              <input
                type="number"
                min="0"
                value={editAdet}
                onChange={(e) => setEditAdet(e.target.value)}
                className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                placeholder="Yeni adet girin"
              />
            </div>
            <div className="mb-6">
              <label className="block text-lg font-medium text-gray-700 mb-2">İşlemi Yapan</label>
              <input
                type="text"
                value={yapan}
                onChange={(e) => setYapan(e.target.value)}
                className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                placeholder="Adınızı girin"
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
                onClick={handleEdit}
                className="flex-1 px-6 py-3 bg-green-500 text-white text-lg font-medium rounded-lg hover:bg-green-600 transition-colors"
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
    </div>
  );
};

export default SevkeHazir;
