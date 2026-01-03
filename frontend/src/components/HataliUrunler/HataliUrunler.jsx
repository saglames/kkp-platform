import React, { useState, useEffect } from 'react';
import { hataliUrunlerAPI } from '../../services/api';
import { HATA_TIPLERI } from '../../constants/urunler';
import LoadingSpinner from '../Shared/LoadingSpinner';
import PartiForm from './PartiForm';
import GecmisPartiler from './GecmisPartiler';

const HataliUrunler = () => {
  const [loading, setLoading] = useState(false);
  const [partiNo, setPartiNo] = useState('');
  const [aktifVeri, setAktifVeri] = useState({});
  const [gecmisPartiler, setGecmisPartiler] = useState([]);
  const [userName, setUserName] = useState('');

  // LocalStorage'dan veri yükleme
  useEffect(() => {
    const savedPartiNo = localStorage.getItem('hatali_urunler_parti_no');
    const savedUserName = localStorage.getItem('hatali_urunler_user_name');
    const savedAktifVeri = localStorage.getItem('hatali_urunler_aktif_veri');

    if (savedPartiNo) setPartiNo(savedPartiNo);
    if (savedUserName) setUserName(savedUserName);
    if (savedAktifVeri) {
      try {
        setAktifVeri(JSON.parse(savedAktifVeri));
      } catch (e) {
        console.error('LocalStorage veri parse hatası:', e);
      }
    }

    fetchGecmisPartiler();
  }, []);

  // LocalStorage'a veri kaydetme
  useEffect(() => {
    if (partiNo) {
      localStorage.setItem('hatali_urunler_parti_no', partiNo);
    }
    if (userName) {
      localStorage.setItem('hatali_urunler_user_name', userName);
    }
    if (Object.keys(aktifVeri).length > 0) {
      localStorage.setItem('hatali_urunler_aktif_veri', JSON.stringify(aktifVeri));
    }
  }, [partiNo, userName, aktifVeri]);

  const fetchGecmisPartiler = async () => {
    try {
      const data = await hataliUrunlerAPI.getGecmis();
      setGecmisPartiler(data);
    } catch (error) {
      console.error('Geçmiş partiler yüklenirken hata:', error);
    }
  };

  const handlePartiNoChange = async (e) => {
    const yeniPartiNo = e.target.value;
    setPartiNo(yeniPartiNo);

    if (yeniPartiNo) {
      try {
        const data = await hataliUrunlerAPI.getAktifParti(yeniPartiNo);
        const veriMap = {};
        data.forEach(item => {
          veriMap[item.urun_kodu] = item;
        });
        setAktifVeri(veriMap);
      } catch (error) {
        console.error('Parti verileri yüklenirken hata:', error);
      }
    }
  };

  const handleHataSayisiDegistir = async (urunKodu, hataTipi, deger) => {
    const mevcutVeri = aktifVeri[urunKodu] || {};
    const yeniDeger = Math.max(0, (mevcutVeri[hataTipi] || 0) + deger);

    const guncelVeri = {
      ...mevcutVeri,
      [hataTipi]: yeniDeger,
      parti_no: partiNo,
      urun_kodu: urunKodu
    };

    try {
      await hataliUrunlerAPI.guncelle(guncelVeri);

      setAktifVeri(prev => ({
        ...prev,
        [urunKodu]: { ...guncelVeri }
      }));
    } catch (error) {
      console.error('Güncelleme hatası:', error);
      alert('Güncelleme sırasında bir hata oluştu!');
    }
  };

  const handleKaydetVeSifirla = async () => {
    if (!partiNo) {
      alert('Lütfen parti numarası girin!');
      return;
    }

    if (!userName) {
      alert('Lütfen adınızı girin!');
      return;
    }

    if (Object.keys(aktifVeri).length === 0) {
      alert('Kaydedilecek veri bulunamadı!');
      return;
    }

    const onay = window.confirm(
      `Parti ${partiNo} kaydedilecek ve form sıfırlanacak. Emin misiniz?`
    );

    if (!onay) return;

    try {
      setLoading(true);
      await hataliUrunlerAPI.kaydetParti({
        parti_no: partiNo,
        kayit_yapan: userName,
        notlar: ''
      });

      // Formu sıfırla
      setAktifVeri({});
      setPartiNo('');

      // LocalStorage'ı temizle
      localStorage.removeItem('hatali_urunler_aktif_veri');
      localStorage.removeItem('hatali_urunler_parti_no');

      // Geçmiş partileri yenile
      await fetchGecmisPartiler();

      alert('Parti başarıyla kaydedildi!');
    } catch (error) {
      console.error('Kaydetme hatası:', error);
      alert('Kaydetme sırasında bir hata oluştu!');
    } finally {
      setLoading(false);
    }
  };

  const handleSifirla = async () => {
    if (!partiNo) {
      alert('Lütfen parti numarası girin!');
      return;
    }

    const onay = window.confirm(
      `Parti ${partiNo} verileri silinecek (kaydedilmeyecek). Emin misiniz?`
    );

    if (!onay) return;

    try {
      await hataliUrunlerAPI.sifirlaParti(partiNo);
      setAktifVeri({});
      setPartiNo('');
      localStorage.removeItem('hatali_urunler_aktif_veri');
      localStorage.removeItem('hatali_urunler_parti_no');
      alert('Parti sıfırlandı!');
    } catch (error) {
      console.error('Sıfırlama hatası:', error);
      alert('Sıfırlama sırasında bir hata oluştu!');
    }
  };

  const toplamHata = () => {
    let toplam = 0;
    Object.values(aktifVeri).forEach(urun => {
      HATA_TIPLERI.forEach(hata => {
        toplam += (urun[hata.key] || 0);
      });
    });
    return toplam;
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      <div className="max-w-full mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg shadow-lg p-8 mb-6 text-white">
          <h2 className="text-3xl font-bold mb-2">🏭 Hatalı Ürün Takip Sistemi</h2>
          <p className="text-blue-100">Fabrika kalite kontrol ve hata takip yönetimi</p>
        </div>

        {/* Parti Bilgileri ve Kontrol Paneli */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6 border-t-4 border-blue-600">
          <h3 className="text-xl font-bold text-gray-800 mb-4">📋 Parti Bilgileri</h3>

          {/* Parti Bilgileri */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-base font-bold text-gray-700 mb-2">
                📦 Parti No <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={partiNo}
                onChange={handlePartiNoChange}
                placeholder="Örn: FO25014"
                className="w-full px-5 py-3 text-lg font-medium border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-base font-bold text-gray-700 mb-2">
                👤 Kayıt Yapan <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Adınız Soyadınız"
                className="w-full px-5 py-3 text-lg font-medium border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-base font-bold text-gray-700 mb-2">
                ⚠️ Toplam Hata Sayısı
              </label>
              <div className="w-full px-5 py-3 bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-300 rounded-lg text-center">
                <span className="text-4xl font-bold text-red-600">{toplamHata()}</span>
              </div>
            </div>
          </div>

          {/* Butonlar */}
          <div className="flex gap-4 mt-6">
            <button
              onClick={handleKaydetVeSifirla}
              disabled={!partiNo || !userName || Object.keys(aktifVeri).length === 0}
              className="flex-1 px-8 py-4 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:from-gray-400 disabled:to-gray-500 text-white text-lg rounded-lg font-bold transition-all shadow-md disabled:cursor-not-allowed"
            >
              ✅ Partiyi Kaydet ve Sıfırla
            </button>
            <button
              onClick={handleSifirla}
              disabled={!partiNo}
              className="px-8 py-4 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 disabled:from-gray-400 disabled:to-gray-500 text-white text-lg rounded-lg font-bold transition-all shadow-md disabled:cursor-not-allowed"
            >
              🗑️ Sıfırla (Kaydetmeden)
            </button>
          </div>

          {/* Uyarı Mesajı */}
          {(!partiNo || !userName) && (
            <div className="mt-4 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded">
              <p className="text-base text-yellow-800 font-medium">
                ⚠️ Lütfen parti numarası ve adınızı girin.
              </p>
            </div>
          )}
        </div>

        {/* Veri Giriş Tablosu */}
        <PartiForm
          partiNo={partiNo}
          aktifVeri={aktifVeri}
          onHataSayisiDegistir={handleHataSayisiDegistir}
        />

        {/* Geçmiş Partiler */}
        <GecmisPartiler
          gecmisPartiler={gecmisPartiler}
          onRefresh={fetchGecmisPartiler}
        />
      </div>
    </div>
  );
};

export default HataliUrunler;
