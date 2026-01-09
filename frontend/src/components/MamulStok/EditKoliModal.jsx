import React, { useState, useEffect } from 'react';

const EditKoliModal = ({ isOpen, onClose, onSubmit, item }) => {
  const [formData, setFormData] = useState({
    name: '',
    en: 0,
    boy: 0,
    yukseklik: 0,
    icine_giren_urunler: '',
    stock: 0
  });

  useEffect(() => {
    if (item) {
      // Parse dimensions from format "15x20x10"
      const dims = item.dimensions ? item.dimensions.split('x').map(d => parseFloat(d) || 0) : [0, 0, 0];

      setFormData({
        name: item.name || '',
        en: dims[0] || 0,
        boy: dims[1] || 0,
        yukseklik: dims[2] || 0,
        icine_giren_urunler: item.icine_giren_urunler || '',
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

    if (formData.en <= 0 || formData.boy <= 0 || formData.yukseklik <= 0) {
      alert('Ölçüler 0\'dan büyük olmalıdır!');
      return;
    }

    // Dimensions formatını oluştur
    const dimensions = `${formData.en}x${formData.boy}x${formData.yukseklik}`;

    onSubmit({
      name: formData.name,
      dimensions,
      icine_giren_urunler: formData.icine_giren_urunler,
      stock: formData.stock
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: ['en', 'boy', 'yukseklik', 'stock'].includes(name)
        ? parseFloat(value) || 0
        : value
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Koli Düzenle</h2>
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
                Ürün Adı <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Örn: Koli A"
                required
              />
            </div>

            {/* Ölçüler */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ölçüler (cm) <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <input
                    type="number"
                    name="en"
                    value={formData.en}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="En"
                    min="0.01"
                    step="0.01"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">En</p>
                </div>
                <div>
                  <input
                    type="number"
                    name="boy"
                    value={formData.boy}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Boy"
                    min="0.01"
                    step="0.01"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Boy</p>
                </div>
                <div>
                  <input
                    type="number"
                    name="yukseklik"
                    value={formData.yukseklik}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Yükseklik"
                    min="0.01"
                    step="0.01"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Yükseklik</p>
                </div>
              </div>
            </div>

            {/* İçine Giren Ürünler */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                İçine Giren Ürünler
              </label>
              <input
                type="text"
                name="icine_giren_urunler"
                value={formData.icine_giren_urunler}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Örn: 50 Adet Kutu A"
              />
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

export default EditKoliModal;
