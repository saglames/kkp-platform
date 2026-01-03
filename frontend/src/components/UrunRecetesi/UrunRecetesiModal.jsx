import React, { useState, useEffect } from 'react';
import Modal from '../Shared/Modal';
import { simulasyonStokAPI } from '../../services/api';

const UrunRecetesiModal = ({ isOpen, onClose, onSubmit, recete = null }) => {
  const [formData, setFormData] = useState({
    urun_kodu: '',
    urun_adi: '',
    aciklama: '',
    kutu_tipi: '',
    koli_tipi: '',
    koli_kapasitesi: 1
  });
  const [kutuListesi, setKutuListesi] = useState([]);
  const [koliListesi, setKoliListesi] = useState([]);

  useEffect(() => {
    if (isOpen) {
      // Simülasyon stoktan kutu ve koli listesini çek
      fetchPaketlemeListeleri();
    }

    if (isOpen && recete) {
      console.log('Modal açıldı, recete:', recete);
      console.log('kutu_tipi değeri:', recete.kutu_tipi);
      setFormData({
        urun_kodu: recete.urun_kodu || '',
        urun_adi: recete.urun_adi || '',
        aciklama: recete.aciklama || '',
        kutu_tipi: recete.kutu_tipi || '',
        koli_tipi: recete.koli_tipi || '',
        koli_kapasitesi: recete.koli_kapasitesi || 1
      });
    } else if (isOpen && !recete) {
      setFormData({
        urun_kodu: '',
        urun_adi: '',
        aciklama: '',
        kutu_tipi: '',
        koli_tipi: '',
        koli_kapasitesi: 1
      });
    }
  }, [isOpen, recete]);

  const fetchPaketlemeListeleri = async () => {
    try {
      const stokData = await simulasyonStokAPI.getAll();

      // Kutu listesini filtrele
      const kutular = stokData
        .filter(s => s.malzeme_turu === 'kutu')
        .map(s => s.urun_adi)
        .sort();

      // Koli listesini filtrele
      const koliler = stokData
        .filter(s => s.malzeme_turu === 'koli')
        .map(s => s.urun_adi)
        .sort();

      setKutuListesi(kutular);
      setKoliListesi(koliler);
    } catch (error) {
      console.error('Paketleme malzeme listesi yüklenirken hata:', error);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.urun_kodu || !formData.urun_adi) {
      alert('Lütfen ürün kodu ve adını girin!');
      return;
    }

    console.log('Form submit - formData:', formData);
    console.log('Form submit - kutu_tipi:', formData.kutu_tipi);
    onSubmit(formData);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'kutu_tipi') {
      console.log('kutu_tipi değişti:', value);
    }
    setFormData(prev => ({
      ...prev,
      [name]: name === 'koli_kapasitesi' ? parseInt(value) || 1 : value
    }));
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={recete ? 'Reçete Düzenle' : 'Yeni Reçete Ekle'}
      size="medium"
    >
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ürün Kodu <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="urun_kodu"
            value={formData.urun_kodu}
            onChange={handleChange}
            placeholder="Örn: MXJ-YA2512M/R"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ürün Adı <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="urun_adi"
            value={formData.urun_adi}
            onChange={handleChange}
            placeholder="Ürün adını girin"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
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
            placeholder="İsteğe bağlı açıklama..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Kutu Tipi
          </label>
          <input
            type="text"
            name="kutu_tipi"
            value={formData.kutu_tipi}
            onChange={handleChange}
            list="kutu-listesi"
            placeholder="Kutu seçin veya yazın..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <datalist id="kutu-listesi">
            {kutuListesi.map((kutu, index) => (
              <option key={index} value={kutu} />
            ))}
          </datalist>
          <p className="mt-1 text-xs text-gray-500">
            Her ürün 1 kutu olarak hesaplanır (Stoktan seçin veya manuel yazın)
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Koli Tipi
            </label>
            <input
              type="text"
              name="koli_tipi"
              value={formData.koli_tipi}
              onChange={handleChange}
              list="koli-listesi"
              placeholder="Koli seçin veya yazın..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <datalist id="koli-listesi">
              {koliListesi.map((koli, index) => (
                <option key={index} value={koli} />
              ))}
            </datalist>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Koli Kapasitesi
            </label>
            <input
              type="number"
              name="koli_kapasitesi"
              value={formData.koli_kapasitesi}
              onChange={handleChange}
              min="1"
              placeholder="10"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="mt-1 text-xs text-gray-500">
              Kaç ürün bir koliye sığar
            </p>
          </div>
        </div>

        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Not:</strong> Tapa ve izolasyon malzemeleri, reçete oluşturduktan sonra "Malzeme Ekle" butonunu kullanarak eklenebilir.
            Bu sayede bir ürüne birden fazla farklı tapa veya izolasyon ekleyebilirsiniz.
          </p>
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
            {recete ? 'Güncelle' : 'Ekle'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default UrunRecetesiModal;
