import React, { useState, useEffect } from 'react';
import { partiTakipAPI, sevkiyatTakipAPI } from '../../services/api';
import { exportSingleParti, exportAllPartiler } from '../../utils/excelExport';
import EditSevkiyatModal from '../TumSurec/EditSevkiyatModal';
import DeleteConfirmModal from '../TumSurec/DeleteConfirmModal';
import LogModal from '../TumSurec/LogModal';

const TemizlemePartiTakip = () => {
  const [partiler, setPartiler] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedParti, setSelectedParti] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showLogModal, setShowLogModal] = useState(false);
  const [editingParti, setEditingParti] = useState(null);
  const [deletingParti, setDeletingParti] = useState(null);

  useEffect(() => {
    console.log('Component yüklendi');
    fetchPartiler();
  }, []);

  const fetchPartiler = async () => {
    console.log('fetchPartiler başladı');
    setLoading(true);
    setError(null);

    try {
      console.log('API çağrısı yapılıyor...');
      const data = await partiTakipAPI.getPartiler();
      console.log('API yanıtı:', data);
      setPartiler(data || []);
    } catch (err) {
      console.error('Hata oluştu:', err);
      setError(err.message || 'Bir hata oluştu');
    } finally {
      console.log('Loading false yapılıyor');
      setLoading(false);
    }
  };

  const handleShowDetail = async (parti) => {
    try {
      console.log('Parti detayı getiriliyor:', parti.parti_no);
      const detay = await partiTakipAPI.getPartiDetay(parti.parti_no);
      console.log('Parti detayı:', detay);
      setSelectedParti(detay);
      setShowDetailModal(true);
    } catch (err) {
      console.error('Parti detay hatası:', err);
      alert('Parti detayı yüklenirken hata oluştu: ' + err.message);
    }
  };

  const handleProblematicChange = async (urunId, field, value) => {
    try {
      // Update local state immediately for better UX
      setSelectedParti(prev => ({
        ...prev,
        urunler: prev.urunler.map(u =>
          u.id === urunId
            ? { ...u, [field]: value }
            : u
        )
      }));

      // Prepare data for API
      const urun = selectedParti.urunler.find(u => u.id === urunId);
      const data = {
        problemli_adet: field === 'problemli_adet' ? parseInt(value) || 0 : urun.problemli_adet || 0,
        problemli_kg: field === 'problemli_kg' ? parseFloat(value) || 0 : urun.problemli_kg || 0
      };

      // Save to backend
      await partiTakipAPI.saveProblematic(urunId, data);
      console.log('Problemli bilgi kaydedildi:', urunId, data);
    } catch (err) {
      console.error('Problemli bilgi kaydetme hatası:', err);
      alert('Kaydetme hatası: ' + err.message);
      // Reload to get correct data
      handleShowDetail({ parti_no: selectedParti.parti_no });
    }
  };

  const handleEditParti = async (parti) => {
    try {
      // Parti verilerini sevkiyat formatına çevir
      const sevkiyatData = await sevkiyatTakipAPI.getSevkiyatlar();
      const sevkiyat = sevkiyatData.find(s => s.sevkiyat_no === parti.parti_no);

      if (sevkiyat) {
        setEditingParti(sevkiyat);
        setShowEditModal(true);
      } else {
        alert('Parti bilgisi bulunamadı!');
      }
    } catch (err) {
      console.error('Parti düzenleme hatası:', err);
      alert('Parti bilgisi yüklenirken hata oluştu!');
    }
  };

  const handleSaveEdit = async (formData) => {
    try {
      await sevkiyatTakipAPI.updateSevkiyat(editingParti.id, formData);
      setShowEditModal(false);
      setEditingParti(null);
      fetchPartiler();
      alert('Parti başarıyla güncellendi!');
    } catch (err) {
      console.error('Parti güncelleme hatası:', err);
      alert('Parti güncellenirken hata oluştu!');
    }
  };

  const handleDeleteClick = async (parti) => {
    try {
      // Parti verilerini sevkiyat formatına çevir
      const sevkiyatData = await sevkiyatTakipAPI.getSevkiyatlar();
      const sevkiyat = sevkiyatData.find(s => s.sevkiyat_no === parti.parti_no);

      if (sevkiyat) {
        setDeletingParti(sevkiyat);
        setShowDeleteModal(true);
      } else {
        alert('Parti bilgisi bulunamadı!');
      }
    } catch (err) {
      console.error('Parti silme hatası:', err);
      alert('Parti bilgisi yüklenirken hata oluştu!');
    }
  };

  const handleConfirmDelete = async (neden) => {
    try {
      await sevkiyatTakipAPI.deleteSevkiyat(deletingParti.id, {
        neden,
        yapan: 'Kullanıcı'
      });
      setShowDeleteModal(false);
      setDeletingParti(null);
      fetchPartiler();
      alert('Parti başarıyla silindi!');
    } catch (err) {
      console.error('Parti silme hatası:', err);
      alert('Parti silinirken hata oluştu!');
    }
  };

  console.log('Render - loading:', loading, 'error:', error, 'partiler:', partiler.length);

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
        <p className="text-gray-600">Yükleniyor...</p>
        <p className="text-sm text-gray-500 mt-2">Parti verileri getiriliyor</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Temizleme Parti Takip</h2>
        </div>
        <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center mb-4">
            <span className="text-red-600 font-semibold mr-2">⚠️ Hata:</span>
            <span className="text-red-700">{error}</span>
          </div>
          <button
            onClick={fetchPartiler}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Tekrar Dene
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Temizleme Parti/İrsaliye Takip</h2>
          <p className="text-gray-600">Temizlemeye gönderilen partilerin detaylı takibi</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowLogModal(true)}
            className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center gap-2 font-medium shadow-md"
          >
            <span>📋</span>
            <span>İşlem Geçmişi</span>
          </button>
          {partiler.length > 0 && (
            <button
              onClick={() => exportAllPartiler(partiler, partiTakipAPI)}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 font-medium shadow-md"
            >
              <span>📥</span>
              <span>Excel İndir</span>
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        {partiler.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xl text-gray-500 mb-4">Henüz parti kaydı bulunmuyor.</p>
            <p className="text-gray-600">
              Parti oluşturmak için "Tüm Süreç → Temizlemeye Gidecek" bölümünden ürün gönderin.
            </p>
            <button
              onClick={fetchPartiler}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Yenile
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-blue-500 to-blue-600">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">Parti No</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">İrsaliye No</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">Tarih</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-white">Toplam Adet</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-white">Toplam Kg</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-white">Durum</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-white">İşlem</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {partiler.map((parti) => (
                  <tr key={parti.parti_no} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-lg font-bold text-blue-600">{parti.parti_no}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                      {parti.irsaliye_no || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                      {new Date(parti.gonderim_tarihi).toLocaleDateString('tr-TR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-gray-900 font-semibold">
                      {parti.toplam_adet}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-gray-900 font-semibold">
                      {parseFloat(parti.toplam_kg || 0).toFixed(2)} kg
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                        parti.durum === 'gonderildi' ? 'bg-blue-100 text-blue-800' :
                        parti.durum === 'geldi' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {parti.durum === 'gonderildi' ? 'Gönderildi' :
                         parti.durum === 'geldi' ? 'Geldi' : parti.durum}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handleShowDetail(parti)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                        >
                          Detay
                        </button>
                        <button
                          onClick={() => handleEditParti(parti)}
                          className="px-3 py-2 text-orange-600 hover:text-orange-800 text-lg font-medium"
                          title="Düzenle"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDeleteClick(parti)}
                          className="px-3 py-2 text-red-600 hover:text-red-800 text-lg font-medium"
                          title="Sil"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detay Modal */}
      {showDetailModal && selectedParti && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-4 flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-bold">Parti Detayı</h3>
                <p className="text-blue-100 text-sm">Parti No: {selectedParti.parti_no}</p>
              </div>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-white hover:text-gray-200 text-2xl font-bold"
              >
                ×
              </button>
            </div>

            <div className="p-6">
              {/* Parti Genel Bilgileri */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">İrsaliye No</p>
                  <p className="text-lg font-bold text-gray-900">{selectedParti.irsaliye_no || '-'}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Gönderim Tarihi</p>
                  <p className="text-lg font-bold text-gray-900">
                    {new Date(selectedParti.gonderim_tarihi).toLocaleDateString('tr-TR')}
                  </p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Toplam Adet</p>
                  <p className="text-lg font-bold text-gray-900">{selectedParti.toplam_adet}</p>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Toplam Kg</p>
                  <p className="text-lg font-bold text-gray-900">
                    {parseFloat(selectedParti.toplam_kg || 0).toFixed(2)} kg
                  </p>
                </div>
              </div>

              {/* Ürünler Tablosu */}
              <h4 className="text-lg font-bold text-gray-800 mb-4">Partide Bulunan Ürünler</h4>
              {selectedParti.urunler && selectedParti.urunler.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 border border-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Ürün Kodu</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Parça Tipi</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700">Giden Adet</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700">Giden Kg</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700">Gelen Adet</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700">Gelen Kg</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Geliş Tarihi</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-red-700 bg-red-50">Problemli Adet</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-red-700 bg-red-50">Problemli Kg</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-green-700 bg-green-50">Ödenecek Kg</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700">Durum</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {selectedParti.urunler.map((urun, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">{urun.urun_kodu}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{urun.parca_tipi}</td>
                          <td className="px-4 py-3 text-sm text-right text-gray-900">{urun.giden_adet}</td>
                          <td className="px-4 py-3 text-sm text-right text-gray-900">
                            {parseFloat(urun.giden_kg || 0).toFixed(2)} kg
                          </td>
                          <td className="px-4 py-3 text-sm text-right text-gray-900">
                            {urun.gelen_adet || '-'}
                          </td>
                          <td className="px-4 py-3 text-sm text-right text-gray-900">
                            {urun.gelen_kg ? `${parseFloat(urun.gelen_kg).toFixed(2)} kg` : '-'}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700">
                            {urun.gelis_tarihi ? new Date(urun.gelis_tarihi).toLocaleDateString('tr-TR', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            }) : '-'}
                          </td>
                          <td className="px-4 py-3 text-right bg-red-50">
                            <input
                              type="number"
                              min="0"
                              value={urun.problemli_adet || ''}
                              onChange={(e) => handleProblematicChange(urun.id, 'problemli_adet', e.target.value)}
                              className="w-20 px-2 py-1 text-sm text-right border border-red-300 rounded focus:ring-2 focus:ring-red-500 focus:border-red-500"
                              placeholder="0"
                            />
                          </td>
                          <td className="px-4 py-3 text-right bg-red-50">
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={urun.problemli_kg || ''}
                              onChange={(e) => handleProblematicChange(urun.id, 'problemli_kg', e.target.value)}
                              className="w-24 px-2 py-1 text-sm text-right border border-red-300 rounded focus:ring-2 focus:ring-red-500 focus:border-red-500"
                              placeholder="0.00"
                            />
                          </td>
                          <td className="px-4 py-3 text-right bg-green-50">
                            <span className="font-semibold text-green-800">
                              {((parseFloat(urun.giden_kg) || 0) - (parseFloat(urun.problemli_kg) || 0)).toFixed(2)} kg
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            {urun.is_mukerrer ? (
                              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                                Mükerrer
                              </span>
                            ) : urun.gelen_adet ? (
                              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                Geldi
                              </span>
                            ) : (
                              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                Bekliyor
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                      {/* Toplam Satırı */}
                      <tr className="bg-blue-50 font-bold border-t-2 border-blue-300">
                        <td className="px-4 py-3 text-sm text-gray-900" colSpan="2">TOPLAM</td>
                        <td className="px-4 py-3 text-sm text-right text-gray-900">
                          {selectedParti.urunler.reduce((sum, u) => sum + (parseInt(u.giden_adet) || 0), 0)}
                        </td>
                        <td className="px-4 py-3 text-sm text-right text-gray-900">
                          {selectedParti.urunler.reduce((sum, u) => sum + (parseFloat(u.giden_kg) || 0), 0).toFixed(2)} kg
                        </td>
                        <td className="px-4 py-3 text-sm text-right text-gray-900">
                          {selectedParti.urunler.reduce((sum, u) => sum + (parseInt(u.gelen_adet) || 0), 0)}
                        </td>
                        <td className="px-4 py-3 text-sm text-right text-gray-900">
                          {selectedParti.urunler.reduce((sum, u) => sum + (parseFloat(u.gelen_kg) || 0), 0).toFixed(2)} kg
                        </td>
                        <td className="px-4 py-3"></td>
                        <td className="px-4 py-3 text-sm text-right text-red-900 bg-red-100">
                          {selectedParti.urunler.reduce((sum, u) => sum + (parseInt(u.problemli_adet) || 0), 0)}
                        </td>
                        <td className="px-4 py-3 text-sm text-right text-red-900 bg-red-100">
                          {selectedParti.urunler.reduce((sum, u) => sum + (parseFloat(u.problemli_kg) || 0), 0).toFixed(2)} kg
                        </td>
                        <td className="px-4 py-3 text-sm text-right text-green-900 bg-green-100">
                          {selectedParti.urunler.reduce((sum, u) =>
                            sum + ((parseFloat(u.giden_kg) || 0) - (parseFloat(u.problemli_kg) || 0)), 0
                          ).toFixed(2)} kg
                        </td>
                        <td className="px-4 py-3"></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Bu partide henüz ürün bulunmuyor.
                </div>
              )}

              {/* Butonlar */}
              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => exportSingleParti(selectedParti)}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                >
                  <span>📥</span>
                  <span>Excel İndir</span>
                </button>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                  Kapat
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Parti Modal */}
      <EditSevkiyatModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingParti(null);
        }}
        sevkiyat={editingParti}
        onSubmit={handleSaveEdit}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setDeletingParti(null);
        }}
        sevkiyat={deletingParti}
        onConfirm={handleConfirmDelete}
      />

      {/* Log Modal */}
      <LogModal
        isOpen={showLogModal}
        onClose={() => setShowLogModal(false)}
      />
    </div>
  );
};

export default TemizlemePartiTakip;
