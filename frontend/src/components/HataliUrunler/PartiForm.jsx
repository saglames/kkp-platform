import React, { useState } from 'react';
import { URUN_LISTESI, HATA_TIPLERI } from '../../constants/urunler';

const PartiForm = ({ partiNo, aktifVeri, onHataSayisiDegistir }) => {
  const [aramaMetni, setAramaMetni] = useState('');
  const [filtreliHataTipi, setFiltreliHataTipi] = useState('');
  const [sadecHatalilar, setSadecHatalilar] = useState(false);

  if (!partiNo) {
    return (
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg shadow-md p-16 text-center border-2 border-dashed border-blue-300">
        <div className="text-6xl mb-4">📋</div>
        <p className="text-gray-600 text-2xl font-medium">
          Lütfen önce Parti No girin
        </p>
      </div>
    );
  }

  // Filtreleme
  const filtreliUrunler = URUN_LISTESI.filter(urun => {
    const aramaEslesmesi = urun.toLowerCase().includes(aramaMetni.toLowerCase());

    if (!aramaEslesmesi) return false;

    const urunVeri = aktifVeri[urun] || {};

    // Sadece hatalı ürünleri göster filtresi
    if (sadecHatalilar) {
      const toplamHata = HATA_TIPLERI.reduce((acc, hata) => acc + (urunVeri[hata.key] || 0), 0);
      if (toplamHata === 0) return false;
    }

    // Belirli hata tipi filtresi
    if (filtreliHataTipi) {
      const hataMiktari = urunVeri[filtreliHataTipi] || 0;
      return hataMiktari > 0;
    }

    return true;
  });

  const getToplamHataSayisi = (urunKodu) => {
    const urunVeri = aktifVeri[urunKodu] || {};
    let toplam = 0;
    HATA_TIPLERI.forEach(hata => {
      toplam += (urunVeri[hata.key] || 0);
    });
    return toplam;
  };

  // Genel istatistikler
  const toplamHataliUrun = Object.keys(aktifVeri).filter(kod => getToplamHataSayisi(kod) > 0).length;
  const genelToplamHata = Object.keys(aktifVeri).reduce((acc, kod) => acc + getToplamHataSayisi(kod), 0);

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      {/* Header ve İstatistikler */}
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-bold text-gray-800">Hata Giriş Formu</h3>

        {/* İstatistik Kartları */}
        <div className="flex gap-4">
          <div className="bg-orange-50 px-5 py-3 rounded-lg border border-orange-200">
            <div className="text-xs text-orange-600 font-medium">Hatalı Ürün Sayısı</div>
            <div className="text-2xl font-bold text-orange-700">{toplamHataliUrun}</div>
          </div>
          <div className="bg-red-50 px-5 py-3 rounded-lg border border-red-200">
            <div className="text-xs text-red-600 font-medium">Toplam Hata</div>
            <div className="text-2xl font-bold text-red-700">{genelToplamHata}</div>
          </div>
        </div>
      </div>

      {/* Filtreleme */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            🔍 Ürün Ara
          </label>
          <input
            type="text"
            placeholder="Ürün kodu ara..."
            value={aramaMetni}
            onChange={(e) => setAramaMetni(e.target.value)}
            className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            🔧 Hata Tipi
          </label>
          <select
            value={filtreliHataTipi}
            onChange={(e) => setFiltreliHataTipi(e.target.value)}
            className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tüm Hatalar</option>
            {HATA_TIPLERI.map(hata => (
              <option key={hata.key} value={hata.key}>
                {hata.label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-end">
          <label className="flex items-center cursor-pointer bg-white px-4 py-3 rounded-lg border border-gray-300 w-full hover:bg-gray-50">
            <input
              type="checkbox"
              checked={sadecHatalilar}
              onChange={(e) => setSadecHatalilar(e.target.checked)}
              className="w-5 h-5 text-blue-600 rounded mr-3"
            />
            <span className="text-base font-medium text-gray-700">Sadece Hatalılar</span>
          </label>
        </div>
        <div className="flex items-end">
          <button
            onClick={() => {
              setAramaMetni('');
              setFiltreliHataTipi('');
              setSadecHatalilar(false);
            }}
            className="w-full px-4 py-3 bg-gray-600 hover:bg-gray-700 text-white text-base rounded-lg font-medium transition-colors"
          >
            🔄 Filtreyi Temizle
          </button>
        </div>
      </div>

      {/* Tablo */}
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gradient-to-r from-blue-100 to-indigo-100 sticky top-0 z-10">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase sticky left-0 bg-blue-100 z-20 shadow-sm">
                Ürün Kodu
              </th>
              {HATA_TIPLERI.map(hata => (
                <th key={hata.key} className="px-4 py-4 text-center text-xs font-bold text-gray-700 uppercase min-w-[140px]">
                  {hata.label}
                </th>
              ))}
              <th className="px-6 py-4 text-center text-sm font-bold text-gray-700 uppercase bg-red-200 min-w-[100px]">
                Toplam
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filtreliUrunler.length === 0 ? (
              <tr>
                <td colSpan={HATA_TIPLERI.length + 2} className="px-6 py-16 text-center text-gray-500 text-lg">
                  <div className="text-5xl mb-3">🔍</div>
                  {aramaMetni || filtreliHataTipi || sadecHatalilar ? 'Filtreye uygun ürün bulunamadı' : 'Ürün bulunamadı'}
                </td>
              </tr>
            ) : (
              filtreliUrunler.map((urun) => {
                const urunVeri = aktifVeri[urun] || {};
                const toplamHata = getToplamHataSayisi(urun);

                return (
                  <tr key={urun} className={`transition-colors ${
                    toplamHata > 10 ? 'bg-red-100 hover:bg-red-200' :
                    toplamHata > 0 ? 'bg-yellow-50 hover:bg-yellow-100' :
                    'hover:bg-gray-50'
                  }`}>
                    <td className="px-6 py-4 text-base font-bold text-gray-900 sticky left-0 bg-inherit shadow-sm">
                      {urun}
                      {toplamHata > 0 && (
                        <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-red-600 text-white">
                          {toplamHata}
                        </span>
                      )}
                    </td>
                    {HATA_TIPLERI.map(hata => {
                      const deger = urunVeri[hata.key] || 0;
                      return (
                        <td key={hata.key} className="px-4 py-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => onHataSayisiDegistir(urun, hata.key, -1)}
                              disabled={deger === 0}
                              className="w-10 h-10 bg-red-500 hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-bold text-xl transition-colors shadow-sm"
                              title="Azalt"
                            >
                              −
                            </button>
                            <span className={`w-14 text-center font-bold text-lg ${
                              deger > 10 ? 'text-red-700' :
                              deger > 5 ? 'text-orange-600' :
                              deger > 0 ? 'text-yellow-600' : 'text-gray-400'
                            }`}>
                              {deger}
                            </span>
                            <button
                              onClick={() => onHataSayisiDegistir(urun, hata.key, 1)}
                              className="w-10 h-10 bg-green-500 hover:bg-green-600 text-white rounded-lg font-bold text-xl transition-colors shadow-sm"
                              title="Artır"
                            >
                              +
                            </button>
                          </div>
                        </td>
                      );
                    })}
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center justify-center min-w-[60px] px-4 py-2 rounded-lg text-xl font-bold shadow-sm ${
                        toplamHata > 10 ? 'bg-red-600 text-white' :
                        toplamHata > 5 ? 'bg-orange-500 text-white' :
                        toplamHata > 0 ? 'bg-yellow-500 text-white' : 'bg-gray-200 text-gray-600'
                      }`}>
                        {toplamHata}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex justify-between items-center text-base">
          <span className="text-gray-700">
            Gösterilen: <strong className="text-blue-600">{filtreliUrunler.length}</strong> / {URUN_LISTESI.length} ürün
          </span>
          <span className="text-gray-700">
            Hatalı Ürün: <strong className="text-orange-600">{toplamHataliUrun}</strong> |
            Toplam Hata: <strong className="text-red-600">{genelToplamHata}</strong>
          </span>
        </div>
      </div>
    </div>
  );
};

export default PartiForm;
