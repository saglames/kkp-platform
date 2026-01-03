import React, { useState, useEffect } from 'react';
import Modal from '../Shared/Modal';
import { simulasyonStokAPI } from '../../services/api';

const MalzemeModal = ({ isOpen, onClose, onSubmit, malzeme = null }) => {
  const [formData, setFormData] = useState({
    malzeme_tipi: '',
    malzeme_kodu: '',
    malzeme_adi: '',
    adet: 1,
    birim: 'adet',
    kategori: '',
    notlar: ''
  });
  const [tapaListesi, setTapaListesi] = useState([]);
  const [izolasyonListesi, setIzolasyonListesi] = useState([]);

  useEffect(() => {
    if (isOpen) {
      // Fetch tapa and izolasyon lists from simulation stock
      fetchTapaVeIzolasyon();
    }

    if (isOpen && malzeme) {
      setFormData({
        malzeme_tipi: malzeme.malzeme_tipi || '',
        malzeme_kodu: malzeme.malzeme_kodu || '',
        malzeme_adi: malzeme.malzeme_adi || '',
        adet: malzeme.adet || 1,
        birim: malzeme.birim || 'adet',
        kategori: malzeme.kategori || '',
        notlar: malzeme.notlar || ''
      });
    } else if (isOpen && !malzeme) {
      setFormData({
        malzeme_tipi: '',
        malzeme_kodu: '',
        malzeme_adi: '',
        adet: 1,
        birim: 'adet',
        kategori: '',
        notlar: ''
      });
    }
  }, [isOpen, malzeme]);

  const fetchTapaVeIzolasyon = async () => {
    try {
      const stokData = await simulasyonStokAPI.getAll();

      // Filter tapa list
      const tapalar = stokData
        .filter(s => s.malzeme_turu === 'tapa')
        .map(s => s.urun_adi)
        .sort();

      // Filter izolasyon list
      const izolasyonlar = stokData
        .filter(s => s.malzeme_turu === 'izolasyon')
        .map(s => s.urun_adi)
        .sort();

      setTapaListesi(tapalar);
      setIzolasyonListesi(izolasyonlar);
    } catch (error) {
      console.error('Tapa ve izolasyon listesi yüklenirken hata:', error);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.malzeme_tipi || !formData.malzeme_kodu) {
      alert('Lütfen malzeme tipi ve kodunu girin!');
      return;
    }

    onSubmit(formData);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // When malzeme_tipi changes to Tapa or İzolasyon, set kategori to 'Paketleme'
    if (name === 'malzeme_tipi' && (value === 'Tapa' || value === 'İzolasyon')) {
      setFormData(prev => ({
        ...prev,
        [name]: value,
        kategori: 'Paketleme'
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: name === 'adet' ? parseInt(value) || 1 : value
      }));
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={malzeme ? 'Malzeme Düzenle' : 'Yeni Malzeme Ekle'}
      size="large"
    >
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Kategori
            </label>
            <select
              name="kategori"
              value={formData.kategori}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Seçiniz...</option>
              <option value="A">A</option>
              <option value="B">B</option>
              <option value="Ortak">Ortak</option>
              <option value="Ek Parça">Ek Parça</option>
              <option value="Paketleme">Paketleme</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Malzeme Tipi <span className="text-red-500">*</span>
            </label>
            <select
              name="malzeme_tipi"
              value={formData.malzeme_tipi}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">Seçiniz...</option>
              <option value="Tapa">Tapa</option>
              <option value="İzolasyon">İzolasyon</option>
              <option value="Ek Parça">Ek Parça</option>
              <option value="Diğer">Diğer</option>
            </select>
            <p className="mt-1 text-xs text-gray-500">
              Kutu ve Koli ürün reçetesinden otomatik hesaplanır
            </p>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Malzeme Kodu <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="malzeme_kodu"
            value={formData.malzeme_kodu}
            onChange={handleChange}
            list={formData.malzeme_tipi === 'Tapa' ? 'tapa-listesi' : formData.malzeme_tipi === 'İzolasyon' ? 'izolasyon-listesi' : undefined}
            placeholder={
              formData.malzeme_tipi === 'Tapa' ? 'Tapa seçin veya yazın...' :
              formData.malzeme_tipi === 'İzolasyon' ? 'İzolasyon seçin veya yazın...' :
              'Örn: 14, K7, B2, 2512 大 BLUE...'
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
          <datalist id="tapa-listesi">
            {tapaListesi.map((tapa, index) => (
              <option key={index} value={tapa} />
            ))}
          </datalist>
          <datalist id="izolasyon-listesi">
            {izolasyonListesi.map((izolasyon, index) => (
              <option key={index} value={izolasyon} />
            ))}
          </datalist>
          {formData.malzeme_tipi === 'Tapa' && (
            <p className="mt-1 text-xs text-gray-500">
              Stoktan tapa seçin veya manuel yazın
            </p>
          )}
          {formData.malzeme_tipi === 'İzolasyon' && (
            <p className="mt-1 text-xs text-gray-500">
              Stoktan izolasyon seçin veya manuel yazın
            </p>
          )}
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Malzeme Adı
          </label>
          <input
            type="text"
            name="malzeme_adi"
            value={formData.malzeme_adi}
            onChange={handleChange}
            placeholder="İsteğe bağlı açıklama..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Adet <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="adet"
              value={formData.adet}
              onChange={handleChange}
              min="1"
              placeholder="1"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Birim
            </label>
            <select
              name="birim"
              value={formData.birim}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="adet">Adet</option>
              <option value="kg">Kg</option>
              <option value="m">Metre</option>
              <option value="cm">Cm</option>
              <option value="lt">Litre</option>
            </select>
          </div>
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
            className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
          >
            {malzeme ? 'Güncelle' : 'Ekle'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default MalzemeModal;
