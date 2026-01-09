import React, { useState, useEffect } from 'react';
import Modal from '../Shared/Modal';

const IcSiparisModal = ({ isOpen, onClose, onSubmit, siparis = null }) => {
  const [formData, setFormData] = useState({
    urun_adi: '',
    adet_miktar: '',
    olcu: '',
    talep_eden: '',
    siparis_veren_yer: '',
    aciklama: '',
    gelen_adet: '',
    gelen_notlar: '',
    durum: 'Beklemede',
    gelis_tarihi: '',
    degistiren: ''
  });

  useEffect(() => {
    if (siparis && isOpen) {
      setFormData({
        urun_adi: siparis.urun_adi || '',
        adet_miktar: siparis.adet_miktar || '',
        olcu: siparis.olcu || '',
        talep_eden: siparis.talep_eden || '',
        siparis_veren_yer: siparis.siparis_veren_yer || '',
        aciklama: siparis.aciklama || '',
        gelen_adet: siparis.gelen_adet || '',
        gelen_notlar: siparis.gelen_notlar || '',
        durum: siparis.durum || 'Beklemede',
        gelis_tarihi: siparis.gelis_tarihi ? siparis.gelis_tarihi.split('T')[0] : '',
        degistiren: ''
      });
    } else if (!siparis && isOpen) {
      // Reset form for new entry
      setFormData({
        urun_adi: '',
        adet_miktar: '',
        olcu: '',
        talep_eden: '',
        siparis_veren_yer: '',
        aciklama: '',
        gelen_adet: '',
        gelen_notlar: '',
        durum: 'Beklemede',
        gelis_tarihi: '',
        degistiren: ''
      });
    }
  }, [siparis, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.urun_adi || !formData.adet_miktar || !formData.talep_eden) {
      alert('Lütfen zorunlu alanları doldurun!');
      return;
    }

    // Eğer düzenleme yapılıyorsa ve degistiren boşsa uyar
    if (siparis && !formData.degistiren) {
      alert('Lütfen değişikliği yapan kişinin adını girin!');
      return;
    }

    const submitData = {
      ...formData,
      gelis_tarihi: formData.gelis_tarihi || null
    };

    onSubmit(submitData);
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
      title={siparis ? 'İç Siparişi Düzenle' : 'Yeni İç Sipariş Ekle'}
      size="large"
    >
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Adet/Miktar <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="adet_miktar"
              value={formData.adet_miktar}
              onChange={handleChange}
              placeholder="Örn: 100 adet"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ölçü
            </label>
            <input
              type="text"
              name="olcu"
              value={formData.olcu}
              onChange={handleChange}
              placeholder="Örn: 10x20 cm"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Talep Eden <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="talep_eden"
              value={formData.talep_eden}
              onChange={handleChange}
              placeholder="Örn: Esat, Melisa..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sipariş Verilen Yer
          </label>
          <input
            type="text"
            name="siparis_veren_yer"
            value={formData.siparis_veren_yer}
            onChange={handleChange}
            placeholder="Örn: Depo, Üretim, Kalite Kontrol..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
            rows="3"
            placeholder="Sipariş detayları..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Gelen Adet
            </label>
            <input
              type="text"
              name="gelen_adet"
              value={formData.gelen_adet}
              onChange={handleChange}
              placeholder="Örn: 50 adet"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Geliş Tarihi
            </label>
            <input
              type="date"
              name="gelis_tarihi"
              value={formData.gelis_tarihi}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Gelen Notlar
          </label>
          <textarea
            name="gelen_notlar"
            value={formData.gelen_notlar}
            onChange={handleChange}
            rows="2"
            placeholder="Teslimat notları..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
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
            <option value="Sipariş Verildi">Sipariş Verildi</option>
            <option value="Geldi">Geldi</option>
          </select>
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

export default IcSiparisModal;
