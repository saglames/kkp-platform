import React, { useState, useEffect } from 'react';
import { simulasyonStokAPI } from '../../services/api';
import LoadingSpinner from '../Shared/LoadingSpinner';
import SimulasyonStokModal from './SimulasyonStokModal';
import ConfirmModal from '../Shared/ConfirmModal';
import StokHareketModal from '../SimulasyonStok/StokHareketModal';
import StokHareketLogModal from '../SimulasyonStok/StokHareketLogModal';

const SimulasyonStok = () => {
  const [stok, setStok] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showStokEkleModal, setShowStokEkleModal] = useState(false);
  const [showStokKullanModal, setShowStokKullanModal] = useState(false);
  const [showLogModal, setShowLogModal] = useState(false);
  const [selectedStok, setSelectedStok] = useState(null);

  const categories = [
    { id: 'all', label: 'Tümü', icon: '📊' },
    { id: 'koli', label: 'Koli', icon: '📦' },
    { id: 'kutu', label: 'Kutu', icon: '📋' },
    { id: 'izolasyon', label: 'İzolasyon', icon: '🔹' },
    { id: 'tapa', label: 'Tapa', icon: '🔘' },
    { id: 'poset', label: 'Poşet', icon: '🛍️' },
    { id: 'etiket', label: 'Etiket', icon: '🏷️' }
  ];

  useEffect(() => {
    fetchStok();
  }, []);

  const fetchStok = async () => {
    try {
      setLoading(true);
      const data = await simulasyonStokAPI.getAll();
      setStok(data);
    } catch (error) {
      console.error('Stok yükleme hatası:', error);
      alert('Stok yüklenirken bir hata oluştu!');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubmit = async (data) => {
    try {
      await simulasyonStokAPI.add(data);
      setShowAddModal(false);
      fetchStok();
      alert('Yeni simülasyon stok başarıyla eklendi!');
    } catch (error) {
      console.error('Stok ekleme hatası:', error);
      alert('Stok eklenirken bir hata oluştu!');
    }
  };

  const handleEditSubmit = async (data) => {
    try {
      await simulasyonStokAPI.update(selectedStok.id, data);
      setShowEditModal(false);
      setSelectedStok(null);
      fetchStok();
      alert('Simülasyon stok başarıyla güncellendi!');
    } catch (error) {
      console.error('Stok güncelleme hatası:', error);
      alert('Stok güncellenirken bir hata oluştu!');
    }
  };

  const handleDelete = async () => {
    try {
      await simulasyonStokAPI.delete(selectedStok.id);
      setShowDeleteModal(false);
      setSelectedStok(null);
      fetchStok();
      alert('Simülasyon stok başarıyla silindi!');
    } catch (error) {
      console.error('Stok silme hatası:', error);
      alert('Stok silinirken bir hata oluştu!');
    }
  };

  const openEditModal = (item) => {
    setSelectedStok(item);
    setShowEditModal(true);
  };

  const openDeleteModal = (item) => {
    setSelectedStok(item);
    setShowDeleteModal(true);
  };

  const openStokEkleModal = (item) => {
    setSelectedStok(item);
    setShowStokEkleModal(true);
  };

  const openStokKullanModal = (item) => {
    setSelectedStok(item);
    setShowStokKullanModal(true);
  };

  const openLogModal = (item) => {
    setSelectedStok(item);
    setShowLogModal(true);
  };

  const handleStokEkle = async (data) => {
    try {
      await simulasyonStokAPI.changeStock(selectedStok.id, {
        eklenen_adet: data.miktar,
        yapan: data.yapan,
        sebep: data.sebep
      });
      setShowStokEkleModal(false);
      setSelectedStok(null);
      fetchStok();
      alert('Stok başarıyla eklendi!');
    } catch (error) {
      console.error('Stok ekleme hatası:', error);
      alert('Stok eklenirken bir hata oluştu!');
    }
  };

  const handleStokKullan = async (data) => {
    try {
      await simulasyonStokAPI.changeStock(selectedStok.id, {
        kullanilan_adet: data.miktar,
        yapan: data.yapan,
        sebep: data.sebep
      });
      setShowStokKullanModal(false);
      setSelectedStok(null);
      fetchStok();
      alert('Stok kullanımı başarıyla kaydedildi!');
    } catch (error) {
      console.error('Stok kullanım hatası:', error);
      alert('Stok kullanımı kaydedilirken bir hata oluştu!');
    }
  };

  const filteredStok = selectedCategory === 'all'
    ? stok
    : stok.filter(item => item.malzeme_turu === selectedCategory);

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Simülasyon Stok ({filteredStok.length} ürün)
        </h3>
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <span className="mr-2">{cat.icon}</span>
              {cat.label}
            </button>
          ))}
          <button
            onClick={fetchStok}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium px-4 py-2"
          >
            🔄 Yenile
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
          >
            <span className="text-lg">+</span>
            Yeni Ekle
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Malzeme Türü</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ürün Adı</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ölçüleri</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Mevcut Adet</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ekleyen</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Son Güncelleme</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">İşlemler</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredStok.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    item.malzeme_turu === 'koli' ? 'bg-blue-100 text-blue-800' :
                    item.malzeme_turu === 'kutu' ? 'bg-purple-100 text-purple-800' :
                    item.malzeme_turu === 'izolasyon' ? 'bg-indigo-100 text-indigo-800' :
                    item.malzeme_turu === 'tapa' ? 'bg-green-100 text-green-800' :
                    item.malzeme_turu === 'poset' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-pink-100 text-pink-800'
                  }`}>
                    {item.malzeme_turu}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.urun_adi}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{item.olculeri || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
                    item.mevcut_adet > 100 ? 'bg-green-100 text-green-800' :
                    item.mevcut_adet > 0 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {item.mevcut_adet}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{item.ekleyen}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{formatDate(item.son_guncelleme)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <div className="flex justify-center gap-2">
                    <button
                      onClick={() => openStokEkleModal(item)}
                      className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs font-medium transition-colors"
                      title="Stok Ekle"
                    >
                      📥
                    </button>
                    <button
                      onClick={() => openStokKullanModal(item)}
                      className="bg-orange-600 hover:bg-orange-700 text-white px-3 py-1 rounded text-xs font-medium transition-colors"
                      title="Stok Kullan"
                    >
                      📤
                    </button>
                    <button
                      onClick={() => openLogModal(item)}
                      className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-xs font-medium transition-colors"
                      title="Hareket Geçmişi"
                    >
                      📋
                    </button>
                    <button
                      onClick={() => openEditModal(item)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs font-medium transition-colors"
                      title="Düzenle"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => openDeleteModal(item)}
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

      {filteredStok.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          {selectedCategory === 'all' ? 'Henüz stok eklenmemiş.' : `"${selectedCategory}" kategorisinde stok bulunmuyor.`}
        </div>
      )}

      <SimulasyonStokModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddSubmit}
        stok={null}
      />

      <SimulasyonStokModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedStok(null);
        }}
        onSubmit={handleEditSubmit}
        stok={selectedStok}
      />

      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedStok(null);
        }}
        onConfirm={handleDelete}
        title="Simülasyon Stok Sil"
        message={`"${selectedStok?.urun_adi}" stoğunu silmek istediğinize emin misiniz?`}
        confirmText="Sil"
        confirmColor="red"
      />

      <StokHareketModal
        isOpen={showStokEkleModal}
        onClose={() => {
          setShowStokEkleModal(false);
          setSelectedStok(null);
        }}
        onSubmit={handleStokEkle}
        stok={selectedStok}
        islemTuru="ekleme"
      />

      <StokHareketModal
        isOpen={showStokKullanModal}
        onClose={() => {
          setShowStokKullanModal(false);
          setSelectedStok(null);
        }}
        onSubmit={handleStokKullan}
        stok={selectedStok}
        islemTuru="kullanim"
      />

      <StokHareketLogModal
        isOpen={showLogModal}
        onClose={() => {
          setShowLogModal(false);
          setSelectedStok(null);
        }}
        stok={selectedStok}
      />
    </div>
  );
};

export default SimulasyonStok;
