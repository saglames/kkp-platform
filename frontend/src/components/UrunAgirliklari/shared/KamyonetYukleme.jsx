import React, { useState, useEffect } from 'react';

// Kamyonet Yükleme Hesaplayıcı - Koli bazlı (Akıllı Hesaplama)
const KamyonetYukleme = ({ hesaplamaResult }) => {
  // Koli tipleri, ölçüleri ve ürün eşleşmeleri
  const koliTipleri = [
    {
      kod: 'B1',
      olculer: { uzunluk: 70, genislik: 46, yukseklik: 28 },
      urunler: [
        { kod: 'DIS-22-1GAT', adet: 35 },
        { kod: 'FQ01B/A', adet: 20 }
      ]
    },
    {
      kod: 'B2',
      olculer: { uzunluk: 56.5, genislik: 34.4, yukseklik: 38.2 },
      urunler: [
        { kod: 'DIS-180-1GAT', adet: 20 },
        { kod: 'FQG-04NaA', adet: 20 },
        { kod: 'HZG-20B', adet: 10 },
        { kod: 'KHRQ22M20T', adet: 10 },
        { kod: 'MXJ-YA2512M/R', adet: 10 },
        { kod: 'FQG-B730A-Y', adet: 10 }
      ]
    },
    {
      kod: 'B3',
      olculer: { uzunluk: 68.5, genislik: 45.5, yukseklik: 32 },
      urunler: [
        { kod: 'MXJ-YA1509M-R1', adet: 20 },
        { kod: 'FQG-335A-Y', adet: 20 },
        { kod: 'FQG-335A', adet: 20 },
        { kod: 'FQG-B506A-Y', adet: 20 }
      ]
    },
    {
      kod: 'B4',
      olculer: { uzunluk: 68.5, genislik: 36, yukseklik: 35 },
      urunler: [
        { kod: 'FQG-B506 GRİ', adet: 15 },
        { kod: 'FQG-B730 GRİ', adet: 15 }
      ]
    },
    {
      kod: 'B5',
      olculer: { uzunluk: 61, genislik: 28, yukseklik: 40 },
      urunler: [
        { kod: 'FQG-B1350A', adet: 5 }
      ]
    },
    {
      kod: 'B6',
      olculer: { uzunluk: 59.5, genislik: 41.5, yukseklik: 30 },
      urunler: [
        { kod: 'HZG-30B', adet: 6 }
      ]
    },
    {
      kod: 'B7',
      olculer: { uzunluk: 38.5, genislik: 26.5, yukseklik: 22 },
      urunler: [] // Fittings için
    },
    {
      kod: 'B8',
      olculer: { uzunluk: 65.5, genislik: 38, yukseklik: 41 },
      urunler: [
        { kod: 'MXJ-YA2815M/R', adet: 10 },
        { kod: 'DIS-371-2GAT', adet: 16 }
      ]
    },
    {
      kod: 'B9',
      olculer: { uzunluk: 72, genislik: 36, yukseklik: 38 },
      urunler: []
    }
  ];

  // Kamyonet tipleri ve kasası ölçüleri (cm cinsinden)
  const kamyonetTipleri = [
    {
      tip: 'Küçük Kamyonet',
      kasa: { uzunluk: 210, genislik: 150, yukseklik: 150 },
      maxAgirlik: 1000, // kg
      renk: 'bg-blue-500'
    },
    {
      tip: 'Orta Kamyonet',
      kasa: { uzunluk: 320, genislik: 180, yukseklik: 180 },
      maxAgirlik: 1500,
      renk: 'bg-green-500'
    },
    {
      tip: 'Büyük Kamyonet',
      kasa: { uzunluk: 420, genislik: 200, yukseklik: 200 },
      maxAgirlik: 2500,
      renk: 'bg-purple-500'
    },
    {
      tip: 'Kamyon',
      kasa: { uzunluk: 620, genislik: 240, yukseklik: 240 },
      maxAgirlik: 5000,
      renk: 'bg-orange-500'
    },
  ];

  const [selectedKamyonet, setSelectedKamyonet] = useState(kamyonetTipleri[0]);
  const [koliAdedi, setKoliAdedi] = useState(
    koliTipleri.reduce((acc, koli) => ({ ...acc, [koli.kod]: 0 }), {})
  );

  // Palet adetleri
  const [palet100x100, setPalet100x100] = useState(0);
  const [palet100x120, setPalet100x120] = useState(0);

  // Otomatik hesaplama: Hesaplama sonucuna göre koli sayısını güncelle
  useEffect(() => {
    if (hesaplamaResult && hesaplamaResult.urun_kodu && hesaplamaResult.adet) {
      const urunKodu = hesaplamaResult.urun_kodu;
      const hesaplananAdet = hesaplamaResult.adet;

      // Hangi kolide bu ürün var?
      const eslesenKoli = koliTipleri.find(koli =>
        koli.urunler.some(urun => urun.kod === urunKodu)
      );

      if (eslesenKoli) {
        // Bu üründen bir koliye kaç adet giriyor?
        const urunBilgisi = eslesenKoli.urunler.find(u => u.kod === urunKodu);
        const koliBasinaAdet = urunBilgisi.adet;

        // Kaç koli gerekiyor?
        const gerekliKoli = Math.ceil(hesaplananAdet / koliBasinaAdet);

        // Koli sayısını güncelle
        setKoliAdedi(prev => ({ ...prev, [eslesenKoli.kod]: gerekliKoli }));
      }
    }
  }, [hesaplamaResult]);

  // Hacim hesaplama (m³)
  const calculateVolume = (olculer) => {
    return (olculer.uzunluk * olculer.genislik * olculer.yukseklik) / 1000000; // cm³ to m³
  };

  // Toplam hacim hesaplama
  const calculateTotalVolume = () => {
    let totalVolume = koliTipleri.reduce((total, koli) => {
      const adet = koliAdedi[koli.kod] || 0;
      return total + (calculateVolume(koli.olculer) * adet);
    }, 0);

    // Palet hacimlerini ekle (100x100x14 cm ve 100x120x14 cm)
    totalVolume += calculateVolume({ uzunluk: 100, genislik: 100, yukseklik: 14 }) * palet100x100;
    totalVolume += calculateVolume({ uzunluk: 100, genislik: 120, yukseklik: 14 }) * palet100x120;

    return totalVolume;
  };

  // Kamyonet hacmi
  const kamyonetHacim = calculateVolume(selectedKamyonet.kasa);

  // Doluluk yüzdesi
  const doluOran = (calculateTotalVolume() / kamyonetHacim) * 100;

  // Renk kodlama
  const getDoluColor = () => {
    if (doluOran < 70) return 'bg-green-500';
    if (doluOran < 90) return 'bg-yellow-500';
    if (doluOran <= 100) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const handleKoliChange = (koliKod, value) => {
    const num = parseInt(value) || 0;
    setKoliAdedi(prev => ({ ...prev, [koliKod]: num }));
  };

  const handleClear = () => {
    setKoliAdedi(koliTipleri.reduce((acc, koli) => ({ ...acc, [koli.kod]: 0 }), {}));
    setPalet100x100(0);
    setPalet100x120(0);
  };

  const toplamKoli = Object.values(koliAdedi).reduce((a, b) => a + b, 0);
  const toplamPalet = palet100x100 + palet100x120;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-800 mb-2">🚚 Kamyonet Yükleme Hesaplayıcı</h3>
        <p className="text-sm text-gray-600">Kolilerinizi kamyonete nasıl yerleştireceğinizi hesaplayın</p>
      </div>

      {/* Kamyonet Seçimi */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Araç Tipi</label>
        <div className="grid grid-cols-2 gap-2">
          {kamyonetTipleri.map((k) => (
            <button
              key={k.tip}
              onClick={() => setSelectedKamyonet(k)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                selectedKamyonet.tip === k.tip
                  ? `${k.renk} text-white shadow-lg`
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {k.tip}
              <div className="text-xs mt-1">
                {k.kasa.uzunluk}x{k.kasa.genislik}x{k.kasa.yukseklik} cm
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Koli Adetleri */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-medium text-gray-700">Koli Adetleri</label>
          <button
            onClick={handleClear}
            className="text-xs px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-gray-700"
          >
            Temizle
          </button>
        </div>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {koliTipleri.map((koli) => {
            const icerik = koli.urunler.map(u => `${u.kod} (${u.adet})`).join(', ') || 'Fittings';
            return (
              <div key={koli.kod} className="flex items-center gap-2 bg-gray-50 p-2 rounded">
                <div className="flex-1">
                  <div className="font-medium text-sm text-gray-800">{koli.kod}</div>
                  <div className="text-xs text-gray-500">
                    {koli.olculer.uzunluk}x{koli.olculer.genislik}x{koli.olculer.yukseklik} cm
                  </div>
                  <div className="text-xs text-blue-600 mt-1">{icerik}</div>
                </div>
                <input
                  type="number"
                  min="0"
                  value={koliAdedi[koli.kod]}
                  onChange={(e) => handleKoliChange(koli.kod, e.target.value)}
                  className="w-20 px-2 py-1 border rounded text-center"
                  placeholder="0"
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Palet Adetleri */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Palet Adetleri</label>
        <div className="space-y-2">
          <div className="flex items-center gap-2 bg-amber-50 p-2 rounded">
            <div className="flex-1">
              <div className="font-medium text-sm text-gray-800">100x100 cm Palet</div>
              <div className="text-xs text-gray-500">100x100x14 cm</div>
            </div>
            <input
              type="number"
              min="0"
              value={palet100x100}
              onChange={(e) => setPalet100x100(parseInt(e.target.value) || 0)}
              className="w-20 px-2 py-1 border rounded text-center"
              placeholder="0"
            />
          </div>
          <div className="flex items-center gap-2 bg-amber-50 p-2 rounded">
            <div className="flex-1">
              <div className="font-medium text-sm text-gray-800">100x120 cm Palet</div>
              <div className="text-xs text-gray-500">100x120x14 cm</div>
            </div>
            <input
              type="number"
              min="0"
              value={palet100x120}
              onChange={(e) => setPalet100x120(parseInt(e.target.value) || 0)}
              className="w-20 px-2 py-1 border rounded text-center"
              placeholder="0"
            />
          </div>
        </div>
      </div>

      {/* Sonuçlar */}
      <div className="border-t pt-4">
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Toplam Koli:</span>
            <span className="text-lg font-bold text-gray-900">{toplamKoli} adet</span>
          </div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Toplam Palet:</span>
            <span className="text-lg font-bold text-amber-700">{toplamPalet} adet</span>
          </div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Kullanılan Hacim:</span>
            <span className="text-lg font-bold text-gray-900">{calculateTotalVolume().toFixed(3)} m³</span>
          </div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Kamyonet Hacmi:</span>
            <span className="text-lg font-bold text-gray-900">{kamyonetHacim.toFixed(3)} m³</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">Kalan Hacim:</span>
            <span className="text-lg font-bold text-gray-900">
              {(kamyonetHacim - calculateTotalVolume()).toFixed(3)} m³
            </span>
          </div>
        </div>

        {/* Doluluk Göstergesi */}
        <div className="mb-3">
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm font-medium text-gray-700">Doluluk Oranı</span>
            <span className={`text-lg font-bold ${
              doluOran > 100 ? 'text-red-600' : 'text-gray-900'
            }`}>
              {doluOran.toFixed(1)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-6 overflow-hidden">
            <div
              className={`h-full ${getDoluColor()} transition-all duration-500 flex items-center justify-center text-white text-xs font-bold`}
              style={{ width: `${Math.min(doluOran, 100)}%` }}
            >
              {doluOran > 10 && `${doluOran.toFixed(0)}%`}
            </div>
          </div>
        </div>

        {/* Uyarılar */}
        {doluOran > 100 && (
          <div className="bg-red-50 border border-red-200 rounded p-3 mb-3">
            <div className="flex items-start gap-2">
              <span className="text-xl">⚠️</span>
              <div>
                <p className="text-sm font-medium text-red-800">Hacim Aşımı!</p>
                <p className="text-xs text-red-700">
                  Koliler kamyonete sığmayacak. Daha büyük araç seçin veya koli sayısını azaltın.
                </p>
              </div>
            </div>
          </div>
        )}

        {doluOran >= 90 && doluOran <= 100 && (
          <div className="bg-orange-50 border border-orange-200 rounded p-3 mb-3">
            <div className="flex items-start gap-2">
              <span className="text-xl">⚡</span>
              <div>
                <p className="text-sm font-medium text-orange-800">Neredeyse Dolu!</p>
                <p className="text-xs text-orange-700">
                  Kamyonet %{doluOran.toFixed(0)} dolu. Dikkatli yükleme yapın.
                </p>
              </div>
            </div>
          </div>
        )}

        {doluOran > 0 && doluOran < 50 && (
          <div className="bg-blue-50 border border-blue-200 rounded p-3">
            <div className="flex items-start gap-2">
              <span className="text-xl">💡</span>
              <div>
                <p className="text-sm font-medium text-blue-800">Verimli Değil</p>
                <p className="text-xs text-blue-700">
                  Kamyonet sadece %{doluOran.toFixed(0)} dolu. Daha fazla koli ekleyebilir veya daha küçük araç seçebilirsiniz.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default KamyonetYukleme;
