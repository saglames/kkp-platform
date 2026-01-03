import React, { useState, useEffect } from 'react';
import { urunRecetesiAPI } from '../../services/api';
import LoadingSpinner from '../Shared/LoadingSpinner';

const SiparisHesaplama = () => {
  const [receteler, setReceteler] = useState([]);
  const [loading, setLoading] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const [selectedUrunKodu, setSelectedUrunKodu] = useState('');
  const [siparisAdet, setSiparisAdet] = useState('');
  const [hesaplama, setHesaplama] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [kayitId, setKayitId] = useState(null);
  const [eslestirmeSonuclari, setEslestirmeSonuclari] = useState(null);
  const [stokDusumYapiliyor, setStokDusumYapiliyor] = useState(false);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    fetchReceteler();
  }, []);

  const fetchReceteler = async () => {
    try {
      setLoading(true);
      const data = await urunRecetesiAPI.getAll();
      setReceteler(data);
    } catch (error) {
      console.error('Reçeteler yüklenirken hata:', error);
      alert('Reçeteler yüklenirken bir hata oluştu!');
    } finally {
      setLoading(false);
    }
  };

  const handleHesapla = async (e) => {
    e.preventDefault();

    if (!selectedUrunKodu || !siparisAdet || siparisAdet <= 0) {
      alert('Lütfen ürün seçin ve geçerli bir sipariş adeti girin!');
      return;
    }

    if (!userName.trim()) {
      alert('Lütfen adınızı girin!');
      return;
    }

    try {
      setCalculating(true);
      const result = await urunRecetesiAPI.hesaplaVeKaydet({
        urun_kodu: selectedUrunKodu,
        siparis_adet: parseInt(siparisAdet),
        hesaplayan: userName.trim()
      });

      setHesaplama(result.hesaplama);
      setKayitId(result.kayit.id);
      setEslestirmeSonuclari(result.eslestirme);
    } catch (error) {
      console.error('Hesaplama hatası:', error);
      alert(error.response?.data?.error || 'Hesaplama yapılırken bir hata oluştu!');
    } finally {
      setCalculating(false);
    }
  };

  const handleStokDusum = async () => {
    if (!kayitId) {
      alert('Hesaplama kaydı bulunamadı!');
      return;
    }

    // Eşleşme kontrolü
    if (eslestirmeSonuclari?.basarisiz && eslestirmeSonuclari.basarisiz.length > 0) {
      alert('Bazı malzemeler stokta bulunamadı. Stok düşümü yapılamaz!\n\n' +
        eslestirmeSonuclari.basarisiz.map(m => `- ${m.malzeme_kodu}: ${m.sebep}`).join('\n'));
      return;
    }

    // Yetersiz stok uyarısı
    if (eslestirmeSonuclari?.yetersiz && eslestirmeSonuclari.yetersiz.length > 0) {
      const uyari = 'Bazı malzemelerde stok yetersiz:\n\n' +
        eslestirmeSonuclari.yetersiz.map(m =>
          `- ${m.malzeme_kodu}: Mevcut ${m.mevcut_miktar}, Gerekli ${m.gerekli_miktar} (Eksik: ${m.eksik_miktar})`
        ).join('\n') +
        '\n\nYine de stok düşümü yapmak istiyor musunuz?';

      if (!window.confirm(uyari)) {
        return;
      }
    }

    // Onay
    if (!window.confirm('Stok düşümü yapılacak. Onaylıyor musunuz?')) {
      return;
    }

    try {
      setStokDusumYapiliyor(true);
      await urunRecetesiAPI.stokDusum(kayitId, { yapan: userName });
      alert('✓ Stok düşümü başarıyla tamamlandı!');
      handleReset();
    } catch (error) {
      console.error('Stok düşümü hatası:', error);
      alert(error.response?.data?.error || 'Stok düşümü yapılırken bir hata oluştu!');
    } finally {
      setStokDusumYapiliyor(false);
    }
  };

  const handleReset = () => {
    setSelectedUrunKodu('');
    setSiparisAdet('');
    setHesaplama(null);
    setSearchTerm('');
    setKayitId(null);
    setEslestirmeSonuclari(null);
  };

  const filteredReceteler = receteler.filter(recete =>
    recete.urun_kodu.toLowerCase().includes(searchTerm.toLowerCase()) ||
    recete.urun_adi.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const groupedMalzemeler = hesaplama?.malzeme_ihtiyaci.reduce((acc, malzeme) => {
    const kategori = malzeme.kategori || 'Diğer';
    if (!acc[kategori]) {
      acc[kategori] = [];
    }
    acc[kategori].push(malzeme);
    return acc;
  }, {});

  if (loading) return <LoadingSpinner />;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Sipariş Hesaplama</h2>

          <form onSubmit={handleHesapla} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Adınız <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Hesaplamayı yapan kişi"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ürün Kodu <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Ürün ara..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-2"
              />
              <select
                value={selectedUrunKodu}
                onChange={(e) => {
                  setSelectedUrunKodu(e.target.value);
                  setSearchTerm('');
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Ürün seçiniz...</option>
                {filteredReceteler.map((recete) => (
                  <option key={recete.id} value={recete.urun_kodu}>
                    {recete.urun_kodu} - {recete.urun_adi}
                    {recete.malzeme_sayisi > 0 && ` (${recete.malzeme_sayisi} malzeme)`}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sipariş Adeti <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={siparisAdet}
                onChange={(e) => setSiparisAdet(e.target.value)}
                min="1"
                placeholder="Örn: 100"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div className="flex space-x-3">
              <button
                type="submit"
                disabled={calculating}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:bg-gray-400"
              >
                {calculating ? 'Hesaplanıyor...' : 'Hesapla'}
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Temizle
              </button>
            </div>
          </form>
        </div>

        {hesaplama && (
          <div className="space-y-6">
            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Sipariş Özeti</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="bg-white rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Ürün Kodu</p>
                  <p className="text-lg font-bold text-gray-800">{hesaplama.urun.urun_kodu}</p>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Sipariş Adeti</p>
                  <p className="text-lg font-bold text-blue-600">{hesaplama.siparis_adet}</p>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Kutu</p>
                  <p className="text-lg font-bold text-purple-600">{hesaplama.kutu_adedi} {hesaplama.urun.kutu_tipi || 'adet'}</p>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Koli Tipi</p>
                  <p className="text-lg font-bold text-gray-800">{hesaplama.urun.koli_tipi || '-'}</p>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Koli Adedi</p>
                  <p className="text-lg font-bold text-green-600">{hesaplama.koli_adedi}</p>
                </div>
              </div>
              <div className="mt-4 bg-white rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Ürün Adı</p>
                <p className="text-base font-medium text-gray-800">{hesaplama.urun.urun_adi}</p>
                <div className="flex gap-4 mt-2 text-sm text-gray-600">
                  {hesaplama.urun.kutu_tipi && (
                    <p>Kutu: {hesaplama.urun.kutu_tipi} (1 ürün = 1 kutu)</p>
                  )}
                  {hesaplama.urun.koli_tipi && (
                    <p>Koli: {hesaplama.urun.koli_tipi} ({hesaplama.urun.koli_kapasitesi} ürün/koli)</p>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-800">Malzeme İhtiyacı</h3>
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Toplam {hesaplama.ozet.toplam_malzeme_tipi} farklı malzeme</span>
                </div>
              </div>

              {groupedMalzemeler && Object.keys(groupedMalzemeler).length > 0 ? (
                <div className="space-y-6">
                  {Object.entries(groupedMalzemeler).map(([kategori, malzemeler]) => (
                    <div key={kategori} className={kategori === 'Paketleme' ? 'bg-purple-50 p-4 rounded-lg border-2 border-purple-200' : ''}>
                      <h4 className={`text-lg font-semibold mb-3 pb-2 border-b ${
                        kategori === 'Paketleme'
                          ? 'text-purple-700 border-purple-300'
                          : 'text-gray-700 border-gray-200'
                      }`}>
                        {kategori === 'null' ? 'Kategori Belirtilmemiş' : kategori}
                        {kategori === 'Paketleme' && (
                          <span className="ml-2 text-sm font-normal text-purple-600">(Otomatik Hesaplanmıştır)</span>
                        )}
                      </h4>
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className={kategori === 'Paketleme' ? 'bg-purple-100' : 'bg-gray-50'}>
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Malzeme Tipi</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kod</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Malzeme Adı</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Birim İhtiyaç</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Toplam İhtiyaç</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Notlar</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {malzemeler.map((malzeme, index) => (
                              <tr key={index} className="hover:bg-gray-50">
                                <td className="px-4 py-3 text-sm font-medium text-gray-900">{malzeme.malzeme_tipi}</td>
                                <td className="px-4 py-3 text-sm font-bold text-blue-600">{malzeme.malzeme_kodu}</td>
                                <td className="px-4 py-3 text-sm text-gray-700">{malzeme.malzeme_adi || '-'}</td>
                                <td className="px-4 py-3 text-sm text-gray-900">
                                  {malzeme.adet} {malzeme.birim}
                                </td>
                                <td className="px-4 py-3 text-sm">
                                  <span className={`font-bold text-base ${
                                    kategori === 'Paketleme' ? 'text-purple-600' : 'text-green-600'
                                  }`}>
                                    {malzeme.toplam_adet} {malzeme.birim}
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-600">{malzeme.notlar || '-'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg">
                  <p className="text-lg">Bu ürün için malzeme bilgisi bulunmuyor</p>
                  <p className="text-sm">Lütfen önce ürün reçetesine malzeme ekleyin</p>
                </div>
              )}

              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-base font-semibold text-gray-700">Genel Toplam:</span>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-green-600">
                        {hesaplama.ozet.toplam_adet} Adet
                      </p>
                      <p className="text-sm text-gray-600">
                        {hesaplama.ozet.toplam_malzeme_tipi} farklı malzeme türü
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Eşleştirme Sonuçları */}
            {eslestirmeSonuclari && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Stok Eşleştirme Sonuçları</h3>

                {/* Başarılı Eşleşmeler */}
                {eslestirmeSonuclari.basarili && eslestirmeSonuclari.basarili.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-green-700 font-semibold mb-2 flex items-center">
                      <span className="mr-2">✓</span>
                      Başarıyla Eşleşen Malzemeler ({eslestirmeSonuclari.basarili.length})
                    </h4>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <table className="min-w-full text-sm">
                        <thead className="bg-green-100">
                          <tr>
                            <th className="px-3 py-2 text-left">Malzeme Kodu</th>
                            <th className="px-3 py-2 text-left">Malzeme Adı</th>
                            <th className="px-3 py-2 text-right">Mevcut Stok</th>
                            <th className="px-3 py-2 text-right">Gerekli Miktar</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-green-100">
                          {eslestirmeSonuclari.basarili.map((m, i) => (
                            <tr key={i}>
                              <td className="px-3 py-2 font-medium">{m.malzeme_kodu}</td>
                              <td className="px-3 py-2">{m.malzeme_adi}</td>
                              <td className="px-3 py-2 text-right text-green-600 font-bold">{m.mevcut_miktar}</td>
                              <td className="px-3 py-2 text-right">{m.gerekli_miktar}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Yetersiz Stoklar */}
                {eslestirmeSonuclari.yetersiz && eslestirmeSonuclari.yetersiz.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-orange-700 font-semibold mb-2 flex items-center">
                      <span className="mr-2">⚠</span>
                      Yetersiz Stoklar ({eslestirmeSonuclari.yetersiz.length})
                    </h4>
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                      <table className="min-w-full text-sm">
                        <thead className="bg-orange-100">
                          <tr>
                            <th className="px-3 py-2 text-left">Malzeme Kodu</th>
                            <th className="px-3 py-2 text-left">Malzeme Adı</th>
                            <th className="px-3 py-2 text-right">Mevcut Stok</th>
                            <th className="px-3 py-2 text-right">Gerekli Miktar</th>
                            <th className="px-3 py-2 text-right">Eksik</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-orange-100">
                          {eslestirmeSonuclari.yetersiz.map((m, i) => (
                            <tr key={i}>
                              <td className="px-3 py-2 font-medium">{m.malzeme_kodu}</td>
                              <td className="px-3 py-2">{m.malzeme_adi}</td>
                              <td className="px-3 py-2 text-right text-orange-600">{m.mevcut_miktar}</td>
                              <td className="px-3 py-2 text-right">{m.gerekli_miktar}</td>
                              <td className="px-3 py-2 text-right text-red-600 font-bold">{m.eksik_miktar}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Bulunamayan Malzemeler */}
                {eslestirmeSonuclari.basarisiz && eslestirmeSonuclari.basarisiz.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-red-700 font-semibold mb-2 flex items-center">
                      <span className="mr-2">✗</span>
                      Stokta Bulunamayan Malzemeler ({eslestirmeSonuclari.basarisiz.length})
                    </h4>
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <table className="min-w-full text-sm">
                        <thead className="bg-red-100">
                          <tr>
                            <th className="px-3 py-2 text-left">Malzeme Kodu</th>
                            <th className="px-3 py-2 text-left">Malzeme Adı</th>
                            <th className="px-3 py-2 text-left">Sebep</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-red-100">
                          {eslestirmeSonuclari.basarisiz.map((m, i) => (
                            <tr key={i}>
                              <td className="px-3 py-2 font-medium">{m.malzeme_kodu}</td>
                              <td className="px-3 py-2">{m.malzeme_adi}</td>
                              <td className="px-3 py-2 text-red-600">{m.sebep}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Stok Düşüm Butonu */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  {eslestirmeSonuclari.basarisiz && eslestirmeSonuclari.basarisiz.length > 0 ? (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <p className="text-red-700 font-medium">
                        ⚠ Bazı malzemeler stokta bulunamadığı için stok düşümü yapılamaz.
                      </p>
                    </div>
                  ) : (
                    <button
                      onClick={handleStokDusum}
                      disabled={stokDusumYapiliyor}
                      className="w-full bg-green-600 hover:bg-green-700 text-white px-6 py-4 rounded-lg font-medium text-lg transition-colors disabled:bg-gray-400"
                    >
                      {stokDusumYapiliyor ? 'Stok Düşümü Yapılıyor...' : '✓ Stoktan Düş'}
                    </button>
                  )}
                </div>
              </div>
            )}

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start">
                <span className="text-yellow-600 mr-2 text-xl">💡</span>
                <div>
                  <p className="font-medium text-gray-800 mb-1">Dikkat:</p>
                  <p className="text-sm text-gray-700">
                    Bu hesaplama, ürün reçetesindeki malzeme bilgilerine göre yapılmıştır.
                    Hesaplama kaydedildi ve stok eşleştirmesi yapıldı.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {!hesaplama && (
          <div className="bg-white rounded-lg shadow-md p-12 text-center text-gray-500">
            <p className="text-lg mb-2">Sipariş hesaplaması yapmak için</p>
            <p className="text-sm">Yukarıdaki formdan ürün seçin ve sipariş adeti girin</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SiparisHesaplama;
