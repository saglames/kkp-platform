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
  const [searchTerm, setSearchTerm] = useState('');
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

  // Malzeme listesi oluşturucu - eksik malzemeler
  const renderEksikMalzemeler = (siparis) => {
    const malzemeler = [];
    if (siparis.eksik_koli > 0) malzemeler.push(`📦 Koli ${siparis.eksik_koli}`);
    if (siparis.eksik_kutu > 0) malzemeler.push(`📋 Kutu ${siparis.eksik_kutu}`);
    if (siparis.eksik_izolasyon > 0) malzemeler.push(`🔹 İzolasyon ${siparis.eksik_izolasyon}`);
    if (siparis.eksik_tapa > 0) malzemeler.push(`🔘 Tapa ${siparis.eksik_tapa}`);
    if (siparis.eksik_poset > 0) malzemeler.push(`🛍️ Poşet ${siparis.eksik_poset}`);
    if (siparis.eksik_ek_parca > 0) malzemeler.push(`🔧 Ek Parça ${siparis.eksik_ek_parca}`);

    return malzemeler.length > 0 ? (
      <div className="flex flex-wrap gap-1">
        {malzemeler.map((m, idx) => (
          <span key={idx} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
            {m}
          </span>
        ))}
      </div>
    ) : <span className="text-gray-400 text-xs">-</span>;
  };

  // Malzeme listesi oluşturucu - hazır malzemeler
  const renderHazirMalzemeler = (siparis) => {
    const malzemeler = [];
    if (siparis.hazir_koli > 0) malzemeler.push(`📦 Koli ${siparis.hazir_koli}`);
    if (siparis.hazir_kutu > 0) malzemeler.push(`📋 Kutu ${siparis.hazir_kutu}`);
    if (siparis.hazir_izolasyon > 0) malzemeler.push(`🔹 İzolasyon ${siparis.hazir_izolasyon}`);
    if (siparis.hazir_ek_parca > 0) malzemeler.push(`🔧 Ek Parça ${siparis.hazir_ek_parca}`);

    return malzemeler.length > 0 ? (
      <div className="flex flex-wrap gap-1">
        {malzemeler.map((m, idx) => (
          <span key={idx} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            {m}
          </span>
        ))}
      </div>
    ) : <span className="text-gray-400 text-xs">-</span>;
  };

  // Filtrele ve ara
  const filteredSiparisler = siparisler.filter(s => {
    // Durum filtresi
    if (filter !== 'all' && s.durum !== filter) return false;

    // Arama filtresi (ürün kodu)
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return s.urun_kodu && s.urun_kodu.toLowerCase().includes(search);
    }

    return true;
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

      {/* Arama */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Ürün kodu ara (örn: MXJ)..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Operator</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sipariş No</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ürün Kodu</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Sipariş Tarihi</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Tamamlanma Tarihi</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Sipariş Adet</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Gönderilen</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Kalan</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Eksik Malzeme</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hazır Malzeme</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Durum</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">İşlemler</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredSiparisler.map((siparis) => {
              const kalanAdet = siparis.siparis_adet - (siparis.gonderilen_adet || 0);
              return (
                <tr key={siparis.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{siparis.operator}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">{siparis.siparis_no}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{siparis.urun_kodu}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-600">
                    {siparis.siparis_tarihi || siparis.tarih || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-600">
                    {siparis.tamamlanma_tarihi || '-'}
                  </td>
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
                    {renderEksikMalzemeler(siparis)}
                  </td>
                  <td className="px-6 py-4">
                    {renderHazirMalzemeler(siparis)}
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
          {searchTerm ? 'Arama sonucu bulunamadı.' : (filter === 'all' ? 'Henüz sipariş eklenmemiş.' : `"${filter}" durumunda sipariş bulunmuyor.`)}
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
