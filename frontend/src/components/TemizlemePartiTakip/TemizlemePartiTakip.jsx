import React, { useState, useEffect } from 'react';
import { partiTakipAPI } from '../../services/api';

const TemizlemePartiTakip = () => {
  const [partiler, setPartiler] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log('Component yüklendi');
    fetchPartiler();
  }, []);

  const fetchPartiler = async () => {
    console.log('fetchPartiler başladı');
    setLoading(true);
    setError(null);

    try {
      console.log('API çağrısı yapılıyor...');
      const data = await partiTakipAPI.getPartiler();
      console.log('API yanıtı:', data);
      setPartiler(data || []);
    } catch (err) {
      console.error('Hata oluştu:', err);
      setError(err.message || 'Bir hata oluştu');
    } finally {
      console.log('Loading false yapılıyor');
      setLoading(false);
    }
  };

  console.log('Render - loading:', loading, 'error:', error, 'partiler:', partiler.length);

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
        <p className="text-gray-600">Yükleniyor...</p>
        <p className="text-sm text-gray-500 mt-2">Parti verileri getiriliyor</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Temizleme Parti Takip</h2>
        </div>
        <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center mb-4">
            <span className="text-red-600 font-semibold mr-2">⚠️ Hata:</span>
            <span className="text-red-700">{error}</span>
          </div>
          <button
            onClick={fetchPartiler}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Tekrar Dene
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Temizleme Parti/İrsaliye Takip</h2>
        <p className="text-gray-600">Temizlemeye gönderilen partilerin detaylı takibi</p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        {partiler.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xl text-gray-500 mb-4">Henüz parti kaydı bulunmuyor.</p>
            <p className="text-gray-600">
              Parti oluşturmak için "Tüm Süreç → Temizlemeye Gidecek" bölümünden ürün gönderin.
            </p>
            <button
              onClick={fetchPartiler}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Yenile
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-blue-500 to-blue-600">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">Parti No</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">İrsaliye No</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">Tarih</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-white">Toplam Adet</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-white">Toplam Kg</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-white">Durum</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {partiler.map((parti) => (
                  <tr key={parti.parti_no} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-lg font-bold text-blue-600">{parti.parti_no}</span>
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
                      {parseFloat(parti.toplam_kg || 0).toFixed(2)} kg
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                        parti.durum === 'gonderildi' ? 'bg-blue-100 text-blue-800' :
                        parti.durum === 'geldi' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {parti.durum === 'gonderildi' ? 'Gönderildi' :
                         parti.durum === 'geldi' ? 'Geldi' : parti.durum}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default TemizlemePartiTakip;
