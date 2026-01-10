import React, { useState, useEffect } from 'react';
import { tumSurecAPI } from '../../services/api';
import LoadingSpinner from '../Shared/LoadingSpinner';

const AnasayfaEditModal = ({ isOpen, onClose, urun, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    temizlemeye_gidecek: 0,
    temizlemede_olan: 0,
    temizlemeden_gelen: 0,
    sevke_hazir: 0,
    kalan: 0
  });

  useEffect(() => {
    if (isOpen && urun) {
      setFormData({
        temizlemeye_gidecek: urun.temizlemeye_gidecek || 0,
        temizlemede_olan: urun.temizlemede_olan || 0,
        temizlemeden_gelen: urun.temizlemeden_gelen || 0,
        sevke_hazir: urun.sevke_hazir || 0,
        kalan: urun.kalan || 0
      });
    }
  }, [isOpen, urun]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const yapan = localStorage.getItem('hatali_urunler_user_name') || 'Admin';

      // Her bir alan için ilgili tabloyu güncelle
      // Temizlemeye Gidecek
      if (formData.temizlemeye_gidecek !== urun.temizlemeye_gidecek) {
        await tumSurecAPI.updateTemizlemeyeGidecek(urun.id, {
          adet: formData.temizlemeye_gidecek,
          yapan
        });
      }

      // Temizlemede Olan
      if (formData.temizlemede_olan !== urun.temizlemede_olan) {
        await tumSurecAPI.updateTemizlemedOlan(urun.id, {
          adet: formData.temizlemede_olan,
          yapan
        });
      }

      // Temizlemeden Gelen
      if (formData.temizlemeden_gelen !== urun.temizlemeden_gelen) {
        await tumSurecAPI.updateTemizlemedenGelen(urun.id, {
          adet: formData.temizlemeden_gelen,
          yapan
        });
      }

      // Sevke Hazır
      if (formData.sevke_hazir !== urun.sevke_hazir) {
        await tumSurecAPI.updateSevkeHazir(urun.id, {
          adet: formData.sevke_hazir,
          yapan
        });
      }

      // Kalan
      if (formData.kalan !== urun.kalan) {
        await tumSurecAPI.updateKalan(urun.id, {
          adet: formData.kalan
        });
      }

      alert('Güncelleme başarılı!');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Güncelleme hatası:', error);
      alert('Güncelleme sırasında bir hata oluştu: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-2xl font-bold text-gray-800">Ürün Düzenle</h3>
              <p className="text-gray-600 mt-1">
                {urun?.urun_kodu} - {urun?.tip} Kalite
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
            >
              ×
            </button>
          </div>

          {loading ? (
            <div className="py-12">
              <LoadingSpinner />
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                {/* Temizlemeye Gidecek */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Temizlemeye Gidecek
                  </label>
                  <input
                    type="number"
                    value={formData.temizlemeye_gidecek}
                    onChange={(e) => setFormData({ ...formData, temizlemeye_gidecek: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="0"
                  />
                </div>

                {/* Temizlemede Olan */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Temizlemede Olan
                  </label>
                  <input
                    type="number"
                    value={formData.temizlemede_olan}
                    onChange={(e) => setFormData({ ...formData, temizlemede_olan: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    min="0"
                  />
                </div>

                {/* Temizlemeden Gelen */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Temizlemeden Gelen
                  </label>
                  <input
                    type="number"
                    value={formData.temizlemeden_gelen}
                    onChange={(e) => setFormData({ ...formData, temizlemeden_gelen: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    min="0"
                  />
                </div>

                {/* Sevke Hazır */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sevke Hazır
                  </label>
                  <input
                    type="number"
                    value={formData.sevke_hazir}
                    onChange={(e) => setFormData({ ...formData, sevke_hazir: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    min="0"
                  />
                </div>

                {/* Kalan */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kalan
                  </label>
                  <input
                    type="number"
                    value={formData.kalan}
                    onChange={(e) => setFormData({ ...formData, kalan: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    min="0"
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 mt-6 pt-6 border-t">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors disabled:bg-gray-400"
                >
                  Kaydet
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium transition-colors"
                >
                  İptal
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnasayfaEditModal;
