import axios from 'axios';

// Production'da environment variable kullan, yoksa localhost
const API_BASE_URL = process.env.REACT_APP_API_URL
  ? `${process.env.REACT_APP_API_URL}/api`
  : 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// MAMÜL STOK API
export const mamulStokAPI = {
  // İzolasyon
  getIzolasyon: async () => (await api.get('/mamul-stok/izolasyon')).data,
  addIzolasyon: async (data) => (await api.post('/mamul-stok/izolasyon', data)).data,
  updateIzolasyon: async (id, data) => (await api.put(`/mamul-stok/izolasyon/${id}`, data)).data,
  deleteIzolasyon: async (id) => (await api.delete(`/mamul-stok/izolasyon/${id}`)).data,
  changeIzolasyonStock: async (id, data) => (await api.post(`/mamul-stok/izolasyon/${id}/stok-degistir`, data)).data,

  // Koli
  getKoli: async () => (await api.get('/mamul-stok/koli')).data,
  addKoli: async (data) => (await api.post('/mamul-stok/koli', data)).data,
  updateKoli: async (id, data) => (await api.put(`/mamul-stok/koli/${id}`, data)).data,
  deleteKoli: async (id) => (await api.delete(`/mamul-stok/koli/${id}`)).data,
  changeKoliStock: async (id, data) => (await api.post(`/mamul-stok/koli/${id}/stok-degistir`, data)).data,

  // Kutu
  getKutu: async () => (await api.get('/mamul-stok/kutu')).data,
  addKutu: async (data) => (await api.post('/mamul-stok/kutu', data)).data,
  updateKutu: async (id, data) => (await api.put(`/mamul-stok/kutu/${id}`, data)).data,
  deleteKutu: async (id) => (await api.delete(`/mamul-stok/kutu/${id}`)).data,
  changeKutuStock: async (id, data) => (await api.post(`/mamul-stok/kutu/${id}/stok-degistir`, data)).data,

  // Tapa
  getTapa: async () => (await api.get('/mamul-stok/tapa')).data,
  addTapa: async (data) => (await api.post('/mamul-stok/tapa', data)).data,
  updateTapa: async (id, data) => (await api.put(`/mamul-stok/tapa/${id}`, data)).data,
  deleteTapa: async (id) => (await api.delete(`/mamul-stok/tapa/${id}`)).data,
  changeTapaStock: async (id, data) => (await api.post(`/mamul-stok/tapa/${id}/stok-degistir`, data)).data,

  // Geçmiş
  getHistory: async () => (await api.get('/mamul-stok/history')).data,
};

// KALİTE KONTROL API
export const kaliteKontrolAPI = {
  // Görevler
  getGorevler: async () => (await api.get('/kalite-kontrol/gorevler')).data,
  addGorev: async (data) => (await api.post('/kalite-kontrol/gorevler', data)).data,
  updateGorev: async (id, data) => (await api.put(`/kalite-kontrol/gorevler/${id}`, data)).data,
  deleteGorev: async (id) => (await api.delete(`/kalite-kontrol/gorevler/${id}`)).data,
  addGorevNote: async (id, data) => (await api.post(`/kalite-kontrol/gorevler/${id}/not`, data)).data,
  deleteGorevNote: async (gorevId, notId) => (await api.delete(`/kalite-kontrol/gorevler/${gorevId}/not/${notId}`)).data,

  // Sipariş Hazırlık
  getSiparisHazirlik: async () => (await api.get('/kalite-kontrol/siparis-hazirlik')).data,
  addSiparis: async (data) => (await api.post('/kalite-kontrol/siparis-hazirlik', data)).data,
  updateSiparis: async (id, data) => (await api.put(`/kalite-kontrol/siparis-hazirlik/${id}`, data)).data,
  deleteSiparis: async (id) => (await api.delete(`/kalite-kontrol/siparis-hazirlik/${id}`)).data,
  getSiparisStats: async () => (await api.get('/kalite-kontrol/siparis-hazirlik/stats')).data,

  // Gönderim Takip
  addGonderim: async (siparisId, data) => (await api.post(`/kalite-kontrol/siparis-hazirlik/${siparisId}/gonderim`, data)).data,
  getGonderimler: async (siparisId) => (await api.get(`/kalite-kontrol/siparis-hazirlik/${siparisId}/gonderimler`)).data,
  deleteGonderim: async (siparisId, gonderimId) => (await api.delete(`/kalite-kontrol/siparis-hazirlik/${siparisId}/gonderim/${gonderimId}`)).data,

  // Değişiklik Logları
  getDegisiklikLog: async (siparisId) => (await api.get(`/kalite-kontrol/siparis-hazirlik/${siparisId}/degisiklik-log`)).data,

  // Ürün Siparişleri
  getUrunSiparisler: async () => (await api.get('/kalite-kontrol/urun-siparisler')).data,
  addUrunSiparis: async (data) => (await api.post('/kalite-kontrol/urun-siparisler', data)).data,
  updateUrunSiparis: async (id, data) => (await api.put(`/kalite-kontrol/urun-siparisler/${id}`, data)).data,
  deleteUrunSiparis: async (id) => (await api.delete(`/kalite-kontrol/urun-siparisler/${id}`)).data,
  getUrunSiparisDegisiklikLog: async (id) => (await api.get(`/kalite-kontrol/urun-siparisler/${id}/degisiklik-log`)).data,
};

// SİMÜLASYON STOK API
export const simulasyonStokAPI = {
  getAll: async () => (await api.get('/simulasyon-stok')).data,
  getByMalzemeTuru: async (malzemeTuru) => (await api.get(`/simulasyon-stok/${malzemeTuru}`)).data,
  add: async (data) => (await api.post('/simulasyon-stok', data)).data,
  update: async (id, data) => (await api.put(`/simulasyon-stok/${id}`, data)).data,
  delete: async (id) => (await api.delete(`/simulasyon-stok/${id}`)).data,
  changeStock: async (id, data) => (await api.post(`/simulasyon-stok/${id}/stok-degistir`, data)).data,
  getHareketLog: async (id) => (await api.get(`/simulasyon-stok/${id}/hareket-log`)).data,
  getStats: async () => (await api.get('/simulasyon-stok/stats/summary')).data,
};

// VERİ AKTARMA API
export const veriAktarmaAPI = {
  exportData: async () => (await api.get('/veri-aktarma/export')).data,
  importData: async (data) => (await api.post('/veri-aktarma/import', { data })).data,
  clearAll: async () => (await api.delete('/veri-aktarma/clear-all')).data,
};

// ÜRÜN REÇETESİ API
export const urunRecetesiAPI = {
  // Ürün Reçeteleri
  getAll: async () => (await api.get('/urun-recetesi')).data,
  getById: async (id) => (await api.get(`/urun-recetesi/${id}`)).data,
  getByCode: async (urunKodu) => (await api.get(`/urun-recetesi/by-code/${urunKodu}`)).data,
  add: async (data) => (await api.post('/urun-recetesi', data)).data,
  update: async (id, data) => (await api.put(`/urun-recetesi/${id}`, data)).data,
  delete: async (id) => (await api.delete(`/urun-recetesi/${id}`)).data,

  // Malzemeler
  addMalzeme: async (urunId, data) => (await api.post(`/urun-recetesi/${urunId}/malzeme`, data)).data,
  updateMalzeme: async (malzemeId, data) => (await api.put(`/urun-recetesi/malzeme/${malzemeId}`, data)).data,
  deleteMalzeme: async (malzemeId) => (await api.delete(`/urun-recetesi/malzeme/${malzemeId}`)).data,

  // Sipariş Hesaplama
  hesapla: async (data) => (await api.post('/urun-recetesi/hesapla', data)).data,
  hesaplaVeKaydet: async (data) => (await api.post('/urun-recetesi/hesapla-ve-kaydet', data)).data,
  stokDusum: async (kayitId, data) => (await api.post(`/urun-recetesi/stok-dusum/${kayitId}`, data)).data,
  getHesaplamaKayitlari: async () => (await api.get('/urun-recetesi/hesaplama-kayitlari')).data,
  getHesaplamaKaydi: async (id) => (await api.get(`/urun-recetesi/hesaplama-kayitlari/${id}`)).data,
};

// HATALI ÜRÜNLER API
export const hataliUrunlerAPI = {
  // Aktif Parti
  getAktifParti: async (partiNo) => (await api.get(`/hatali-urunler/aktif/${partiNo}`)).data,
  guncelle: async (data) => (await api.post('/hatali-urunler/guncelle', data)).data,
  kaydetParti: async (data) => (await api.post('/hatali-urunler/kaydet-parti', data)).data,
  sifirlaParti: async (partiNo) => (await api.delete(`/hatali-urunler/sifirla/${partiNo}`)).data,

  // Geçmiş Log
  getGecmis: async () => (await api.get('/hatali-urunler/gecmis')).data,
  getGecmisById: async (id) => (await api.get(`/hatali-urunler/gecmis/${id}`)).data,
  filtrele: async (data) => (await api.post('/hatali-urunler/gecmis/filtrele', data)).data,
  deleteGecmis: async (id) => (await api.delete(`/hatali-urunler/gecmis/${id}`)).data,
};

// TÜM SÜREÇ API
export const tumSurecAPI = {
  // Anasayfa - Özet
  getAnasayfa: async () => (await api.get('/tum-surec/anasayfa')).data,

  // Ürünler
  getUrunler: async () => (await api.get('/tum-surec/urunler')).data,

  // Temizlemeye Gidecek
  getTemizlemeyeGidecek: async () => (await api.get('/tum-surec/temizlemeye-gidecek')).data,
  temizlemeyeGidecekEkle: async (data) => (await api.post('/tum-surec/temizlemeye-gidecek/ekle', data)).data,
  addTemizlemeyeGidecek: async (data) => (await api.post('/tum-surec/temizlemeye-gidecek', data)).data,
  updateTemizlemeyeGidecek: async (id, data) => (await api.put(`/tum-surec/temizlemeye-gidecek/${id}`, data)).data,
  deleteTemizlemeyeGidecek: async (id) => (await api.delete(`/tum-surec/temizlemeye-gidecek/${id}`)).data,

  // Temizlemeye Gönder
  temizlemeyeGonder: async (data) => (await api.post('/tum-surec/temizlemeye-gonder', data)).data,

  // Temizlemede Olan
  getTemizlemedOlan: async () => (await api.get('/tum-surec/temizlemede-olan')).data,
  addTemizlemedOlan: async (data) => (await api.post('/tum-surec/temizlemede-olan', data)).data,
  updateTemizlemedOlan: async (id, data) => (await api.put(`/tum-surec/temizlemede-olan/${id}`, data)).data,
  deleteTemizlemedOlan: async (id) => (await api.delete(`/tum-surec/temizlemede-olan/${id}`)).data,

  // Temizlemeden Getir
  temizlemedenGetir: async (data) => (await api.post('/tum-surec/temizlemeden-getir', data)).data,

  // Temizlemeden Gelen
  getTemizlemedenGelen: async () => (await api.get('/tum-surec/temizlemeden-gelen')).data,
  addTemizlemedenGelen: async (data) => (await api.post('/tum-surec/temizlemeden-gelen', data)).data,
  updateTemizlemedenGelen: async (id, data) => (await api.put(`/tum-surec/temizlemeden-gelen/${id}`, data)).data,
  deleteTemizlemedenGelen: async (id) => (await api.delete(`/tum-surec/temizlemeden-gelen/${id}`)).data,

  // Sevke Hazır
  getSevkeHazir: async () => (await api.get('/tum-surec/sevke-hazir')).data,
  sevkeHazirla: async (data) => (await api.post('/tum-surec/sevke-hazirla', data)).data,
  addSevkeHazir: async (data) => (await api.post('/tum-surec/sevke-hazir', data)).data,
  updateSevkeHazir: async (id, data) => (await api.put(`/tum-surec/sevke-hazir/${id}`, data)).data,
  deleteSevkeHazir: async (id) => (await api.delete(`/tum-surec/sevke-hazir/${id}`)).data,

  // Sevk Et
  sevkEt: async (data) => (await api.post('/tum-surec/sevk-et', data)).data,

  // Sevk Edilen
  getSevkEdilen: async () => (await api.get('/tum-surec/sevk-edilen')).data,
  addSevkEdilen: async (data) => (await api.post('/tum-surec/sevk-edilen', data)).data,
  updateSevkEdilen: async (id, data) => (await api.put(`/tum-surec/sevk-edilen/${id}`, data)).data,
  deleteSevkEdilen: async (id) => (await api.delete(`/tum-surec/sevk-edilen/${id}`)).data,

  // Kalan
  getKalan: async () => (await api.get('/tum-surec/kalan')).data,
  addKalan: async (data) => (await api.post('/tum-surec/kalan', data)).data,
  updateKalan: async (id, data) => (await api.put(`/tum-surec/kalan/${id}`, data)).data,
  deleteKalan: async (id) => (await api.delete(`/tum-surec/kalan/${id}`)).data,
  updateKalanNotlar: async (urunId, data) => (await api.put(`/tum-surec/kalan/${urunId}/notlar`, data)).data,

  // Hareket Log
  getHareketLog: async (limit = 50) => (await api.get(`/tum-surec/hareket-log?limit=${limit}`)).data,

  // İstatistikler
  getIstatistikler: async () => (await api.get('/tum-surec/istatistikler')).data,
};

// ÜRÜN AĞIRLIKLARI API
export const urunAgirliklariAPI = {
  // Ürünler
  getUrunler: async () => (await api.get('/urun-agirliklari/urunler')).data,
  updateUrun: async (id, data) => (await api.put(`/urun-agirliklari/urunler/${id}`, data)).data,

  // Fittinglar
  getFittinglar: async () => (await api.get('/urun-agirliklari/fittinglar')).data,
  updateFitting: async (id, data) => (await api.put(`/urun-agirliklari/fittinglar/${id}`, data)).data,

  // Hesaplama
  hesapla: async (data) => (await api.post('/urun-agirliklari/hesapla', data)).data,
  hesaplaABToplam: async (data) => (await api.post('/urun-agirliklari/hesapla-ab-toplam', data)).data,
  hesaplaBatch: async (data) => (await api.post('/urun-agirliklari/hesapla-batch', data)).data, // Feature 4
  getHesaplamalar: async () => (await api.get('/urun-agirliklari/hesaplamalar')).data,
  getRecentHesaplamalar: async () => (await api.get('/urun-agirliklari/hesaplamalar/recent')).data, // Feature 2
  deleteHesaplama: async (id) => (await api.delete(`/urun-agirliklari/hesaplamalar/${id}`)).data,
  clearHesaplamalar: async () => (await api.delete('/urun-agirliklari/hesaplamalar')).data,

  // Karşılaştırma (Feature 9)
  karsilastir: async (urunId, adet) => (await api.get(`/urun-agirliklari/karsilastir/${urunId}/${adet}`)).data,

  // İstatistikler
  getIstatistikler: async () => (await api.get('/urun-agirliklari/istatistikler')).data,
};

// TEKNİK RESİMLER API
export const teknikResimlerAPI = {
  // Login
  login: async (username, password) => (await api.post('/teknik-resimler/login', { username, password })).data,

  // Kategoriler
  getKategoriler: async () => (await api.get('/teknik-resimler/kategoriler')).data,

  // Dosyalar
  getDosyalar: async (kategoriId = null) => {
    const url = kategoriId
      ? `/teknik-resimler/dosyalar/${kategoriId}`
      : '/teknik-resimler/dosyalar';
    return (await api.get(url)).data;
  },

  // PDF yükle
  uploadPDF: async (kategoriId, file, yukleyen = 'esatakg') => {
    const formData = new FormData();
    formData.append('pdf', file);
    formData.append('kategori_id', kategoriId);
    formData.append('yukleyen', yukleyen);

    return (await axios.post(`${API_BASE_URL}/teknik-resimler/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })).data;
  },

  // PDF görüntüle
  getViewURL: (fileId) => `${API_BASE_URL}/teknik-resimler/view/${fileId}`,

  // Dosya sil
  deleteDosya: async (fileId) => (await api.delete(`/teknik-resimler/dosyalar/${fileId}`)).data,
};

// KESİM ÖLÇÜLERİ API
export const kesimOlculeriAPI = {
  // Tüm kesim ölçülerini getir
  getAll: async () => (await api.get('/kesim-olculeri')).data,

  // Modelleri getir
  getModeller: async () => (await api.get('/kesim-olculeri/modeller')).data,

  // Model'e göre kesim ölçülerini getir
  getByModel: async (model) => (await api.get(`/kesim-olculeri/model/${model}`)).data,

  // Yeni kesim ölçüsü ekle
  add: async (data) => (await api.post('/kesim-olculeri', data)).data,

  // Kesim ölçüsü güncelle
  update: async (id, data) => (await api.put(`/kesim-olculeri/${id}`, data)).data,

  // Kesim ölçüsü sil
  delete: async (id) => (await api.delete(`/kesim-olculeri/${id}`)).data,

  // Excel'den import
  import: async (data) => (await api.post('/kesim-olculeri/import', { data })).data,

  // Arama
  search: async (query) => (await api.get('/kesim-olculeri/search', { params: { q: query } })).data,
};

// PARTİ TAKİP API (Yeni Sistem)
export const partiTakipAPI = {
  getPartiler: async () => (await api.get('/parti-takip/partiler')).data,
  getPartiDetay: async (parti_no) => (await api.get(`/parti-takip/partiler/${parti_no}`)).data,
  saveMukerrer: async (data) => (await api.post(`/parti-takip/partiler/${data.parti_no}/mukerrer`, data)).data,
  getIstatistikler: async () => (await api.get('/parti-takip/istatistikler')).data,
};

// TEMİZLEME TAKİP API
export const temizlemeTakipAPI = {
  // Parti Yönetimi
  getPartiler: async (params) => (await api.get('/temizleme-takip/partiler', { params })).data,
  getParti: async (id) => (await api.get(`/temizleme-takip/partiler/${id}`)).data,
  createParti: async (data) => (await api.post('/temizleme-takip/partiler', data)).data,
  createManuelParti: async (data) => (await api.post('/temizleme-takip/partiler/manuel', data)).data,
  updateParti: async (id, data) => (await api.put(`/temizleme-takip/partiler/${id}`, data)).data,
  deleteParti: async (id) => (await api.delete(`/temizleme-takip/partiler/${id}`)).data,

  // Parti Durum Değişiklikleri
  partiDonus: async (id, data) => (await api.post(`/temizleme-takip/partiler/${id}/donus`, data)).data,
  kaliteKontrol: async (id, data) => (await api.post(`/temizleme-takip/partiler/${id}/kalite-kontrol`, data)).data,

  // Kalite Geçmişi
  getKaliteGecmis: async (id) => (await api.get(`/temizleme-takip/partiler/${id}/kalite-gecmis`)).data,

  // Raporlar
  getRaporOzet: async () => (await api.get('/temizleme-takip/raporlar/ozet')).data,
  getRaporUrunBazli: async () => (await api.get('/temizleme-takip/raporlar/urun-bazli')).data,

  // Ödeme Raporları
  getOdemeRaporu: async (params) => (await api.get('/temizleme-takip/raporlar/odeme-raporu', { params })).data,
  getOdemeDetay: async (id) => (await api.get(`/temizleme-takip/partiler/${id}/odeme-detay`)).data,
  odemeHesapla: async (id) => (await api.post(`/temizleme-takip/partiler/${id}/odeme-hesapla`)).data,
  odemeKaydet: async (id, data) => (await api.post(`/temizleme-takip/partiler/${id}/odeme-kaydet`, data)).data,
};

// SEVKİYAT TAKİP API (Yeni Sistem - Kg Bazlı)
export const sevkiyatTakipAPI = {
  // Sevkiyat Yönetimi
  getSevkiyatlar: async () => (await api.get('/sevkiyat-takip/sevkiyatlar')).data,
  getSevkiyat: async (id) => (await api.get(`/sevkiyat-takip/sevkiyat/${id}`)).data,
  createSevkiyat: async (data) => (await api.post('/sevkiyat-takip/sevkiyat', data)).data,
  updateSevkiyat: async (id, data) => (await api.put(`/sevkiyat-takip/sevkiyat/${id}`, data)).data,

  // Ürün İşlemleri
  updateUrun: async (id, data) => (await api.put(`/sevkiyat-takip/urun/${id}`, data)).data,
  addUrun: async (sevkiyatId, data) => (await api.post(`/sevkiyat-takip/sevkiyat/${sevkiyatId}/urun`, data)).data,

  // Kalite Kontrol
  kaliteKontrol: async (data) => (await api.post('/sevkiyat-takip/kalite-kontrol', data)).data,
  getPisUrunler: async (sevkiyatId) => (await api.get(`/sevkiyat-takip/sevkiyat/${sevkiyatId}/pis-urunler`)).data,

  // Raporlar
  getOdemeRaporu: async (sevkiyatId) => (await api.get(`/sevkiyat-takip/odeme-raporu/${sevkiyatId}`)).data,
  getIstatistikler: async () => (await api.get('/sevkiyat-takip/istatistikler')).data,
};

export default api;
