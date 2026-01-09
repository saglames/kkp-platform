import React, { useState, useEffect } from 'react';

const EditIzolasyonModal = ({ isOpen, onClose, onSubmit, item }) => {
  const [formData, setFormData] = useState({
    name: '',
    cin_adi: '',
    turk_adi: '',
    renk: '',
    stock: 0
  });

  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name || '',
        cin_adi: item.cin_adi || '',
        turk_adi: item.turk_adi || '',
        renk: item.renk || '',
        stock: item.stock || 0
      });
    }
  }, [item]);

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validasyon
    if (!formData.name.trim()) {
      alert('Ürün adı zorunludur!');
      return;
    }

    onSubmit(formData);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'stock' ? parseInt(value) || 0 : value
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">İzolasyon Düzenle</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Ürün Adı */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ürün Adı (Kod) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Örn: FOG-B335A (A)"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Birden fazla ürün için tire (-) ile ayırın: FOG-B335A (B) - FOG-B506A (B)
              </p>
            </div>

            {/* Çin Adı */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Çin Adı (Ölçü)
              </label>
              <input
                type="text"
                name="cin_adi"
                value={formData.cin_adi}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Örn: CMY-102L-A"
              />
            </div>

            {/* Türk Adı */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Türk Adı
              </label>
              <input
                type="text"
                name="turk_adi"
                value={formData.turk_adi}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Türk adı girin"
              />
            </div>

            {/* Renk */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Renk
              </label>
              <select
                name="renk"
                value={formData.renk}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Seçiniz</option>
                <option value="GRİ">GRİ</option>
                <option value="MAVİ">MAVİ</option>
                <option value="YEŞİL">YEŞİL</option>
                <option value="SARI">SARI</option>
                <option value="KIRMIZI">KIRMIZI</option>
                <option value="SİYAH">SİYAH</option>
                <option value="BEYAZ">BEYAZ</option>
              </select>
            </div>

            {/* Stok */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Stok Adedi
              </label>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="0"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
            >
              İptal
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              Kaydet
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditIzolasyonModal;
