import React, { useState, useEffect } from 'react';
import Modal from '../Shared/Modal';

const SiparisHazirlikModal = ({ isOpen, onClose, onSubmit, siparis = null }) => {
  const [formData, setFormData] = useState({
    tarih: '',
    operator: '',
    siparis_no: '',
    urun_kodu: '',
    siparis_adet: '',
    gonderilen_adet: 0,
    malzeme_koli: false,
    malzeme_kutu: false,
    malzeme_izolasyon: false,
    malzeme_tapa: false,
    malzeme_poset: false,
    durum: 'Hazırlanıyor',
    notlar: '',
    degistiren: ''
  });

  useEffect(() => {
    if (siparis && isOpen) {
      setFormData({
        tarih: siparis.tarih || '',
        operator: siparis.operator || '',
        siparis_no: siparis.siparis_no || '',
        urun_kodu: siparis.urun_kodu || '',
        siparis_adet: siparis.siparis_adet || '',
        gonderilen_adet: siparis.gonderilen_adet || 0,
        malzeme_koli: siparis.malzeme_koli || false,
        malzeme_kutu: siparis.malzeme_kutu || false,
        malzeme_izolasyon: siparis.malzeme_izolasyon || false,
        malzeme_tapa: siparis.malzeme_tapa || false,
        malzeme_poset: siparis.malzeme_poset || false,
        durum: siparis.durum || 'Hazırlanıyor',
        notlar: siparis.notlar || '',
        degistiren: ''
      });
    } else if (!siparis && isOpen) {
      // Reset form for new entry
      setFormData({
        tarih: new Date().toISOString().split('T')[0],
        operator: '',
        siparis_no: '',
        urun_kodu: '',
        siparis_adet: '',
        gonderilen_adet: 0,
        malzeme_koli: false,
        malzeme_kutu: false,
        malzeme_izolasyon: false,
        malzeme_tapa: false,
        malzeme_poset: false,
        durum: 'Hazırlanıyor',
        notlar: '',
        degistiren: ''
      });
    }
  }, [siparis, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.tarih || !formData.operator || !formData.siparis_no || !formData.urun_kodu || !formData.siparis_adet) {
      alert('Lütfen zorunlu alanları doldurun!');
      return;
    }

    // Eğer düzenleme yapılıyorsa ve degistiren boşsa uyar
    if (siparis && !formData.degistiren) {
      alert('Lütfen değişikliği yapan kişinin adını girin!');
      return;
    }

    onSubmit({
      ...formData,
      siparis_adet: parseInt(formData.siparis_adet) || 0,
      gonderilen_adet: parseInt(formData.gonderilen_adet) || 0
    });
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={siparis ? 'Siparişi Düzenle' : 'Yeni Sipariş Ekle'}
      size="large"
    >
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tarih <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="tarih"
              value={formData.tarih}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Operator <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="operator"
              value={formData.operator}
              onChange={handleChange}
              placeholder="Örn: Esat, Melisa..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sipariş No <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="siparis_no"
              value={formData.siparis_no}
              onChange={handleChange}
              placeholder="Örn: SIP-2024-001"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ürün Kodu <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="urun_kodu"
              value={formData.urun_kodu}
              onChange={handleChange}
              placeholder="Örn: FQG-B335A"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sipariş Adet <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="siparis_adet"
              value={formData.siparis_adet}
              onChange={handleChange}
              min="0"
              placeholder="0"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Gönderilen Adet
            </label>
            <input
              type="number"
              name="gonderilen_adet"
              value={formData.gonderilen_adet}
              onChange={handleChange}
              min="0"
              placeholder="0"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Malzeme Checklist
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                name="malzeme_koli"
                checked={formData.malzeme_koli}
                onChange={handleChange}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">📦 Koli</span>
            </label>

            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                name="malzeme_kutu"
                checked={formData.malzeme_kutu}
                onChange={handleChange}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">📋 Kutu</span>
            </label>

            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                name="malzeme_izolasyon"
                checked={formData.malzeme_izolasyon}
                onChange={handleChange}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">🔹 İzolasyon</span>
            </label>

            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                name="malzeme_tapa"
                checked={formData.malzeme_tapa}
                onChange={handleChange}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">🔘 Tapa</span>
            </label>

            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                name="malzeme_poset"
                checked={formData.malzeme_poset}
                onChange={handleChange}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">🛍️ Poşet</span>
            </label>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Durum
          </label>
          <select
            name="durum"
            value={formData.durum}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="Beklemede">Beklemede</option>
            <option value="Hazırlanıyor">Hazırlanıyor</option>
            <option value="Tamamlandı">Tamamlandı</option>
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notlar
          </label>
          <textarea
            name="notlar"
            value={formData.notlar}
            onChange={handleChange}
            rows="3"
            placeholder="İsteğe bağlı notlar..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {siparis && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Değişikliği Yapan <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="degistiren"
              value={formData.degistiren}
              onChange={handleChange}
              placeholder="Örn: Esat, Melisa..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
            <p className="mt-2 text-xs text-gray-600">
              ℹ️ Yaptığınız değişiklikler otomatik olarak kaydedilecektir.
            </p>
          </div>
        )}

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
            {siparis ? 'Güncelle' : 'Ekle'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default SiparisHazirlikModal;
