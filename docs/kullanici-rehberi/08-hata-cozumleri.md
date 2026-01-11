# HATA ÇÖZÜMLERİ

## Bu Bölüm Ne İşe Yarar?

Sistem kullanırken karşılaşabileceğiniz sorunlar ve çözümleri. Bir sorun yaşadığınızda önce buraya bakın, çözüm bulamazsanız teknik desteğe başvurun.

---

## 🌐 İnternet ve Bağlantı Sorunları

### Sorun 1: Sayfa Açılmıyor

**Belirtiler:**
- Tarayıcıda sayfa yüklenmiyor
- "Siteye ulaşılamıyor" hatası
- Beyaz ekran

**Çözümler:**

**1. İnternet Bağlantısını Kontrol Et:**
```
✓ Bilgisayarınızda internet var mı kontrol edin
✓ Başka bir web sitesi açılıyor mu deneyin
✓ Wi-Fi bağlı mı kontrol edin
```

**2. URL Adresini Kontrol Et:**
```
Doğru adres: https://kkp-frontend.onrender.com
Yanlış adres örnekleri:
  - http://kkp-frontend.onrender.com (https yerine http)
  - kkp-frontend.onrender.com (başında https:// yok)
```

**3. Tarayıcıyı Yenile:**
```
- Windows: F5 veya Ctrl + F5
- Mac: Cmd + R
```

**4. Tarayıcı Cache Temizle:**
```
Chrome:
1. Ctrl + Shift + Delete
2. "Önbelleğe alınmış resimler ve dosyalar" seç
3. "Verileri temizle"

Edge:
1. Ctrl + Shift + Delete
2. "Önbelleğe alınmış veriler ve dosyalar" seç
3. "Şimdi temizle"
```

**5. Farklı Tarayıcı Dene:**
- Chrome kullanıyorsanız → Edge deneyin
- Edge kullanıyorsanız → Chrome deneyin

**6. Bilgisayarı Yeniden Başlat:**
- Tüm uygulamaları kapat
- Bilgisayarı yeniden başlat
- Tekrar dene

---

### Sorun 2: Sayfa Yavaş Yükleniyor

**Belirtiler:**
- Sayfalar çok yavaş açılıyor
- Butonlara bastığınızda cevap geç geliyor

**Çözümler:**

**1. İnternet Hızını Kontrol Et:**
```
✓ speed test.net adresinden hız testi yap
✓ İndirme hızı: En az 5 Mbps olmalı
✓ Düşükse: İnternet sağlayıcınızı arayın
```

**2. Gereksiz Sekmeleri Kapat:**
```
✓ Tarayıcıda sadece KKP platformu açık olsun
✓ Diğer sekmeleri kapat
```

**3. Bilgisayar Yükünü Azalt:**
```
✓ Gereksiz programları kapat
✓ Görev Yöneticisi'nden CPU ve RAM kullanımını kontrol et
```

**4. Farklı Saatte Dene:**
```
✓ Herkes aynı anda kullanıyorsa yavaş olabilir
✓ Yoğun olmayan saatlerde dene
```

---

## 🔐 Giriş ve Yetkilendirme Sorunları

### Sorun 3: Giriş Yapamıyorum

**Belirtiler:**
- "Kullanıcı adı veya şifre hatalı" hatası
- Giriş butonuna basınca hiçbir şey olmuyor

**Çözümler:**

**1. Kullanıcı Adı ve Şifre Kontrolü:**
```
✓ Caps Lock kapalı mı?
✓ Türkçe karakter kullandınız mı? (İ, Ş, Ğ, vb.)
✓ Boşluk var mı? (Başında veya sonunda)
✓ Kopyala-yapıştır yaptıysanız, manuel yazın
```

**2. Şifremi Unuttum:**
```
1. Giriş sayfasında "Şifremi Unuttum" linkine tıkla
   (Yoksa yöneticinize başvurun)
2. Email adresinizi girin
3. Gelen maildeki linke tıklayın
4. Yeni şifre belirleyin
```

**3. Hesap Kilitlendi:**
```
✓ Çok fazla yanlış deneme yaptıysanız hesap kilitlenmiş olabilir
✓ 15 dakika bekleyin veya yöneticinize başvurun
```

---

### Sorun 4: Giriş Yaptım Ama Sayfalar Açılmıyor

**Belirtiler:**
- Giriş yaptınız ama menüler görünmüyor
- "Yetkiniz yok" hatası alıyorsunuz

**Çözüm:**
```
✓ Kullanıcı yetkiniz tanımlanmamış olabilir
✓ Yöneticinize başvurun
✓ Hangi bölümlere erişim istediğinizi belirtin
```

---

## 💾 Veri Kaydetme Sorunları

### Sorun 5: Veri Kaydedilmiyor

**Belirtiler:**
- "Kaydet" butonuna bastınız ama veri kaydedilmedi
- Hata mesajı gösteriliyor

**Çözümler:**

**1. Zorunlu Alanları Kontrol Et:**
```
✓ Kırmızı * işaretli alanlar dolu mu?
✓ Tüm gerekli bilgileri girdiniz mi?
```

**2. Veri Formatını Kontrol Et:**
```
✓ Sayı alanına harf yazdınız mı?
✓ Tarih formatı doğru mu? (GG/AA/YYYY)
✓ Özel karakterler var mı? (örn: !, @, #)
```

**3. İnternet Bağlantısı:**
```
✓ İnternet bağlantınız kesildi mi kontrol edin
✓ Bağlantı varsa tekrar deneyin
```

**4. Tarayıcı Konsolu Hatası:**
```
✓ F12 tuşuna basın
✓ "Console" sekmesine gidin
✓ Kırmızı hata varsa ekran görüntüsü alın
✓ Teknik desteğe gönderin
```

---

### Sorun 6: Yanlış Veri Girdim, Nasıl Düzeltirim?

**Mamül Stok:**
```
Yanlış: 100 yerine 1000 yazdım

Çözüm:
1. Stok azaltma işlemi yap
2. Fark kadar azalt: -900
3. Neden kısmına: "Yanlış giriş düzeltmesi"
```

**Hatalı Ürünler:**
```
Yanlış: Temizleme Hatalı'ya 5 yerine 50 yazdım

Çözüm:
1. - butonuna 45 kez bas
2. Veya partiyi sil, yeniden başla
```

**Diğer Modüller:**
```
✓ "Düzenle" butonu varsa düzenle
✓ Yoksa yöneticinize bildirin
```

---

## 🔄 Sayfa ve İşlem Sorunları

### Sorun 7: Sayfa Dondu, Yanıt Vermiyor

**Belirtiler:**
- Butonlara basmışsınız ama hiçbir şey olmuyor
- Sayfa takılı kaldı

**Çözümler:**

**1. Bekleyin:**
```
✓ Büyük veri işlemlerinde 10-30 saniye sürebilir
✓ "Yükleniyor" yazısı varsa bekleyin
```

**2. Sayfayı Yenileyin:**
```
✓ F5 tuşuna basın
✓ Verileriniz kaydedildiyse kaybolmaz
```

**3. Tarayıcıyı Kapatıp Açın:**
```
1. Tarayıcıyı tamamen kapatın
2. Yeniden açın
3. KKP platformuna giriş yapın
```

**4. Görev Yöneticisinden Sonlandırın:**
```
Windows:
1. Ctrl + Shift + Esc
2. Tarayıcıyı bulun
3. "Görevi sonlandır"
4. Yeniden açın
```

---

### Sorun 8: Veri Görüntülenmiyor / Boş Tablo

**Belirtiler:**
- Tablolar boş görünüyor
- "Veri bulunamadı" yazıyor ama olması gerekiyor

**Çözümler:**

**1. Filtre Kontrolü:**
```
✓ Tarih filtresi çok dar aralıkta mı?
✓ Arama kutusunda eski arama var mı?
✓ Filtreleri sıfırlayın
```

**2. Sayfa Yenile:**
```
✓ F5 ile sayfayı yenileyin
```

**3. Yetki Kontrolü:**
```
✓ O verileri görme yetkiniz var mı?
✓ Yöneticinize sorun
```

---

## 🖨️ Yazdırma ve Rapor Sorunları

### Sorun 9: Rapor İndirilmiyor

**Belirtiler:**
- "Rapor İndir" butonuna bastınız ama dosya inmiyor

**Çözümler:**

**1. Pop-up Engelleme:**
```
Chrome:
1. Adres çubuğunun sağındaki simgeye tıkla
2. "Her zaman izin ver" seç

Edge:
1. Ayarlar → İzinler
2. Pop-upları aç
```

**2. İndirilenler Klasörü:**
```
✓ İndirilenler klasörüne bakın
✓ Dosya orada olabilir
```

**3. Tarayıcı Ayarları:**
```
✓ İndirme klasörü doğru mu?
✓ Disk alanınız dolu mu?
```

---

## 📱 Mobil Cihaz Sorunları

### Sorun 10: Telefon/Tablette Düzgün Görünmüyor

**Belirtiler:**
- Butonlar çok küçük
- Menüler sığmıyor

**Çözüm:**
```
✓ KKP platformu bilgisayar için tasarlandı
✓ Mümkünse bilgisayar kullanın
✓ Tablet kullanıyorsanız yatay moda çevirin
```

---

## ⚠️ Hata Mesajları ve Anlamları

### Yaygın Hata Mesajları:

**"Sunucuya bağlanılamadı"**
```
Neden: İnternet bağlantısı yok veya sunucu bakımda
Çözüm: İnternet kontrol et, birkaç dakika bekle
```

**"Oturum süresi doldu"**
```
Neden: Uzun süre işlem yapmadınız
Çözüm: Çıkış yapın, tekrar giriş yapın
```

**"Yetkisiz işlem"**
```
Neden: Bu işlem için yetkiniz yok
Çözüm: Yöneticinize başvurun
```

**"Değer 0 veya daha yüksek olmalıdır"**
```
Neden: Negatif değer girdiniz (bazı alanlarda kabul edilmez)
Çözüm:
- Simülasyon stokta negatif girebilirsiniz
- Diğer alanlarda pozitif değer girin
```

**"Bu kayıt zaten mevcut"**
```
Neden: Aynı kayıt daha önce girilmiş
Çözüm: Mevcut kaydı düzenleyin veya farklı bilgi girin
```

**"Zorunlu alan"**
```
Neden: Gerekli alanları doldurmadınız
Çözüm: Kırmızı * işaretli alanları doldurun
```

---

## 🛠️ İleri Düzey Sorun Giderme

### Tarayıcı Geliştirici Araçları

**Konsol Hatalarını Görme:**
```
1. F12 tuşuna bas
2. "Console" sekmesine git
3. Kırmızı hatalar varsa ekran görüntüsü al
4. Teknik desteğe gönder
```

**Ağ İsteklerini Kontrol Etme:**
```
1. F12 tuşuna bas
2. "Network" sekmesine git
3. Sayfayı yenile (F5)
4. Kırmızı (failed) istekler varsa dikkat
5. Ekran görüntüsü al, teknik desteğe gönder
```

---

## 📞 Teknik Destek

### Destek İçin Hazırlık

Teknik desteğe başvurmadan önce hazırlayın:

**1. Sorun Detayları:**
```
✓ Ne yapmaya çalışıyordunuz?
✓ Ne oldu? (Ne bekliyordunuz, ne oldu)
✓ Hata mesajı var mı? (Tam metin)
```

**2. Ekran Görüntüsü:**
```
✓ Windows: Windows + Shift + S
✓ Mac: Cmd + Shift + 4
✓ Hatanın görüldüğü ekranı al
```

**3. Sistem Bilgileri:**
```
✓ Hangi tarayıcı? (Chrome, Edge, Firefox)
✓ Tarayıcı versiyonu?
✓ İşletim sistemi? (Windows 10, 11, Mac)
```

**4. Adım Adım Tekrar:**
```
Sorunu tekrar oluşturmak için:
1. ...
2. ...
3. ...
```

### İletişim

**Teknik Destek:** Esat AKG

**Bildirim Formatı:**
```
Konu: [KKP Platform] - [Sorun Özeti]

Merhaba,

Sorun: [Kısa açıklama]

Detaylar:
- Ne yapmaya çalıştım: ...
- Ne oldu: ...
- Hata mesajı: ...
- Tarayıcı: ...
- Tarih/Saat: ...

Ekran görüntüsü ekte.

[Adınız]
```

---

## 🔍 Sorun Giderme Kontrol Listesi

Herhangi bir sorun yaşadığınızda bu adımları izleyin:

```
☐ 1. İnternet bağlantım var mı?
☐ 2. Doğru URL'ye gidiyorum muyum?
☐ 3. Tarayıcımı güncelledim mi?
☐ 4. Sayfayı yeniledim mi? (F5)
☐ 5. Başka tarayıcıda denedim mi?
☐ 6. Bilgisayarı yeniden başlattım mı?
☐ 7. Hata mesajını okudum mu?
☐ 8. Ekran görüntüsü aldım mı?
☐ 9. Yukarıdaki çözümleri denedim mi?
☐ 10. Hala çözülmedi mi? → Teknik desteğe başvur
```

---

**Sonraki Bölüm:** [Sık Sorulan Sorular →](09-sss.md)
