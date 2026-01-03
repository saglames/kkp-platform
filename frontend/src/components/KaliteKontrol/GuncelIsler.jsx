import React, { useState, useEffect } from 'react';
import { kaliteKontrolAPI } from '../../services/api';
import LoadingSpinner from '../Shared/LoadingSpinner';
import GorevModal from './GorevModal';
import ConfirmModal from '../Shared/ConfirmModal';

const GuncelIsler = () => {
  const [gorevler, setGorevler] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedGorev, setSelectedGorev] = useState(null);

  useEffect(() => {
    fetchGorevler();
  }, []);

  const fetchGorevler = async () => {
    try {
      setLoading(true);
      const data = await kaliteKontrolAPI.getGorevler();
      setGorevler(data);
    } catch (error) {
      console.error('Görevler yükleme hatası:', error);
      alert('Görevler yüklenirken bir hata oluştu!');
    } finally {
      setLoading(false);
    }
  };

  const toggleGorevTamamlandi = async (id, currentStatus) => {
    try {
      // Mevcut görevi bul
      const gorev = gorevler.find(g => g.id === id);
      if (!gorev) {
        alert('Görev bulunamadı!');
        return;
      }

      // Tüm bilgileri gönder, sadece tamamlandi durumunu değiştir
      await kaliteKontrolAPI.updateGorev(id, {
        baslik: gorev.baslik,
        aciklama: gorev.aciklama,
        aciliyet: gorev.aciliyet,
        atanan: gorev.atanan,
        baslama_tarihi: gorev.baslama_tarihi || null,
        bitis_tarihi: gorev.bitis_tarihi || null,
        tamamlandi: !currentStatus,
        sira: gorev.sira || 0
      });
      fetchGorevler();
    } catch (error) {
      console.error('Görev güncelleme hatası:', error);
      alert('Görev güncellenirken bir hata oluştu!');
    }
  };

  const handleAddSubmit = async (data) => {
    try {
      await kaliteKontrolAPI.addGorev(data);
      setShowAddModal(false);
      fetchGorevler();
      alert('Yeni görev başarıyla eklendi!');
    } catch (error) {
      console.error('Görev ekleme hatası:', error);
      alert('Görev eklenirken bir hata oluştu!');
    }
  };

  const handleEditSubmit = async (data) => {
    try {
      await kaliteKontrolAPI.updateGorev(selectedGorev.id, data);
      setShowEditModal(false);
      setSelectedGorev(null);
      fetchGorevler();
      alert('Görev başarıyla güncellendi!');
    } catch (error) {
      console.error('Görev güncelleme hatası:', error);
      alert('Görev güncellenirken bir hata oluştu!');
    }
  };

  const handleDelete = async () => {
    try {
      await kaliteKontrolAPI.deleteGorev(selectedGorev.id);
      setShowDeleteModal(false);
      setSelectedGorev(null);
      fetchGorevler();
      alert('Görev başarıyla silindi!');
    } catch (error) {
      console.error('Görev silme hatası:', error);
      alert('Görev silinirken bir hata oluştu!');
    }
  };

  const openEditModal = (gorev) => {
    setSelectedGorev(gorev);
    setShowEditModal(true);
  };

  const openDeleteModal = (gorev) => {
    setSelectedGorev(gorev);
    setShowDeleteModal(true);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const aciliyetRenk = (aciliyet) => {
    switch (aciliyet) {
      case 'Yüksek':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'Orta':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'Düşük':
        return 'bg-green-100 text-green-800 border-green-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const tamamlanmayanGorevler = gorevler.filter(g => !g.tamamlandi);
  const tamamlananGorevler = gorevler.filter(g => g.tamamlandi);

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="mb-6 flex justify-between items-center gap-4">
        <h3 className="text-lg font-semibold text-gray-800">
          Güncel İşler ({tamamlanmayanGorevler.length} açık, {tamamlananGorevler.length} tamamlandı)
        </h3>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchGorevler}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            🔄 Yenile
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
          >
            <span className="text-lg">+</span>
            Yeni Görev
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {tamamlanmayanGorevler.length > 0 && (
          <div>
            <h4 className="text-md font-semibold text-gray-700 mb-3">⏳ Devam Eden Görevler</h4>
            <div className="space-y-3">
              {tamamlanmayanGorevler.map((gorev) => (
                <div key={gorev.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h5 className="text-lg font-semibold text-gray-900">{gorev.baslik}</h5>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${aciliyetRenk(gorev.aciliyet)}`}>
                          {gorev.aciliyet}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{gorev.aciklama}</p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span>👤 {gorev.atanan}</span>
                        <span>📅 Oluşturma: {formatDate(gorev.olusturma_tarihi)}</span>
                        {gorev.baslama_tarihi && (
                          <span>🚀 Başlama: {formatDate(gorev.baslama_tarihi)}</span>
                        )}
                        {gorev.bitis_tarihi && (
                          <span>🏁 Bitiş: {formatDate(gorev.bitis_tarihi)}</span>
                        )}
                      </div>
                    </div>
                    <div className="ml-4 flex flex-col gap-2">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEditModal(gorev)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs font-medium transition-colors"
                          title="Düzenle"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => openDeleteModal(gorev)}
                          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs font-medium transition-colors"
                          title="Sil"
                        >
                          🗑️
                        </button>
                      </div>
                      <button
                        onClick={() => toggleGorevTamamlandi(gorev.id, gorev.tamamlandi)}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                      >
                        ✓ Tamamla
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tamamlananGorevler.length > 0 && (
          <div>
            <h4 className="text-md font-semibold text-gray-700 mb-3">✅ Tamamlanan Görevler</h4>
            <div className="space-y-3">
              {tamamlananGorevler.map((gorev) => (
                <div key={gorev.id} className="bg-gray-50 border border-gray-200 rounded-lg p-4 opacity-75">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h5 className="text-lg font-semibold text-gray-700 line-through">{gorev.baslik}</h5>
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-300">
                          Tamamlandı
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mb-2">{gorev.aciklama}</p>
                      <div className="flex items-center space-x-4 text-xs text-gray-400">
                        <span>👤 {gorev.atanan}</span>
                        <span>📅 Oluşturma: {formatDate(gorev.olusturma_tarihi)}</span>
                        {gorev.baslama_tarihi && (
                          <span>🚀 Başlama: {formatDate(gorev.baslama_tarihi)}</span>
                        )}
                        {gorev.bitis_tarihi && (
                          <span>🏁 Bitiş: {formatDate(gorev.bitis_tarihi)}</span>
                        )}
                      </div>
                    </div>
                    <div className="ml-4 flex flex-col gap-2">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEditModal(gorev)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs font-medium transition-colors"
                          title="Düzenle"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => openDeleteModal(gorev)}
                          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs font-medium transition-colors"
                          title="Sil"
                        >
                          🗑️
                        </button>
                      </div>
                      <button
                        onClick={() => toggleGorevTamamlandi(gorev.id, gorev.tamamlandi)}
                        className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                      >
                        ↺ Geri Al
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {gorevler.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            Henüz görev eklenmemiş.
          </div>
        )}
      </div>

      <GorevModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddSubmit}
        gorev={null}
      />

      <GorevModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedGorev(null);
        }}
        onSubmit={handleEditSubmit}
        gorev={selectedGorev}
      />

      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedGorev(null);
        }}
        onConfirm={handleDelete}
        title="Görevi Sil"
        message={`"${selectedGorev?.baslik}" görevini silmek istediğinize emin misiniz?`}
        confirmText="Sil"
        confirmColor="red"
      />
    </div>
  );
};

export default GuncelIsler;
