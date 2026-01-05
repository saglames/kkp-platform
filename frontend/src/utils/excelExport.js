import * as XLSX from 'xlsx';

/**
 * Tarihi Excel için formatlar (DD.MM.YYYY HH:MM)
 */
const formatDate = (date) => {
  if (!date) return '-';
  const d = new Date(date);
  return d.toLocaleDateString('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Tarihi sadece gün formatında (DD.MM.YYYY)
 */
const formatDateShort = (date) => {
  if (!date) return '-';
  const d = new Date(date);
  return d.toLocaleDateString('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

/**
 * Durum kodunu Türkçe'ye çevirir
 */
const getDurumText = (durum) => {
  if (durum === 'gonderildi') return 'Gönderildi';
  if (durum === 'geldi') return 'Geldi';
  if (durum === 'kalite_kontrol') return 'Kalite Kontrol';
  return durum || '-';
};

/**
 * Tek bir partiyi Excel'e export eder
 * 2 Sheet: Parti Özeti + Ürün Detayları
 */
export const exportSingleParti = (parti) => {
  if (!parti) {
    alert('Parti bilgisi bulunamadı!');
    return;
  }

  // Sheet 1: Parti Özeti
  const ozetData = [[
    'Parti No',
    'İrsaliye No',
    'Gönderim Tarihi',
    'Toplam Adet',
    'Toplam Kg',
    'Gelen Adet',
    'Gelen Kg',
    'Problemli Adet',
    'Problemli Kg',
    'Ödenecek Kg',
    'Durum'
  ]];

  const totalGidenAdet = parti.urunler?.reduce((sum, u) => sum + (parseInt(u.giden_adet) || 0), 0) || 0;
  const totalGidenKg = parti.urunler?.reduce((sum, u) => sum + (parseFloat(u.giden_kg) || 0), 0) || 0;
  const totalGelenAdet = parti.urunler?.reduce((sum, u) => sum + (parseInt(u.gelen_adet) || 0), 0) || 0;
  const totalGelenKg = parti.urunler?.reduce((sum, u) => sum + (parseFloat(u.gelen_kg) || 0), 0) || 0;
  const totalProblemliAdet = parti.urunler?.reduce((sum, u) => sum + (parseInt(u.problemli_adet) || 0), 0) || 0;
  const totalProblemliKg = parti.urunler?.reduce((sum, u) => sum + (parseFloat(u.problemli_kg) || 0), 0) || 0;
  const totalOdenecekKg = totalGidenKg - totalProblemliKg;

  ozetData.push([
    parti.parti_no,
    parti.irsaliye_no || '-',
    formatDateShort(parti.gonderim_tarihi),
    totalGidenAdet,
    totalGidenKg.toFixed(2),
    totalGelenAdet,
    totalGelenKg.toFixed(2),
    totalProblemliAdet,
    totalProblemliKg.toFixed(2),
    totalOdenecekKg.toFixed(2),
    getDurumText(parti.durum)
  ]);

  // Sheet 2: Ürün Detayları
  const detayData = [[
    'Parti No',
    'İrsaliye No',
    'Ürün Kodu',
    'Parça Tipi',
    'Giden Adet',
    'Giden Kg',
    'Gelen Adet',
    'Gelen Kg',
    'Geliş Tarihi',
    'Problemli Adet',
    'Problemli Kg',
    'Ödenecek Kg',
    'Durum'
  ]];

  if (parti.urunler && parti.urunler.length > 0) {
    parti.urunler.forEach(urun => {
      const odenecekKg = (parseFloat(urun.giden_kg) || 0) - (parseFloat(urun.problemli_kg) || 0);
      const durumText = urun.is_mukerrer ? 'Mükerrer' :
                       urun.gelen_adet ? 'Geldi' : 'Bekliyor';

      detayData.push([
        parti.parti_no,
        parti.irsaliye_no || '-',
        urun.urun_kodu,
        urun.parca_tipi,
        parseInt(urun.giden_adet) || 0,
        parseFloat(urun.giden_kg || 0).toFixed(2),
        parseInt(urun.gelen_adet) || '-',
        urun.gelen_kg ? parseFloat(urun.gelen_kg).toFixed(2) : '-',
        formatDate(urun.gelis_tarihi),
        parseInt(urun.problemli_adet) || 0,
        parseFloat(urun.problemli_kg || 0).toFixed(2),
        odenecekKg.toFixed(2),
        durumText
      ]);
    });
  }

  // Excel oluştur
  const workbook = XLSX.utils.book_new();
  const ozetSheet = XLSX.utils.aoa_to_sheet(ozetData);
  const detaySheet = XLSX.utils.aoa_to_sheet(detayData);

  // Kolon genişlikleri
  ozetSheet['!cols'] = [
    { wch: 10 }, { wch: 12 }, { wch: 15 }, { wch: 12 }, { wch: 12 },
    { wch: 12 }, { wch: 12 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }
  ];

  detaySheet['!cols'] = [
    { wch: 10 }, { wch: 12 }, { wch: 20 }, { wch: 12 }, { wch: 12 },
    { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 18 }, { wch: 15 },
    { wch: 15 }, { wch: 15 }, { wch: 12 }
  ];

  XLSX.utils.book_append_sheet(workbook, ozetSheet, 'Parti Özeti');
  XLSX.utils.book_append_sheet(workbook, detaySheet, 'Ürün Detayları');

  // Dosya adı
  const tarih = new Date().toLocaleDateString('tr-TR').replace(/\./g, '-');
  const dosyaAdi = `Parti_${parti.parti_no}_${tarih}.xlsx`;

  // İndir
  XLSX.writeFile(workbook, dosyaAdi);
};

/**
 * Tüm partileri Excel'e export eder
 * 2 Sheet: Parti Özeti + Ürün Detayları
 */
export const exportAllPartiler = async (partiler, partiTakipAPI) => {
  if (!partiler || partiler.length === 0) {
    alert('Export edilecek parti bulunamadı!');
    return;
  }

  try {
    // Sheet 1: Parti Özeti
    const ozetData = [[
      'Parti No',
      'İrsaliye No',
      'Gönderim Tarihi',
      'Toplam Adet',
      'Toplam Kg',
      'Gelen Adet',
      'Gelen Kg',
      'Problemli Adet',
      'Problemli Kg',
      'Ödenecek Kg',
      'Durum'
    ]];

    // Sheet 2: Ürün Detayları
    const detayData = [[
      'Parti No',
      'İrsaliye No',
      'Ürün Kodu',
      'Parça Tipi',
      'Giden Adet',
      'Giden Kg',
      'Gelen Adet',
      'Gelen Kg',
      'Geliş Tarihi',
      'Problemli Adet',
      'Problemli Kg',
      'Ödenecek Kg',
      'Durum'
    ]];

    // Her parti için detay bilgilerini al
    for (const parti of partiler) {
      // Parti detayını getir
      const partiDetay = await partiTakipAPI.getPartiDetay(parti.parti_no);

      // Parti özeti hesapla
      const totalGidenAdet = partiDetay.urunler?.reduce((sum, u) => sum + (parseInt(u.giden_adet) || 0), 0) || 0;
      const totalGidenKg = partiDetay.urunler?.reduce((sum, u) => sum + (parseFloat(u.giden_kg) || 0), 0) || 0;
      const totalGelenAdet = partiDetay.urunler?.reduce((sum, u) => sum + (parseInt(u.gelen_adet) || 0), 0) || 0;
      const totalGelenKg = partiDetay.urunler?.reduce((sum, u) => sum + (parseFloat(u.gelen_kg) || 0), 0) || 0;
      const totalProblemliAdet = partiDetay.urunler?.reduce((sum, u) => sum + (parseInt(u.problemli_adet) || 0), 0) || 0;
      const totalProblemliKg = partiDetay.urunler?.reduce((sum, u) => sum + (parseFloat(u.problemli_kg) || 0), 0) || 0;
      const totalOdenecekKg = totalGidenKg - totalProblemliKg;

      // Özet satırı ekle
      ozetData.push([
        partiDetay.parti_no,
        partiDetay.irsaliye_no || '-',
        formatDateShort(partiDetay.gonderim_tarihi),
        totalGidenAdet,
        totalGidenKg.toFixed(2),
        totalGelenAdet,
        totalGelenKg.toFixed(2),
        totalProblemliAdet,
        totalProblemliKg.toFixed(2),
        totalOdenecekKg.toFixed(2),
        getDurumText(partiDetay.durum)
      ]);

      // Ürün detayları ekle
      if (partiDetay.urunler && partiDetay.urunler.length > 0) {
        partiDetay.urunler.forEach(urun => {
          const odenecekKg = (parseFloat(urun.giden_kg) || 0) - (parseFloat(urun.problemli_kg) || 0);
          const durumText = urun.is_mukerrer ? 'Mükerrer' :
                           urun.gelen_adet ? 'Geldi' : 'Bekliyor';

          detayData.push([
            partiDetay.parti_no,
            partiDetay.irsaliye_no || '-',
            urun.urun_kodu,
            urun.parca_tipi,
            parseInt(urun.giden_adet) || 0,
            parseFloat(urun.giden_kg || 0).toFixed(2),
            parseInt(urun.gelen_adet) || '-',
            urun.gelen_kg ? parseFloat(urun.gelen_kg).toFixed(2) : '-',
            formatDate(urun.gelis_tarihi),
            parseInt(urun.problemli_adet) || 0,
            parseFloat(urun.problemli_kg || 0).toFixed(2),
            odenecekKg.toFixed(2),
            durumText
          ]);
        });
      }
    }

    // Excel oluştur
    const workbook = XLSX.utils.book_new();
    const ozetSheet = XLSX.utils.aoa_to_sheet(ozetData);
    const detaySheet = XLSX.utils.aoa_to_sheet(detayData);

    // Kolon genişlikleri
    ozetSheet['!cols'] = [
      { wch: 10 }, { wch: 12 }, { wch: 15 }, { wch: 12 }, { wch: 12 },
      { wch: 12 }, { wch: 12 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }
    ];

    detaySheet['!cols'] = [
      { wch: 10 }, { wch: 12 }, { wch: 20 }, { wch: 12 }, { wch: 12 },
      { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 18 }, { wch: 15 },
      { wch: 15 }, { wch: 15 }, { wch: 12 }
    ];

    XLSX.utils.book_append_sheet(workbook, ozetSheet, 'Parti Özeti');
    XLSX.utils.book_append_sheet(workbook, detaySheet, 'Ürün Detayları');

    // Dosya adı
    const tarih = new Date().toLocaleDateString('tr-TR').replace(/\./g, '-');
    const dosyaAdi = `Tum_Partiler_${tarih}.xlsx`;

    // İndir
    XLSX.writeFile(workbook, dosyaAdi);
  } catch (error) {
    console.error('Excel export hatası:', error);
    alert('Excel export sırasında hata oluştu: ' + error.message);
  }
};
