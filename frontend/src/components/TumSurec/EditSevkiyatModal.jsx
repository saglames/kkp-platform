import React, { useState, useEffect } from 'react';

const EditSevkiyatModal = ({ isOpen, onClose, sevkiyat, onSubmit }) => {
  const [formData, setFormData] = useState({
    irsaliye_no: '',
    gonderim_tarihi: '',
    gelis_tarihi: '',
    durum: 'gonderildi',
    notlar: ''
  });

  useEffect(() => {
    if (sevkiyat) {
      setFormData({
        irsaliye_no: sevkiyat.irsaliye_no || '',
        gonderim_tarihi: sevkiyat.gonderim_tarihi ? sevkiyat.gonderim_tarihi.substring(0, 16) : '',
        gelis_tarihi: sevkiyat.gelis_tarihi ? sevkiyat.gelis_tarihi.substring(0, 16) : '',
        durum: sevkiyat.durum || 'gonderildi',
        notlar: sevkiyat.notlar || ''
      });
    }
  }, [sevkiyat]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-2xl font-bold text-gray-800">Sevkiyat Düzenle</h3>
              <p className="text-gray-600 mt-1">Sevkiyat #{sevkiyat?.sevkiyat_no}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
            >
              ×
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              {/* İrsaliye No */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  İrsaliye No
                </label>
                <input
                  type="text"
                  name="irsaliye_no"
                  value={formData.irsaliye_no}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="İrsaliye numarası girin"
                />
              </div>

              {/* Gönderim Tarihi */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gönderim Tarihi <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  name="gonderim_tarihi"
                  value={formData.gonderim_tarihi}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Geliş Tarihi */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Geliş Tarihi
                </label>
                <input
                  type="datetime-local"
                  name="gelis_tarihi"
                  value={formData.gelis_tarihi}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Durum */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Durum <span className="text-red-500">*</span>
                </label>
                <select
                  name="durum"
                  value={formData.durum}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="gonderildi">Gönderildi</option>
                  <option value="geldi">Geldi</option>
                  <option value="tamamlandi">Tamamlandı</option>
                </select>
              </div>

              {/* Notlar */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notlar
                </label>
                <textarea
                  name="notlar"
                  value={formData.notlar}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Notlar..."
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3 mt-6 pt-6 border-t">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors"
              >
                İptal
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
              >
                Kaydet
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditSevkiyatModal;
