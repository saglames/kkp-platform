# İzolasyon Mamül Stok Güncelleme Kılavuzu

## 📋 Yapılan Değişiklikler

### 1. Frontend Güncellemeleri ✅

#### IzolasyonTab.jsx
- **Yeni Kolonlar Eklendi:**
  - Çin Adı (cin_adi)
  - Türk Adı (turk_adi)
  - Renk (renk)

- **Arama Fonksiyonu Geliştirildi:**
  - Artık Çin Adı, Türk Adı ve Renk alanlarında da arama yapılabilir

- **Renk Badge Sistemi:**
  - GRİ → Gri arka plan
  - MAVİ → Mavi arka plan
  - YEŞİL → Yeşil arka plan

#### AddIzolasyonModal.jsx
- **Yeni Form Alanları:**
  - Çin Adı (text input)
  - Türk Adı (text input)
  - Renk (dropdown: GRİ, MAVİ, YEŞİL)

### 2. Backend Güncellemeleri ✅

#### mamulStok.js Routes
- `GET /izolasyon` → cin_adi, turk_adi, renk alanlarını döndürür
- `POST /izolasyon` → Yeni alanları kabul eder
- `PUT /izolasyon/:id` → Yeni alanları günceller

### 3. Veritabanı Güncellemeleri 📊

#### Yeni Kolonlar
```sql
ALTER TABLE mamul_izolasyon
ADD COLUMN IF NOT EXISTS cin_adi VARCHAR(100),
ADD COLUMN IF NOT EXISTS turk_adi VARCHAR(50),
ADD COLUMN IF NOT EXISTS renk VARCHAR(20);
```

#### Yeni İndeksler (Performans)
```sql
CREATE INDEX IF NOT EXISTS idx_mamul_izolasyon_cin_adi ON mamul_izolasyon(cin_adi);
CREATE INDEX IF NOT EXISTS idx_mamul_izolasyon_turk_adi ON mamul_izolasyon(turk_adi);
CREATE INDEX IF NOT EXISTS idx_mamul_izolasyon_renk ON mamul_izolasyon(renk);
```

## 🚀 Kurulum Adımları

### Adım 1: Veritabanını Güncelle

Script ile kolon ve indeksleri ekle:
```bash
cd backend
node update-izolasyon-data.js
```

Bu script:
- ✅ Gerekli kolonları ekler (varsa atlar)
- ✅ 42 izolasyon ürününün verilerini günceller/ekler
- ✅ Çin Adı, Türk Adı, Renk ve Stok bilgilerini doldurur

### Adım 2: Backend'i Yeniden Başlat

```bash
# Backend klasöründe
npm start
```

### Adım 3: Frontend'i Yenile

Tarayıcıda sayfayı yenile (Ctrl+F5)

## 📊 Eklenen Ürünler (42 Adet)

Excel dosyasından alınan veriler:

### GRİ Ürünler (25 adet)
- FOG-B335A (A), FOG-B335A (B), FOG-B506A (A), FOG-B506A (B)
- FOG-B730A (A), FOG-B730A (B), FOG-B1350 (A), FOG-B1350A (B)
- HZG20B (A), HZG20B (B), HZG30B (A), HZG30B (B), HZG30B (C), HZG30B (D)
- FQ-01B/A (A), FQ01B/A-B
- KHRQ22M20T (A), KHRQ22M20T (B)
- CMY-Y102SS-TR (A), CMY-Y102SS-TR (B)
- CMY-102L-A (A), CMY-102L-B
- CMY-202S (A), CMY-202S (B)

### MAVİ Ürünler (12 adet)
- MXJ-YA1509M/R1 (A), MXJ-YA1509M/R1 (B)
- MXJ-YA1500M
- MXJ-YA2512M/R3 (A), MXJ-YA2512M/R3 (B)
- MXJ-YA2812M (A), MXJ-YA2812M (B)
- MXJ-YA2815M (A), MXJ-YA2815M (B)
- MXJ-YA3419M (A), MXJ-YA3419M (B)
- MXJ-YA4119M (A), MXJ-YA4119M (B)

### YEŞİL Ürünler (5 adet)
- FOG-B335A/Y (A), FOG-B335A/Y (B)
- FOG-B506A/Y (A), FOG-B506A/Y (B)
- FOG-B730A/Y (A), FOG-B730A/Y (B)

## 🔄 Alternatif Kullanım Bilgisi

Bazı izolasyonlar birden fazla ürün kodunda kullanılabilir:

**Örnek 1:**
- **FOG-B335A (B) ↔ FOG-B506A (B)**
  - Çin Adı: 102SN小
  - Türk Adı: G35K
  - Her ikisi de aynı izolasyonu kullanır

**Örnek 2:**
- **MXJ-YA1509M/R1 (B) → 4 farklı üründe kullanılır**
  - MXJ-YA2812M (B)
  - MXJ-YA2815M (B)
  - MXJ-YA3419M (B)
  - Çin Adı: 1509小
  - Türk Adı: B15K

## 📝 Kullanım Kılavuzu

### Frontend'de Görünüm

Tablo kolonları (soldan sağa):
1. **Ürün Adı** - Örn: FOG-B335A (A)
2. **Çin Adı** - Örn: 335L大
3. **Türk Adı** - Örn: G35B
4. **Renk** - Badge olarak (renkli)
5. **Kullanılan Ürünler** - Alternatif kodlar (varsa)
6. **Stok** - Yeşil/Sarı/Kırmızı badge
7. **İşlemler** - Stok Değiştir butonu

### Arama Özelliği

Arama kutusu şu alanlarda arar:
- Ürün Adı
- Çin Adı
- Türk Adı
- Renk

**Örnek:**
- "335" yazarsanız → FOG-B335A ürünlerini bulur
- "G35" yazarsanız → Türk adı G35B veya G35K olan ürünleri bulur
- "MAVİ" yazarsanız → Tüm mavi izolasyonları listeler

### Yeni Ürün Ekleme

"Yeni Ekle" butonuna tıklayınca açılan formda:
1. **Ürün Adı** (zorunlu)
2. **Çin Adı** (opsiyonel)
3. **Türk Adı** (opsiyonel)
4. **Renk** (dropdown: GRİ, MAVİ, YEŞİL)
5. **Kullanılan Ürünler** (virgülle ayırarak)
6. **Başlangıç Stok**

## 🔧 Teknik Detaylar

### Dosya Değişiklikleri

**Frontend:**
- `frontend/src/components/MamulStok/IzolasyonTab.jsx` ✅
- `frontend/src/components/MamulStok/AddIzolasyonModal.jsx` ✅

**Backend:**
- `backend/routes/mamulStok.js` ✅
- `backend/update-izolasyon-data.js` (yeni) ✅
- `backend/add-izolasyon-columns.sql` (yeni) ✅

**Veritabanı:**
- `mamul_izolasyon` tablosu → 3 yeni kolon eklendi

### API Endpoint Değişiklikleri

**GET /api/mamul-stok/izolasyon**
```json
{
  "id": 1,
  "name": "FOG-B335A (A)",
  "cin_adi": "335L大",
  "turk_adi": "G35B",
  "renk": "GRİ",
  "kullanilan_urunler": [],
  "stock": 3425
}
```

**POST /api/mamul-stok/izolasyon**
```json
{
  "name": "FOG-B335A (A)",
  "cin_adi": "335L大",
  "turk_adi": "G35B",
  "renk": "GRİ",
  "kullanilan_urunler": [],
  "stock": 3425
}
```

## ✅ Kontrol Listesi

- [x] Frontend tablosuna Çin Adı, Türk Adı, Renk kolonları eklendi
- [x] Renk badge sistemi oluşturuldu
- [x] Arama fonksiyonu geliştirildi
- [x] AddIzolasyonModal'a yeni alanlar eklendi
- [x] Backend API'ye yeni alanlar eklendi
- [x] Veritabanı migration script'i hazırlandı
- [x] Excel verilerinden 42 ürün veri script'i hazırlandı
- [x] Alternatif kullanım bilgisi eklendi

## 🚨 Önemli Notlar

1. **Veri Güncellemesi Gerekli:**
   - `node backend/update-izolasyon-data.js` script'ini çalıştırmalısınız

2. **Stok Tutarsızlığı:**
   - Excel'deki adetler güncel ve doğru
   - Script çalıştırıldığında mevcut stoklar güncellenir

3. **Alternatif Ürünler:**
   - Bazı izolasyonlar birden fazla kodda kullanılabilir
   - `kullanilan_urunler` alanında bu bilgi saklanır

4. **Renk Seçenekleri:**
   - Şu an sadece 3 renk: GRİ, MAVİ, YEŞİL
   - İhtiyaç halinde `AddIzolasyonModal.jsx` dosyasından eklenebilir

## 📞 Destek

Sorun yaşarsanız kontrol edin:
1. Backend server çalışıyor mu?
2. Veritabanı migration'ı yapıldı mı?
3. Tarayıcı console'da hata var mı?
4. Network sekmesinde API çağrıları başarılı mı?
