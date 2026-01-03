import React, { useState } from 'react';
import { hataliUrunlerAPI } from '../../services/api';
import { HATA_TIPLERI } from '../../constants/urunler';
import * as XLSX from 'xlsx';

const GecmisPartiler = ({ gecmisPartiler, onRefresh }) => {
  const [filtre, setFiltre] = useState({
    parti_no: '',
    baslangic_tarihi: '',
    bitis_tarihi: ''
  });
  const [detayGoster, setDetayGoster] = useState(null);
  const [siralamaKriteri, setSiralamaKriteri] = useState('tarih_desc'); // tarih_desc, tarih_asc, hata_desc, hata_asc

  const handleFiltrele = async () => {
    try {
      await hataliUrunlerAPI.filtrele(filtre);
      onRefresh();
    } catch (error) {
      console.error('Filtreleme hatası:', error);
      alert('Filtreleme sırasında bir hata oluştu!');
    }
  };

  const handleSil = async (id) => {
    const onay = window.confirm('Bu kayıt silinecek. Emin misiniz?');
    if (!onay) return;

    try {
      await hataliUrunlerAPI.deleteGecmis(id);
      alert('Kayıt silindi!');
      onRefresh();
    } catch (error) {
      console.error('Silme hatası:', error);
      alert('Silme sırasında bir hata oluştu!');
    }
  };

  const exportToExcel = (parti) => {
    try {
      // veriler zaten object olabilir veya string olabilir
      const veriler = typeof parti.veriler === 'string'
        ? JSON.parse(parti.veriler)
        : parti.veriler;

      // Excel için veri hazırlama
      const excelData = veriler.map(item => {
        const row = {
          'Ürün Kodu': item.urun_kodu
        };

        HATA_TIPLERI.forEach(hata => {
          row[hata.label] = item[hata.key] || 0;
        });

        // Toplam hesapla
        let toplam = 0;
        HATA_TIPLERI.forEach(hata => {
          toplam += (item[hata.key] || 0);
        });
        row['Toplam'] = toplam;

        return row;
      });

      // Başlık bilgileri
      const baslik = [
        { 'Ürün Kodu': `Parti No: ${parti.parti_no}` },
        { 'Ürün Kodu': `Kayıt Tarihi: ${new Date(parti.kayit_tarihi).toLocaleString('tr-TR')}` },
        { 'Ürün Kodu': `Kayıt Yapan: ${parti.kayit_yapan || '-'}` },
        { 'Ürün Kodu': `Toplam Hata: ${parti.toplam_hata}` },
        {}
      ];

      const worksheet = XLSX.utils.json_to_sheet(baslik, { skipHeader: true });
      XLSX.utils.sheet_add_json(worksheet, excelData, { origin: -1 });

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Hatalı Ürünler');

      XLSX.writeFile(workbook, `Hatali_Urunler_${parti.parti_no}_${Date.now()}.xlsx`);
    } catch (error) {
      console.error('Excel export hatası:', error);
      alert('Excel oluşturulurken bir hata oluştu!');
    }
  };

  const formatTarih = (tarih) => {
    return new Date(tarih).toLocaleString('tr-TR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // İstatistikleri hesapla
  const hesaplaIstatistikler = () => {
    const toplamParti = gecmisPartiler.length;
    const toplamHata = gecmisPartiler.reduce((acc, parti) => acc + parti.toplam_hata, 0);
    const ortalamaHata = toplamParti > 0 ? (toplamHata / toplamParti).toFixed(1) : 0;
    const enCokHata = toplamParti > 0 ? Math.max(...gecmisPartiler.map(p => p.toplam_hata)) : 0;

    return { toplamParti, toplamHata, ortalamaHata, enCokHata };
  };

  // Sıralama
  const siraliPartiler = [...gecmisPartiler].sort((a, b) => {
    switch (siralamaKriteri) {
      case 'tarih_desc':
        return new Date(b.kayit_tarihi) - new Date(a.kayit_tarihi);
      case 'tarih_asc':
        return new Date(a.kayit_tarihi) - new Date(b.kayit_tarihi);
      case 'hata_desc':
        return b.toplam_hata - a.toplam_hata;
      case 'hata_asc':
        return a.toplam_hata - b.toplam_hata;
      default:
        return 0;
    }
  });

  const stats = hesaplaIstatistikler();

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-bold text-gray-800">Tamamlanan Partiler</h3>

        {/* İstatistik Kartları */}
        <div className="flex gap-4">
          <div className="bg-blue-50 px-4 py-2 rounded-lg border border-blue-200">
            <div className="text-xs text-blue-600 font-medium">Toplam Parti</div>
            <div className="text-2xl font-bold text-blue-700">{stats.toplamParti}</div>
          </div>
          <div className="bg-red-50 px-4 py-2 rounded-lg border border-red-200">
            <div className="text-xs text-red-600 font-medium">Toplam Hata</div>
            <div className="text-2xl font-bold text-red-700">{stats.toplamHata}</div>
          </div>
          <div className="bg-orange-50 px-4 py-2 rounded-lg border border-orange-200">
            <div className="text-xs text-orange-600 font-medium">Ortalama Hata</div>
            <div className="text-2xl font-bold text-orange-700">{stats.ortalamaHata}</div>
          </div>
          <div className="bg-purple-50 px-4 py-2 rounded-lg border border-purple-200">
            <div className="text-xs text-purple-600 font-medium">En Çok Hata</div>
            <div className="text-2xl font-bold text-purple-700">{stats.enCokHata}</div>
          </div>
        </div>
      </div>

      {/* Filtreleme */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Parti No
          </label>
          <input
            type="text"
            value={filtre.parti_no}
            onChange={(e) => setFiltre({ ...filtre, parti_no: e.target.value })}
            placeholder="Parti ara..."
            className="w-full px-4 py-2 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Başlangıç Tarihi
          </label>
          <input
            type="date"
            value={filtre.baslangic_tarihi}
            onChange={(e) => setFiltre({ ...filtre, baslangic_tarihi: e.target.value })}
            className="w-full px-4 py-2 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Bitiş Tarihi
          </label>
          <input
            type="date"
            value={filtre.bitis_tarihi}
            onChange={(e) => setFiltre({ ...filtre, bitis_tarihi: e.target.value })}
            className="w-full px-4 py-2 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sıralama
          </label>
          <select
            value={siralamaKriteri}
            onChange={(e) => setSiralamaKriteri(e.target.value)}
            className="w-full px-4 py-2 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="tarih_desc">Tarih (Yeni → Eski)</option>
            <option value="tarih_asc">Tarih (Eski → Yeni)</option>
            <option value="hata_desc">Hata (Çok → Az)</option>
            <option value="hata_asc">Hata (Az → Çok)</option>
          </select>
        </div>

        <div className="flex items-end">
          <button
            onClick={handleFiltrele}
            className="w-full px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-base rounded-lg font-medium transition-colors shadow-sm"
          >
            🔍 Filtrele
          </button>
        </div>
      </div>

      {/* Liste */}
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gradient-to-r from-gray-100 to-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase">Parti No</th>
              <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase">Kayıt Tarihi</th>
              <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase">Kayıt Yapan</th>
              <th className="px-6 py-4 text-center text-sm font-bold text-gray-700 uppercase">Toplam Hata</th>
              <th className="px-6 py-4 text-center text-sm font-bold text-gray-700 uppercase">İşlemler</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {siraliPartiler.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-12 text-center text-gray-500 text-lg">
                  📦 Henüz kaydedilmiş parti bulunmuyor
                </td>
              </tr>
            ) : (
              siraliPartiler.map((parti) => (
                <React.Fragment key={parti.id}>
                  <tr className="hover:bg-blue-50 transition-colors">
                    <td className="px-6 py-4 text-base font-bold text-gray-900">{parti.parti_no}</td>
                    <td className="px-6 py-4 text-base text-gray-600">{formatTarih(parti.kayit_tarihi)}</td>
                    <td className="px-6 py-4 text-base text-gray-600">
                      <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-800 font-medium">
                        👤 {parti.kayit_yapan || '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center justify-center w-20 h-12 rounded-lg font-bold text-xl ${
                        parti.toplam_hata > 100 ? 'bg-red-100 text-red-700 border-2 border-red-300' :
                        parti.toplam_hata > 50 ? 'bg-orange-100 text-orange-700 border-2 border-orange-300' :
                        'bg-yellow-100 text-yellow-700 border-2 border-yellow-300'
                      }`}>
                        {parti.toplam_hata}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => setDetayGoster(detayGoster === parti.id ? null : parti.id)}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-base rounded-lg font-medium transition-colors shadow-sm"
                        >
                          {detayGoster === parti.id ? '👁️ Gizle' : '👁️ Detay'}
                        </button>
                        <button
                          onClick={() => exportToExcel(parti)}
                          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-base rounded-lg font-medium transition-colors shadow-sm"
                        >
                          📊 Excel
                        </button>
                        <button
                          onClick={() => handleSil(parti.id)}
                          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-base rounded-lg font-medium transition-colors shadow-sm"
                        >
                          🗑️ Sil
                        </button>
                      </div>
                    </td>
                  </tr>
                  {detayGoster === parti.id && (
                    <tr>
                      <td colSpan="5" className="px-6 py-6 bg-gradient-to-br from-gray-50 to-blue-50">
                        <DetayTablosu veriler={typeof parti.veriler === 'string' ? JSON.parse(parti.veriler) : parti.veriler} />
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 text-base text-gray-600 flex justify-between items-center">
        <span>
          Toplam <strong className="text-blue-600">{siraliPartiler.length}</strong> parti kaydı
        </span>
        <span className="text-sm text-gray-500">
          Son güncelleme: {new Date().toLocaleString('tr-TR')}
        </span>
      </div>
    </div>
  );
};

// Detay Tablosu Component - Geliştirilmiş
const DetayTablosu = ({ veriler }) => {
  const [aramaMetni, setAramaMetni] = useState('');
  const [seciliHataTipi, setSeciliHataTipi] = useState('');

  // Sadece hatalı ürünleri filtrele
  const hataliUrunler = veriler.filter(item => {
    let toplamHata = 0;
    HATA_TIPLERI.forEach(hata => {
      toplamHata += (item[hata.key] || 0);
    });

    const aramaEslesmesi = aramaMetni === '' || item.urun_kodu.toLowerCase().includes(aramaMetni.toLowerCase());
    const hataEslesmesi = seciliHataTipi === '' || (item[seciliHataTipi] || 0) > 0;

    return toplamHata > 0 && aramaEslesmesi && hataEslesmesi;
  });

  // Hata tipi istatistikleri
  const hataIstatistikleri = HATA_TIPLERI.map(hata => {
    const toplam = hataliUrunler.reduce((acc, item) => acc + (item[hata.key] || 0), 0);
    return { ...hata, toplam };
  }).filter(stat => stat.toplam > 0);

  return (
    <div className="space-y-4">
      {/* Filtreleme ve İstatistikler */}
      <div className="bg-white rounded-lg p-4 border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              🔍 Ürün Ara
            </label>
            <input
              type="text"
              value={aramaMetni}
              onChange={(e) => setAramaMetni(e.target.value)}
              placeholder="Ürün kodu ara..."
              className="w-full px-4 py-2 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              🔧 Hata Tipi Filtrele
            </label>
            <select
              value={seciliHataTipi}
              onChange={(e) => setSeciliHataTipi(e.target.value)}
              className="w-full px-4 py-2 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tüm Hatalar</option>
              {HATA_TIPLERI.map(hata => (
                <option key={hata.key} value={hata.key}>{hata.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Hata Tipi İstatistikleri */}
        {hataIstatistikleri.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {hataIstatistikleri.map(stat => (
              <div key={stat.key} className="bg-gradient-to-br from-red-50 to-orange-50 p-3 rounded-lg border border-red-200">
                <div className="text-xs text-gray-600 font-medium truncate">{stat.label}</div>
                <div className="text-2xl font-bold text-red-700">{stat.toplam}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Detay Tablosu */}
      <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
        <table className="min-w-full divide-y divide-gray-300">
          <thead className="bg-gradient-to-r from-red-100 to-orange-100">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-bold text-gray-700 uppercase sticky left-0 bg-red-100 z-10">
                Ürün Kodu
              </th>
              {HATA_TIPLERI.map(hata => (
                <th key={hata.key} className="px-4 py-3 text-center text-xs font-bold text-gray-700 uppercase">
                  {hata.label}
                </th>
              ))}
              <th className="px-4 py-3 text-center text-sm font-bold text-gray-700 uppercase bg-red-200">
                Toplam
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {hataliUrunler.length === 0 ? (
              <tr>
                <td colSpan={HATA_TIPLERI.length + 2} className="px-6 py-8 text-center text-gray-500 text-base">
                  {aramaMetni || seciliHataTipi ? '🔍 Filtreye uygun hatalı ürün bulunamadı' : '✅ Hatalı ürün bulunmuyor'}
                </td>
              </tr>
            ) : (
              hataliUrunler.map((item, index) => {
                let toplamHata = 0;
                HATA_TIPLERI.forEach(hata => {
                  toplamHata += (item[hata.key] || 0);
                });

                return (
                  <tr key={index} className={`hover:bg-red-50 transition-colors ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
                    <td className="px-4 py-3 text-base font-bold text-gray-900 sticky left-0 bg-inherit">
                      {item.urun_kodu}
                    </td>
                    {HATA_TIPLERI.map(hata => {
                      const deger = item[hata.key] || 0;
                      return (
                        <td key={hata.key} className="px-4 py-3 text-center">
                          <span className={`inline-flex items-center justify-center min-w-[40px] px-2 py-1 rounded-md text-base font-semibold ${
                            deger > 10 ? 'bg-red-200 text-red-800' :
                            deger > 5 ? 'bg-orange-200 text-orange-800' :
                            deger > 0 ? 'bg-yellow-200 text-yellow-800' : 'text-gray-400'
                          }`}>
                            {deger > 0 ? deger : '-'}
                          </span>
                        </td>
                      );
                    })}
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center justify-center min-w-[50px] px-3 py-1 rounded-lg bg-red-600 text-white text-lg font-bold shadow-sm">
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

      <div className="text-base text-gray-600">
        Gösterilen: <strong className="text-red-600">{hataliUrunler.length}</strong> hatalı ürün
      </div>
    </div>
  );
};

export default GecmisPartiler;
