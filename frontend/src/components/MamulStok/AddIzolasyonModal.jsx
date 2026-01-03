import React, { useState } from 'react';
import Modal from '../Shared/Modal';

const AddIzolasyonModal = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    kullanilan_urunler: '',
    stock: 0
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert('Lütfen ürün adı girin!');
      return;
    }

    // Kullanılan ürünleri virgülle ayırıp array'e çevir
    const kullanilanUrunlerArray = formData.kullanilan_urunler
      .split(',')
      .map(item => item.trim())
      .filter(item => item !== '');

    onSubmit({
      name: formData.name.trim(),
      kullanilan_urunler: kullanilanUrunlerArray.length > 0 ? kullanilanUrunlerArray : [formData.name.trim()],
      stock: parseInt(formData.stock) || 0
    });

    // Formu sıfırla
    setFormData({
      name: '',
      kullanilan_urunler: '',
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
    <Modal isOpen={isOpen} onClose={onClose} title="Yeni İzolasyon Ekle" size="medium">
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
            placeholder="Örn: FQG-B335A (B)"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Kullanılan Ürünler (virgülle ayırın)
          </label>
          <input
            type="text"
            name="kullanilan_urunler"
            value={formData.kullanilan_urunler}
            onChange={handleChange}
            placeholder="Örn: FQG-B335A, FQG-B506A (boş bırakılırsa ürün adı kullanılır)"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-500 mt-1">
            Birden fazla ürün için virgülle ayırın. Boş bırakılırsa otomatik olarak ürün adı kullanılır.
          </p>
        </div>

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

export default AddIzolasyonModal;
