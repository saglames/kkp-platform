import React, { useState } from 'react';
import Modal from '../Shared/Modal';

const AddProductModal = ({ isOpen, onClose, onSubmit, category }) => {
  const [formData, setFormData] = useState({
    name: '',
    dimensions: '',
    icine_giren_urunler: '',
    icine_giren_urun: '',
    stock: 0
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert('Lütfen ürün adı girin!');
      return;
    }

    const submitData = {
      name: formData.name.trim(),
      stock: parseInt(formData.stock) || 0
    };

    // Kategoriye göre ek alanlar ekle
    if (category === 'Koli') {
      submitData.dimensions = formData.dimensions.trim() || '';
      submitData.icine_giren_urunler = formData.icine_giren_urunler.trim() || '';
    } else if (category === 'Kutu') {
      submitData.dimensions = formData.dimensions.trim() || '';
      submitData.icine_giren_urun = formData.icine_giren_urun.trim() || '';
    }

    onSubmit(submitData);

    // Formu sıfırla
    setFormData({
      name: '',
      dimensions: '',
      icine_giren_urunler: '',
      icine_giren_urun: '',
      stock: 0
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
    <Modal isOpen={isOpen} onClose={onClose} title={`Yeni ${category} Ekle`} size="medium">
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ürün Adı <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder={`${category} adı girin`}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        {(category === 'Koli' || category === 'Kutu') && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ölçüler
            </label>
            <input
              type="text"
              name="dimensions"
              value={formData.dimensions}
              onChange={handleChange}
              placeholder="Örn: 40x30x25"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        )}

        {category === 'Koli' && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              İçine Giren Ürünler
            </label>
            <input
              type="text"
              name="icine_giren_urunler"
              value={formData.icine_giren_urunler}
              onChange={handleChange}
              placeholder="Örn: 20 kutu"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        )}

        {category === 'Kutu' && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              İçine Giren Ürün
            </label>
            <input
              type="text"
              name="icine_giren_urun"
              value={formData.icine_giren_urun}
              onChange={handleChange}
              placeholder="Örn: İzolasyon adı"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        )}

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Başlangıç Stok
          </label>
          <input
            type="number"
            name="stock"
            value={formData.stock}
            onChange={handleChange}
            min="0"
            placeholder="0"
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
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            Ekle
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AddProductModal;
