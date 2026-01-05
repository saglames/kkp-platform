import React, { useState, useEffect } from 'react';
import { tumSurecAPI } from '../../services/api';

const TemizlemedOlan = () => {
  const [urunler, setUrunler] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedUrun, setSelectedUrun] = useState(null);
  const [transferAdet, setTransferAdet] = useState('');
  const [transferKg, setTransferKg] = useState('');
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
      const data = await tumSurecAPI.getTemizlemedOlan();
      setUrunler(data);
    } catch (error) {
      console.error('Veri yükleme hatası:', error);
      alert('Veri yüklenirken hata oluştu!');
    } finally {
      setLoading(false);
    }
  };

  const handleTransferClick = (urun) => {
    setSelectedUrun(urun);
    setTransferAdet('');
    setTransferKg('');
    setYapan('');
    setShowTransferModal(true);
  };

  const handleEditClick = (urun) => {
    setSelectedUrun(urun);
    setEditAdet(urun.adet.toString());
    setYapan('');
    setShowEditModal(true);
  };

  const handleTransfer = async () => {
    if (!yapan) {
      alert('Lütfen işlemi yapan kişiyi girin!');
      return;
    }

    if (!transferAdet && !transferKg) {
      alert('Lütfen gelen adet veya kg girin!');
      return;
    }

    const adet = parseInt(transferAdet);
    const kg = parseFloat(transferKg);

    if (transferAdet && (isNaN(adet) || adet <= 0)) {
      alert('Geçerli bir adet girin!');
      return;
    }

    if (transferKg && (isNaN(kg) || kg <= 0)) {
      alert('Geçerli bir kg girin!');
      return;
    }

    if (adet > selectedUrun.adet) {
      alert(`Maksimum ${selectedUrun.adet} adet getirilebilir!`);
      return;
    }

    try {
      const response = await tumSurecAPI.temizlemedenGetir({
        urun_id: selectedUrun.urun_id,
        adet: adet || null,
        kg: kg || null,
        yapan: yapan.trim()
      });

      let message = 'Ürün temizlemeden getirildi!';
      if (response.calculated_kg) {
        message += ` (${response.calculated_kg.toFixed(2)} kg)`;
      }

      alert(message);
      setShowTransferModal(false);
      fetchData();
    } catch (error) {
      console.error('Transfer hatası:', error);
      alert(error.response?.data?.error || 'Transfer sırasında hata oluştu!');
    }
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
      await tumSurecAPI.updateTemizlemedOlan(selectedUrun.id, {
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
      await tumSurecAPI.addTemizlemedOlan(formData);
      alert('Ürün eklendi!');
      setShowAddModal(false);
      fetchData();
    } catch (error) {
      console.error('Ekleme hatası:', error);
      alert('Ekleme işlemi sırasında hata oluştu!');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bu ürünü silmek istediğinizden emin misiniz?')) {
      return;
    }
    try {
      await tumSurecAPI.deleteTemizlemedOlan(id);
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
          <h2 className="text-2xl font-bold text-gray-800">Temizlemede Olan Ürünler</h2>
          <p className="text-gray-600 mt-1">Şu anda temizlik sürecinde olan ürünler</p>
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
          <thead className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white">
            <tr>
              <th className="px-4 py-4 text-left text-lg font-semibold border-b">Tip</th>
              <th className="px-4 py-4 text-left text-lg font-semibold border-b">Ürün Kodu</th>
              <th className="px-4 py-4 text-center text-lg font-semibold border-b">Adet</th>
              <th className="px-4 py-4 text-center text-lg font-semibold border-b">Gönderilme</th>
              <th className="px-4 py-4 text-center text-lg font-semibold border-b">Gönderen</th>
              <th className="px-4 py-4 text-center text-lg font-semibold border-b">İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {urunler.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-4 py-8 text-center text-gray-500 text-lg">
                  Temizlemede olan ürün yok
                </td>
              </tr>
            ) : (
              urunler.map((urun) => (
                <tr key={urun.id} className="border-b hover:bg-yellow-50 transition-colors">
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
                  <td className="px-4 py-4 text-center text-lg font-bold text-yellow-600 border-r">
                    {urun.adet}
                  </td>
                  <td className="px-4 py-4 text-center text-sm text-gray-600 border-r">
                    {new Date(urun.updated_at).toLocaleString('tr-TR')}
                  </td>
                  <td className="px-4 py-4 text-center text-lg border-r">
                    {urun.updated_by || '-'}
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
                        onClick={() => handleDelete(urun.id)}
                        className="px-4 py-2 bg-red-500 text-white text-sm font-medium rounded-lg hover:bg-red-600 transition-colors"
                      >
                        Sil
                      </button>
                      <button
                        onClick={() => handleTransferClick(urun)}
                        disabled={urun.adet <= 0}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                          urun.adet > 0
                            ? 'bg-green-500 text-white hover:bg-green-600'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        Temizlemeden Getir
                      </button>
                    </div>
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
                <strong>Mevcut Adet:</strong> <span className="text-yellow-600 font-bold">{selectedUrun.adet}</span>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-lg font-medium text-gray-700 mb-2">
                Yeni Adet
              </label>
              <input
                type="number"
                min="0"
                value={editAdet}
                onChange={(e) => setEditAdet(e.target.value)}
                className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
                placeholder="Yeni adet girin"
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
                className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
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
                className="flex-1 px-6 py-3 bg-yellow-500 text-white text-lg font-medium rounded-lg hover:bg-yellow-600 transition-colors"
              >
                Kaydet
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Transfer Modal */}
      {showTransferModal && selectedUrun && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-bold mb-6 text-gray-800">Temizlemeden Getir</h3>

            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="text-lg text-gray-700 mb-2">
                <strong>Ürün:</strong> {selectedUrun.urun_kodu}
              </div>
              <div className="text-lg text-gray-700">
                <strong>Gönderilen Adet:</strong> <span className="text-yellow-600 font-bold">{selectedUrun.adet}</span>
              </div>
            </div>

            <div className="mb-6">
              <h4 className="font-semibold text-lg mb-3 text-gray-800">Gelen Ürünler</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gelen Adet *
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={selectedUrun.adet}
                    value={transferAdet}
                    onChange={(e) => setTransferAdet(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    placeholder="Adet"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gelen Kg (opsiyonel)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={transferKg}
                    onChange={(e) => setTransferKg(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    placeholder="Kg"
                  />
                </div>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                İşlemi Yapan *
              </label>
              <input
                type="text"
                value={yapan}
                onChange={(e) => setYapan(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                placeholder="Adınızı girin"
              />
            </div>

            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded text-sm text-gray-600">
              <strong>Not:</strong> Kg girilmezse otomatik hesaplanacak.
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowTransferModal(false)}
                className="flex-1 px-6 py-3 bg-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-400 transition-colors"
              >
                İptal
              </button>
              <button
                onClick={handleTransfer}
                className="flex-1 px-6 py-3 bg-green-500 text-white font-medium rounded-lg hover:bg-green-600 transition-colors"
              >
                Getir
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

      <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <span className="text-2xl">ℹ️</span>
          <div>
            <h3 className="font-bold text-lg text-gray-800 mb-1">Bilgi</h3>
            <p className="text-gray-700">
              Bu ürünler şu anda temizlik sürecinde. Temizlik tamamlandığında "Temizlemeden Getir" butonu ile bir sonraki aşamaya aktarılır.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemizlemedOlan;
