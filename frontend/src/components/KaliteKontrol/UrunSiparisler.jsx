import React, { useState, useEffect } from 'react';
import { kaliteKontrolAPI } from '../../services/api';
import LoadingSpinner from '../Shared/LoadingSpinner';
import IcSiparisModal from './IcSiparisModal';
import ConfirmModal from '../Shared/ConfirmModal';
import UrunSiparisDegisiklikLogModal from './UrunSiparisDegisiklikLogModal';

const UrunSiparisler = () => {
  const [siparisler, setSiparisler] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showLogModal, setShowLogModal] = useState(false);
  const [selectedSiparis, setSelectedSiparis] = useState(null);

  useEffect(() => {
    fetchSiparisler();
  }, []);

  const fetchSiparisler = async () => {
    try {
      setLoading(true);
      const data = await kaliteKontrolAPI.getUrunSiparisler();
      setSiparisler(data);
    } catch (error) {
      console.error('Siparişler yükleme hatası:', error);
      alert('Siparişler yüklenirken bir hata oluştu!');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubmit = async (data) => {
    try {
      await kaliteKontrolAPI.addUrunSiparis(data);
      setShowAddModal(false);
      fetchSiparisler();
      alert('Yeni iç sipariş başarıyla eklendi!');
    } catch (error) {
      console.error('Sipariş ekleme hatası:', error);
      alert('Sipariş eklenirken bir hata oluştu!');
    }
  };

  const handleEditSubmit = async (data) => {
    try {
      await kaliteKontrolAPI.updateUrunSiparis(selectedSiparis.id, data);
      setShowEditModal(false);
      setSelectedSiparis(null);
      fetchSiparisler();
      alert('İç sipariş başarıyla güncellendi!');
    } catch (error) {
      console.error('Sipariş güncelleme hatası:', error);
      alert('Sipariş güncellenirken bir hata oluştu!');
    }
  };

  const handleDelete = async () => {
    try {
      await kaliteKontrolAPI.deleteUrunSiparis(selectedSiparis.id);
      setShowDeleteModal(false);
      setSelectedSiparis(null);
      fetchSiparisler();
      alert('İç sipariş başarıyla silindi!');
    } catch (error) {
      console.error('Sipariş silme hatası:', error);
      alert('Sipariş silinirken bir hata oluştu!');
    }
  };

  const openEditModal = (siparis) => {
    setSelectedSiparis(siparis);
    setShowEditModal(true);
  };

  const openDeleteModal = (siparis) => {
    setSelectedSiparis(siparis);
    setShowDeleteModal(true);
  };

  const openLogModal = (siparis) => {
    setSelectedSiparis(siparis);
    setShowLogModal(true);
  };

  const durumRenk = (durum) => {
    switch (durum) {
      case 'Sipariş Verildi':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Geldi':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'Beklemede':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="mb-6 flex justify-between items-center gap-4">
        <h3 className="text-lg font-semibold text-gray-800">
          İç Siparişler ({siparisler.length} sipariş)
        </h3>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchSiparisler}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            🔄 Yenile
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
          >
            <span className="text-lg">+</span>
            Yeni Sipariş
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ürün Adı</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Adet/Miktar</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ölçü</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Talep Eden</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Açıklama</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Durum</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Giriş Tarihi</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Geliş</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">İşlemler</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {siparisler.map((siparis) => (
              <tr key={siparis.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{siparis.urun_adi}</td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <span className="text-sm font-semibold text-gray-900">{siparis.adet_miktar}</span>
                  {siparis.gelen_adet && (
                    <span className="block text-xs text-green-600">Gelen: {siparis.gelen_adet}</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{siparis.olcu || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{siparis.talep_eden}</td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {siparis.aciklama}
                  {siparis.gelen_notlar && (
                    <span className="block text-xs text-green-600 mt-1">Not: {siparis.gelen_notlar}</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${durumRenk(siparis.durum)}`}>
                    {siparis.durum}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 text-center">
                  {formatDate(siparis.olusturma_tarihi)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 text-center">
                  {formatDate(siparis.gelis_tarihi)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <div className="flex justify-center gap-2">
                    <button
                      onClick={() => openLogModal(siparis)}
                      className="bg-orange-600 hover:bg-orange-700 text-white px-3 py-1 rounded text-xs font-medium transition-colors"
                      title="Değişiklik Geçmişi"
                    >
                      📋
                    </button>
                    <button
                      onClick={() => openEditModal(siparis)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs font-medium transition-colors"
                      title="Düzenle"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => openDeleteModal(siparis)}
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs font-medium transition-colors"
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

      {siparisler.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          Henüz iç sipariş eklenmemiş.
        </div>
      )}

      <IcSiparisModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddSubmit}
        siparis={null}
      />

      <IcSiparisModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedSiparis(null);
        }}
        onSubmit={handleEditSubmit}
        siparis={selectedSiparis}
      />

      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedSiparis(null);
        }}
        onConfirm={handleDelete}
        title="İç Siparişi Sil"
        message={`"${selectedSiparis?.urun_adi}" siparişini silmek istediğinize emin misiniz?`}
        confirmText="Sil"
        confirmColor="red"
      />

      <UrunSiparisDegisiklikLogModal
        isOpen={showLogModal}
        onClose={() => {
          setShowLogModal(false);
          setSelectedSiparis(null);
        }}
        siparis={selectedSiparis}
      />
    </div>
  );
};

export default UrunSiparisler;
