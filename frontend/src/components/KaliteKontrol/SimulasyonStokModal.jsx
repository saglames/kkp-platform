import React, { useState, useEffect } from 'react';
import Modal from '../Shared/Modal';

const SimulasyonStokModal = ({ isOpen, onClose, onSubmit, stok = null }) => {
  const [formData, setFormData] = useState({
    malzeme_turu: 'koli',
    urun_adi: '',
    olculeri: '',
    mevcut_adet: 0,
    ekleyen: ''
  });

  useEffect(() => {
    if (stok && isOpen) {
      setFormData({
        malzeme_turu: stok.malzeme_turu || 'koli',
        urun_adi: stok.urun_adi || '',
        olculeri: stok.olculeri || '',
        mevcut_adet: stok.mevcut_adet || 0,
        ekleyen: stok.ekleyen || ''
      });
    } else if (!stok && isOpen) {
      // Reset form for new entry
      setFormData({
        malzeme_turu: 'koli',
        urun_adi: '',
        olculeri: '',
        mevcut_adet: 0,
        ekleyen: ''
      });
    }
  }, [stok, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.urun_adi || !formData.ekleyen) {
      alert('Lütfen zorunlu alanları doldurun!');
      return;
    }

    onSubmit({
      ...formData,
      mevcut_adet: parseInt(formData.mevcut_adet) || 0
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={stok ? 'Simülasyon Stok Düzenle' : 'Yeni Simülasyon Stok Ekle'}
      size="medium"
    >
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Malzeme Türü <span className="text-red-500">*</span>
          </label>
          <select
            name="malzeme_turu"
            value={formData.malzeme_turu}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          >
            <option value="koli">📦 Koli</option>
            <option value="kutu">📋 Kutu</option>
            <option value="izolasyon">🔹 İzolasyon</option>
            <option value="tapa">🔘 Tapa</option>
            <option value="poset">🛍️ Poşet</option>
            <option value="etiket">🏷️ Etiket</option>
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ürün Adı <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="urun_adi"
            value={formData.urun_adi}
            onChange={handleChange}
            placeholder="Örn: FQG-B335A"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ölçüleri
          </label>
          <input
            type="text"
            name="olculeri"
            value={formData.olculeri}
            onChange={handleChange}
            placeholder="Örn: 30x40x20 cm"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Mevcut Adet
          </label>
          <input
            type="number"
            name="mevcut_adet"
            value={formData.mevcut_adet}
            onChange={handleChange}
            min="0"
            placeholder="0"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ekleyen <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="ekleyen"
            value={formData.ekleyen}
            onChange={handleChange}
            placeholder="Örn: Esat, Melisa..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            İptal
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            {stok ? 'Güncelle' : 'Ekle'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default SimulasyonStokModal;
