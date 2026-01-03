import React, { useState, useEffect } from 'react';
import Modal from '../Shared/Modal';

const GorevModal = ({ isOpen, onClose, onSubmit, gorev = null }) => {
  const [formData, setFormData] = useState({
    baslik: '',
    aciklama: '',
    aciliyet: 'Orta',
    atanan: '',
    baslama_tarihi: '',
    bitis_tarihi: ''
  });

  useEffect(() => {
    if (gorev) {
      setFormData({
        baslik: gorev.baslik || '',
        aciklama: gorev.aciklama || '',
        aciliyet: gorev.aciliyet || 'Orta',
        atanan: gorev.atanan || '',
        baslama_tarihi: gorev.baslama_tarihi || '',
        bitis_tarihi: gorev.bitis_tarihi || ''
      });
    } else {
      setFormData({
        baslik: '',
        aciklama: '',
        aciliyet: 'Orta',
        atanan: '',
        baslama_tarihi: '',
        bitis_tarihi: ''
      });
    }
  }, [gorev, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.baslik.trim()) {
      alert('Lütfen görev başlığı girin!');
      return;
    }

    if (!formData.atanan.trim()) {
      alert('Lütfen atanan kişi girin!');
      return;
    }

    onSubmit({
      baslik: formData.baslik.trim(),
      aciklama: formData.aciklama.trim(),
      aciliyet: formData.aciliyet,
      atanan: formData.atanan.trim(),
      baslama_tarihi: formData.baslama_tarihi || null,
      bitis_tarihi: formData.bitis_tarihi || null,
      tamamlandi: gorev ? gorev.tamamlandi : false,
      sira: gorev ? gorev.sira : 0
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
      title={gorev ? 'Görevi Düzenle' : 'Yeni Görev Ekle'}
      size="medium"
    >
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Başlık <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="baslik"
            value={formData.baslik}
            onChange={handleChange}
            placeholder="Görev başlığı"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Açıklama
          </label>
          <textarea
            name="aciklama"
            value={formData.aciklama}
            onChange={handleChange}
            placeholder="Görev detayları..."
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Aciliyet <span className="text-red-500">*</span>
          </label>
          <select
            name="aciliyet"
            value={formData.aciliyet}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          >
            <option value="Düşük">Düşük</option>
            <option value="Orta">Orta</option>
            <option value="Yüksek">Yüksek</option>
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Atanan Kişi <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="atanan"
            value={formData.atanan}
            onChange={handleChange}
            placeholder="Örn: Esat, Melisa, Evrim..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            Kullanıcılar: Esat, Melisa, Evrim, Koray, Emre, Ahmet
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Başlama Tarihi
            </label>
            <input
              type="date"
              name="baslama_tarihi"
              value={formData.baslama_tarihi}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bitiş Tarihi
            </label>
            <input
              type="date"
              name="bitis_tarihi"
              value={formData.bitis_tarihi}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
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
            {gorev ? 'Güncelle' : 'Ekle'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default GorevModal;
