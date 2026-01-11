# HATALI ÜRÜNLER TAKİBİ

## Bu Bölüm Ne İşe Yarar?

Kalite kontrol sırasında bulunan hatalı ürünlerin kaydını tutmak için kullanılır. Hangi üründe hangi hatalar var, kaç adet hatalı, kim buldu - hepsi buradan takip edilir.

**Ne zaman kullanılır:**
- Kalite kontrol yaparken hatalı ürün bulduğunuzda
- Parti bazında hata sayımı yapılacağında
- Tamir edilen ürünleri kaydetmek istediğinizde
- Geçmiş hata kayıtlarını görmek istediğinizde

## 📱 Bilgisayar Başında Kullanım

### Adım 1: Yeni Parti Başlatma

**Ne yapacaksınız:**
Yeni bir kontrol partisi açıp hataları saymaya başlayacaksınız.

**Nasıl yapılır:**
1. Ana menüden **"⚠️ Hatalı Ürünler"** sekmesine tıklayın
2. Sağ üstteki yeşil **"+ Yeni Parti"** butonuna basın
3. Açılan pencerede formu doldurun:
   - **Parti Numarası:** Etiket üzerindeki parti numarasını yazın (örn: **25012**)
   - **Ürün Kodu:** Ürün kodunu yazın (örn: **DIS-180**)
   - **İsim:** Adınızı yazın (örn: **Ahmet**)
4. **"Parti Başlat"** butonuna basın

**Örnek:**
```
Parti Numarası: 25012
Ürün Kodu: DIS-180
İsim: Ahmet
```

**Sonuç:**
Ekranda hata kategorileri görünecek. Artık hataları sayabilirsiniz.

---

### Adım 2: Hataları Sayma

**Ne yapacaksınız:**
Her hata tipi için kaç adet olduğunu işaretleyeceksiniz.

**Nasıl yapılır:**
1. Her hata kategorisinin yanında **+** ve **-** butonları var
2. Hatalı ürün buldukça **+** butonuna basın
   - Örnek: 5 tane "Temizleme Hatalı" varsa, 5 kez + basın
3. Yanlış saydıysanız **-** ile azaltın
4. **⭐ Sistem otomatik kaydediyor** - kaydet butonuna basmanıza gerek yok!

**12 Hata Kategorisi:**

| No | Hata Kategorisi | Açıklama |
|----|-----------------|----------|
| 1 | Temizleme Hatalı | Temizlik işlemi yetersiz |
| 2 | Vuruk | Çentik, ezik, darbe izi |
| 3 | Kapağı Alınmayan | Kapak çıkarılmamış |
| 4 | Polisaj | Cilalama sorunu, mat yüzey |
| 5 | Kaynak Az | Kaynak eksik |
| 6 | Kaynak Akıntısı | Kaynak taşması, akıntı |
| 7 | İçi Çapaklı | İç kısımda çapak var |
| 8 | Pim Girmeyen | Pim takılamıyor |
| 9 | Boncuklu | Yüzeyde boncuk oluşumu |
| 10 | Yamuk | Şekil bozukluğu |
| 11 | Gramajı Düşük | Standart ağırlıktan hafif |
| 12 | Hurda | Tamiri mümkün değil |

**Örnek Sayım:**
```
DIS-180 Parti 25012 - 100 adet kontrol

+ Temizleme Hatalı: 5 kez bas → 5 adet
+ Vuruk: 2 kez bas → 2 adet
+ Kapağı Alınmayan: 1 kez bas → 1 adet
Diğerleri: 0

TOPLAM HATALI: 8 adet
Sorunsuz: 92 adet
```

**Önemli:** Her + veya - tuşuna bastığınızda sistem otomatik kaydeder. Elektrik kesilse bile verileriniz korunur!

---

### Adım 3: Parti Sonlandırma

**Ne yapacaksınız:**
Tüm hatalar sayıldıktan sonra partiyi bitirip kaydetmek.

**Nasıl yapılır:**
1. Tüm hataları saydığınızdan emin olun
2. Sayfanın altındaki **"Kaydet ve Sıfırla"** butonuna basın
3. Onay sorusuna **"Evet"** deyin

**Sonuç:**
- Parti kaydedildi
- Hata sayaçları sıfırlandı
- Yeni parti için tekrar başlayabilirsiniz

**Not:** "Kaydet ve Sıfırla" yapmadan sayfayı kapatırsanız, veriler kaybolmaz. Geri geldiğinizde kaldığınız yerden devam edebilirsiniz.

---

### Adım 4: Tamir Edilen Ürünleri Kaydetme (YENİ ÖZELLİK)

**Ne yapacaksınız:**
Hatalı ürünler tamir edildikten sonra tamir edilen adedi kaydetmek.

**Nasıl yapılır:**
1. Ana menüden **"Hatalı Ürünler"** sekmesine git
2. Alt kısımda **"Geçmiş Partiler"** tablosunu göreceksiniz
3. İlgili partinin satırında **"Detay"** veya **"Düzenle"** butonuna basın
4. **"Tamir Edilen Adet"** alanını bulun
5. Tamir edilen adet sayısını yazın (örn: **5**)
6. **"Güncelle"** butonuna basın

**Örnek:**
```
Parti: 25012
Toplam Hatalı: 8 adet
Tamir Edilen: 5 adet
Hurda: 3 adet
```

**Sonuç:**
- Tamir edilen adet kaydedildi
- Hurda oranı hesaplandı
- Raporlarda görünecek

---

### Adım 5: Geçmiş Partileri Görüntüleme

**Ne yapacaksınız:**
Daha önce kaydedilmiş partileri ve hata detaylarını görmek.

**Nasıl yapılır:**
1. **"Hatalı Ürünler"** sayfasının alt kısmına inin
2. **"Geçmiş Partiler"** tablosunu göreceksiniz

**Ne göreceksiniz:**

| Sütun | Anlamı |
|-------|--------|
| Parti No | Parti numarası |
| Ürün Kodu | Hangi ürün |
| Tarih | Ne zaman kontrol edildi |
| Toplam Hatalı | Kaç adet hatalı bulundu |
| Tamir Edilen | Kaç adet tamir edildi |
| Kontrol Eden | Kim kontrolü yaptı |
| Detay | Hata detaylarını göster |

**Detay Görüntüleme:**
1. İlgili partinin yanındaki **"Detay"** butonuna basın
2. Tüm hata kategorilerini ve adetlerini göreceksiniz:
   ```
   Temizleme Hatalı: 5 adet
   Vuruk: 2 adet
   Kapağı Alınmayan: 1 adet
   Polisaj: 0 adet
   ...
   ```

**Filtreleme ve Arama:**
- Üstteki arama kutusuna parti numarası yazarak arama yapabilirsiniz
- Ürün koduna göre filtreleyebilirsiniz
- Tarihe göre sıralayabilirsiniz

---

## 📋 Bilgisayar Olmadan - Toplanacak Bilgiler

**Bilgisayar yoksa ne yapmalısınız?**

Aşağıdaki formu doldurun ve sisteme girmek için yöneticinize verin.

### Gerekli Bilgiler
- [ ] Parti numarası
- [ ] Ürün kodu
- [ ] Kontrol yapan kişi
- [ ] Tarih
- [ ] Her hata kategorisi için adet
- [ ] Tamir edilen adet (varsa)

### Veri Toplama Formu

```
HATALI ÜRÜNLER KONTROL FORMU

TARİH: ___/___/______
PARTİ NO: ________________
ÜRÜN KODU: _______________
KONTROL EDEN: ____________

TOPLAM KONTROL EDİLEN: _____ adet

HATA SAYILARI:
┌─────────────────────────┬──────┐
│ 1. Temizleme Hatalı     │ ____ │
│ 2. Vuruk                │ ____ │
│ 3. Kapağı Alınmayan     │ ____ │
│ 4. Polisaj              │ ____ │
│ 5. Kaynak Az            │ ____ │
│ 6. Kaynak Akıntısı      │ ____ │
│ 7. İçi Çapaklı          │ ____ │
│ 8. Pim Girmeyen         │ ____ │
│ 9. Boncuklu             │ ____ │
│ 10. Yamuk               │ ____ │
│ 11. Gramajı Düşük       │ ____ │
│ 12. Hurda               │ ____ │
└─────────────────────────┴──────┘

TOPLAM HATALI: _____ adet

TAMİR EDİLEN: _____ adet (varsa)

EK NOTLAR:
_________________________________
_________________________________

İMZA: ______________
```

### Hızlı Sayım Tablosu (Çizgi Yöntemi)

Her 5 hatada bir grup yaparak saymanız daha kolay olabilir:

```
HATA SAYIM TABLOSU

Temizleme Hatalı:  |||| → 5 adet

Vuruk:             || → 2 adet

Kapağı Alınmayan:  | → 1 adet

(5'lik gruplar: |||| çizgisini çapraz çiz)
```

---

## 💡 Örnek Senaryolar

### Senaryo 1: Tam Kontrol Süreci

**Durum:**
Parti numarası 25012 olan DIS-180 ürününü kontrol ediyorsunuz. Toplam 100 adet ürün var.

**Kontrol Sonucu:**
- 5 tanesi temizleme hatalı
- 2 tanesi vuruk
- 1 tanesi kapağı alınmamış
- Diğerleri sorunsuz

**Çözüm - Adım Adım:**

**1. Parti Başlat:**
```
"Hatalı Ürünler" → "+ Yeni Parti"
Parti No: 25012
Ürün: DIS-180
İsim: Ahmet
"Parti Başlat" butonuna bas
```

**2. Hataları Say:**
```
Temizleme Hatalı: + butonuna 5 kez bas → 5 adet
Vuruk: + butonuna 2 kez bas → 2 adet
Kapağı Alınmayan: + butonuna 1 kez bas → 1 adet
```

**3. Kontrol Et:**
```
Toplam Hatalı: 8 adet
Sorunsuz: 92 adet
Hata oranı: %8
```

**4. Kaydet:**
```
"Kaydet ve Sıfırla" butonuna bas
Onay → "Evet"
```

**Sonuç:**
- Parti kaydedildi
- 8 adet hatalı ürün sisteme girildi
- Yönetim bu verileri görebilir
- Geçmiş partiler bölümünden tekrar görüntüleyebilirsiniz

---

### Senaryo 2: Tamir Süreci ile Birlikte

**Durum:**
Parti 25015, DIS-200 ürünü. 12 adet hatalı bulundu. Tamir ekibi 9 tanesini tamir etti, 3 tanesi hurda oldu.

**Çözüm:**

**1. İlk Kontrol:**
```
"+ Yeni Parti"
Parti: 25015
Ürün: DIS-200

Hata Sayımı:
- Polisaj: 7 adet
- Vuruk: 3 adet
- İçi Çapaklı: 2 adet
TOPLAM: 12 adet

"Kaydet ve Sıfırla"
```

**2. Tamir Sonrası Güncelleme:**
```
"Geçmiş Partiler" → Parti 25015 → "Düzenle"
Tamir Edilen Adet: 9
"Güncelle"
```

**3. Sonuç Özeti:**
```
Toplam Hatalı: 12 adet
Tamir Edilen: 9 adet (kullanılabilir hale geldi)
Hurda: 3 adet (tamiri imkansız)
Başarı Oranı: %75 tamir
```

**Yararı:**
- Tamir ekibinin performansı ölçülebilir
- Hurda oranı takip edilebilir
- Maliyet hesaplaması yapılabilir

---

### Senaryo 3: Bilgisayar Olmadan Kontrol

**Durum:**
Üretim alanında çalışıyorsunuz, bilgisayar yok. Parti 25020, DIS-220 ürününü kontrol ediyorsunuz.

**Kontrol Sonuçları:**
- Temizleme Hatalı: 3
- Vuruk: 1
- Kaynak Az: 2
- Hurda: 1

**Çözüm:**

**1. Formu Doldur:**
```
HATALI ÜRÜNLER KONTROL FORMU

Tarih: 11/01/2026
Parti No: 25020
Ürün Kodu: DIS-220
Kontrol Eden: Mehmet

Toplam Kontrol Edilen: 50 adet

Hata Sayıları:
1. Temizleme Hatalı:     3
2. Vuruk:                1
3. Kapağı Alınmayan:     0
4. Polisaj:              0
5. Kaynak Az:            2
6. Kaynak Akıntısı:      0
7. İçi Çapaklı:          0
8. Pim Girmeyen:         0
9. Boncuklu:             0
10. Yamuk:               0
11. Gramajı Düşük:       0
12. Hurda:               1

Toplam Hatalı: 7 adet

Tamir Edilen: - (henüz tamire gitmedi)

Ek Notlar: Kaynak az olanlar tamire gönderilecek

İmza: Mehmet
```

**2. Formu Teslim Et:**
- Vardiya sonunda yöneticinize verin
- Yönetici sisteme girecek

**3. Takip:**
- Ertesi gün sistemde kontrol edin
- Tamir sonrası güncelleyin

---

## ⚠️ Önemli Notlar

### Otomatik Kayıt
- **Veri kaybı yok:** Her + veya - tuşuna bastığınızda sistem otomatik kaydeder
- **Güvenli:** Elektrik kesilse bile veriler korunur
- **Devam edebilirsiniz:** Sayfayı kapatıp geri geldiğinizde kaldığınız yerden devam edebilirsiniz

### İsim Yazma
- **Mutlaka adınızı yazın** - Bu sayede kim hangi kontrolü yaptı belli olur
- **Sorumluluk:** Her kayıt yapan kişinin adı sistem de kalır
- **Performans takibi:** Yönetim hangi kontrol elemanı ne kadar hata buluyor görebilir

### Parti Numarası
- **Doğru yazın:** Ürün etiketi üzerindeki parti numarasını kontrol edin
- **Tekrar kontrol:** Yanlış parti numarası tüm kaydı hatalı yapar
- **Aynı parti:** Aynı parti için birden fazla kayıt açmayın

### Tamir Takibi (Yeni Özellik)
- **Tamir sonrası:** Hatalı ürünler tamir edildikten sonra mutlaka kaydedin
- **Düzenleme:** Geçmiş partilerden düzenle butonuyla tamir adedini girin
- **Raporlama:** Tamir başarı oranı hesaplanır

### Hata Kategorileri
- **Doğru kategori:** Her hatayı doğru kategoriye yazın
- **Emin değilseniz:** Hangi kategoriye gireceğini bilmiyorsanız yöneticinize sorun
- **Standart:** Herkes aynı şekilde kategorilere yazsın ki raporlar doğru olsun

---

## ❌ Sık Yapılan Hatalar

### Hata 1: Parti Bitince "Kaydet ve Sıfırla" Yapmadan Çıkmak

**Yanlış:**
```
100 ürün saydım, hataları işaretledim
Sayfayı kapattım
(Veriler kaybolmaz ama parti tamamlanmış sayılmaz)
```

**Doğru:**
```
100 ürün saydım, hataları işaretledim
"Kaydet ve Sıfırla" butonuna bastım
Parti tamamlandı, yeni kontrol için hazır
```

### Hata 2: Aynı Parti İçin Birden Fazla Kayıt Açmak

**Yanlış:**
```
Sabah: Parti 25012 açtım, 50 ürün saydım, kaydettim
Öğleden sonra: Parti 25012 tekrar açtım, 50 ürün daha saydım
→ Sistemde 2 ayrı kayıt var (YANLIŞ!)
```

**Doğru:**
```
Sabah: Parti 25012 açtım, 50 ürün saydım
Öğleden sonra: Aynı partiyi devam ettirdim, 50 ürün daha ekledim
Gün sonu: Toplamı kaydettim
→ Tek kayıt, toplam 100 ürün
```

### Hata 3: Hata Kategorisini Karıştırmak

**Yanlış:**
Vuruk (çentik) olan ürünü "Yamuk" kategorisine yazmak

**Doğru:**
- **Vuruk:** Darbe izi, çentik, ezik
- **Yamuk:** Şekil bozukluğu, eğri, çarpık

Her kategorinin tanımını öğrenin!

### Hata 4: Tamir Edilen Adedi Güncellememeyi Unutmak

**Yanlış:**
```
12 adet hatalı kaydettim
Tamir ekibi 9 tanesini tamir etti
Sistemi güncellemedim
→ Raporlarda hala 12 adet hatalı görünüyor
```

**Doğru:**
```
12 adet hatalı kaydettim
Tamir ekibi 9 tanesini tamir etti
"Geçmiş Partiler" → "Düzenle" → Tamir Edilen: 9
→ Sistemde doğru bilgi var
```

### Hata 5: Yanlış Saydığında Silip Yeniden Başlamak

**Yanlış:**
```
Temizleme Hatalı: 5 kez bastım
Ama aslında 3 olmalıydı
Partiyi sildim, yeniden başladım
```

**Doğru:**
```
Temizleme Hatalı: 5 kez bastım (yanlış)
- butonuna 2 kez bastım
Şimdi 3 adet (doğru)
```

**Not:** + ve - butonları tam bu iş için var. Yeniden başlamaya gerek yok!

---

## 🎯 Hızlı İpuçları

### Hızlı Sayım Teknikleri

**1. 5'lik Gruplar:**
```
Her 5 hatada bir not al
5, 10, 15, 20...
Son grubu topla
```

**2. Kağıda Çizgi:**
```
|||| |||| || → 12 adet
(Her 4 çizgide 5. çizgiyi çapraz çek)
```

**3. Fiziksel Ayırma:**
```
Hatalı ürünleri kategorilere göre ayrı kutulara koy
Kutu başına say, sisteme gir
```

### Kontrol Listesi

Parti başlatmadan önce:
- [ ] Parti numarasını ürün etiketinden oku
- [ ] Ürün kodunu kontrol et
- [ ] Adını doğru yaz
- [ ] Kontrol edilecek toplam adedi bil

Sayım sırasında:
- [ ] Her kategoriyi dikkatli seç
- [ ] Şüphelileri yöneticine göster
- [ ] Fiziksel sayımı yap, sonra sisteme gir

Parti bitince:
- [ ] Tüm ürünleri saydığından emin ol
- [ ] Toplam hatayı kontrol et
- [ ] "Kaydet ve Sıfırla" butonuna bas

---

**Sonraki Bölüm:** [Parti Takip (Temizleme) →](05-parti-takip.md)
