# ⚡ HIZLI BAŞLANGIÇ - K.K.P. Platform

## Adım 1: PostgreSQL Kontrolü

PostgreSQL kurulu mu kontrol edin:

```bash
psql --version
```

Eğer kurulu değilse:
- İndirin: https://www.postgresql.org/download/windows/
- Kurulum sırasında şifre belirleyin: `postgres` (veya kendiniz belirleyin)

## Adım 2: Veritabanını Hazırlayın

**PowerShell veya CMD açın:**

```bash
# PostgreSQL'e bağlanın
psql -U postgres

# Veritabanını oluşturun
CREATE DATABASE kkp_db;

# Çıkın
\q

# Şemayı yükleyin
cd C:\Users\ESAT\kkp-platform\backend
psql -U postgres -d kkp_db -f database.sql
```

## Adım 3: Backend'i Başlatın

**Yeni terminal açın:**

```bash
cd C:\Users\ESAT\kkp-platform\backend

# JSON verilerini PostgreSQL'e aktar (ilk kez)
npm run migrate

# Backend'i başlat
npm run dev
```

✅ Backend çalışıyor mu? http://localhost:5000/api/health adresini tarayıcıda açın.
Görmeniz gereken: `{"status":"OK","message":"K.K.P. Platform API çalışıyor"}`

## Adım 4: Frontend'i Başlatın

**Başka bir terminal açın:**

```bash
cd C:\Users\ESAT\kkp-platform\frontend

# Frontend'i başlat
npm start
```

✅ Tarayıcınız otomatik olarak http://localhost:3000 açılacak.

## ✅ Tamamlandı!

Artık K.K.P. Platform kullanıma hazır!

### 📌 Kullanım İpuçları

1. **Mamül Stok**: Sol menüden "Mamül Stok" seçin
   - İzolasyon, Koli, Kutu, Tapa kategorileri
   - Stok ekle/çıkar butonları
   - Arama yapabilirsiniz

2. **Kalite Kontrol**: Sol menüden "Kalite Kontrol" seçin
   - Güncel İşler: Görev ekleyin, tamamlayın
   - Sipariş Hazırlığı: Yeni sipariş oluşturun
   - Simülasyon Stok: Planlama yapın

3. **Veri Yedekleme**:
   - Kalite Kontrol → Veri Aktarma
   - "Dışa Aktar" butonuna tıklayın
   - JSON dosyası indirilir

## 🔧 Sorun mu Var?

### Backend başlamıyor:
```bash
# PostgreSQL çalışıyor mu kontrol edin
psql -U postgres -c "SELECT 1;"

# .env dosyasındaki şifreyi kontrol edin
# DB_PASSWORD=postgres (kendi şifreniz)
```

### Migrate hatası:
```bash
# Veritabanını sıfırlayın
psql -U postgres -c "DROP DATABASE kkp_db;"
psql -U postgres -c "CREATE DATABASE kkp_db;"
psql -U postgres -d kkp_db -f backend/database.sql
npm run migrate
```

### Port hatası (5000 veya 3000 kullanımda):
```bash
# Backend portunu değiştir: backend/.env → PORT=5001
# Frontend portunu değiştir: frontend/package.json → "start": "PORT=3001 react-scripts start"
```

## 📊 İlk Veri Kontrolü

Veriler doğru aktarıldı mı?

```bash
# PostgreSQL'de kontrol
psql -U postgres -d kkp_db

# Sorgu
SELECT COUNT(*) FROM mamul_izolasyon;
SELECT COUNT(*) FROM gorevler;

\q
```

---

**Hâlâ sorun mu yaşıyorsunuz?** README.md dosyasına bakın veya bana bildirin!
