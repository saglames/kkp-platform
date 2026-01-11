# ÜRÜN SİPARİŞİ İHTİYAÇ HESAPLAMA

## Bu Bölüm Ne İşe Yarar?

Ürün Siparişi İhtiyaç Hesaplama bölümü, yeni bir sipariş geldiğinde hangi malzemelerin ne kadar gerekli olduğunu hesaplamak için kullanılır. Ürün reçetelerine göre otomatik hesaplama yapar.

**Ne zaman kullanılır:**
- Yeni sipariş geldiğinde malzeme ihtiyacını hesaplamak için
- Üretim planlamas ı yaparken
- Malzeme sipariş vermeden önce
- Simülasyon stoktan düşme işlemi için

**Önemli:** Bu bölüm sadece hesaplama yapar, gerçek stoktan düşmez (simülasyon stoktan düşer).

---

## 📱 Bilgisayar Başında Kullanım

### Adım 1: Sipariş Hesaplama Sayfasına Gitme

**Nasıl yapılır:**
1. Ana menüden **"📊 Ürün Siparişi İhtiyaç Hesaplama"** sekmesine git
2. İki ana bölüm göreceksiniz:
   - **Sipariş Hesaplama** - Yeni hesaplama yapmak için
   - **Ürün Reçeteleri** - Mevcut reçeteleri görüntüleme/düzenleme

---

### Adım 2: Sipariş Hesaplama

**Ne yapacaksınız:**
Bir ürün için kaç tane sipariş geldiğinde hangi malzemeler ne kadar gerekli hesaplayacaksınız.

**Nasıl yapılır:**
1. **"Sipariş Hesaplama"** bölümüne git
2. Formu doldur:
   - **Ürün Kodu:** Hangi ürün siparişi (örn: **DIS-180**)
   - **Sipariş Adedi:** Kaç tane (örn: **1000**)
3. **"Hesapla"** butonuna bas

**Örnek:**
```
Ürün Kodu: DIS-180
Sipariş Adedi: 1000

[Hesapla]
```

**Sonuç Ekranı:**
```
═══════════════════════════════════════════
DIS-180 İÇİN 1000 ADET SİPARİŞ
═══════════════════════════════════════════

GEREKLI MALZEMELER:
┌─────────────────────┬───────────┬────────┐
│ Malzeme             │ Birim     │ Miktar │
├─────────────────────┼───────────┼────────┤
│ A Parçası           │ Adet      │  1000  │
│ B Parçası           │ Adet      │  1000  │
│ Kaynak Teli         │ KG        │   50   │
│ İzolasyon           │ Metre     │  500   │
│ Koli                │ Adet      │   50   │
│ Tapa                │ Adet      │  2000  │
└─────────────────────┴───────────┴────────┘

Not: Bu hesaplama ürün reçetesine göre yapılmıştır.
```

---

### Adım 3: Simülasyon Stoktan Düşme

**Ne yapacaksınız:**
Hesaplanan malzemeleri simülasyon stoktan düşmek (planlama için).

**Nasıl yapılır:**
1. Hesaplama sonuç ekranında **"Simülasyon Stoktan Düş"** butonuna bas
2. Onay sorusuna **"Evet"** de
3. Malzemeler simülasyon stoktan düşülecek

**Ne olur:**
```
Öncesi (Simülasyon Stok):
- A Parçası: 5000 adet
- B Parçası: 4800 adet
- Kaynak Teli: 200 kg
- İzolasyon: 1000 metre
- Koli: 100 adet
- Tapa: 5000 adet

Düşüldükten Sonrası:
- A Parçası: 5000 - 1000 = 4000 adet
- B Parçası: 4800 - 1000 = 3800 adet
- Kaynak Teli: 200 - 50 = 150 kg
- İzolasyon: 1000 - 500 = 500 metre
- Koli: 100 - 50 = 50 adet
- Tapa: 5000 - 2000 = 3000 adet
```

**Uyarı:** Simülasyon stokta yeterli malzeme yoksa sistem uyarı verir:
```
⚠️ UYARI: İzolasyon stoğu yetersiz!
Gerekli: 500 metre
Mevcut: 300 metre
Eksik: 200 metre

→ Malzeme sipariş verilmeli
```

---

### Adım 4: Ürün Reçetelerini Görüntüleme

**Ne yapacaksınız:**
Sistemdeki tüm ürün reçetelerini görmek.

**Nasıl yapılır:**
1. **"Ürün Reçeteleri"** sekmesine git
2. Tüm ürünlerin reçetelerini göreceksiniz

**Ne göreceksiniz:**

| Ürün Kodu | Malzeme Sayısı | Son Güncelleme |
|-----------|----------------|----------------|
| DIS-180 | 6 malzeme | 10/01/2026 |
| DIS-200 | 5 malzeme | 08/01/2026 |
| DIS-220 | 6 malzeme | 05/01/2026 |

**Detay Görüntüleme:**
1. İlgili ürünün yanındaki **"Detay"** butonuna bas
2. Reçete detayını göreceksiniz:
   ```
   DIS-180 ÜRÜN REÇETESİ

   1 adet DIS-180 için:
   - A Parçası: 1 adet
   - B Parçası: 1 adet
   - Kaynak Teli: 0.05 kg
   - İzolasyon: 0.5 metre
   - Koli: 0.05 adet (20 ürün = 1 koli)
   - Tapa: 2 adet
   ```

---

### Adım 5: Yeni Ürün Reçetesi Ekleme

**Ne yapacaksınız:**
Yeni bir ürün için reçete tanımlamak.

**Nasıl yapılır:**
1. **"+ Yeni Reçete Ekle"** butonuna bas
2. **Ürün Kodu** gir (örn: **DIS-250**)
3. **Malzeme Listesi** ekle:
   - Malzeme adı
   - Birim (adet, kg, metre, vb.)
   - 1 ürün için miktar
4. **"Kaydet"** butonuna bas

**Örnek - DIS-250 Reçetesi:**
```
Ürün Kodu: DIS-250

Malzemeler:
┌──────────────┬────────┬───────────────────┐
│ Malzeme      │ Birim  │ 1 Ürün Başına     │
├──────────────┼────────┼───────────────────┤
│ A Parçası    │ Adet   │ 1                 │
│ B Parçası    │ Adet   │ 1                 │
│ C Parçası    │ Adet   │ 1                 │
│ Kaynak Teli  │ KG     │ 0.06              │
│ İzolasyon    │ Metre  │ 0.6               │
│ Koli         │ Adet   │ 0.04 (25 ürün/koli)│
│ Tapa         │ Adet   │ 2                 │
└──────────────┴────────┴───────────────────┘

[Kaydet]
```

**Sonuç:**
- DIS-250 reçetesi sisteme eklendi
- Artık DIS-250 için hesaplama yapılabilir

---

## 📋 Bilgisayar Olmadan - Toplanacak Bilgiler

### 1. Sipariş Hesaplama Talep Formu

```
SİPARİŞ HESAPLAMA TALEP FORMU

TARİH: ___/___/______
TALEP EDEN: __________________

ÜRÜN KODU: __________________
SİPARİŞ ADEDİ: __________

HESAPLAMA TALEP EDİLİYOR

Bu formu doldurup planlama bölümüne verin.
Hesaplama sonucu size iletilecek.

İMZA: ______________
```

### 2. Ürün Reçetesi Tanımlama Formu

```
ÜRÜN REÇETESİ TANIMLAMA FORMU

TARİH: ___/___/______
HAZIRLAYAN: __________________

ÜRÜN KODU: __________________
ÜRÜN ADI: ____________________

MALZEME LİSTESİ (1 ürün başına):
┌─────┬──────────────┬────────┬─────────┐
│ No  │ Malzeme      │ Birim  │ Miktar  │
├─────┼──────────────┼────────┼─────────┤
│  1  │              │        │         │
│  2  │              │        │         │
│  3  │              │        │         │
│  4  │              │        │         │
│  5  │              │        │         │
│  6  │              │        │         │
│  7  │              │        │         │
│  8  │              │        │         │
└─────┴──────────────┴────────┴─────────┘

ÖZEL NOTLAR:
_________________________________
_________________________________

ONAYLA YAN: _____________
TARİH: ___/___/______
```

### 3. Hesaplama Sonuç Formu (Bilgisayardan Alınan)

```
SİPARİŞ HESAPLAMA SONUCU

Ürün: _______________
Sipariş Adedi: _______________
Hesaplama Tarihi: ___/___/______

GEREKLI MALZEMELER:
┌─────┬──────────────┬────────┬─────────┐
│ No  │ Malzeme      │ Birim  │ Miktar  │
├─────┼──────────────┼────────┼─────────┤
│  1  │              │        │         │
│  2  │              │        │         │
│  3  │              │        │         │
│  4  │              │        │         │
│  5  │              │        │         │
│  6  │              │        │         │
└─────┴──────────────┴────────┴─────────┘

STOK UYARISI:
  ☐ Tüm malzemeler yeterli
  ☐ Eksik malzeme var (aşağıda belirtilmiştir)

EKSİK MALZEMELER:
_________________________________
_________________________________

Hazırlayan: _____________
```

---

## 💡 Örnek Senaryolar

### Senaryo 1: Basit Sipariş Hesaplama

**Durum:**
Müşteriden 1000 adet DIS-180 siparişi geldi. Hangi malzemeler ne kadar gerekli?

**Çözüm:**
```
"Ürün Siparişi İhtiyaç Hesaplama" → "Sipariş Hesaplama"

Ürün Kodu: DIS-180
Sipariş Adedi: 1000
[Hesapla]
```

**Sonuç:**
```
GEREKLI MALZEMELER:
- A Parçası: 1000 adet
- B Parçası: 1000 adet
- Kaynak Teli: 50 kg
- İzolasyon: 500 metre
- Koli: 50 adet
- Tapa: 2000 adet
```

**Sonraki Adım:**
1. Stokları kontrol et - yeterli mi?
2. Eksik varsa malzeme sipariş ver
3. Üretime başla

---

### Senaryo 2: Stok Kontrolü ile Birlikte Hesaplama

**Durum:**
2000 adet DIS-200 siparişi. Stokta ne kadar var, ne kadar eksik?

**Çözüm:**

**1. Hesaplama:**
```
Ürün: DIS-200
Sipariş: 2000 adet
[Hesapla]

Sonuç:
- A Parçası: 2000 adet gerekli
- B Parçası: 2000 adet gerekli
- Kaynak Teli: 100 kg gerekli
- İzolasyon: 1000 metre gerekli
```

**2. Mevcut Stok Kontrolü:**
```
Gerçek Stok:
- A Parçası: 2500 adet ✓ Yeterli
- B Parçası: 1500 adet ✗ EKSİK (500 adet)
- Kaynak Teli: 120 kg ✓ Yeterli
- İzolasyon: 800 metre ✗ EKSİK (200 metre)
```

**3. Eksik Malzeme Siparişi:**
```
SİPARİŞ VERİLMELİ:
- B Parçası: 500 adet
- İzolasyon: 200 metre (veya daha fazla)
```

---

### Senaryo 3: Yeni Ürün Reçetesi Tanımlama

**Durum:**
Yeni ürün: DIS-300. Reçetesini sisteme girmemiz gerekiyor.

**Ürün Yapısı:**
```
DIS-300 = 1 adet A + 1 adet B + 1 adet C + Kaynak + İzolasyon + Paketleme
```

**Çözüm:**
```
"Ürün Reçeteleri" → "+ Yeni Reçete Ekle"

Ürün Kodu: DIS-300

Malzemeler:
1. A Parçası: 1 adet
2. B Parçası: 1 adet
3. C Parçası: 1 adet
4. Kaynak Teli: 0.07 kg
5. İzolasyon: 0.7 metre
6. Koli: 0.033 adet (30 ürün/koli)
7. Tapa: 3 adet

[Kaydet]
```

**Test:**
```
100 adet DIS-300 siparişi için hesapla:

Sonuç:
- A Parçası: 100 adet
- B Parçası: 100 adet
- C Parçası: 100 adet
- Kaynak Teli: 7 kg
- İzolasyon: 70 metre
- Koli: 4 adet (3.3 yuvarlandı)
- Tapa: 300 adet
```

---

## ⚠️ Önemli Notlar

### Reçete Doğruluğu
- **Kritik:** Reçeteler yanlışsa hesaplamalar da yanlış olur
- **Doğrulama:** Yeni reçete girince mutlaka test et
- **Güncelleme:** Ürün değiştiğinde reçeteyi güncelle

### Simülasyon Stok
- **Planlama aracı:** Gerçek stoktan düşmez, sadece plan için
- **Takip:** Simülasyon stok kullanım takibi yapın
- **Sıfırlama:** Üretim bittikten sonra simülasyon stoku sıfırlayın

### Birim Dönüşümleri
- **Dikkat:** Birimler doğru olmalı (adet, kg, metre)
- **Ondalık:** 0.05 gibi ondalık sayılar kullanılabilir
- **Yuvarlama:** Koli gibi bölünemeyen birimler yuvarlanır

### Eksik Malzeme
- **Uyarı sistemi:** Stok yetersizse sistem uyarı verir
- **Önlem:** Siparişten önce mutlaka stok kontrolü yapın
- **Zamanında sipariş:** Eksik malzeme için erkenden sipariş verin

---

## ❌ Sık Yapılan Hatalar

### Hata 1: Reçetede Hatalı Miktar

**Yanlış:**
```
DIS-180 Reçetesi:
- Tapa: 1 adet (1 ürün başına)

1000 adet sipariş hesaplama:
- Tapa: 1000 adet ← YANLIŞ! (2000 olmalı)
```

**Doğru:**
```
DIS-180 Reçetesi:
- Tapa: 2 adet (1 ürün başına)

1000 adet sipariş hesaplama:
- Tapa: 2000 adet ← DOĞRU
```

### Hata 2: Simülasyon Stok ile Gerçek Stok Karıştırma

**Yanlış:**
```
Simülasyon stoktan düştüm
Artık gerçek stokta da düştü sanıyorum ← YANLIŞ!
```

**Doğru:**
```
Simülasyon stoktan düşme = Sadece planlama
Gerçek stok = Üretimde kullanılınca düşer

İki sistem ayrı!
```

### Hata 3: Ondalık Sayıları Yuvarlama

**Yanlış:**
```
Koli: 0.05 adet/ürün (20 ürün = 1 koli)

100 adet sipariş:
Koli: 100 × 0.05 = 5 adet ← Tam sayı, OK

101 adet sipariş:
Koli: 101 × 0.05 = 5.05 adet
Manuel: 5 adet sipariş verdim ← YANLIŞ!
(1 adet eksik kalır, 101. ürün paketlenemez)
```

**Doğru:**
```
101 adet sipariş:
Koli: 101 × 0.05 = 5.05 adet
→ Yukarı yuvarla: 6 adet ← DOĞRU
```

### Hata 4: Eski Reçeteyi Güncellemeden Kullanma

**Yanlış:**
```
DIS-180 ürünü değişti, artık 3 tapa gerekiyor
Reçete güncellenmedi (hala 2 tapa)

Sipariş hesaplama:
Tapa: 2000 adet (1000 ürün × 2) ← YANLIŞ!
Gerçekte: 3000 adet gerekli (1000 ürün × 3)
→ 1000 adet tapa eksik kalır!
```

**Doğru:**
```
Ürün değişti → Reçeteyi güncelle
Sonra hesaplama yap
```

---

**Sonraki Bölüm:** [Hata Çözümleri →](08-hata-cozumleri.md)
