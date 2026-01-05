import React, { useState, useEffect } from 'react';
import { partiTakipAPI } from '../../services/api';

const TemizlemePartiTakip = () => {
  const [partiler, setPartiler] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedParti, setSelectedParti] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showMukerrerModal, setShowMukerrerModal] = useState(false);
  const [mukerrerData, setMukerrerData] = useState({});

  useEffect(() => {
    fetchPartiler();
  }, []);

  const fetchPartiler = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await partiTakipAPI.getPartiler();
      console.log('Parti verileri:', data);
      setPartiler(data || []);
    } catch (error) {
      console.error('Veri yükleme hatası:', error);
      console.error('Hata detayı:', error.response?.data || error.message);
      setError(error.response?.data?.error || error.message || 'Veri yüklenirken bir hata oluştu');
      setPartiler([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePartiClick = async (parti) => {
    try {
      const detay = await partiTakipAPI.getPartiDetay(parti.parti_no);
      setSelectedParti(detay);
      setShowDetailModal(true);
    } catch (error) {
      console.error('Detay yükleme hatası:', error);
      alert('Detay yüklenirken hata oluştu!');
    }
  };

  const handleMukerrerClick = (parti) => {
    setSelectedParti(parti);
    setMukerrerData({});
    setShowMukerrerModal(true);
  };

  const handleMukerrerSave = async () => {
    try {
      await partiTakipAPI.saveMukerrer({
        parti_no: selectedParti.parti_no,
        mukerrer_data: mukerrerData
      });
      alert('Mükerrer temizlik kaydedildi!');
      setShowMukerrerModal(false);
      fetchPartiler();
    } catch (error) {
      console.error('Kayıt hatası:', error);
      alert('Kayıt sırasında hata oluştu!');
    }
  };

  const getDurumBadge = (durum) => {
    const badges = {
      'gonderildi': 'bg-blue-100 text-blue-800',
      'geldi': 'bg-green-100 text-green-800',
      'kalite_kontrol': 'bg-yellow-100 text-yellow-800'
    };
    return badges[durum] || 'bg-gray-100 text-gray-800';
  };

  const getDurumText = (durum) => {
    const texts = {
      'gonderildi': 'Gönderildi',
      'geldi': 'Geldi',
      'kalite_kontrol': 'Kalite Kontrol'
    };
    return texts[durum] || durum;
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
        <p className="text-gray-600">Yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Temizleme Parti/İrsaliye Takip</h2>
        <p className="text-gray-600">Temizlemeye gönderilen partilerin detaylı takibi</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <span className="text-red-600 font-semibold mr-2">⚠️ Hata:</span>
            <span className="text-red-700">{error}</span>
          </div>
          <button
            onClick={fetchPartiler}
            className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Tekrar Dene
          </button>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-blue-500 to-blue-600">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                  Parti No
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                  İrsaliye No
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                  Gönderim Tarihi
                </th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-white">
                  Toplam Adet
                </th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-white">
                  Toplam Kg
                </th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-white">
                  Mükerrer Kg
                </th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-white">
                  Ödenecek Kg
                </th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-white">
                  Durum
                </th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-white">
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {partiler.length === 0 ? (
                <tr>
                  <td colSpan="9" className="px-6 py-8 text-center text-gray-500">
                    Henüz parti kaydı bulunmuyor.
                  </td>
                </tr>
              ) : (
                partiler.map((parti) => (
                  <tr key={parti.parti_no} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-lg font-bold text-blue-600">
                        {parti.parti_no}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                      {parti.irsaliye_no || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                      {new Date(parti.gonderim_tarihi).toLocaleDateString('tr-TR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-gray-900 font-semibold">
                      {parti.toplam_adet}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-gray-900 font-semibold">
                      {parti.toplam_kg.toFixed(2)} kg
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-red-600 font-semibold">
                      {parti.mukerrer_kg ? parti.mukerrer_kg.toFixed(2) : '0.00'} kg
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-green-600 font-bold">
                      {(parti.toplam_kg - (parti.mukerrer_kg || 0)).toFixed(2)} kg
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getDurumBadge(parti.durum)}`}>
                        {getDurumText(parti.durum)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() => handlePartiClick(parti)}
                          className="px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors"
                        >
                          Detay
                        </button>
                        <button
                          onClick={() => handleMukerrerClick(parti)}
                          className="px-4 py-2 bg-yellow-500 text-white text-sm font-medium rounded-lg hover:bg-yellow-600 transition-colors"
                        >
                          Mükerrer
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Parti Detay Modal */}
      {showDetailModal && selectedParti && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-bold mb-6 text-gray-800">
              Parti No: {selectedParti.parti_no} Detayı
            </h3>

            <div className="grid grid-cols-2 gap-6 mb-6">
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="text-sm text-gray-600">İrsaliye No</div>
                <div className="text-xl font-bold text-gray-900">{selectedParti.irsaliye_no || '-'}</div>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="text-sm text-gray-600">Gönderim Tarihi</div>
                <div className="text-xl font-bold text-gray-900">
                  {new Date(selectedParti.gonderim_tarihi).toLocaleDateString('tr-TR')}
                </div>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="text-sm text-gray-600">Toplam Gönderilen</div>
                <div className="text-xl font-bold text-green-700">
                  {selectedParti.toplam_adet} adet / {selectedParti.toplam_kg.toFixed(2)} kg
                </div>
              </div>
              <div className="p-4 bg-red-50 rounded-lg">
                <div className="text-sm text-gray-600">Mükerrer Temizlik</div>
                <div className="text-xl font-bold text-red-700">
                  {selectedParti.mukerrer_adet || 0} adet / {selectedParti.mukerrer_kg?.toFixed(2) || '0.00'} kg
                </div>
              </div>
            </div>

            <h4 className="text-lg font-semibold mb-3 text-gray-800">Partide Yer Alan Ürünler</h4>
            <div className="overflow-x-auto mb-6">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Ürün Kodu</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Parça Tipi</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Giden Adet</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Giden Kg</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Gelen Adet</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Gelen Kg</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Pis Adet</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Pis Kg</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {selectedParti.urunler?.map((urun, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-900">{urun.urun_kodu}</td>
                      <td className="px-4 py-3 text-gray-700">{urun.parca_tipi}</td>
                      <td className="px-4 py-3 text-right text-gray-900 font-semibold">{urun.giden_adet}</td>
                      <td className="px-4 py-3 text-right text-gray-900">{urun.giden_kg.toFixed(2)}</td>
                      <td className="px-4 py-3 text-right text-green-600 font-semibold">
                        {urun.gelen_adet || '-'}
                      </td>
                      <td className="px-4 py-3 text-right text-green-600">
                        {urun.gelen_kg ? urun.gelen_kg.toFixed(2) : '-'}
                      </td>
                      <td className="px-4 py-3 text-right text-red-600 font-semibold">
                        {urun.pis_adet || '-'}
                      </td>
                      <td className="px-4 py-3 text-right text-red-600">
                        {urun.pis_kg ? urun.pis_kg.toFixed(2) : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-4 bg-green-50 border-2 border-green-200 rounded-lg">
              <div className="text-lg font-semibold text-gray-800 mb-2">Ödeme Hesabı</div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <div className="text-sm text-gray-600">Gönderilen Toplam</div>
                  <div className="text-xl font-bold text-gray-900">{selectedParti.toplam_kg.toFixed(2)} kg</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Mükerrer (Düşülecek)</div>
                  <div className="text-xl font-bold text-red-600">
                    - {selectedParti.mukerrer_kg?.toFixed(2) || '0.00'} kg
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Ödenecek Tutar</div>
                  <div className="text-2xl font-bold text-green-600">
                    {(selectedParti.toplam_kg - (selectedParti.mukerrer_kg || 0)).toFixed(2)} kg
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-6 py-3 bg-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-400 transition-colors"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mükerrer Temizlik Modal */}
      {showMukerrerModal && selectedParti && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-bold mb-6 text-gray-800">
              Parti No: {selectedParti.parti_no} - Mükerrer Temizlik Kaydı
            </h3>

            <p className="text-gray-600 mb-6">
              Bu partide temizlenmediği için tekrar gönderilecek (mükerrer) ürünleri işaretleyin.
              Mükerrer ürünler ödeme hesabından düşülecektir.
            </p>

            <div className="space-y-4 mb-6">
              {selectedParti.urunler?.map((urun, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="mb-3">
                    <div className="font-semibold text-gray-900">{urun.urun_kodu} ({urun.parca_tipi})</div>
                    <div className="text-sm text-gray-600">
                      Gönderilen: {urun.giden_adet} adet / {urun.giden_kg.toFixed(2)} kg
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Mükerrer Adet
                      </label>
                      <input
                        type="number"
                        min="0"
                        max={urun.giden_adet}
                        value={mukerrerData[`${urun.urun_kodu}_${urun.parca_tipi}_adet`] || ''}
                        onChange={(e) => setMukerrerData({
                          ...mukerrerData,
                          [`${urun.urun_kodu}_${urun.parca_tipi}_adet`]: e.target.value
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Mükerrer Kg
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={mukerrerData[`${urun.urun_kodu}_${urun.parca_tipi}_kg`] || ''}
                        onChange={(e) => setMukerrerData({
                          ...mukerrerData,
                          [`${urun.urun_kodu}_${urun.parca_tipi}_kg`]: e.target.value
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowMukerrerModal(false)}
                className="flex-1 px-6 py-3 bg-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-400 transition-colors"
              >
                İptal
              </button>
              <button
                onClick={handleMukerrerSave}
                className="flex-1 px-6 py-3 bg-yellow-500 text-white font-medium rounded-lg hover:bg-yellow-600 transition-colors"
              >
                Kaydet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TemizlemePartiTakip;
