import React, { useState, useEffect } from 'react';
import { sevkiyatTakipAPI } from '../../services/api';
import LoadingSpinner from '../Shared/LoadingSpinner';
import YeniSevkiyatModal from './YeniSevkiyatModal';
import GelenUrunlerModal from './GelenUrunlerModal';
import EditSevkiyatModal from './EditSevkiyatModal';
import DeleteConfirmModal from './DeleteConfirmModal';
import LogModal from './LogModal';

const TemizlemeTakip = () => {
  const [sevkiyatlar, setSevkiyatlar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSevkiyat, setSelectedSevkiyat] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showYeniSevkiyatModal, setShowYeniSevkiyatModal] = useState(false);
  const [showGelenUrunlerModal, setShowGelenUrunlerModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showLogModal, setShowLogModal] = useState(false);
  const [editingSevkiyat, setEditingSevkiyat] = useState(null);
  const [deletingSevkiyat, setDeleteingSevkiyat] = useState(null);

  useEffect(() => {
    fetchSevkiyatlar();
  }, []);

  const fetchSevkiyatlar = async () => {
    try {
      setLoading(true);
      const data = await sevkiyatTakipAPI.getSevkiyatlar();
      setSevkiyatlar(data);
    } catch (error) {
      console.error('Sevkiyat listesi hatası:', error);
      alert('Sevkiyatlar yüklenirken hata oluştu!');
    } finally {
      setLoading(false);
    }
  };

  const handleShowDetail = async (sevkiyatId) => {
    try {
      const data = await sevkiyatTakipAPI.getSevkiyat(sevkiyatId);
      setSelectedSevkiyat(data);
      setShowDetailModal(true);
    } catch (error) {
      console.error('Sevkiyat detay hatası:', error);
      alert('Sevkiyat detayı yüklenirken hata oluştu!');
    }
  };

  const handleCreateSevkiyat = async (formData) => {
    try {
      await sevkiyatTakipAPI.createSevkiyat(formData);
      setShowYeniSevkiyatModal(false);
      fetchSevkiyatlar();
      alert('Sevkiyat başarıyla oluşturuldu!');
    } catch (error) {
      console.error('Sevkiyat oluşturma hatası:', error);
      alert('Sevkiyat oluşturulurken hata oluştu!');
    }
  };

  const handleGelenUrunler = async (sevkiyatId) => {
    try {
      const data = await sevkiyatTakipAPI.getSevkiyat(sevkiyatId);
      setSelectedSevkiyat(data);
      setShowGelenUrunlerModal(true);
    } catch (error) {
      console.error('Sevkiyat yükleme hatası:', error);
      alert('Sevkiyat bilgileri yüklenirken hata oluştu!');
    }
  };

  const handleSaveGelenUrunler = async (updateData) => {
    try {
      // Update sevkiyat gelis_tarihi
      await sevkiyatTakipAPI.updateSevkiyat(updateData.sevkiyat_id, {
        gelis_tarihi: updateData.gelis_tarihi,
        durum: 'geldi'
      });

      // Update each product
      for (const urun of updateData.urunler) {
        await sevkiyatTakipAPI.updateUrun(urun.id, {
          gelen_adet: urun.gelen_adet,
          gelen_kg: urun.gelen_kg,
          pis_adet: urun.pis_adet,
          pis_kg: urun.pis_kg,
          gelis_tarihi: updateData.gelis_tarihi
        });
      }

      setShowGelenUrunlerModal(false);
      setSelectedSevkiyat(null);
      fetchSevkiyatlar();
      alert('Gelen ürünler başarıyla kaydedildi!');
    } catch (error) {
      console.error('Gelen ürünler kaydetme hatası:', error);
      alert('Gelen ürünler kaydedilirken hata oluştu!');
    }
  };

  const handleEditSevkiyat = (sevkiyat) => {
    setEditingSevkiyat(sevkiyat);
    setShowEditModal(true);
  };

  const handleSaveEdit = async (formData) => {
    try {
      await sevkiyatTakipAPI.updateSevkiyat(editingSevkiyat.id, formData);
      setShowEditModal(false);
      setEditingSevkiyat(null);
      fetchSevkiyatlar();
      alert('Sevkiyat başarıyla güncellendi!');
    } catch (error) {
      console.error('Sevkiyat güncelleme hatası:', error);
      alert('Sevkiyat güncellenirken hata oluştu!');
    }
  };

  const handleDeleteClick = (sevkiyat) => {
    setDeleteingSevkiyat(sevkiyat);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async (neden) => {
    try {
      await sevkiyatTakipAPI.deleteSevkiyat(deletingSevkiyat.id, {
        neden,
        yapan: 'Kullanıcı' // Burada gerçek kullanıcı adı kullanılabilir
      });
      setShowDeleteModal(false);
      setDeleteingSevkiyat(null);
      fetchSevkiyatlar();
      alert('Sevkiyat başarıyla silindi!');
    } catch (error) {
      console.error('Sevkiyat silme hatası:', error);
      alert('Sevkiyat silinirken hata oluştu!');
    }
  };

  const getDurumBadge = (durum) => {
    const badges = {
      gonderildi: 'bg-blue-100 text-blue-800',
      geldi: 'bg-green-100 text-green-800',
      tamamlandi: 'bg-gray-100 text-gray-800'
    };
    const labels = {
      gonderildi: 'Gönderildi',
      geldi: 'Geldi',
      tamamlandi: 'Tamamlandı'
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${badges[durum] || 'bg-gray-100 text-gray-800'}`}>
        {labels[durum] || durum}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Temizleme Takip</h2>
          <p className="text-gray-600 mt-1">Sevkiyat bazlı temizleme takibi (Kg hesaplamalı)</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-600">
            Toplam Sevkiyat: <span className="font-semibold text-lg">{sevkiyatlar.length}</span>
          </div>
          <button
            onClick={() => setShowLogModal(true)}
            className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <span className="text-lg">📋</span>
            İşlem Geçmişi
          </button>
          <button
            onClick={() => setShowYeniSevkiyatModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <span className="text-lg">+</span>
            Yeni Sevkiyat
          </button>
        </div>
      </div>

      {/* İstatistik Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <div className="text-blue-600 text-sm font-medium">Bekleyen</div>
          <div className="text-2xl font-bold text-blue-800 mt-1">
            {sevkiyatlar.filter(s => s.durum === 'gonderildi').length}
          </div>
        </div>
        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <div className="text-green-600 text-sm font-medium">Gelen</div>
          <div className="text-2xl font-bold text-green-800 mt-1">
            {sevkiyatlar.filter(s => s.durum === 'geldi').length}
          </div>
        </div>
        <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
          <div className="text-purple-600 text-sm font-medium">Toplam Giden Kg</div>
          <div className="text-2xl font-bold text-purple-800 mt-1">
            {sevkiyatlar.reduce((sum, s) => sum + parseFloat(s.toplam_giden_kg || 0), 0).toFixed(2)}
          </div>
        </div>
        <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
          <div className="text-orange-600 text-sm font-medium">Mükerrer Kg (Ücretsiz)</div>
          <div className="text-2xl font-bold text-orange-800 mt-1">
            {sevkiyatlar.reduce((sum, s) => sum + parseFloat(s.toplam_mukerrer_kg || 0), 0).toFixed(2)}
          </div>
        </div>
      </div>

      {/* Sevkiyat Listesi */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sevkiyat No</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">İrsaliye No</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Gönderim Tarihi</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Geliş Tarihi</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Ürün Çeşidi</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Giden Kg</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Gelen Kg</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Ödenecek Kg</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Durum</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">İşlemler</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sevkiyatlar.length === 0 ? (
              <tr>
                <td colSpan="10" className="px-6 py-12 text-center text-gray-500">
                  Henüz sevkiyat kaydı yok. İlk sevkiyatınızı oluşturun!
                </td>
              </tr>
            ) : (
              sevkiyatlar.map((sevkiyat) => (
                <tr key={sevkiyat.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-bold text-blue-600">#{sevkiyat.sevkiyat_no}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {sevkiyat.irsaliye_no || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {formatDate(sevkiyat.gonderim_tarihi)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {formatDate(sevkiyat.gelis_tarihi)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className="text-sm font-semibold text-gray-800">
                      {sevkiyat.toplam_urun_cesidi || 0}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className="text-sm font-semibold text-purple-700">
                      {parseFloat(sevkiyat.toplam_giden_kg || 0).toFixed(2)} kg
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className="text-sm font-semibold text-green-700">
                      {sevkiyat.toplam_gelen_kg ? parseFloat(sevkiyat.toplam_gelen_kg).toFixed(2) + ' kg' : '-'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className="text-sm font-bold text-blue-700">
                      {parseFloat(sevkiyat.odenecek_kg || 0).toFixed(2)} kg
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    {getDurumBadge(sevkiyat.durum)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => handleShowDetail(sevkiyat.id)}
                        className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                      >
                        Detay
                      </button>
                      {sevkiyat.durum === 'gonderildi' && (
                        <button
                          onClick={() => handleGelenUrunler(sevkiyat.id)}
                          className="text-green-600 hover:text-green-800 font-medium text-sm"
                        >
                          Gelen Kaydet
                        </button>
                      )}
                      <button
                        onClick={() => handleEditSevkiyat(sevkiyat)}
                        className="text-orange-600 hover:text-orange-800 font-medium text-sm"
                        title="Düzenle"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDeleteClick(sevkiyat)}
                        className="text-red-600 hover:text-red-800 font-medium text-sm"
                        title="Sil"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Detay Modal */}
      {showDetailModal && selectedSevkiyat && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Header */}
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-gray-800">
                    Sevkiyat #{selectedSevkiyat.sevkiyat.sevkiyat_no}
                  </h3>
                  <p className="text-gray-600 mt-1">
                    İrsaliye: {selectedSevkiyat.sevkiyat.irsaliye_no || '-'}
                  </p>
                </div>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
                >
                  ×
                </button>
              </div>

              {/* Özet Bilgiler */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="text-blue-600 text-xs font-medium">Gönderim Tarihi</div>
                  <div className="text-sm font-semibold text-gray-800 mt-1">
                    {formatDate(selectedSevkiyat.sevkiyat.gonderim_tarihi)}
                  </div>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="text-green-600 text-xs font-medium">Geliş Tarihi</div>
                  <div className="text-sm font-semibold text-gray-800 mt-1">
                    {formatDate(selectedSevkiyat.sevkiyat.gelis_tarihi)}
                  </div>
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="text-purple-600 text-xs font-medium">Toplam Giden</div>
                  <div className="text-sm font-semibold text-gray-800 mt-1">
                    {selectedSevkiyat.ozet.toplam_giden_adet} adet / {parseFloat(selectedSevkiyat.ozet.toplam_giden_kg || 0).toFixed(2)} kg
                  </div>
                </div>
                <div className="bg-orange-50 rounded-lg p-4">
                  <div className="text-orange-600 text-xs font-medium">Ödenecek</div>
                  <div className="text-lg font-bold text-orange-800 mt-1">
                    {parseFloat(selectedSevkiyat.ozet.odenecek_kg || 0).toFixed(2)} kg
                  </div>
                </div>
              </div>

              {/* Ürünler Tablosu */}
              <div className="mb-4">
                <h4 className="text-lg font-semibold text-gray-800 mb-3">Sevkiyattaki Ürünler</h4>
                <div className="overflow-x-auto border rounded-lg">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Ürün Kodu</th>
                        <th className="px-4 py-2 text-center text-xs font-medium text-gray-500">Parça</th>
                        <th className="px-4 py-2 text-center text-xs font-medium text-gray-500">Giden Adet</th>
                        <th className="px-4 py-2 text-center text-xs font-medium text-gray-500">Giden Kg</th>
                        <th className="px-4 py-2 text-center text-xs font-medium text-gray-500">Gelen Adet</th>
                        <th className="px-4 py-2 text-center text-xs font-medium text-gray-500">Gelen Kg</th>
                        <th className="px-4 py-2 text-center text-xs font-medium text-gray-500">Pis Adet</th>
                        <th className="px-4 py-2 text-center text-xs font-medium text-gray-500">Mükerrer</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {selectedSevkiyat.urunler.map((urun) => (
                        <tr key={urun.id} className={urun.is_mukerrer ? 'bg-orange-50' : ''}>
                          <td className="px-4 py-2 text-sm font-medium text-gray-900">{urun.urun_kodu}</td>
                          <td className="px-4 py-2 text-center text-sm text-gray-600">{urun.parca_tipi || '-'}</td>
                          <td className="px-4 py-2 text-center text-sm font-semibold text-gray-800">{urun.giden_adet}</td>
                          <td className="px-4 py-2 text-center text-sm font-semibold text-purple-700">
                            {parseFloat(urun.giden_kg || 0).toFixed(3)} kg
                          </td>
                          <td className="px-4 py-2 text-center text-sm font-semibold text-gray-800">
                            {urun.gelen_adet || '-'}
                          </td>
                          <td className="px-4 py-2 text-center text-sm font-semibold text-green-700">
                            {urun.gelen_kg ? parseFloat(urun.gelen_kg).toFixed(3) + ' kg' : '-'}
                          </td>
                          <td className="px-4 py-2 text-center text-sm font-semibold text-red-600">
                            {urun.pis_adet || 0}
                          </td>
                          <td className="px-4 py-2 text-center">
                            {urun.is_mukerrer && (
                              <span className="text-xs bg-orange-200 text-orange-800 px-2 py-1 rounded">
                                Tekrar
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Notlar */}
              {selectedSevkiyat.sevkiyat.notlar && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="text-yellow-800 text-sm font-medium mb-1">Notlar:</div>
                  <div className="text-gray-700 text-sm">{selectedSevkiyat.sevkiyat.notlar}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Yeni Sevkiyat Modal */}
      <YeniSevkiyatModal
        isOpen={showYeniSevkiyatModal}
        onClose={() => setShowYeniSevkiyatModal(false)}
        onSubmit={handleCreateSevkiyat}
        selectedProducts={[]}
      />

      {/* Gelen Ürünler Modal */}
      <GelenUrunlerModal
        isOpen={showGelenUrunlerModal}
        onClose={() => {
          setShowGelenUrunlerModal(false);
          setSelectedSevkiyat(null);
        }}
        sevkiyat={selectedSevkiyat}
        onSubmit={handleSaveGelenUrunler}
      />

      {/* Edit Sevkiyat Modal */}
      <EditSevkiyatModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingSevkiyat(null);
        }}
        sevkiyat={editingSevkiyat}
        onSubmit={handleSaveEdit}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setDeleteingSevkiyat(null);
        }}
        sevkiyat={deletingSevkiyat}
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

export default TemizlemeTakip;
