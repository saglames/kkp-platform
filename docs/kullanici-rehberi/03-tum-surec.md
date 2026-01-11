# TÜM SÜREÇ YÖNETİMİ

## Bu Bölüm Ne İşe Yarar?

Tüm Süreç bölümü, ürünlerin temizlemeden sevkiyata kadar olan tüm aşamalarını takip etmek için kullanılır. Hangi ürünler nerede, hangi aşamada - hepsini buradan görebilirsiniz.

**Ne zaman kullanılır:**
- Ürünler temizlemeye gönderilirken
- Ürünler temizlemeden geldiğinde
- Sevkiyat hazırlığı yapılırken
- Sevk edilen ürünleri kaydetmek için
- Kalan ürünleri kontrol etmek için

## 📱 Bilgisayar Başında Kullanım

Tüm Süreç **6 ana aşamadan** oluşur:

```
┌─────────────────┐
│ 1. Temizlemeye  │
│    Gidecek      │
└────────┬────────┘
         ↓
┌─────────────────┐
│ 2. Temizlemede  │
│    Olan         │
└────────┬────────┘
         ↓
┌─────────────────┐
│ 3. Temizlemeden │
│    Gelen        │
└────────┬────────┘
         ↓
┌─────────────────┐
│ 4. Sevke Hazır  │
└────────┬────────┘
         ↓
┌─────────────────┐
│ 5. Sevk Edilen  │
└────────┬────────┘
         ↓
┌─────────────────┐
│ 6. Kalan        │
│    Ürünler      │
└─────────────────┘
```

### Anasayfa - Özet Görünüm

**İlk açıldığında ne göreceksiniz:**

Ana sayfada tüm aşamalardaki ürünlerin özet listesi görünür:
- Ürün kodu
- Parti numarası
- Adet
- Hangi aşamada
- Tarih

**Yeni özellikler:**
- ✏️ **Düzenle** butonu - Ürün bilgilerini düzenleyebilirsiniz
- 🗑️ **Sil** butonu - Yanlış kaydı silebilirsiniz

---

## 1. TEMİZLEMEYE GİDECEK

### Ne İşe Yarar?
Temizlemeye gönderilecek ürünleri kaydetmek için kullanılır. Henüz temizlemeciye gönderilmedi ama hazırlanıyor.

### Adım 1: Yeni Ürün Ekleme

**Nasıl yapılır:**
1. "Tüm Süreç" menüsüne git
2. **"Temizlemeye Gidecek"** sekmesine tıkla
3. **"+ Yeni Ürün Ekle"** butonuna bas
4. Formu doldur:
   - **Ürün Kodu:** Ne gönderilecek (örn: DIS-180)
   - **Parti No:** Parti numarası
   - **Adet:** Kaç tane
   - **Tarih:** Ne zaman gönderilecek
   - **Not:** Özel açıklama (opsiyonel)
5. **"Ekle"** butonuna bas

**Örnek:**
```
Ürün Kodu: DIS-180
Parti No: 25012
Adet: 500
Tarih: 12/01/2026
Not: Acil sipariş için öncelikli
```

### Adım 2: Temizlemeye Gönderme

**Nasıl yapılır:**
1. Hazır olan ürünün yanındaki **"Gönder"** butonuna bas
2. Gönderim tarihini onayla
3. Ürün otomatik olarak **"Temizlemede Olan"** listesine geçer

---

## 2. TEMİZLEMEDE OLAN

### Ne İşe Yarar?
Şu anda temizlemecide olan ürünleri gösterir. Hangi ürünler dışarıda - takip buradan yapılır.

### Ürünleri Görüntüleme

**Ne göreceksiniz:**
- Ürün kodu
- Parti numarası
- Adet
- Gönderilme tarihi
- Kaç gündür temizlemede

**Nasıl geldi buraya:**
- Önceki aşamadan (Temizlemeye Gidecek) "Gönder" butonuyla

**Ne zaman geçer:**
- Temizlemeden geri geldiğinde bir sonraki aşamaya geçer

---

## 3. TEMİZLEMEDEN GELEN

### Ne İşe Yarar?
Temizlemeden geri gelen ürünleri kaydetmek için kullanılır. Ürünler temizlendi, fabrikaya geri döndü.

### Adım 1: Dönüş Kaydı

**Nasıl yapılır:**
1. **"Temizlemeden Gelen"** sekmesine git
2. Sistem otomatik olarak "Temizlemede Olan" listesinden gelen ürünleri buraya aktarır
3. Veya manuel olarak **"+ Gelen Ürün Ekle"** butonuyla yeni kayıt yapabilirsiniz

**Manuel ekleme:**
```
Ürün Kodu: DIS-180
Parti No: 25012
Gönderilen Adet: 500
Gelen Adet: 495
Eksik/Fire: 5
Dönüş Tarihi: 15/01/2026
Not: 5 adet fire var
```

### Adım 2: Kalite Kontrol Sonrası

Temizlemeden gelen ürünler kontrol edildikten sonra **"Sevke Hazır"** aşamasına geçer.

---

## 4. SEVKE HAZIR

### Ne İşe Yarar?
Sevkiyata hazır, paketlenmiş, müşteriye gönderilebilecek ürünleri gösterir.

### Ürünleri Görüntüleme

**Ne göreceksiniz:**
- Ürün kodu
- Parti numarası
- Adet
- Hazır olma tarihi

**Nasıl geldi buraya:**
- "Temizlemeden Gelen" aşamasından kontrol sonrası

### Sevkiyat İşlemi

**Nasıl yapılır:**
1. Sevk edilecek ürünün yanındaki **"Sevk Et"** butonuna bas
2. Sevkiyat bilgilerini gir:
   - **Sevk Tarihi**
   - **İrsaliye No** (varsa)
   - **Müşteri** (varsa)
   - **Sevk Edilen Adet**
3. **"Onayla"** butonuna bas
4. Ürün **"Sevk Edilen"** listesine geçer

---

## 5. SEVK EDİLEN

### Ne İşe Yarar?
Müşteriye gönderilen ürünlerin geçmişini gösterir. Kim ne zaman ne kadar sevk etti - kayıt buradan.

### Sevk Geçmişini Görüntüleme

**Ne göreceksiniz:**
- Ürün kodu
- Parti numarası
- Sevk edilen adet
- Sevk tarihi
- İrsaliye numarası
- Müşteri

**Filtreleme:**
- Tarihe göre filtrele
- Ürüne göre ara
- Müşteriye göre listele

---

## 6. KALAN ÜRÜNLER

### Ne İşe Yarar?
Sevkiyat sonrası kalan, tamamlanamayan veya bekleyen ürünleri gösterir.

**Örnek durumlar:**
- Sipariş 500 adet, sadece 450 adet sevk edildi → 50 adet kaldı
- Temizlemeden 5 adet fire geldi → Fire kayıtları
- Müşteri iptal etti → Kalan ürünler

### Kalan Ürün Kaydı

**Nasıl yapılır:**
1. **"Kalan Ürünler"** sekmesine git
2. Kalan ürünler otomatik hesaplanır veya manuel ekleyebilirsiniz
3. **"+ Kalan Ekle"** butonuna bas
4. Formu doldur:
   - **Ürün Kodu**
   - **Parti No**
   - **Kalan Adet**
   - **Neden:** Neden kaldı
5. **"Ekle"** butonuna bas

---

## 📋 Bilgisayar Olmadan - Toplanacak Bilgiler

### 1. Temizlemeye Gönderim Formu

```
TEMİZLEMEYE GÖNDERİM FORMU

TARİH: ___/___/______
GÖNDERENx: __________________

ÜRÜN KODU: __________________
PARTİ NO: ___________________
ADET: __________

GÖNDERİM TARİHİ: ___/___/______

ÖZEL NOTLAR:
_________________________________
_________________________________

İMZA: ______________
```

### 2. Temizlemeden Dönüş Formu

```
TEMİZLEMEDEN DÖNÜŞ FORMU

TARİH: ___/___/______
TESLIM ALAN: _________________

ÜRÜN KODU: __________________
PARTİ NO: ___________________

GÖNDERİLEN ADET: __________
GELEN ADET: __________
EKSİK/FİRE: __________

DÖNÜŞ TARİHİ: ___/___/______

KALİTE KONTROL SONUCU:
  ☐ Uygun
  ☐ Uygun Değil

SORUNLAR (varsa):
_________________________________
_________________________________

İMZA: ______________
```

### 3. Sevkiyat Formu

```
SEVKİYAT FORMU

TARİH: ___/___/______
SEVK EDEN: ___________________

ÜRÜN KODU: __________________
PARTİ NO: ___________________
SEVK EDİLEN ADET: __________

İRSALİYE NO: _________________
MÜŞTERİ: _____________________

SEVK TARİHİ: ___/___/______
SEVK SAATİ: ___:___

ARAÇ PLAKA: __________________

NOTLAR:
_________________________________
_________________________________

İMZA: ______________
```

### 4. Kalan Ürün Formu

```
KALAN ÜRÜN KAYIT FORMU

TARİH: ___/___/______
KAYDEDEN: ____________________

ÜRÜN KODU: __________________
PARTİ NO: ___________________
KALAN ADET: __________

NEDEN KALDI (daire yapın):
  Kısmi sevkiyat
  Fire
  Müşteri iptali
  Kalite problemi
  Diğer: ___________________

AÇIKLAMA:
_________________________________
_________________________________

NE YAPILACAK:
  ☐ Bekletilecek
  ☐ Yeniden işlenecek
  ☐ İade edilecek
  ☐ Hurda

İMZA: ______________
```

## 💡 Örnek Senaryolar

### Senaryo 1: Tam Süreç - Temizlemeden Sevkiyata

**Durum:**
500 adet DIS-180 parti 25012 temizlemeye gönderilecek, temizlenip müşteriye sevk edilecek.

**Adım adım:**

**1. Temizlemeye Gidecek (11 Ocak):**
```
"Tüm Süreç" → "Temizlemeye Gidecek" → "+ Yeni Ürün"
Ürün: DIS-180
Parti: 25012
Adet: 500
Tarih: 11/01/2026
```

**2. Gönderim (11 Ocak):**
```
"Gönder" butonuna bas
→ Ürün "Temizlemede Olan" listesine geçti
```

**3. Temizlemeden Dönüş (15 Ocak):**
```
Temizlemeci ürünleri getirdi
"Temizlemeden Gelen" → Dönüş kaydı
Gönderilen: 500
Gelen: 495 (5 adet fire)
```

**4. Kalite Kontrol:**
```
495 adet kontrol edildi, sorun yok
→ "Sevke Hazır" listesine geçti
```

**5. Sevkiyat (16 Ocak):**
```
"Sevke Hazır" → "Sevk Et" butonu
Sevk Tarihi: 16/01/2026
İrsaliye: 2026-050
Müşteri: ABC Firma
Adet: 495
→ "Sevk Edilen" listesine geçti
```

**6. Fire Kaydı:**
```
"Kalan Ürünler" → Fire kaydı
Adet: 5
Neden: Temizleme firesi
```

**Sonuç:**
- 495 adet sevk edildi
- 5 adet fire kaydedildi
- Tüm süreç takip edildi

### Senaryo 2: Kısmi Sevkiyat

**Durum:**
1000 adet DIS-200 hazır, ancak müşteri şimdilik 600 adet istiyor. Kalan 400 adet bekleyecek.

**Çözüm:**

**1. İlk Sevkiyat:**
```
"Sevke Hazır" listesinde 1000 adet DIS-200 var
"Sevk Et" butonuna bas
Sevk edilen adet: 600
İrsaliye: 2026-051
Müşteri: XYZ Firma
```

**2. Kalan Kayıt:**
```
Sistem otomatik hesaplar: 1000 - 600 = 400 kaldı
Veya manuel "Kalan Ürünler" → "+ Kalan Ekle"
Adet: 400
Neden: Müşteri kısmi teslimat istedi, kalanı daha sonra
```

**3. İkinci Sevkiyat (bir hafta sonra):**
```
Müşteri kalan 400 adeti istedi
"Sevke Hazır" → "Sevk Et"
Sevk edilen: 400
İrsaliye: 2026-068
```

**Sonuç:**
- İki ayrı sevkiyat yapıldı
- Kalan takip edildi
- Müşteri ihtiyacına göre sevk edildi

### Senaryo 3: Bilgisayar Olmadan Temizleme Süreci

**Durum:**
Üretim alanında çalışıyorsunuz, 300 adet DIS-220 temizlemeye gönderiyorsunuz. Bilgisayar yok.

**Çözüm:**

**1. Gönderim sırasında form doldur:**
```
TEMİZLEMEYE GÖNDERİM FORMU

Tarih: 11/01/2026
Gönderen: Mehmet

Ürün Kodu: DIS-220
Parti No: 25018
Adet: 300

Gönderim Tarihi: 11/01/2026

Özel Notlar: Acil sipariş, 3 gün içinde dönmeli

İmza: Mehmet
```

**2. Formu yöneticiye ver:**
- Yönetici sisteme "Temizlemeye Gidecek" olarak girecek

**3. Dönüş geldiğinde (14 Ocak):**
```
TEMİZLEMEDEN DÖNÜŞ FORMU

Tarih: 14/01/2026
Teslim Alan: Mehmet

Ürün Kodu: DIS-220
Parti No: 25018

Gönderilen Adet: 300
Gelen Adet: 298
Eksik/Fire: 2

Dönüş Tarihi: 14/01/2026

Kalite Kontrol Sonucu: [x] Uygun

Sorunlar: 2 adet fire

İmza: Mehmet
```

**4. Formu yöneticiye ver:**
- Sistem güncellenecek

## ⚠️ Önemli Notlar

### Temizlemeye Gönderim
- **Parti numarası:** Mutlaka doğru parti numarasını yazın
- **Adet kontrolü:** Fiziksel sayım yapın, sonra sisteme girin
- **Öncelik:** Acil işler için not kısmına "ACİL" yazın

### Temizlemeden Dönüş
- **Fire kontrolü:** Gönderilen ve gelen adet farkını mutlaka kaydedin
- **Kalite kontrol:** Dönüşte kalite kontrol yapmadan sevke hazır yapmayın
- **Eksik ürün:** Eksikse nedeni sorun ve kaydedin

### Sevkiyat
- **İrsaliye:** İrsaliye numarasını mutlaka girin - sonra takip için önemli
- **Kısmi sevk:** Tamamını sevk etmiyorsanız kalanı kaydedin
- **Müşteri bilgisi:** Müşteri adını doğru yazın

### Düzenleme ve Silme (Yeni Özellik)
- **Düzenle:** Anasayfadaki satırlarda ✏️ düzenle butonu ile bilgileri güncelleyebilirsiniz
- **Sil:** Yanlış kayıt varsa 🗑️ sil butonu ile silebilirsiniz
- **Dikkat:** Silme işlemi geri alınamaz - emin olun

## ❌ Sık Yapılan Hatalar

### Hata 1: Fire Kaydını Yapmamak
**Yanlış:**
```
Gönderilen: 500
Gelen: 495
Sisteme: 500 (fire görmezden gelindi)
```

**Doğru:**
```
Gönderilen: 500
Gelen: 495
Sisteme gelen: 495
Kalan/Fire: 5 (ayrıca fire olarak kaydet)
```

### Hata 2: Aşama Atlamak
**Yanlış:**
Ürün temizlemeden geldi, direkt "Sevk Edilen" olarak kaydetmek

**Doğru Sıra:**
1. Temizlemeden Gelen
2. Kalite kontrol
3. Sevke Hazır
4. Sevk Et
5. Sevk Edilen

### Hata 3: Kısmi Sevkiyatta Kalanı Kaydetmemek
**Yanlış:**
```
Toplam: 1000 adet
Sevk edilen: 600 adet
Kalan: Kayıt yok (sistemde hala 1000 görünüyor)
```

**Doğru:**
```
Toplam: 1000 adet
Sevk edilen: 600 adet
Kalan: 400 adet (Kalan Ürünler'de kayıtlı)
```

### Hata 4: Aynı Partiyi İki Kez Göndermek
**Yanlış:**
Parti 25012 zaten temizlemede, tekrar "Temizlemeye Gidecek" olarak eklemek

**Doğru:**
- Önce kontrol et: Bu parti zaten sistemde mi?
- "Temizlemede Olan" listesine bak
- Eğer varsa, yeni kayıt ekleme

---

**Sonraki Bölüm:** [Hatalı Ürünler Takibi →](04-hatali-urunler.md)
