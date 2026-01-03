import React, { useState, useEffect } from 'react';
import Modal from '../Shared/Modal';

const GonderimModal = ({ isOpen, onClose, onSubmit, siparis = null }) => {
  const [formData, setFormData] = useState({
    gonderen: '',
    gonderilen_adet: 0,
    notlar: ''
  });

  useEffect(() => {
    if (isOpen && !siparis) {
      // Reset form if no siparis
      setFormData({
        gonderen: '',
        gonderilen_adet: 0,
        notlar: ''
      });
    } else if (isOpen && siparis) {
      // Prepare form for new shipment
      const kalanAdet = siparis.siparis_adet - (siparis.gonderilen_adet || 0);
      setFormData({
        gonderen: '',
        gonderilen_adet: kalanAdet > 0 ? kalanAdet : 0,
        notlar: ''
      });
    }
  }, [isOpen, siparis]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.gonderen || !formData.gonderilen_adet || formData.gonderilen_adet <= 0) {
      alert('Lütfen tüm zorunlu alanları doldurun ve geçerli bir adet girin!');
      return;
    }

    const kalanAdet = siparis.siparis_adet - (siparis.gonderilen_adet || 0);
    if (formData.gonderilen_adet > kalanAdet) {
      alert(`Gönderilecek adet, kalan adetten (${kalanAdet}) fazla olamaz!`);
      return;
    }

    onSubmit({
      ...formData,
      gonderilen_adet: parseInt(formData.gonderilen_adet)
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (!siparis) return null;

  const kalanAdet = siparis.siparis_adet - (siparis.gonderilen_adet || 0);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Gönderim Ekle"
      size="medium"
    >
      <div className="mb-4 p-4 bg-blue-50 rounded-lg">
        <h4 className="font-semibold text-gray-800 mb-2">Sipariş Bilgileri</h4>
        <div className="text-sm text-gray-700 space-y-1">
          <p><span className="font-medium">Sipariş No:</span> {siparis.siparis_no}</p>
          <p><span className="font-medium">Ürün Kodu:</span> {siparis.urun_kodu}</p>
          <p><span className="font-medium">Toplam Sipariş:</span> {siparis.siparis_adet}</p>
          <p><span className="font-medium">Gönderilen:</span> {siparis.gonderilen_adet || 0}</p>
          <p>
            <span className="font-medium">Kalan:</span>{' '}
            <span className={`font-bold ${kalanAdet > 0 ? 'text-orange-600' : 'text-green-600'}`}>
              {kalanAdet}
            </span>
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Gönderen <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="gonderen"
            value={formData.gonderen}
            onChange={handleChange}
            placeholder="Örn: Esat, Melisa..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Gönderilen Adet <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            name="gonderilen_adet"
            value={formData.gonderilen_adet}
            onChange={handleChange}
            min="1"
            max={kalanAdet}
            placeholder="0"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
          <p className="mt-1 text-xs text-gray-500">
            Maksimum gönderebileceğiniz adet: {kalanAdet}
          </p>
        </div>

        <div className="mb-6">
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
            className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
          >
            Gönderimi Kaydet
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default GonderimModal;
