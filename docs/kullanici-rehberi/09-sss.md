# SIK SORULAN SORULAR (SSS)

## Genel Sorular

### S1: KKP Platform nedir?

**Cevap:** KKP (Kalite Kontrol Paketleme) Platform, fabrikamızdaki kalite kontrol ve paketleme süreçlerini dijital ortamda takip etmek için geliştirilmiş bir sistemdir.

**Ne yapar:**
- Stok takibi
- Hatalı ürün kaydı
- Temizleme parti takibi
- Sipariş hesaplama
- Görev yönetimi

---

### S2: Sisteme nereden giriş yapabilirim?

**Cevap:**
```
Web Adresi: https://kkp-frontend.onrender.com

Tarayıcınıza yazın veya yer imlerinize ekleyin.
```

---

### S3: Kullanıcı adımı ve şifremi nasıl alabilirim?

**Cevap:**
- İlk kullanım için yöneticinize başvurun
- Size özel kullanıcı adı ve şifre verilecek
- İlk girişte şifrenizi değiştirmeniz önerilir

---

### S4: Şifremi unuttum, ne yapmalıyım?

**Cevap:**
1. Giriş sayfasında "Şifremi Unuttum" linkine tıklayın (varsa)
2. Yoksa yöneticinize başvurun
3. Yeni şifre alacaksınız

---

### S5: Birden fazla cihazdan giriş yapabilir miyim?

**Cevap:**
Evet, aynı anda birden fazla cihazdan (bilgisayar, tablet) giriş yapabilirsiniz. Ancak:
- Her cihazda ayrı giriş yapmalısınız
- İşiniz bitince çıkış yapın
- Ortak bilgisayarlarda "Beni Hatırla" seçmeyin

---

## Mamül Stok Soruları

### S6: Stok azaltırken yanlış miktar girdim, nasıl düzeltirim?

**Cevap:**
```
Yöntem 1 - Ters işlem:
Yanlış: 100 yerine 1000 azalttım
Çözüm: Stok artırma → 900 ekle → Neden: "Düzeltme"

Yöntem 2 - İşlem geçmişi:
Yöneticinize bildirin, işlem iptal edilebilir
```

---

### S7: Stok sıfırın altına düşebilir mi?

**Cevap:**
Hayır, normal stok sıfırın altına düşemez. Sistem izin vermez.

**İstisna:** Simülasyon stokta negatif değer kullanılabilir (planlama için).

---

### S8: Fire kaydını nasıl yaparım?

**Cevap:**
```
Örnek: 1000 gönderildi, 995 geldi, 5 fire

1. Mamül Stok → İlgili ürün
2. Stok azaltma → 5 adet
3. Neden: "Temizleme firesi - Parti 25012"
```

---

## Hatalı Ürünler Soruları

### S9: Hata sayarken yanlış tuşa bastım, nasıl düzeltirim?

**Cevap:**
- Fazla saydıysanız: **- butonuna** basın
- Eksi yapabilirsiniz, sıfıra kadar
- Sistem otomatik kaydediyor, endişelenmeyin

---

### S10: "Kaydet ve Sıfırla" butonu ne işe yarar?

**Cevap:**
```
İşlevi:
1. Mevcut partiyi kaydeder
2. Hata sayaçlarını sıfırlar
3. Yeni parti için hazır hale getirir

Ne zaman kullanılır:
- Bir parti kontrolü bittiğinde
- Yeni partiye başlamadan önce
```

---

### S11: Aynı parti için iki kez kayıt açabilir miyim?

**Cevap:**
**Hayır!** Aynı parti numarası için sadece bir kayıt olmalı.

**Yanlış:**
```
Sabah: Parti 25012 açtım
Öğleden sonra: Parti 25012 tekrar açtım
→ İki ayrı kayıt (YANLIŞ!)
```

**Doğru:**
```
Sabah: Parti 25012 açtım, 50 ürün saydım
Öğleden sonra: Devam ettim, 50 ürün daha ekledim
Gün sonu: "Kaydet ve Sıfırla" ile bitirdim
```

---

### S12: Tamir edilen ürünleri nasıl kaydederim?

**Cevap:**
```
1. "Hatalı Ürünler" → "Geçmiş Partiler"
2. İlgili parti → "Detay" veya "Düzenle"
3. "Tamir Edilen Adet" alanını doldur
4. "Güncelle"

Örnek:
Toplam Hatalı: 12 adet
Tamir Edilen: 9 adet
Hurda: 3 adet
```

---

## Tüm Süreç Soruları

### S13: Temizlemeye giden ürünleri nasıl takip ederim?

**Cevap:**
```
Adımlar:
1. Temizlemeye Gidecek → Yeni ürün ekle
2. Gönder butonu → Temizlemede Olan'a geçer
3. Dönüş → Temizlemeden Gelen'e kaydet
4. Kalite kontrol → Sevke Hazır
5. Sevk Et → Sevk Edilen
```

Her aşamada durum otomatik değişir.

---

### S14: Fire çıktığında ne yapmalıyım?

**Cevap:**
```
1. Dönüş kaydı yaparken:
   Gönderilen: 1000
   Gelen: 995
   Fire: 5 (sistem hesaplar)

2. Fire nedenini belirt

3. Fire sorumluluğunu belirle:
   - Temizleme firması mı?
   - Taşıma hasarı mı?
   - Normal fire mi?

4. Kalan Ürünler'e kaydet (fire)
```

---

## Parti Takip Soruları

### S15: İrsaliye numarasını sonradan ekleyebilir miyim?

**Cevap:**
Evet, ekleyebilirsiniz.

```
1. Parti Takip → İlgili parti
2. "Düzenle" butonu
3. İrsaliye No alanını doldur
4. "Güncelle"
```

---

### S16: Ödeme hesaplaması nasıl yapılır?

**Cevap:**
```
İki yöntem:

1. Gönderilen Adete Göre:
   1000 adet gönderildi × 0.50 TL = 500 TL

2. Gelen Adete Göre:
   995 adet geldi × 0.50 TL = 497.50 TL
   (5 adet fire ödenmez)

Hangi yöntem: Temizleme firmasıyla sözleşmeye göre
```

---

## Yarı Mamül Soruları

### S17: A ve B parçaları eşleşmediğinde ne yapmalıyım?

**Cevap:**
```
Örnek:
A parçası: 1000 adet
B parçası: 980 adet

Eşleşme: 980 çift → Sevk edildi
Kalan: 20 adet A parçası

Kayıt:
"Yarı Mamül" → "Jointler" → "Yeni Joint Ekle"
Ürün: DIS-180
A Adet: 20
B Adet: 0
```

Yeni B üretimi geldiğinde eşleştirin.

---

### S18: Yarı mamül stoğu nasıl kullanılır?

**Cevap:**
```
1. Mevcut Stok Kontrolü:
   Yarı Mamül → DIS-180
   A Adet: 35 (bekliyor)

2. Yeni Üretim:
   B parçası: 50 adet üretildi

3. Eşleştirme:
   35 çift oluşturuldu → Sevk
   Kalan B: 15 adet

4. Stok Güncelleme:
   A Adet: 35 - 35 = 0
   B Adet: 50 - 35 = 15
```

---

## Ürün Reçetesi Soruları

### S19: Yeni ürün reçetesi nasıl eklerim?

**Cevap:**
```
1. "Ürün Reçeteleri" → "+ Yeni Reçete"
2. Ürün Kodu: DIS-300
3. Malzeme listesi:
   - A Parçası: 1 adet
   - B Parçası: 1 adet
   - Kaynak Teli: 0.06 kg
   - İzolasyon: 0.6 metre
   - ...
4. Kaydet
```

**Test:**
100 adet sipariş hesapla, doğru mu kontrol et.

---

### S20: Simülasyon stok nedir?

**Cevap:**
Simülasyon stok = Sanal stok (planlama için)

**Gerçek stoktan farkı:**
- Gerçek stok: Depoda fiziksel olarak var
- Simülasyon stok: Planlama için hesaplama

**Kullanım:**
```
Sipariş: 1000 adet DIS-180

Hesapla → Gerekli malzemeler:
- A Parçası: 1000 adet
- B Parçası: 1000 adet
- ...

Simülasyon stoktan düş:
→ Bu malzemeler rezerve edildi (planlama)
→ Gerçek stok değişmedi
```

---

## Kalite Kontrol Soruları

### S21: Görev atama nasıl yapılır?

**Cevap:**
```
1. "Kalite Kontrol" → "Güncel İşler"
2. "+ Yeni Görev"
3. Formu doldur:
   - Görev: Ne yapılacak
   - Atanan: Kim yapacak
   - Öncelik: Acil/Yüksek/Orta/Düşük
   - Tarih: Ne zamana kadar
4. "Ekle"

Atanan kişi görev listesinde görecek.
```

---

### S22: İç sipariş ne demek?

**Cevap:**
Fabrika içinde bölümler arası talep/sipariş.

**Örnek:**
```
Talep Eden: Paketleme
Talep Edilen: Depo
Ürün: Koli
Adet: 200
Neden: Stok bitti

Depo bu talebi görecek ve karşılayacak.
```

---

## Bilgisayar Olmadan Kullanım

### S23: Bilgisayar yoksa ne yapmalıyım?

**Cevap:**
```
1. Veri toplama formlarını kullanın
   (10-veri-toplama-formlari.md)

2. Kağıda doldurun:
   - Ürün kodu
   - Adet
   - Tarih
   - Neden
   - Adınız

3. Vardiya sonunda yöneticinize verin

4. Yönetici sisteme girecek
```

---

### S24: Formları nereden bulabilirim?

**Cevap:**
```
1. Bu rehberde: 10-veri-toplama-formlari.md

2. Yazdırın ve kullanın

3. Veya kendiniz kağıda çizin:
   - Tarih
   - Ürün Kodu
   - Adet
   - İşlem (Giriş/Çıkış)
   - Neden
   - İmza
```

---

## Teknik Sorular

### S25: Hangi tarayıcıları kullanabilirim?

**Cevap:**
```
✓ Google Chrome (Önerilen)
✓ Microsoft Edge
✓ Mozilla Firefox
✓ Safari (Mac)

✗ Internet Explorer (Desteklenmiyor)
```

---

### S26: İnternet olmadan çalışır mı?

**Cevap:**
**Hayır.** KKP Platform internet bağlantısı gerektirir.

**İnternet kesilirse:**
1. Kağıda not alın
2. Bağlantı gelince sisteme girin

---

### S27: Verilerim kaybolur mu?

**Cevap:**
**Hayır.** Verileriniz güvendedir.

**Güvenlik önlemleri:**
- Her işlem otomatik kaydedilir
- Sunucuda yedeklenir
- Elektrik kesilse bile veriler korunur

**İstisna:**
- Henüz kaydetmeden sayfayı kapattıysanız
- İnternet kesilmişse

**Güvenli modüller:**
- Hatalı Ürünler: Otomatik kayıt (her + veya -)
- Diğerleri: "Kaydet" butonuna basın

---

### S28: Başkasının kullanıcı adıyla giriş yapabilir miyim?

**Cevap:**
**Hayır!** Her kullanıcı kendi hesabını kullanmalıdır.

**Neden:**
- Kim ne yaptı takip edilir
- Sorumluluk belirlenir
- Güvenlik sağlanır

---

## Raporlama ve İstatistik

### S29: Raporları nasıl alabilirim?

**Cevap:**
```
Modüle göre değişir:

Mamül Stok:
- "İşlem Geçmişi" → Rapor Al

Hatalı Ürünler:
- "Geçmiş Partiler" → Filtreleme → Rapor

Parti Takip:
- "Raporlar" sekmesi → Aylık/Yıllık rapor

Genellikle PDF veya Excel olarak indirilir.
```

---

### S30: Aylık hata istatistiğini nasıl görebilirim?

**Cevap:**
```
1. "Hatalı Ürünler" → "Geçmiş Partiler"
2. Tarih filtresi: Ocak 2026
3. "İstatistikler" veya "Rapor" butonuna bas
4. Hata kategorilerine göre özet göreceksiniz:
   - Temizleme Hatalı: 150 adet
   - Vuruk: 80 adet
   - ...
```

---

## Yetki ve Güvenlik

### S31: Hangi bölümleri kullanabilirim?

**Cevap:**
Yetkinize göre değişir.

**Kontrol:**
```
1. Giriş yaptıktan sonra menüye bakın
2. Görebildiğiniz bölümler = Yetkiniz var
3. Göremediğiniz bölümler = Yetkiniz yok

Ek yetki için: Yöneticinize başvurun
```

---

### S32: Şifremi nasıl değiştiririm?

**Cevap:**
```
1. Sağ üst köşede profil ikonu
2. "Ayarlar" veya "Profil"
3. "Şifre Değiştir"
4. Eski şifre + Yeni şifre
5. "Kaydet"

(Menü yapısı değişebilir, yoksa yöneticinize başvurun)
```

---

## Diğer Sorular

### S33: Sistem güncellemesi olduğunda ne olur?

**Cevap:**
```
1. Güncelleme genellikle gece yapılır
2. Mesai saatlerini etkilemez
3. Önemli güncelleme varsa bildirim alırsınız
4. Tarayıcınızı yenileyin (F5) yeni özellikler görünür
```

---

### S34: Önerim var, kime bildiririm?

**Cevap:**
```
1. Yöneticinize söyleyin
2. Veya Esat AKG'ye direkt ulaşın
3. Öneri formu varsa doldurun

Önerileriniz değerlidir!
```

---

### S35: Eğitim alabilir miyim?

**Cevap:**
```
Evet!

1. Bu kullanım kılavuzunu okuyun
2. Yöneticinize eğitim talep edin
3. Birebir eğitim planlanabilir
4. Video eğitimler hazırlanabilir
```

---

## Hızlı Başvuru

### En Çok Sorulan 5 Soru:

1. **Şifremi unuttum** → Yöneticinize başvurun
2. **Yanlış veri girdim** → Ters işlem yapın veya düzenleyin
3. **Sayfa açılmıyor** → İnternet kontrol, tarayıcı yenile, F5
4. **Veri kaydedilmiyor** → Zorunlu alanları doldurun, tekrar deneyin
5. **Yetkim yok** → Yöneticinize başvurun

---

**Sonraki Bölüm:** [Veri Toplama Formları →](10-veri-toplama-formlari.md)
