# YARI MAMÜL JOINT VE FİTTİNGSLER

## Bu Bölüm Ne İşe Yarar?

Yarı Mamül bölümü, eşleşmeyen A/B ürünlerinin (Jointler ve Fittingsler) stok takibini yapmak için kullanılır. Joint üretiminde A ve B parçaları eşit sayıda olmadığında, kalan parçalar buraya kaydedilir.

**Ne zaman kullanılır:**
- Joint üretiminde A ve B parçaları eşleşmediğinde
- Fittings üretiminde fazla veya eksik parça olduğunda
- Yarı mamül stok kontrolü yapılacağında
- Eşleşmeyen parçaları birleştirmek için bakılacağında

**Önemli:** Bu bölüm **stok yönetimi** içindir. Üretim tamamlanmamış ürünlerin takibi.

---

## 📱 Bilgisayar Başında Kullanım

Yarı Mamül bölümü **2 sekmeden** oluşur:

1. **Jointler** - Joint A/B/C/D parçaları
2. **Fittingsler** - Fittings parçaları

---

## 1. JOINTLER STOK YÖNETİMİ

### Ne İşe Yarar?
Joint üretiminde A, B, C, D parçalarının ayrı ayrı stok takibi.

**Örnek Durum:**
```
DIS-180 Joint Üretimi:
- A parçası: 1000 adet üretildi
- B parçası: 980 adet üretildi
─────────────────────────────
Eşleşen: 980 çift (sevk edildi)
Kalan A parçası: 20 adet → Yarı mamül stoğa kaydet
```

### Adım 1: Jointler Listesini Görüntüleme

**Nasıl yapılır:**
1. Ana menüden **"🔧 Yarı Mamül Joint ve Fittingsler"** sekmesine git
2. **"Jointler"** sekmesine tıkla
3. Tüm joint kayıtlarını göreceksiniz

**Ne göreceksiniz:**

| Sütun | Anlamı | Örnek |
|-------|--------|-------|
| Ürün | Joint kodu | DIS-180 |
| A Adet | A parçası stok | 20 |
| B Adet | B parçası stok | 0 |
| C Adet | C parçası stok | 0 |
| D Adet | D parçası stok | 0 |
| KG | Toplam ağırlık | 15.5 |
| İşlemler | Düzenle / Sil | ✏️ 🗑️ |

---

### Adım 2: Yeni Joint Kaydı Ekleme

**Ne yapacaksınız:**
Eşleşmeyen parçaları sisteme kaydetmek.

**Nasıl yapılır:**
1. **"+ Yeni Joint Ekle"** butonuna bas
2. Formu doldur:
   - **Ürün Kodu:** Joint kodu (örn: **DIS-180**)
   - **A Adet:** A parçası adet (örn: **20**)
   - **B Adet:** B parçası adet (örn: **0**)
   - **C Adet:** C parçası adet (varsa)
   - **D Adet:** D parçası adet (varsa)
   - **KG:** Toplam kilogram
   - **Yapan:** Adınız
3. **"Ekle"** butonuna bas

**Örnek:**
```
Ürün Kodu: DIS-180
A Adet: 20
B Adet: 0
C Adet: 0
D Adet: 0
KG: 15.5
Yapan: Ahmet
```

**Sonuç:**
- 20 adet DIS-180 A parçası yarı mamül stoğa eklendi
- Eşleşen B parçası geldiğinde birleştirilecek

---

### Adım 3: Joint Stok Düzenleme

**Ne yapacaksınız:**
Mevcut kaydı güncellemek (stok artırma/azaltma).

**Nasıl yapılır:**
1. İlgili ürünün yanındaki **✏️ "Düzenle"** butonuna bas
2. Adetleri güncelle:
   - Artırmak için: Mevcut + Yeni
   - Azaltmak için: Mevcut - Kullanılan
3. **"Güncelle"** butonuna bas

**Örnek - Stok Artırma:**
```
Mevcut: A Adet = 20
Yeni üretim: 15 adet A daha geldi

Güncelleme:
A Adet: 20 + 15 = 35
```

**Örnek - Eşleştirme (Stok Azaltma):**
```
Mevcut: A Adet = 20
B parçası 20 adet geldi → eşleştirildi

Güncelleme:
A Adet: 20 - 20 = 0 (stok sıfırlandı)
```

---

### Adım 4: Joint Silme

**Nasıl yapılır:**
1. İlgili ürünün yanındaki **🗑️ "Sil"** butonuna bas
2. Onay sorusuna **"Evet"** de
3. **Yapan** bilgisini gir (kim sildi)

**Ne zaman silinmeli:**
- Tüm parçalar eşleşti, stok sıfır oldu
- Hatalı kayıt yapıldı
- Ürün artık üretilmiyor

---

## 2. FİTTİNGSLER STOK YÖNETİMİ

### Ne İşe Yarar?
Fittings parçalarının ebat/kod ve ürün tipine göre stok takibi.

**Fittings Yapısı:**
- **Ebat / Kod:** Ürün ebadı veya kodu (örn: 1/2", 3/4", F-100)
- **Ürün Tipi:** Dirsek, Te, Redüksiyon vb.

### Adım 1: Fittingsler Listesini Görüntüleme

**Nasıl yapılır:**
1. **"Fittingsler"** sekmesine tıkla
2. Tüm fittings kayıtlarını göreceksiniz

**Ne göreceksiniz:**

| Sütun | Anlamı | Örnek |
|-------|--------|-------|
| Ebat / Kod | Ürün ebadı | 1/2" |
| Ürün Tipi | Tip | Dirsek |
| Adet | Stok adedi | 50 |
| KG | Ağırlık | 25.3 |
| İşlemler | Düzenle / Sil | ✏️ 🗑️ |

---

### Adım 2: Yeni Fittings Ekleme

**Nasıl yapılır:**
1. **"+ Yeni Fittings Ekle"** butonuna bas
2. Formu doldur:
   - **Ebat / Kod:** Ebat veya kod (örn: **1/2"**)
   - **Ürün Tipi:** Tip (örn: **Dirsek**)
   - **Adet:** Kaç tane (örn: **50**)
   - **KG:** Kilogram (örn: **25.3**)
   - **Yapan:** Adınız
3. **"Ekle"** butonuna bas

**Örnek:**
```
Ebat / Kod: 1/2"
Ürün Tipi: Dirsek
Adet: 50
KG: 25.3
Yapan: Mehmet
```

**Sonuç:**
- 50 adet 1/2" Dirsek yarı mamül stoğa eklendi

---

### Adım 3: Fittings Düzenleme

**Örnek - Stok Artırma:**
```
Mevcut: 1/2" Dirsek = 50 adet
Yeni üretim: 30 adet daha

Güncelleme:
Adet: 50 + 30 = 80
```

**Örnek - Stok Azaltma (Kullanım):**
```
Mevcut: 1/2" Dirsek = 80 adet
Sipariş için kullanıldı: 25 adet

Güncelleme:
Adet: 80 - 25 = 55
```

---

## 📋 Bilgisayar Olmadan - Toplanacak Bilgiler

### 1. Jointler Stok Formu

```
YARI MAMÜL JOİNTLER STOK FORMU

TARİH: ___/___/______
KAYDEDEN: __________________

ÜRÜN KODU: __________________

PARÇA ADETLERİ:
┌──────────┬──────┐
│ A Adet   │ ____ │
│ B Adet   │ ____ │
│ C Adet   │ ____ │
│ D Adet   │ ____ │
└──────────┴──────┘

TOPLAM KG: __________

İŞLEM TİPİ (daire yapın):
  Yeni Stok Girişi
  Stok Artırma
  Stok Azaltma (Eşleştirme)

NEDEN:
_________________________________
_________________________________

İMZA: ______________
```

### 2. Fittingsler Stok Formu

```
YARI MAMÜL FİTTİNGSLER STOK FORMU

TARİH: ___/___/______
KAYDEDEN: __________________

EBAT / KOD: _________________
ÜRÜN TİPİ: __________________

ADET: __________
KG: __________

İŞLEM TİPİ (daire yapın):
  Yeni Stok Girişi
  Stok Artırma
  Stok Azaltma

NEDEN:
_________________________________
_________________________________

İMZA: ______________
```

### 3. Eşleştirme Formu

```
YARI MAMÜL EŞLEŞTİRME FORMU

TARİH: ___/___/______
EŞLEŞTİREN: _________________

ÜRÜN: _______________________

STOK DURUMU (Öncesi):
  A Adet: _____ | B Adet: _____
  C Adet: _____ | D Adet: _____

EŞLEŞTİRİLEN:
  Çift Sayısı: _____
  Sevk Edilen: _____

KALAN (Sonrası):
  A Adet: _____ | B Adet: _____
  C Adet: _____ | D Adet: _____

İMZA: ______________
```

---

## 💡 Örnek Senaryolar

### Senaryo 1: Joint Üretimi - Eşleşmeyen Parçalar

**Durum:**
DIS-180 joint üretimi yapıldı.

**Üretim Sonucu:**
```
A parçası: 1000 adet üretildi
B parçası: 980 adet üretildi
```

**Eşleştirme:**
```
Eşleşen çift: 980 adet → Sevk Edildi
Kalan A parçası: 20 adet → Yarı Mamül Stoğa
```

**Çözüm:**
```
"Yarı Mamül" → "Jointler" → "+ Yeni Joint Ekle"

Ürün: DIS-180
A Adet: 20
B Adet: 0
KG: 15.5
Yapan: Ahmet
```

**Sonuç:**
- 20 adet DIS-180 A parçası yarı mamül stoğa kaydedildi
- Yeni B üretimi geldiğinde eşleştirilecek

---

### Senaryo 2: Biriken Stokları Eşleştirme

**Durum:**
Sistemde DIS-200 için biriken yarı mamül var:

**Mevcut Stok:**
```
DIS-200:
  A Adet: 35
  B Adet: 0
```

**Yeni Üretim:**
```
B parçası: 50 adet üretildi
```

**Eşleştirme:**
```
A: 35 adet (mevcut)
B: 50 adet (yeni)

Eşleşen: 35 çift → Sevk Edildi
Kalan B: 15 adet → Yarı Mamül Stoğa
```

**Sistem Güncellemesi:**
```
"Jointler" → DIS-200 → "Düzenle"

A Adet: 35 - 35 = 0
B Adet: 0 + (50 - 35) = 15
```

**Sonuç:**
- 35 çift sevk edildi
- 15 adet B parçası yarı mamül stokta bekliyor

---

### Senaryo 3: Fittings Stok Kullanımı

**Durum:**
1/2" Dirsek stoğu var. Sipariş için kullanılacak.

**Mevcut Stok:**
```
1/2" Dirsek: 80 adet
```

**Sipariş Talebi:**
```
Müşteri siparişi için 25 adet gerekli
```

**Çözüm:**
```
"Fittingsler" → 1/2" Dirsek → "Düzenle"

Adet: 80 - 25 = 55
```

**Sonuç:**
- 25 adet sipariş için kullanıldı
- 55 adet yarı mamül stokta kaldı

---

## ⚠️ Önemli Notlar

### Joint Eşleştirme
- **A-B dengesi:** Mümkünse A ve B adetleri dengesiz üretilmesin
- **Planlama:** Üretim planlaması yaparken yarı mamül stoğu kontrol edin
- **Eşleştirme önceliği:** Eski stokları önce kullanın (FIFO)

### Stok Kontrolü
- **Düzenli sayım:** Ayda bir fiziksel stok sayımı yapın
- **Sistem-gerçek uyumu:** Stok kayıtları gerçek stokla uyumlu olmalı
- **Eskimiş stok:** Uzun süredir bekleyen stokları raporlayın

### Ağırlık Takibi (KG)
- **Önemli:** Ağırlık bilgisi lojistik için gerekli
- **Birim ağırlık:** Her ürün için standart birim ağırlık belli olmalı
- **Toplam hesap:** Adet × Birim Ağırlık = Toplam KG

### Log Sistemi
- **Kim ne yaptı:** Her işlem kaydedilir
- **Takip:** Geçmiş işlemleri görmek için log butonunu kullanın
- **Sorumluluk:** "Yapan" bilgisi mutlaka girilmeli

---

## ❌ Sık Yapılan Hatalar

### Hata 1: Eşleşen Parçaları Yarı Mamül Stoğa Eklemek

**Yanlış:**
```
Üretim:
A: 100 adet
B: 100 adet

Yarı Mamül Stoğa:
A: 100 adet ← YANLIŞ!
B: 100 adet ← YANLIŞ!
```

**Doğru:**
```
Üretim:
A: 100 adet
B: 100 adet

Eşleşme: 100 çift → Direkt Sevk
Yarı Mamül: 0 (eşleştiği için stok yok)
```

### Hata 2: Stok Azaltırken Doğrudan Silmek

**Yanlış:**
```
Mevcut: A Adet = 50
25 adet kullanıldı
→ Kaydı tamamen sil ← YANLIŞ!
```

**Doğru:**
```
Mevcut: A Adet = 50
25 adet kullanıldı
→ Düzenle: A Adet = 50 - 25 = 25
```

**Not:** Stok sıfır olana kadar düzenle, sıfır olunca sil.

### Hata 3: Ürün Tipi Karışıklığı (Fittingsler)

**Yanlış:**
```
Ebat: 1/2"
Ürün Tipi: Dirsek

Aynı ebatta:
Ebat: 1/2"
Ürün Tipi: Dirsek ← Tekrar kayıt (YANLIŞ!)
```

**Doğru:**
```
Sistem kontrolü:
Aynı Ebat + Aynı Ürün Tipi = Tekrar kayıt yapılamaz

Zaten var olan kaydı düzenle
```

### Hata 4: KG Bilgisini Güncellememek

**Yanlış:**
```
İlk kayıt:
Adet: 50, KG: 25.0

Stok güncelleme:
Adet: 80 ← Güncellendi
KG: 25.0 ← GÜNCELLENMEDİ (YANLIŞ!)
```

**Doğru:**
```
Birim ağırlık: 0.5 kg

İlk kayıt:
Adet: 50, KG: 50 × 0.5 = 25.0

Stok güncelleme:
Adet: 80
KG: 80 × 0.5 = 40.0 ← Güncellendi
```

---

**Sonraki Bölüm:** [Ürün Siparişi İhtiyaç Hesaplama →](07-urun-recetesi.md)
