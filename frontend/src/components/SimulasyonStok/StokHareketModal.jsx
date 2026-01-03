import React, { useState } from 'react';
import Modal from '../Shared/Modal';

const StokHareketModal = ({ isOpen, onClose, onSubmit, stok, islemTuru }) => {
  const [formData, setFormData] = useState({
    miktar: '',
    yapan: '',
    sebep: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.miktar || !formData.yapan || !formData.sebep) {
      alert('Lütfen tüm alanları doldurun!');
      return;
    }

    const miktar = parseInt(formData.miktar);
    if (miktar <= 0) {
      alert('Miktar 0\'dan büyük olmalıdır!');
      return;
    }

    if (islemTuru === 'kullanim' && miktar > stok.mevcut_adet) {
      alert(`Kullanılacak miktar, mevcut stoktan (${stok.mevcut_adet}) fazla olamaz!`);
      return;
    }

    onSubmit({
      ...formData,
      miktar: parseInt(formData.miktar)
    });

    // Form resetle
    setFormData({
      miktar: '',
      yapan: '',
      sebep: ''
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (!stok) return null;

  const title = islemTuru === 'ekleme' ? 'Stok Ekle' : 'Stok Kullan';
  const buttonText = islemTuru === 'ekleme' ? 'Ekle' : 'Kullan';
  const buttonColor = islemTuru === 'ekleme' ? 'bg-green-600 hover:bg-green-700' : 'bg-orange-600 hover:bg-orange-700';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="medium"
    >
      <div className="mb-4 p-4 bg-blue-50 rounded-lg">
        <h4 className="font-semibold text-gray-800 mb-2">Ürün Bilgileri</h4>
        <div className="grid grid-cols-2 gap-4 text-sm text-gray-700">
          <div>
            <p><span className="font-medium">Ürün:</span> {stok.urun_adi}</p>
            <p><span className="font-medium">Malzeme Türü:</span> {stok.malzeme_turu}</p>
          </div>
          <div>
            <p><span className="font-medium">Ölçüleri:</span> {stok.olculeri || '-'}</p>
            <p><span className="font-medium">Mevcut Stok:</span> <span className="font-bold text-blue-600">{stok.mevcut_adet}</span></p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {islemTuru === 'ekleme' ? 'Eklenecek Adet' : 'Kullanılacak Adet'} <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            name="miktar"
            value={formData.miktar}
            onChange={handleChange}
            min="1"
            max={islemTuru === 'kullanim' ? stok.mevcut_adet : undefined}
            placeholder="Örn: 10"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
          {islemTuru === 'ekleme' && formData.miktar && (
            <p className="mt-1 text-xs text-green-600">
              Yeni stok: {stok.mevcut_adet} + {formData.miktar} = {stok.mevcut_adet + parseInt(formData.miktar || 0)}
            </p>
          )}
          {islemTuru === 'kullanim' && formData.miktar && (
            <p className="mt-1 text-xs text-orange-600">
              Yeni stok: {stok.mevcut_adet} - {formData.miktar} = {stok.mevcut_adet - parseInt(formData.miktar || 0)}
            </p>
          )}
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            İşlemi Yapan <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="yapan"
            value={formData.yapan}
            onChange={handleChange}
            placeholder="Örn: Esat, Melisa..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sebep / Açıklama <span className="text-red-500">*</span>
          </label>
          <textarea
            name="sebep"
            value={formData.sebep}
            onChange={handleChange}
            rows="3"
            placeholder={islemTuru === 'ekleme' ? 'Örn: Yeni sevkiyat geldi' : 'Örn: Üretimde kullanıldı'}
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
            className={`px-6 py-2 ${buttonColor} text-white rounded-lg font-medium transition-colors`}
          >
            {buttonText}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default StokHareketModal;
