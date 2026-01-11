# KALİTE KONTROL

## Bu Bölüm Ne İşe Yarar?

Kalite kontrol bölümü, günlük işlerin planlanması ve takibi için kullanılır. Görevler, siparişler, iç siparişler ve simülasyon stok yönetimi bu bölümde yapılır.

**Ne zaman kullanılır:**
- Günlük yapılacak işleri görmek ve takip etmek istediğinizde
- Yeni sipariş hazırlığı yapılacağında
- İç sipariş (fabrika içi talep) oluşturmak istediğinizde
- Simülasyon stok (sanal stok) yönetimi için

## 📱 Bilgisayar Başında Kullanım

Kalite Kontrol bölümü **4 sekmeden** oluşur:
1. **Güncel İşler** - Görev yönetimi
2. **Sipariş Hazırlığı** - Sipariş malzeme planlaması
3. **İç Siparişler** - Fabrika içi talepler
4. **Simülasyon Stok** - Sanal stok takibi

---

## 1. GÜNCEL İŞLER (Görev Yönetimi)

### Ne İşe Yarar?
Yapılacak işlerin listesi ve takibi. Kim hangi işi yapacak, ne zaman bitirilmeli - hepsi burada.

### Adım 1: Güncel İşleri Görüntüleme

**Nasıl yapılır:**
1. "Kalite Kontrol" → "Güncel İşler" sekmesine git
2. Ekranda tüm aktif görevleri göreceksiniz

**Ne göreceksiniz:**

| Sütun | Anlamı |
|-------|--------|
| Görev | Ne yapılacak |
| Atanan Kişi | Kim yapacak |
| Durum | Bekliyor / Devam Ediyor / Tamamlandı |
| Öncelik | Düşük / Orta / Yüksek / Acil |
| Tarih | Ne zamana kadar bitmeli |

### Adım 2: Yeni Görev Ekleme

**Nasıl yapılır:**
1. Sağ üstteki yeşil **"+ Yeni Görev"** butonuna bas
2. Formu doldur:
   - **Görev Açıklaması:** Ne yapılacak (örn: "DIS-180 parti 25012 kalite kontrol")
   - **Atanan Kişi:** Kim yapacak
   - **Öncelik:** Acil / Yüksek / Orta / Düşük
   - **Bitiş Tarihi:** Ne zamana kadar bitmeli
   - **Notlar:** Ek bilgiler (opsiyonel)
3. **"Ekle"** butonuna bas

**Örnek:**
```
Görev: DIS-200 parti 25015 temizlik kontrolü
Atanan: Ahmet
Öncelik: Yüksek
Tarih: 12/01/2026
Notlar: Müşteri acil istiyor
```

### Adım 3: Görev Durumunu Güncelleme

**Nasıl yapılır:**
1. İlgili görevin satırında **"Düzenle"** butonuna bas
2. **Durum** kısmını değiştir:
   - **Bekliyor** → Henüz başlanmadı
   - **Devam Ediyor** → Üzerinde çalışılıyor
   - **Tamamlandı** → İş bitti
3. **"Güncelle"** butonuna bas

### Adım 4: Görev Silme

**Nasıl yapılır:**
1. İlgili görevin satırında **"Sil"** butonuna bas
2. Onay sorusuna **"Evet"** de

**Not:** Tamamlanan görevleri silmek yerine durum "Tamamlandı" olarak işaretleyin - kayıt kalır.

---

## 2. SİPARİŞ HAZIRLIĞI

### Ne İşe Yarar?
Yeni sipariş geldiğinde hangi malzemeler gerekli hesaplamak için kullanılır.

### Adım 1: Sipariş Listesini Görme

**Nasıl yapılır:**
1. "Kalite Kontrol" → "Sipariş Hazırlığı" sekmesine git
2. Tüm siparişlerin listesini göreceksiniz

**Ne göreceksiniz:**
- Sipariş numarası
- Ürün kodu
- Adet
- Durum
- Tarih

### Adım 2: Yeni Sipariş Ekleme

**Nasıl yapılır:**
1. **"+ Yeni Sipariş"** butonuna bas
2. Formu doldur:
   - **Sipariş No:** Müşteriden gelen sipariş numarası
   - **Ürün Kodu:** Ne üretilecek (örn: DIS-180)
   - **Adet:** Kaç tane
   - **Termin Tarihi:** Ne zamana kadar bitmeli
   - **Müşteri:** Kim için (opsiyonel)
   - **Notlar:** Özel talepler (opsiyonel)
3. **"Ekle"** butonuna bas

**Örnek:**
```
Sipariş No: SP-2026-001
Ürün Kodu: DIS-180
Adet: 1000
Termin: 20/01/2026
Müşteri: ABC Firma
Notlar: Özel paketleme gerekli
```

### Adım 3: Sipariş Durumunu Takip Etme

Sipariş durumları:
- **Bekliyor** → Henüz başlanmadı
- **Hazırlanıyor** → Malzemeler hazırlanıyor
- **Üretimde** → Üretim devam ediyor
- **Tamamlandı** → Sipariş hazır

**Not:** Bu bölüm malzeme ihtiyacı hesaplama için de kullanılır. Detaylı hesaplama için "Ürün Siparişi İhtiyaç Hesaplama" bölümüne bakın.

---

## 3. İÇ SİPARİŞLER

### Ne İşe Yarar?
Fabrika içinde bir bölümden diğerine talep/sipariş iletmek için kullanılır.

**Örnek kullanım:**
- Kalite kontrol → Üretim: "50 adet DIS-180 daha gerekli"
- Paketleme → Depo: "Koli stoğu bitti, yeni koli lazım"

### Adım 1: İç Sipariş Oluşturma

**Nasıl yapılır:**
1. "Kalite Kontrol" → "İç Siparişler" sekmesine git
2. **"+ Yeni İç Sipariş"** butonuna bas
3. Formu doldur:
   - **Talep Eden:** Hangi bölüm istiyor
   - **Talep Edilen:** Hangi bölümden isteniyor
   - **Ürün/Malzeme:** Ne isteniyor
   - **Adet:** Kaç tane
   - **Aciliyet:** Normal / Acil
   - **Açıklama:** Neden gerekli
4. **"Gönder"** butonuna bas

**Örnek:**
```
Talep Eden: Kalite Kontrol
Talep Edilen: Üretim
Ürün: DIS-180
Adet: 50
Aciliyet: Acil
Açıklama: Müşteri siparişi için eksik kaldı
```

### Adım 2: İç Sipariş Durumu Takibi

**Durum seçenekleri:**
- **Yeni** → Henüz görülmedi
- **Onaylandı** → İlgili bölüm onayladı
- **Hazırlanıyor** → Üzerinde çalışılıyor
- **Tamamlandı** → Teslim edildi
- **İptal** → İptal edildi

---

## 4. SİMÜLASYON STOK

### Ne İşe Yarar?
Henüz fiziksel olarak gelmemiş ama planlamaya dahil edilmesi gereken ürünlerin takibi. "Sanal stok" - yolda olan veya üretilecek mallar.

**Örnek kullanım:**
- Tedarikçiden yolda olan malzeme
- Henüz bitmemiş üretim
- Gelecek plan için hesaplama

### Adım 1: Simülasyon Stok Görüntüleme

**Nasıl yapılır:**
1. "Kalite Kontrol" → "Simülasyon Stok" sekmesine git
2. Tüm simülasyon stok kayıtlarını göreceksiniz

**Ne göreceksiniz:**

| Sütun | Anlamı |
|-------|--------|
| Ürün Kodu | Hangi ürün |
| Adet | Kaç tane (pozitif veya negatif olabilir) |
| Durum | Yolda / Üretimde / Planlanan |
| Tarih | Ne zaman gelecek/bitmeli |

### Adım 2: Simülasyon Stok Ekleme

**Nasıl yapılır:**
1. **"+ Yeni Stok"** butonuna bas
2. Formu doldur:
   - **Ürün Kodu:** Hangi ürün
   - **Adet:** Kaç tane (örn: 500)
   - **Durum:** Yolda / Üretimde / Planlanan
   - **Tarih:** Ne zaman gelecek
   - **Açıklama:** Nereden geliyor, neden eklendi
3. **"Ekle"** butonuna bas

**Örnek:**
```
Ürün Kodu: DIS-180
Adet: 500
Durum: Yolda
Tarih: 15/01/2026
Açıklama: Tedarikçi sevkiyatı - İrsaliye: 2026020
```

### Adım 3: Simülasyon Stok Düzenleme (NEGATİF DEĞER DESTEĞİ)

**Önemli:** Simülasyon stokta **negatif değer** de girebilirsiniz. Bu özellik planlamada eksik stoğu göstermek için kullanılır.

**Nasıl yapılır:**
1. İlgili kaydın yanındaki **"Düzenle"** butonuna bas
2. **Adet** kısmına istediğiniz değeri yazın:
   - Pozitif: Gelecek stok (örn: +500)
   - Negatif: Eksik/Kullanılacak stok (örn: -42)
3. **"Güncelle"** butonuna bas

**Örnek Negatif Kullanım:**
```
Ürün Kodu: DIS-200
Adet: -100
Durum: Planlanan
Açıklama: Gelecek hafta sipariş için eksik
```

**Ne anlama gelir:**
- Negatif değer = Bu kadar eksik var veya kullanılacak
- Pozitif değer = Bu kadar gelecek veya hazır

### Adım 4: Simülasyon Stok Silme

**Nasıl yapılır:**
1. Artık geçerli olmayan kaydın yanındaki **"Sil"** butonuna bas
2. Onay sorusuna **"Evet"** de

**Ne zaman silinmeli:**
- Malzeme geldi ve gerçek stoğa eklendi
- Plan değişti, artık gelmeyecek
- Hatalı kayıt yapılmış

---

## 📋 Bilgisayar Olmadan - Toplanacak Bilgiler

### 1. Görev Bildirimi Formu

```
GÖREV BİLDİRİMİ

TARİH: ___/___/______
BİLDİREN: __________________

GÖREV TANIMI:
_________________________________
_________________________________

ATANACAK KİŞİ: ________________

ÖNCELİK (daire yapın):
   Düşük  /  Orta  /  Yüksek  /  Acil

BİTİŞ TARİHİ: ___/___/______

EK NOTLAR:
_________________________________
_________________________________
```

### 2. Sipariş Bildirimi Formu

```
YENİ SİPARİŞ BİLDİRİMİ

TARİH: ___/___/______
KAYDEDEN: __________________

SİPARİŞ NO: __________________
ÜRÜN KODU: __________________
ADET: __________
TERMİN TARİHİ: ___/___/______

MÜŞTERİ: _____________________

ÖZEL TALEPLER:
_________________________________
_________________________________
```

### 3. İç Sipariş Formu

```
İÇ SİPARİŞ TALEP FORMU

TARİH: ___/___/______

TALEP EDEN BÖLÜM: ______________
TALEP EDİLEN BÖLÜM: ____________

ÜRÜN/MALZEME: _________________
ADET: __________

ACİLİYET (daire yapın):  Normal  /  Acil

NEDEN GEREKLİ:
_________________________________
_________________________________

İMZA: ______________
```

### 4. Simülasyon Stok Formu

```
SİMÜLASYON STOK KAYDI

TARİH: ___/___/______
KAYDEDEN: __________________

ÜRÜN KODU: __________________
ADET: __________ (+ veya - işareti koy)

DURUM (daire yapın):
   Yolda  /  Üretimde  /  Planlanan

BEKLENEN TARİH: ___/___/______

AÇIKLAMA:
_________________________________
_________________________________
```

## 💡 Örnek Senaryolar

### Senaryo 1: Yeni Sipariş Geldi, Görev Oluşturma

**Durum:**
Müşteriden yeni sipariş geldi: 1000 adet DIS-180, 20 Ocak'a kadar bitmeli. Kalite kontrol için Ahmet'e görev atanacak.

**Çözüm:**
1. "Kalite Kontrol" → "Sipariş Hazırlığı" → "+ Yeni Sipariş"
2. Siparişi kaydet:
   - Sipariş No: SP-2026-005
   - Ürün: DIS-180
   - Adet: 1000
   - Termin: 20/01/2026
3. Sonra "Güncel İşler" → "+ Yeni Görev"
4. Görev oluştur:
   - Görev: "SP-2026-005 DIS-180 kalite kontrol"
   - Atanan: Ahmet
   - Öncelik: Yüksek
   - Tarih: 18/01/2026 (termin 2 gün öncesi)
5. Kaydet

**Sonuç:**
- Sipariş kaydedildi
- Ahmet'in görev listesinde görünüyor
- Takip edilebilir

### Senaryo 2: Simülasyon Stokta Negatif Değer Kullanımı

**Durum:**
Gelecek hafta 500 adet DIS-200 siparişi var. Ancak elimizde sadece 400 adet hazır. 100 adet eksik olduğunu simülasyon stokta göstermek istiyorsunuz.

**Çözüm:**
1. "Kalite Kontrol" → "Simülasyon Stok" → "+ Yeni Stok"
2. Formu doldur:
   - Ürün Kodu: DIS-200
   - Adet: **-100** (negatif)
   - Durum: Planlanan
   - Tarih: 17/01/2026
   - Açıklama: "Gelecek hafta sipariş için 100 adet eksik - üretilmeli"
3. Kaydet

**Sonuç:**
- Sistemde -100 adet DIS-200 görünüyor
- Planlamacılar eksik olduğunu görüyor
- Üretim planlaması buna göre yapılıyor

### Senaryo 3: Bilgisayar Olmadan İç Sipariş

**Durum:**
Paketleme alanında çalışıyorsunuz, koli stoğu bitti. Depodan 200 adet koli istemeniz gerekiyor. Bilgisayar yok.

**Çözüm:**
1. İç Sipariş formunu doldur:
```
İÇ SİPARİŞ TALEP FORMU

Tarih: 11/01/2026

Talep Eden Bölüm: Paketleme
Talep Edilen Bölüm: Depo

Ürün/Malzeme: KL-100 Koli
Adet: 200

Aciliyet: Acil

Neden Gerekli: Paketleme alanında koli stoğu bitti,
                günlük operasyon devam edemiyor

İmza: Mehmet
```

2. Formu depo sorumlusuna ver veya yöneticine ilet
3. Yönetici sisteme girecek

## ⚠️ Önemli Notlar

### Görev Yönetimi
- **Öncelik:** Acil görevler listede öne çıkar - önceliği doğru seçin
- **Atama:** Görevi kime atadıysanız, o kişi bilgilendirilmeli
- **Tamamlama:** Görev bitince mutlaka durumu "Tamamlandı" yapın

### Sipariş Hazırlığı
- **Termin:** Müşteri termin tarihini doğru girin - gecikme olmasın
- **Özel talepler:** Varsa mutlaka not kısmına yazın
- **Takip:** Düzenli olarak sipariş durumunu güncelleyin

### Simülasyon Stok
- **Negatif değer:** Eksik stoğu gösterir - korkmayın, hata değil
- **Pozitif değer:** Gelecek/Planlanan stoğu gösterir
- **Güncelleme:** Malzeme gelince simülasyon stoktan silin, gerçek stoğa ekleyin
- **Temizlik:** Eski, geçersiz kayıtları düzenli olarak temizleyin

### İç Siparişler
- **Aciliyet:** Gerçekten acilse "Acil" seçin - her şey acil olmasın
- **Takip:** İç siparişinizin durumunu kontrol edin
- **İletişim:** Acil durumlarda sisteme girmenin yanında karşı bölümü arayla da bilgilendir

## ❌ Sık Yapılan Hatalar

### Hata 1: Tamamlanan Görevi Silmek
**Yanlış:** Görev bitti, "Sil" butonuna basıp silmek

**Doğru:** Durumu "Tamamlandı" yapmak
- Silince kayıt kalma z
- Tamamlandı yapınca kim ne zaman bitirdi görünür

### Hata 2: Simülasyon Stokta Negatif Değer Girememe
**Yanlış:** Negatif değer hata veriyor diye girmemek

**Doğru:** Şimdi artık negatif değer girebilirsiniz
- Mevcut adete -42 yazabilirsiniz
- Sistem kabul eder
- Eksik stoğu gösterir

### Hata 3: Her Şeyi "Acil" Yapmak
**Yanlış:**
```
Görev 1: Acil
Görev 2: Acil
Görev 3: Acil
Görev 4: Acil
```

**Doğru:** Gerçek önceliğe göre ayarlamak
```
Görev 1: Acil (müşteri bugün bekliyor)
Görev 2: Yüksek (yarın bitmeli)
Görev 3: Orta (bu hafta)
Görev 4: Düşük (zaman var)
```

### Hata 4: Simülasyon Stok vs Gerçek Stok Karışıklığı
**Yanlış:** Gerçek stoğa giren malzemeyi simülasyon stoktan silmemek

**Doğru Süreç:**
1. Malzeme yolda → Simülasyon stoğa ekle (+500)
2. Malzeme geldi → Gerçek stoğa ekle (+500)
3. Simülasyon stoktan sil (artık gerçek stokta)

---

**Sonraki Bölüm:** [Tüm Süreç Yönetimi →](03-tum-surec.md)
