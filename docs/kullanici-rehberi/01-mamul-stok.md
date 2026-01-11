# MAMÜL STOK YÖNETİMİ

## Bu Bölüm Ne İşe Yarar?

Fabrikada kullanılan paketleme malzemelerinin (İzolasyon, Koli, Kutu, Tapa) stok takibini yapmak için kullanılır. Malzeme geldiğinde veya kullanıldığında buradan stok artırılır veya azaltılır.

**Ne zaman kullanılır:**
- Yeni malzeme geldiğinde (stok artırma)
- Paketlemede malzeme kullandığınızda (stok azaltma)
- Mevcut stok miktarını kontrol etmek istediğinizde
- Geçmiş işlemleri görmek istediğinizde

## 📱 Bilgisayar Başında Kullanım

### Adım 1: Mamül Stok Bölümüne Gitme

**Nasıl yapılır:**
1. Ana menüden "📦 Mamül Stok" sekmesine tıklayın
2. Ekranda 4 sekme göreceksiniz:
   - **İzolasyon Stok**
   - **Koli Stok**
   - **Kutu Stok**
   - **Tapa Stok**
3. Çalışmak istediğiniz malzeme tipine tıklayın

**Sonuç:** O malzeme türüne ait tüm ürünler ve stok miktarları listelenir.

### Adım 2: Mevcut Stoku Görüntüleme

**Ne göreceksiniz:**

Her ürün için bir satır göreceksiniz. Satırda şu bilgiler var:

| Sütun Adı | Anlamı | Örnek |
|-----------|--------|-------|
| Ürün Kodu | Malzemenin kodu | İZ-1000-50 |
| Açıklama | Ürün hakkında bilgi | 1000x50 İzolasyon |
| Mevcut Adet | Şu an depoda kaç tane var | 150 |
| Birim | Ölçü birimi | Adet / Metre |
| İşlemler | Stok artır/azalt butonları | + / - |

**İpucu:** Listede çok ürün varsa, yukarıdaki arama kutusunu kullanabilirsiniz.

### Adım 3: Stok Artırma (Malzeme Geldiğinde)

**Ne yapacaksınız:** Yeni malzeme geldi, stoka ekliyorsunuz.

**Nasıl yapılır:**
1. İlgili ürünün satırında **yeşil "+" butonuna** basın
2. Açılan pencerede **kaç adet eklemek istediğinizi** yazın (örn: 200)
3. Tamam'a basın
4. Açılan ikinci pencerede **stok ekleme nedenini** yazın (örn: "Tedarikçiden yeni sevkiyat")
5. Tamam'a basın

**Örnek Senaryo:**
Depoya 200 adet yeni koli geldi. İZ-1000-50 kodu için:
1. Yeşil **"+"** butonuna bas
2. Adet sorusuna: **200** yaz → Tamam
3. Neden sorusuna: **"Tedarikçiden yeni sevkiyat"** yaz → Tamam

**Sonuç:** Mevcut stok 200 artar. Örneğin 150 adet varsa, şimdi 350 adet olur.

**Hızlı İpucu:** + butonuna basıp direkt sayı yazıp Enter'larsanız çok hızlı stok ekleyebilirsiniz!

### Adım 4: Stok Azaltma (Malzeme Kullandığınızda)

**Ne yapacaksınız:** Paketlemede malzeme kullandınız, stoktan düşüyorsunuz.

**Nasıl yapılır:**
1. İlgili ürünün satırında **kırmızı "−" butonuna** basın
2. Açılan pencerede **kaç adet çıkarmak istediğinizi** yazın (örn: 50)
3. Tamam'a basın
4. Açılan ikinci pencerede **stok azaltma nedenini** yazın (örn: "DIS-180 siparişi paketleme")
5. Tamam'a basın

**Örnek Senaryo:**
DIS-180 siparişini paketlerken 50 adet koli kullandınız:
1. Koli Stok sekmesine git
2. İlgili koli kodunun satırında kırmızı **"−"** butonuna bas
3. Adet sorusuna: **50** yaz → Tamam
4. Neden sorusuna: **"DIS-180 siparişi paketleme"** yaz → Tamam

**Sonuç:** Mevcut stok 50 azalır. Örneğin 350 adet varsa, şimdi 300 adet olur.

**Hızlı İpucu:** - butonuna basıp direkt sayı yazıp Enter'larsanız çok hızlı stok azaltabilirsiniz!

### Adım 5: İşlem Geçmişini Görüntüleme

**Ne yapacaksınız:** Kim ne zaman ne kadar stok değişikliği yaptı görmek.

**Nasıl yapılır:**
1. Sayfanın altında **"İşlem Geçmişi"** bölümü var
2. Veya ilgili ürünün yanındaki **mor "Log" butonuna** basın
3. Tarih, yapan, işlem tipi, miktar bilgilerini göreceksiniz

**Ne görürsünüz:**
- **Tarih/Saat:** İşlem ne zaman yapıldı
- **Yapan:** Kim yaptı
- **İşlem:** Artırma mı, azaltma mı
- **Adet:** Ne kadar değişti
- **Önceki/Sonraki:** Önceki stok / sonraki stok
- **Neden:** Açıklama

**Örnek:**
```
Tarih: 11/01/2026 14:30
Yapan: Ahmet
İşlem: Artırma
Adet: +200
Önceki Stok: 150
Sonraki Stok: 350
Neden: Tedarikçiden yeni sevkiyat
```

## 📋 Bilgisayar Olmadan - Toplanacak Bilgiler

**Bilgisayar yoksa ne yapmalısınız?**

Aşağıdaki formu doldurun ve sisteme girmek için yöneticinize verin.

### Gerekli Bilgiler
- [ ] Tarih ve saat
- [ ] Malzeme tipi (İzolasyon / Koli / Kutu / Tapa)
- [ ] Ürün kodu
- [ ] İşlem tipi (Giriş / Çıkış)
- [ ] Adet
- [ ] Neden/Açıklama
- [ ] Adınız

### Veri Toplama Formu

```
MAMÜL STOK HAREKETİ FORMU

TARİH: ___/___/______ SAAT: ___:___
YAPAN: ____________________

MALZEME TİPİ (daire yapın):
   İzolasyon  /  Koli  /  Kutu  /  Tapa

ÜRÜN KODU: _____________________

İŞLEM (daire yapın):
   GİRİŞ (Stok Artırma)  /  ÇIKIŞ (Stok Azaltma)

ADET: ________

NEDEN/AÇIKLAMA:
_________________________________
_________________________________

İMZA: ______________
```

**Birden fazla işlem varsa:**
Her işlem için ayrı form doldurun veya aşağıdaki liste formatını kullanın:

```
GÜNLÜK STOK LİSTESİ

Tarih: ___/___/______
Yapan: _______________

No | Ürün Kodu | Giriş/Çıkış | Adet | Neden
---|-----------|-------------|------|-------
1  |           |             |      |
2  |           |             |      |
3  |           |             |      |
4  |           |             |      |
5  |           |             |      |
```

## 💡 Örnek Senaryolar

### Senaryo 1: Yeni Malzeme Teslim Alındı

**Durum:**
Tedarikçiden 500 adet İZ-1000-50 izolasyon geldi. Depo sorumlusunuz ve stoka kaydetmeniz gerekiyor.

**Çözüm:**
1. "Mamül Stok" → "İzolasyon Stok" sekmesine git
2. İZ-1000-50 kodunu bul (arama kutusunu kullanabilirsin)
3. Yeşil "+" butonuna bas
4. Formu doldur:
   - Adet: **500**
   - Neden: **"Tedarikçi sevkiyatı - İrsaliye No: 2026001"**
   - Yapan: **[Adın]**
5. "Artır" butonuna bas

**Sonuç:**
- Stok 500 arttı
- İşlem kaydedildi
- İrsaliye numarası da kayıtta görünüyor

### Senaryo 2: Paketlemede Koli Kullanıldı

**Durum:**
DIS-200 siparişini paketlerken 75 adet koli kullandınız. Gün sonunda stoktan düşmeniz gerekiyor.

**Çözüm:**
1. "Mamül Stok" → "Koli Stok" sekmesine git
2. İlgili koli kodunu bul
3. Kırmızı "-" butonuna bas
4. Formu doldur:
   - Adet: **75**
   - Neden: **"DIS-200 siparişi paketleme"**
   - Yapan: **[Adın]**
5. "Azalt" butonuna bas

**Sonuç:**
- Stok 75 azaldı
- Hangi sipariş için kullanıldığı kayıtta görünüyor

### Senaryo 3: Bilgisayar Olmadan Gün Sonu Sayımı

**Durum:**
Üretim alanında çalışıyorsunuz, bilgisayar yok. Gün içinde kullandığınız malzemeleri kaydetmeniz gerekiyor.

**Kullandığınız malzemeler:**
- 50 adet KL-100 koli
- 30 adet TP-50 tapa
- 100 metre İZ-1000-50 izolasyon

**Çözüm:**
1. Veri toplama formunu yazdır (veya kağıda geçir)
2. Her malzeme için ayrı satır doldur:

```
GÜNLÜK STOK LİSTESİ

Tarih: 11/01/2026
Yapan: Ahmet

No | Ürün Kodu   | Giriş/Çıkış | Adet | Neden
---|-------------|-------------|------|------------------
1  | KL-100      | ÇIKIŞ       | 50   | Günlük paketleme
2  | TP-50       | ÇIKIŞ       | 30   | Günlük paketleme
3  | İZ-1000-50  | ÇIKIŞ       | 100  | Günlük paketleme
```

3. Gün sonunda formu yöneticine ver
4. Yönetici sisteme girecek

## ⚠️ Önemli Notlar

### Stok Artırırken
- **İrsaliye numarası:** Varsa mutlaka neden kısmına yazın (örn: "İrsaliye: 2026001")
- **Ölçü birimi:** Adet mi, metre mi, kg mi - doğru birime dikkat edin
- **Sayım kontrolü:** Fiziksel sayımı yaptıktan sonra sisteme girin

### Stok Azaltırken
- **Sipariş/Parti bilgisi:** Hangi iş için kullanıldı mutlaka belirtin
- **Negatif stok:** Sistem stoktan fazla azaltmanıza izin vermez
- **Gün sonu:** Mümkünse her gün sonunda günlük kullanımı kaydedin

### İşlem Geçmişi
- **Silme yok:** Yapılan işlemler silinemez, sadece yeni işlemle düzeltilir
- **Hata durumunda:** Yanlış miktar girdiyseniz, ters işlem yaparak düzeltin
  - Örnek: 100 yerine 200 yazdıysanız, -100 yaparak düzeltin

### Uyarılar
⚠️ **Stok eksikse:** Mevcut stok kritik seviyeye düştüyse yöneticinizi bilgilendirin

⚠️ **Sayım farkı:** Fiziksel sayım ile sistem farkı varsa, "Sayım düzeltmesi" notu ile düzeltin

⚠️ **Günlük kayıt:** Her gün kullanılan malzemeleri kaydetmek önemli - stok takibi doğru olmalı

## ❌ Sık Yapılan Hatalar

### Hata 1: Neden Yazmadan Stok Değiştirmek
**Yanlış:** Sadece adet yazıp neden kısmını boş bırakmak
```
Adet: 100
Neden: [boş]
```

**Doğru:** Mutlaka açıklayıcı bir neden yazın
```
Adet: 100
Neden: Tedarikçi sevkiyatı - İrsaliye: 2026015
```

### Hata 2: Yanlış Ürün Koduna Kaydetmek
**Yanlış:** İZ-1000-50 yerine İZ-1000-60 koduna stok eklemek

**Doğru:**
- Ürün kodunu iki kez kontrol edin
- Etiket üzerindeki kodu okuyun
- Emin değilseniz arama yapın

### Hata 3: Toplu Kullanımı Tek Satırda Göstermek
**Yanlış:** 5 farklı sipariş için kullanılan koliteri tek satırda toplamak
```
Adet: 250
Neden: Günlük kullanım
```

**Doğru:** Her sipariş için ayrı işlem yapmak veya detaylı açıklama yazmak
```
İşlem 1:
Adet: 50
Neden: DIS-180 siparişi

İşlem 2:
Adet: 75
Neden: DIS-200 siparişi

...veya...

Adet: 250
Neden: DIS-180 (50), DIS-200 (75), DIS-220 (60), DIS-240 (40), DIS-260 (25)
```

### Hata 4: Birim Karışıklığı
**Yanlış:** Metre cinsinden ölçülen malzemeyi adet olarak girmek

**Doğru:** Ürünün birim tipine dikkat edin
- İzolasyon genellikle **metre**
- Koli, kutu, tapa **adet**
- Kontrol: Tablodaki "Birim" sütununa bakın

### Hata 5: Günlük Kayıt Yapmamak
**Yanlış:** Hafta sonunda toplu kayıt yapmak
- Hafıza hatası riski
- Hangi iş için kullanıldığını unutma
- Stok takibinde gecikme

**Doğru:** Her gün sonunda o günkü kullanımı kaydetmek
- Aynı gün kaydet, unutma
- Bilgisayar yoksa kağıda not al, ertesi gün kaydet

---

**Sonraki Bölüm:** [Kalite Kontrol →](02-kalite-kontrol.md)
