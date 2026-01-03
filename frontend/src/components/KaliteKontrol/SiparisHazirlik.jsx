import React, { useState, useEffect } from 'react';
import { kaliteKontrolAPI } from '../../services/api';
import LoadingSpinner from '../Shared/LoadingSpinner';
import SiparisHazirlikModal from './SiparisHazirlikModal';
import ConfirmModal from '../Shared/ConfirmModal';
import GonderimModal from './GonderimModal';
import GonderimHistoryModal from './GonderimHistoryModal';
import DegisiklikLogModal from './DegisiklikLogModal';

const SiparisHazirlik = () => {
  const [siparisler, setSiparisler] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showGonderimModal, setShowGonderimModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showLogModal, setShowLogModal] = useState(false);
  const [selectedSiparis, setSelectedSiparis] = useState(null);

  useEffect(() => {
    fetchSiparisler();
  }, []);

  const fetchSiparisler = async () => {
    try {
      setLoading(true);
      const data = await kaliteKontrolAPI.getSiparisHazirlik();
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
      await kaliteKontrolAPI.addSiparis(data);
      setShowAddModal(false);
      fetchSiparisler();
      alert('Yeni sipariş başarıyla eklendi!');
    } catch (error) {
      console.error('Sipariş ekleme hatası:', error);
      alert('Sipariş eklenirken bir hata oluştu!');
    }
  };

  const handleEditSubmit = async (data) => {
    try {
      await kaliteKontrolAPI.updateSiparis(selectedSiparis.id, data);
      setShowEditModal(false);
      setSelectedSiparis(null);
      fetchSiparisler();
      alert('Sipariş başarıyla güncellendi!');
    } catch (error) {
      console.error('Sipariş güncelleme hatası:', error);
      alert('Sipariş güncellenirken bir hata oluştu!');
    }
  };

  const handleDelete = async () => {
    try {
      await kaliteKontrolAPI.deleteSiparis(selectedSiparis.id);
      setShowDeleteModal(false);
      setSelectedSiparis(null);
      fetchSiparisler();
      alert('Sipariş başarıyla silindi!');
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

  const openGonderimModal = (siparis) => {
    setSelectedSiparis(siparis);
    setShowGonderimModal(true);
  };

  const openHistoryModal = (siparis) => {
    setSelectedSiparis(siparis);
    setShowHistoryModal(true);
  };

  const openLogModal = (siparis) => {
    setSelectedSiparis(siparis);
    setShowLogModal(true);
  };

  const handleGonderimSubmit = async (data) => {
    try {
      await kaliteKontrolAPI.addGonderim(selectedSiparis.id, data);
      setShowGonderimModal(false);
      setSelectedSiparis(null);
      fetchSiparisler();
      alert('Gönderim başarıyla kaydedildi!');
    } catch (error) {
      console.error('Gönderim ekleme hatası:', error);
      alert('Gönderim eklenirken bir hata oluştu!');
    }
  };

  const durumRenk = (durum) => {
    switch (durum) {
      case 'hazirlanıyor':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'tamamlandi':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'beklemede':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-300';
    }
  };

  const durumGoster = (durum) => {
    switch (durum) {
      case 'hazirlanıyor':
        return 'Hazırlanıyor';
      case 'tamamlandi':
        return 'Tamamlandı';
      case 'beklemede':
        return 'Beklemede';
      default:
        return durum;
    }
  };

  const filteredSiparisler = siparisler.filter(s => {
    if (filter === 'all') return true;
    return s.durum === filter;
  });

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-800">
          Sipariş Hazırlığı ({filteredSiparisler.length} sipariş)
        </h3>
        <div className="flex space-x-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Tümü
          </button>
          <button
            onClick={() => setFilter('hazirlanıyor')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'hazirlanıyor' ? 'bg-yellow-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Hazırlanıyor
          </button>
          <button
            onClick={() => setFilter('tamamlandi')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'tamamlandi' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Tamamlandı
          </button>
          <button
            onClick={fetchSiparisler}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium px-4 py-2"
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tarih</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Operator</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sipariş No</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ürün Kodu</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Sipariş Adet</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Gönderilen</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Kalan</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Malzemeler</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Durum</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">İşlemler</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredSiparisler.map((siparis) => {
              const kalanAdet = siparis.siparis_adet - (siparis.gonderilen_adet || 0);
              return (
                <tr key={siparis.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{siparis.tarih}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{siparis.operator}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">{siparis.siparis_no}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{siparis.urun_kodu}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-semibold text-gray-900">
                    {siparis.siparis_adet}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-600">
                    <button
                      onClick={() => openHistoryModal(siparis)}
                      className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
                      title="Gönderim geçmişini görüntüle"
                    >
                      {siparis.gonderilen_adet || 0}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
                      kalanAdet === 0 ? 'bg-green-100 text-green-800' :
                      kalanAdet > 0 ? 'bg-orange-100 text-orange-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {kalanAdet}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {siparis.malzeme_koli && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 cursor-pointer hover:bg-blue-200 transition-colors">
                          📦 Koli
                        </span>
                      )}
                      {siparis.malzeme_kutu && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 cursor-pointer hover:bg-purple-200 transition-colors">
                          📋 Kutu
                        </span>
                      )}
                      {siparis.malzeme_izolasyon && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 cursor-pointer hover:bg-indigo-200 transition-colors">
                          🔹 İzolasyon
                        </span>
                      )}
                      {siparis.malzeme_tapa && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 cursor-pointer hover:bg-green-200 transition-colors">
                          🔘 Tapa
                        </span>
                      )}
                      {siparis.malzeme_poset && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 cursor-pointer hover:bg-yellow-200 transition-colors">
                          🛍️ Poşet
                        </span>
                      )}
                      {!siparis.malzeme_koli && !siparis.malzeme_kutu && !siparis.malzeme_izolasyon && !siparis.malzeme_tapa && !siparis.malzeme_poset && (
                        <span className="text-gray-400 text-xs">-</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${durumRenk(siparis.durum)}`}>
                      {durumGoster(siparis.durum)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => openGonderimModal(siparis)}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-xs font-medium transition-colors"
                        title="Gönderim Ekle"
                      >
                        📤
                      </button>
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
              );
            })}
          </tbody>
        </table>
      </div>

      {filteredSiparisler.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          {filter === 'all' ? 'Henüz sipariş eklenmemiş.' : `"${filter}" durumunda sipariş bulunmuyor.`}
        </div>
      )}

      <SiparisHazirlikModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddSubmit}
        siparis={null}
      />

      <SiparisHazirlikModal
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
        title="Siparişi Sil"
        message={`"${selectedSiparis?.siparis_no}" numaralı siparişi silmek istediğinize emin misiniz?`}
        confirmText="Sil"
        confirmColor="red"
      />

      <GonderimModal
        isOpen={showGonderimModal}
        onClose={() => {
          setShowGonderimModal(false);
          setSelectedSiparis(null);
        }}
        onSubmit={handleGonderimSubmit}
        siparis={selectedSiparis}
      />

      <GonderimHistoryModal
        isOpen={showHistoryModal}
        onClose={() => {
          setShowHistoryModal(false);
          setSelectedSiparis(null);
        }}
        siparis={selectedSiparis}
        onRefresh={fetchSiparisler}
      />

      <DegisiklikLogModal
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

export default SiparisHazirlik;
