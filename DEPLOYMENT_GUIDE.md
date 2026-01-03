# K.K.P. Platform - Ücretsiz Deployment Rehberi

## 🚀 Render.com ile Ücretsiz Deployment

### Ön Hazırlık

1. **GitHub Hesabı Oluşturun** (yoksa)
   - https://github.com adresine gidin
   - Ücretsiz hesap oluşturun

2. **Render Hesabı Oluşturun**
   - https://render.com adresine gidin
   - "Get Started for Free" butonuna tıklayın
   - GitHub hesabınızla giriş yapın

### Adım 1: Kodu GitHub'a Yükleyin

1. GitHub'da yeni bir repository (depo) oluşturun:
   - Repository adı: `kkp-platform`
   - Public veya Private seçebilirsiniz
   - "Create repository" tıklayın

2. Bilgisayarınızda terminal/command prompt açın ve proje klasörüne gidin:
   ```bash
   cd C:\Users\ESAT\kkp-platform
   ```

3. Git komutlarını çalıştırın:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/KULLANICI_ADINIZ/kkp-platform.git
   git push -u origin main
   ```

   **Not:** `KULLANICI_ADINIZ` yerine kendi GitHub kullanıcı adınızı yazın
<>
### Adım 2: PostgreSQL Veritabanı Oluşturun

1. Render Dashboard'a gidin: https://dashboard.render.com
2. "New +" butonuna tıklayın
3. "PostgreSQL" seçin
4. Ayarlar:
   - **Name:** `kkp-db`
   - **Database:** `kkp_db`
   - **User:** `kkp_user`
   - **Region:** `Frankfurt (EU Central)` (Türkiye'ye en yakın)
   - **Plan:** `Free` seçin
5. "Create Database" tıklayın
6. Veritabanı oluşturulurken bekleyin (2-3 dakika)

### Adım 3: Backend API Deploy Edin

1. Render Dashboard'da "New +" > "Web Service" seçin
2. GitHub repository'nizi bağlayın:
   - "Connect GitHub" tıklayın
   - `kkp-platform` repository'sini seçin
3. Ayarlar:
   - **Name:** `kkp-backend`
   - **Region:** `Frankfurt (EU Central)`
   - **Branch:** `main`
   - **Root Directory:** `backend`
   - **Runtime:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
   - **Plan:** `Free` seçin

4. Environment Variables ekleyin (Advanced bölümünde):
   ```
   NODE_ENV=production
   PORT=10000
   FRONTEND_URL=https://kkp-frontend.onrender.com
   ```

5. "Add from Database" tıklayın:
   - Database: `kkp-db` seçin
   - Bu otomatik olarak `DATABASE_URL` ekleyecek

6. "Create Web Service" tıklayın
7. Deploy başlayacak (5-10 dakika sürebilir)

### Adım 4: Veritabanı Tablolarını Oluşturun

Backend deploy edildikten sonra:

1. Render Dashboard'da `kkp-db` veritabanınıza gidin
2. "Connect" bölümünde "External Connection String" kopyalayın
3. Bilgisayarınızda pgAdmin veya DBeaver ile bağlanın
4. Şu SQL scriptini çalıştırın:

```sql
-- backend/schema.sql dosyasındaki tüm CREATE TABLE komutlarını çalıştırın
```

**Alternatif:** Backend'e SSH ile bağlanıp migration scriptlerini çalıştırabilirsiniz.

### Adım 5: Frontend Deploy Edin

1. Render Dashboard'da "New +" > "Static Site" seçin
2. GitHub repository'nizi seçin: `kkp-platform`
3. Ayarlar:
   - **Name:** `kkp-frontend`
   - **Branch:** `main`
   - **Root Directory:** `frontend`
   - **Build Command:** `npm install && npm run build`
   - **Publish Directory:** `build`

4. Environment Variable ekleyin:
   ```
   REACT_APP_API_URL=https://kkp-backend.onrender.com
   ```
   **Not:** Backend URL'inizi kopyalayıp buraya yapıştırın

5. "Create Static Site" tıklayın
6. Deploy başlayacak (5-10 dakika)

### Adım 6: CORS Ayarlarını Güncelleyin

1. Backend'inizin URL'ini kopyalayın
2. Render Dashboard'da backend servisinize gidin
3. Environment Variables'a gidin
4. `FRONTEND_URL` değerini frontend URL'iniz ile güncelleyin:
   ```
   FRONTEND_URL=https://kkp-frontend.onrender.com
   ```
5. "Save Changes" tıklayın (otomatik re-deploy olacak)

### ✅ Tamamlandı!

Artık siteniz yayında! Frontend URL'nize giderek uygulamanızı kullanabilirsiniz.

**Örnek URL:**
- Frontend: https://kkp-frontend.onrender.com
- Backend API: https://kkp-backend.onrender.com/api/health

---

## 🔄 Güncelleme Yapma

Kod değişikliği yaptığınızda:

```bash
git add .
git commit -m "Değişiklik açıklaması"
git push
```

Render otomatik olarak yeni kodu deploy edecek!

---

## 💡 Önemli Notlar

### Ücretsiz Plan Sınırlamaları:
- **Database:** 1GB storage, 15 dakika inaktiflik sonrası sleep
- **Web Service:** 512MB RAM, 15 dakika inaktiflik sonrası sleep
- **Static Site:** 100GB bandwidth/ay
- **Sleep:** İlk istek geldiğinde 30 saniye içinde uyanır

### Sleep Problemi Çözümü:
Sitenizi sürekli aktif tutmak için UptimeRobot kullanabilirsiniz:
1. https://uptimerobot.com (ücretsiz)
2. Her 5 dakikada bir sitenize ping atar
3. Site hiç sleep moduna girmez

---

## 🆘 Sorun Giderme

### "Application Error" hatası:
- Render Dashboard > Logs bölümünden hata mesajlarını kontrol edin
- Environment variables doğru girilmiş mi kontrol edin

### Database connection hatası:
- `DATABASE_URL` environment variable'ı doğru mu kontrol edin
- Veritabanı aktif mi kontrol edin

### CORS hatası:
- `FRONTEND_URL` environment variable'ı doğru URL'i içeriyor mu kontrol edin
- Backend'i re-deploy edin

### 502 Bad Gateway:
- Backend'in deploy'u tamamlanmış mı kontrol edin
- Start command doğru mu kontrol edin: `node server.js`

---

## 📞 Destek

Sorun yaşarsanız:
1. Render Logs'u kontrol edin
2. Environment variables'ları kontrol edin
3. GitHub Issues açın
