# PARTİ TAKİP (TEMİZLEME)

## Bu Bölüm Ne İşe Yarar?

Parti Takip bölümü, temizlemeye gönderilen ürünlerin detaylı takibi ve ödeme hesaplaması için kullanılır. Parti oluşturma, irsaliye takibi, dönüş kaydı, kalite kontrol ve ödeme hesaplama işlemlerini kapsar.

**Ne zaman kullanılır:**
- Temizlemeye yeni parti gönderirken
- İrsaliye numarası kaydedilecekken
- Ürünler temizlemeden döndüğünde
- Kalite kontrol yapıldığında
- Ödeme hesaplaması yapılacağında
- Geçmiş parti bilgilerine bakılacakken

## 📱 Bilgisayar Başında Kullanım

Parti Takip süreci **6 ana adımdan** oluşur:

```
1. Parti Oluştur
    ↓
2. İrsaliye Kaydet
    ↓
3. Dönüş Kaydı
    ↓
4. Kalite Kontrol
    ↓
5. Ödeme Hesapla
    ↓
6. Rapor/Arşiv
```

---

### Adım 1: Yeni Parti Oluşturma

**Ne yapacaksınız:**
Temizlemeye gönderilecek ürünler için yeni bir parti kaydı oluşturacaksınız.

**Nasıl yapılır:**
1. Ana menüden **"📋 Temizleme Parti Takip"** sekmesine git
2. **"+ Yeni Parti"** butonuna bas
3. Formu doldur:
   - **Parti Numarası:** Benzersiz parti numarası (örn: **TP-2026-001**)
   - **Ürün Kodu:** Hangi ürün (örn: **DIS-180**)
   - **Gönderen:** Adınız
   - **Gönderilecek Adet:** Kaç tane gönderilecek
   - **Gönderim Tarihi:** Ne zaman gönderildi
   - **Notlar:** Özel talepler (opsiyonel)
4. **"Parti Oluştur"** butonuna bas

**Örnek:**
```
Parti No: TP-2026-001
Ürün Kodu: DIS-180
Gönderen: Ahmet
Gönderilecek Adet: 1000
Gönderim Tarihi: 11/01/2026
Notlar: Acil sipariş - 3 gün içinde dönmeli
```

**Sonuç:**
- Parti kaydı oluşturuldu
- Durum: "Gönderildi"
- İrsaliye numarası eklenmeyi bekliyor

---

### Adım 2: İrsaliye Numarası Ekleme

**Ne yapacaksınız:**
Temizlemeciye gönderirken verilen irsaliye numarasını kaydetmek.

**Nasıl yapılır:**
1. Parti listesinde ilgili partiyi bul
2. **"İrsaliye Ekle"** veya **"Düzenle"** butonuna bas
3. **İrsaliye Numarası** alanına gir (örn: **2026-TM-050**)
4. **"Kaydet"** butonuna bas

**Örnek:**
```
Parti: TP-2026-001
İrsaliye No: 2026-TM-050
Tarih: 11/01/2026
```

**Neden Önemli:**
- İrsaliye takibi için gerekli
- Ödeme hesaplamada kullanılır
- Yasal zorunluluk

---

### Adım 3: Dönüş Kaydı

**Ne yapacaksınız:**
Ürünler temizlemeden döndüğünde dönüş bilgilerini kaydetmek.

**Nasıl yapılır:**
1. İlgili partinin **"Dönüş Kaydı"** butonuna bas
2. Formu doldur:
   - **Dönüş Tarihi:** Ne zaman geldi
   - **Gelen Adet:** Kaç tane döndü
   - **Eksik/Fire:** Varsa kaç tane eksik
   - **Dönüş İrsaliye No:** Dönüşte verilen irsaliye (opsiyonel)
3. **"Dönüş Kaydet"** butonuna bas

**Örnek:**
```
Parti: TP-2026-001
Gönderilen: 1000 adet
Gelen: 995 adet
Fire: 5 adet
Dönüş Tarihi: 14/01/2026
Dönüş İrsaliye: 2026-TM-050-D
```

**Fire Hesaplama:**
- Sistem otomatik hesaplar: Gönderilen - Gelen = Fire
- Fire oranı: (5 / 1000) × 100 = %0.5

---

### Adım 4: Kalite Kontrol Kaydı

**Ne yapacaksınız:**
Temizlemeden gelen ürünlerin kalite kontrolünü yapmak ve kaydetmek.

**Nasıl yapılır:**
1. İlgili partinin **"Kalite Kontrol"** butonuna bas
2. Kontrol bilgilerini gir:
   - **Kontrol Eden:** Adınız
   - **Kontrol Tarihi:** Ne zaman kontrol edildi
   - **Uygun Adet:** Kaç tane kaliteli
   - **Uygun Değil:** Kaç tane sorunlu
   - **Sorun Detayı:** Varsa ne tür sorun (opsiyonel)
3. **"Kaydet"** butonuna bas

**Örnek:**
```
Parti: TP-2026-001
Kontrol Eden: Mehmet
Tarih: 14/01/2026

Gelen Adet: 995
Uygun: 990
Uygun Değil: 5
Sorun: Temizlik yetersiz, tekrar gönderilecek
```

**Kalite Başarı Oranı:**
- (990 / 995) × 100 = %99.5

---

### Adım 5: Ödeme Hesaplama

**Ne yapacaksınız:**
Temizleme firmasına ödenecek tutarı hesaplamak.

**Nasıl yapılır:**
1. İlgili partinin **"Ödeme Hesapla"** butonuna bas
2. Ödeme bilgilerini gir:
   - **Birim Fiyat:** Adet başına fiyat (örn: **0.50 TL**)
   - **Hesaplama Yöntemi:** Gönderilen adete göre / Gelen adete göre
   - **İndirim/Ek:** Varsa (opsiyonel)
3. Sistem otomatik hesaplar

**Örnek Hesaplama 1 - Gönderilen Adete Göre:**
```
Gönderilen: 1000 adet
Birim Fiyat: 0.50 TL
─────────────────────
Toplam: 1000 × 0.50 = 500 TL
```

**Örnek Hesaplama 2 - Gelen Adete Göre:**
```
Gelen: 995 adet
Birim Fiyat: 0.50 TL
─────────────────────
Toplam: 995 × 0.50 = 497.50 TL
```

**İndirim Örneği:**
```
Gelen: 995 adet
Birim Fiyat: 0.50 TL
Ara Toplam: 497.50 TL
İndirim (%5): -24.88 TL
─────────────────────
Ödenecek: 472.62 TL
```

**Sonuç:**
- Ödeme tutarı hesaplandı
- Fatura için hazır
- Raporlarda görünür

---

### Adım 6: Parti Geçmişi ve Raporlar

**Ne yapacaksınız:**
Tamamlanmış partilerin geçmişini görüntülemek ve raporlar almak.

**Nasıl yapılır:**
1. **"Geçmiş Partiler"** sekmesine git
2. Filtreleme seçenekleri:
   - Tarihe göre
   - Ürüne göre
   - Duruma göre

**Rapor Çıktıları:**
- Aylık temizleme özeti
- Firma bazında ödeme raporu
- Fire oranı analizi
- Kalite performansı

**Detay Görüntüleme:**
```
Parti: TP-2026-001
Ürün: DIS-180
Gönderilen: 1000 adet
Gelen: 995 adet
Fire: 5 adet (%0.5)
Kalite OK: 990 adet (%99.5)
Ödeme: 497.50 TL
Süre: 3 gün
```

---

## 📋 Bilgisayar Olmadan - Toplanacak Bilgiler

### 1. Parti Gönderim Formu

```
TEMİZLEME PARTİSİ GÖNDERİM FORMU

TARİH: ___/___/______
PARTİ NO: ________________
ÜRÜN KODU: _______________
GÖNDERİLEN ADET: _________

GÖNDEREN: ________________
GÖNDERİM TARİHİ: ___/___/______
İRSALİYE NO: _____________

ÖZEL TALEPLER:
_________________________________
_________________________________

ARAÇ BİLGİSİ:
Plaka: ____________
Şoför: ____________

İMZA: ______________
```

### 2. Dönüş Tesellüm Formu

```
TEMİZLEME DÖNÜŞ TESLİM FORMU

TARİH: ___/___/______
PARTİ NO: ________________

GÖNDERİLEN ADET: _________
GELEN ADET: _________
EKSİK/FİRE: _________

DÖNÜŞ TARİHİ: ___/___/______
DÖNÜŞ İRSALİYE: __________

TESLIM ALAN: _____________

FİRE DURUMU:
  ☐ Fire yok
  ☐ Fire var
  ☐ Fire nedeni: ______________

İMZA: ______________
```

### 3. Kalite Kontrol Formu

```
TEMİZLEME KALİTE KONTROL FORMU

TARİH: ___/___/______
PARTİ NO: ________________
ÜRÜN KODU: _______________

KONTROL EDEN: ____________
KONTROL TARİHİ: ___/___/______

GELEN ADET: _________
UYGUN: _________
UYGUN DEĞİL: _________

SORUNLAR (varsa):
┌─────────────────────────┬─────┐
│ Temizlik Yetersiz       │ ___ │
│ Hasar/Ezik              │ ___ │
│ Kayıp Parça             │ ___ │
│ Diğer                   │ ___ │
└─────────────────────────┴─────┘

SORUN DETAYI:
_________________________________
_________________________________

KARAR:
  ☐ Kabul
  ☐ Red - İade edilecek
  ☐ Kısmi kabul

İMZA: ______________
```

### 4. Ödeme Hesap Formu

```
TEMİZLEME ÖDEME HESAP FORMU

PARTİ NO: ________________
ÜRÜN KODU: _______________

HESAPLAMA:
┌──────────────────────┬──────────┐
│ Gönderilen/Gelen:    │ ________ │
│ Birim Fiyat:         │ ________ │
│                      │          │
│ Ara Toplam:          │ ________ │
│                      │          │
│ İndirim (_%):        │ ________ │
│ Ek Ücret:            │ ________ │
│                      │          │
│ TOPLAM ÖDEME:        │ ________ │
└──────────────────────┴──────────┘

ÖDEME KOŞULU:
  ☐ Peşin
  ☐ 15 gün vade
  ☐ 30 gün vade
  ☐ Diğer: ______________

HAZIR LAYAN: _____________
ONAYLAYAN: ______________
TARİH: ___/___/______
```

---

## 💡 Örnek Senaryolar

### Senaryo 1: Tam Parti Takip Süreci

**Durum:**
1000 adet DIS-180 ürününü temizlemeye gönderiyorsunuz. Baştan sona tüm süreci takip edeceğiniz.

**11 Ocak - Gönderim:**
```
"Parti Takip" → "+ Yeni Parti"

Parti No: TP-2026-001
Ürün: DIS-180
Gönderen: Ahmet
Adet: 1000
Tarih: 11/01/2026
Notlar: Acil sipariş

İrsaliye: 2026-TM-050
```

**14 Ocak - Dönüş:**
```
Parti TP-2026-001 → "Dönüş Kaydı"

Gelen Adet: 995
Fire: 5
Dönüş Tarihi: 14/01/2026
Dönüş İrsaliye: 2026-TM-050-D
```

**14 Ocak - Kalite Kontrol:**
```
"Kalite Kontrol"

Kontrol Eden: Mehmet
Uygun: 990
Uygun Değil: 5 (temizlik yetersiz)
```

**15 Ocak - Ödeme:**
```
"Ödeme Hesapla"

Gelen adet: 995
Birim fiyat: 0.50 TL
Toplam: 497.50 TL
```

**Sonuç Özeti:**
```
Gönderilen: 1000
Gelen: 995
Fire: 5 (%0.5)
Kalite OK: 990 (%99.5)
Kalite Sorunlu: 5
Süre: 3 gün
Ödeme: 497.50 TL
```

---

### Senaryo 2: Fire Çıkan Parti

**Durum:**
500 adet DIS-200 gönderildi, 480 adet döndü. 20 adet fire var.

**Gönderim:**
```
Parti: TP-2026-005
Gönderilen: 500 adet
```

**Dönüş:**
```
Gelen: 480 adet
Fire: 20 adet (%4 fire oranı)
```

**Fire Analizi:**
- Normal fire: %0.5-1
- Bu parti: %4 (yüksek!)
- Neden soruşturması gerekli

**Aksiyon:**
1. Temizleme firmasıyla görüş
2. Fire nedenini öğren
3. Fire sorumluluğu belirle:
   - Temizleme hatası → Firmadan tazmin
   - Normal fire → Kabul
4. Ödeme hesaplarken fire düş

**Ödeme Hesabı:**
```
Gelen: 480 adet (fire dahil değil)
Birim fiyat: 0.50 TL
Toplam: 240 TL

Not: 20 adet fire temizleme firması sorumluluğunda
     Firma bu 20 adet için ücret alamaz
```

---

### Senaryo 3: Kalite Sorunlu Dönüş

**Durum:**
Temizlemeden dönen 300 adetten 50 tanesi kalite kontrolden geçemedi.

**Dönüş Kaydı:**
```
Parti: TP-2026-010
Gönderilen: 300
Gelen: 300
Fire: 0
```

**Kalite Kontrol:**
```
Uygun: 250
Uygun Değil: 50
Sorun: Temizlik yetersiz, yağ kalıntısı var
```

**Karar:**
```
50 adet tekrar temizlemeye gidecek
Temizleme firması ek ücret almadan temizleyecek
(İlk temizlik kalitesiz olduğu için)
```

**Yeni Parti Oluştur:**
```
Parti: TP-2026-010-R (R = Rework)
Adet: 50
Notlar: Kalite sorunu nedeniyle tekrar temizleme
        Ek ücret YOK
```

---

## ⚠️ Önemli Notlar

### Parti Numaralandırma
- **Benzersiz olmalı:** Her parti farklı numara
- **Sistem önerisi:** TP-YILYIL-SIRA formatı (TP-2026-001)
- **Kolay takip:** Numaraya bakınca hangi dönem olduğu belli olmalı

### İrsaliye Takibi
- **Mutlaka kaydet:** Her gönderim ve dönüşte irsaliye no
- **Yasal zorunluluk:** Vergi dairesi için gerekli
- **Takip kolaylığı:** İrsaliye ile eşleştirme yapılır

### Fire Yönetimi
- **Normal fire:** %0.5-1 arası kabul edilebilir
- **Yüksek fire:** %2 üzeri soruşturulmalı
- **Sorumluluk:** Fire kimin sorumluluğunda belirlenmeli

### Kalite Kontrol
- **Mutlaka yapılmalı:** Temizlemeden gelen her parti kontrol edilmeli
- **Standart:** Her kontrol elemanı aynı kriterleri uygulamalı
- **Kayıt:** Sorunlar detaylı kaydedilmeli

### Ödeme Hesaplama
- **Netleştir:** Gönderilen mi, gelen mi - önceden anlaş
- **Fire düş:** Sorumlu fire ödemeye dahil edilmez
- **Döküm ver:** Firmaya detaylı hesap dökümü ver

---

## ❌ Sık Yapılan Hatalar

### Hata 1: Dönüş Adedi Yazılmadan Kalite Kontrole Geçmek

**Yanlış:**
```
1. Parti oluştur
2. Dönüş kaydı atla
3. Direkt kalite kontrole geç
→ Kaç adet geldi bilgisi yok!
```

**Doğru:**
```
1. Parti oluştur
2. Dönüş kaydı yap (gelen adet)
3. Sonra kalite kontrol
```

### Hata 2: Fire Nedenini Araştırmamak

**Yanlış:**
```
Fire: 20 adet (%4)
Neden: Bilinmiyor
Ödeme: Fire dahil hesaplandı
```

**Doğru:**
```
Fire: 20 adet (%4)
Neden Araştır:
- Taşıma hasarı mı?
- Temizleme firması sorumluluğu mu?
- Zaten hasarlı mı gönderildi?

Sorumluya göre ödeme hesapla
```

### Hata 3: Kalite Sorununu Ödeme Hesabına Yansıtmamak

**Yanlış:**
```
Gelen: 300 adet
Kalite OK: 250 adet
Kalite Sorunlu: 50 adet

Ödeme: 300 × 0.50 = 150 TL (YANLIŞ!)
```

**Doğru:**
```
Gelen: 300 adet
Kalite OK: 250 adet
Kalite Sorunlu: 50 adet (kabul edilmedi)

Ödeme: 250 × 0.50 = 125 TL
veya
Sözleşmeye göre: 300 adet ödeme + 50 adet tekrar temizleme
```

---

**Sonraki Bölüm:** [Yarı Mamül Joint ve Fittingsler →](06-yari-mamul.md)
