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
    durum: 'Hazırlanıyor',
    notlar: '',
    siparis_tarihi: '',
    tamamlanma_tarihi: '',
    // Eksik malzeme adetleri
    eksik_koli: 0,
    eksik_kutu: 0,
    eksik_izolasyon: 0,
    eksik_tapa: 0,
    eksik_poset: 0,
    eksik_ek_parca: 0,
    // Hazır malzeme adetleri
    hazir_koli: 0,
    hazir_kutu: 0,
    hazir_izolasyon: 0,
    hazir_ek_parca: 0,
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
        durum: siparis.durum || 'Hazırlanıyor',
        notlar: siparis.notlar || '',
        siparis_tarihi: siparis.siparis_tarihi || '',
        tamamlanma_tarihi: siparis.tamamlanma_tarihi || '',
        eksik_koli: siparis.eksik_koli || 0,
        eksik_kutu: siparis.eksik_kutu || 0,
        eksik_izolasyon: siparis.eksik_izolasyon || 0,
        eksik_tapa: siparis.eksik_tapa || 0,
        eksik_poset: siparis.eksik_poset || 0,
        eksik_ek_parca: siparis.eksik_ek_parca || 0,
        hazir_koli: siparis.hazir_koli || 0,
        hazir_kutu: siparis.hazir_kutu || 0,
        hazir_izolasyon: siparis.hazir_izolasyon || 0,
        hazir_ek_parca: siparis.hazir_ek_parca || 0,
        degistiren: ''
      });
    } else if (!siparis && isOpen) {
      // Reset form for new entry
      const today = new Date().toISOString().split('T')[0];
      setFormData({
        tarih: today,
        operator: '',
        siparis_no: '',
        urun_kodu: '',
        siparis_adet: '',
        gonderilen_adet: 0,
        durum: 'Hazırlanıyor',
        notlar: '',
        siparis_tarihi: today,
        tamamlanma_tarihi: '',
        eksik_koli: 0,
        eksik_kutu: 0,
        eksik_izolasyon: 0,
        eksik_tapa: 0,
        eksik_poset: 0,
        eksik_ek_parca: 0,
        hazir_koli: 0,
        hazir_kutu: 0,
        hazir_izolasyon: 0,
        hazir_ek_parca: 0,
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
      gonderilen_adet: parseInt(formData.gonderilen_adet) || 0,
      eksik_koli: parseInt(formData.eksik_koli) || 0,
      eksik_kutu: parseInt(formData.eksik_kutu) || 0,
      eksik_izolasyon: parseInt(formData.eksik_izolasyon) || 0,
      eksik_tapa: parseInt(formData.eksik_tapa) || 0,
      eksik_poset: parseInt(formData.eksik_poset) || 0,
      eksik_ek_parca: parseInt(formData.eksik_ek_parca) || 0,
      hazir_koli: parseInt(formData.hazir_koli) || 0,
      hazir_kutu: parseInt(formData.hazir_kutu) || 0,
      hazir_izolasyon: parseInt(formData.hazir_izolasyon) || 0,
      hazir_ek_parca: parseInt(formData.hazir_ek_parca) || 0
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
      title={siparis ? 'Siparişi Düzenle' : 'Yeni Sipariş Ekle'}
      size="large"
    >
      <form onSubmit={handleSubmit}>
        {/* Temel Bilgiler */}
        <div className="mb-6">
          <h4 className="text-md font-semibold text-gray-700 mb-3 border-b pb-2">Temel Bilgiler</h4>
          <div className="grid grid-cols-2 gap-4">
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
                placeholder="Örn: MXJ-B335A"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

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
        </div>

        {/* Tarihler */}
        <div className="mb-6">
          <h4 className="text-md font-semibold text-gray-700 mb-3 border-b pb-2">Tarihler</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sipariş Tarihi <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="siparis_tarihi"
                value={formData.siparis_tarihi}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tamamlanma Tarihi
              </label>
              <input
                type="date"
                name="tamamlanma_tarihi"
                value={formData.tamamlanma_tarihi}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Eksik Malzeme Miktarları */}
        <div className="mb-6">
          <h4 className="text-md font-semibold text-gray-700 mb-3 border-b pb-2">Eksik Malzeme Mevçudiyeti</h4>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                📦 Koli (adet)
              </label>
              <input
                type="number"
                name="eksik_koli"
                value={formData.eksik_koli}
                onChange={handleChange}
                min="0"
                placeholder="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                📋 Kutu (adet)
              </label>
              <input
                type="number"
                name="eksik_kutu"
                value={formData.eksik_kutu}
                onChange={handleChange}
                min="0"
                placeholder="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                🔹 İzolasyon (adet)
              </label>
              <input
                type="number"
                name="eksik_izolasyon"
                value={formData.eksik_izolasyon}
                onChange={handleChange}
                min="0"
                placeholder="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                🔘 Tapa (adet)
              </label>
              <input
                type="number"
                name="eksik_tapa"
                value={formData.eksik_tapa}
                onChange={handleChange}
                min="0"
                placeholder="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                🛍️ Poşet (adet)
              </label>
              <input
                type="number"
                name="eksik_poset"
                value={formData.eksik_poset}
                onChange={handleChange}
                min="0"
                placeholder="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                🔧 Ek Parça (adet)
              </label>
              <input
                type="number"
                name="eksik_ek_parca"
                value={formData.eksik_ek_parca}
                onChange={handleChange}
                min="0"
                placeholder="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Hazır Malzeme Miktarları */}
        <div className="mb-6">
          <h4 className="text-md font-semibold text-gray-700 mb-3 border-b pb-2">Hazır Malzeme</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                📦 Koli (adet)
              </label>
              <input
                type="number"
                name="hazir_koli"
                value={formData.hazir_koli}
                onChange={handleChange}
                min="0"
                placeholder="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                📋 Kutu (adet)
              </label>
              <input
                type="number"
                name="hazir_kutu"
                value={formData.hazir_kutu}
                onChange={handleChange}
                min="0"
                placeholder="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                🔹 İzolasyon (adet)
              </label>
              <input
                type="number"
                name="hazir_izolasyon"
                value={formData.hazir_izolasyon}
                onChange={handleChange}
                min="0"
                placeholder="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                🔧 Ek Parça (adet)
              </label>
              <input
                type="number"
                name="hazir_ek_parca"
                value={formData.hazir_ek_parca}
                onChange={handleChange}
                min="0"
                placeholder="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Durum ve Notlar */}
        <div className="mb-6">
          <h4 className="text-md font-semibold text-gray-700 mb-3 border-b pb-2">Durum ve Notlar</h4>
          <div className="grid grid-cols-1 gap-4">
            <div>
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

            <div>
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
          </div>
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
