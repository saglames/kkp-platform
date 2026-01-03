# K.K.P. (Kalite Kontrol Platformu) Yönetim Sistemi

Modern, full-stack web uygulaması - Mamül Stok ve Kalite Kontrol yönetimi için profesyonel platform.

## 🎯 Özellikler

### 📦 Mamül Stok Modülü
- **İzolasyon Yönetimi** (35 ürün)
- **Koli Yönetimi** (9 çeşit)
- **Kutu Yönetimi** (11 çeşit)
- **Tapa Yönetimi** (28 çeşit)
- Gerçek zamanlı stok takibi
- İşlem geçmişi (son 20 işlem)
- Stok ekleme/çıkarma işlemleri
- Arama ve filtreleme

### 🏭 Kalite Kontrol Modülü
- **Güncel İşler**: Görev yönetimi, aciliyet seviyeleri, not sistemi
- **Sipariş Hazırlığı**: Malzeme checklist, durum takibi, özet dashboard
- **Ürün Siparişleri**: Tedarik yönetimi, durum takibi
- **Simülasyon Stok**: 6 kategori (Koli, Kutu, İzolasyon, Tapa, Poşet, Etiket)
- **Veri Aktarma**: JSON export/import, veri yedekleme

## 🛠️ Teknoloji Stack

### Backend
- **Node.js** v18+
- **Express.js** - REST API
- **PostgreSQL** - Veritabanı
- **pg** - PostgreSQL client

### Frontend
- **React** 18+
- **React Router** - Sayfa yönlendirme
- **Axios** - HTTP istekleri
- **Tailwind CSS** - Modern UI

## 📋 Gereksinimler

- Node.js (v18 veya üzeri)
- PostgreSQL (v14 veya üzeri)
- npm veya yarn

## 🚀 Kurulum

### 1. PostgreSQL Kurulumu

PostgreSQL henüz kurulu değilse:
- Windows: https://www.postgresql.org/download/windows/
- Kurulum sırasında şifre: `postgres` (veya kendi şifrenizi belirleyin)

### 2. Veritabanı Oluşturma

PostgreSQL'e bağlanın ve veritabanını oluşturun:

```bash
# pgAdmin veya psql ile bağlanın
psql -U postgres

# Veritabanını oluşturun
CREATE DATABASE kkp_db;

# Bağlantıdan çıkın
\q
```

Ardından şema dosyasını çalıştırın:

```bash
cd backend
psql -U postgres -d kkp_db -f database.sql
```

### 3. Backend Kurulumu

```bash
cd backend

# .env dosyasını kontrol edin (şifre doğru mu?)
# DB_PASSWORD=postgres (kendi şifrenizi yazın)

# Veritabanı şeması zaten oluşturuldu

# Mevcut JSON verilerini PostgreSQL'e aktar
npm run migrate

# Backend'i başlat
npm run dev
```

Backend şu adreste çalışacak: http://localhost:5000

### 4. Frontend Kurulumu

Yeni bir terminal açın:

```bash
cd frontend

# Frontend'i başlat
npm start
```

Frontend şu adreste açılacak: http://localhost:3000

## 📊 Veri Taşıma

Mevcut Firebase verileriniz otomatik olarak PostgreSQL'e aktarıldı:

```bash
cd backend
npm run migrate
```

Bu komut şu dosyaları okuyup PostgreSQL'e aktarır:
- `C:\Users\ESAT\Downloads\envanter-yedek-2025-12-29.json` → Mamül Stok verileri
- `C:\Users\ESAT\Downloads\akg_firebase_yedek_2025-12-29.json` → Kalite Kontrol verileri

## 🎨 Kullanıcılar

Sistemde 6 kullanıcı bulunur (herkes her şeye erişebilir):
1. Esat
2. Melisa
3. Evrim
4. Koray
5. Emre
6. Ahmet

## 📁 Proje Yapısı

```
kkp-platform/
├── backend/
│   ├── routes/           # API endpoint'leri
│   │   ├── mamulStok.js
│   │   ├── kaliteKontrol.js
│   │   ├── simulasyonStok.js
│   │   └── veriAktarma.js
│   ├── database.sql      # PostgreSQL şeması
│   ├── migrate.js        # Veri taşıma scripti
│   ├── server.js         # Express server
│   ├── db.js             # PostgreSQL bağlantısı
│   └── .env              # Ortam değişkenleri
│
└── frontend/
    ├── src/
    │   ├── components/   # React bileşenleri
    │   ├── pages/        # Sayfa bileşenleri
    │   ├── services/     # API servisleri
    │   └── utils/        # Yardımcı fonksiyonlar
    └── public/
```

## 🔧 API Endpoints

### Mamül Stok
- `GET /api/mamul-stok/izolasyon` - Tüm izolasyonları getir
- `POST /api/mamul-stok/izolasyon` - Yeni izolasyon ekle
- `PUT /api/mamul-stok/izolasyon/:id` - İzolasyon güncelle
- `DELETE /api/mamul-stok/izolasyon/:id` - İzolasyon sil
- `POST /api/mamul-stok/izolasyon/:id/stok-degistir` - Stok ekle/çıkar

*(Koli, Kutu, Tapa için de aynı endpoint'ler mevcut)*

### Kalite Kontrol
- `GET /api/kalite-kontrol/gorevler` - Tüm görevleri getir
- `GET /api/kalite-kontrol/siparis-hazirlik` - Siparişleri getir
- `GET /api/kalite-kontrol/urun-siparisler` - Ürün siparişlerini getir

### Simülasyon Stok
- `GET /api/simulasyon-stok` - Tüm stokları getir
- `GET /api/simulasyon-stok/:malzeme_turu` - Kategoriye göre getir

### Veri Aktarma
- `GET /api/veri-aktarma/export` - Tüm verileri JSON olarak indir
- `POST /api/veri-aktarma/import` - JSON dosyasından veri yükle
- `DELETE /api/veri-aktarma/clear-all` - Tüm verileri temizle

## ⚠️ Önemli Notlar

1. **PostgreSQL Şifresi**: `.env` dosyasındaki `DB_PASSWORD` değerini kendi PostgreSQL şifrenizle değiştirin.

2. **Port Çakışması**: Eğer 5000 veya 3000 portları kullanımdaysa:
   - Backend: `.env` dosyasında `PORT` değiştirin
   - Frontend: `package.json`'da port ayarlayın

3. **Veri Yedekleme**: Düzenli olarak "Veri Aktarma" modülünden JSON export yapın.

4. **Tarayıcı**: Chrome, Firefox veya Edge kullanın.

## 🐛 Sorun Giderme

### PostgreSQL bağlantı hatası
```bash
# PostgreSQL servisinin çalıştığından emin olun
# Windows: Services → PostgreSQL

# Bağlantı testleri:
psql -U postgres -d kkp_db -c "SELECT version();"
```

### Migrate hatası
```bash
# Veritabanını sıfırlayıp yeniden oluşturun
psql -U postgres -c "DROP DATABASE kkp_db;"
psql -U postgres -c "CREATE DATABASE kkp_db;"
psql -U postgres -d kkp_db -f backend/database.sql
npm run migrate
```

### Frontend başlamıyor
```bash
# node_modules'ü temizleyin
cd frontend
rm -rf node_modules package-lock.json
npm install
npm start
```

## 📝 Geliştirme

### Yeni Özellik Eklemek

1. **Backend**: `backend/routes/` klasöründe ilgili route dosyasına endpoint ekleyin
2. **Database**: Gerekirse `database.sql`'e yeni tablo/alan ekleyin
3. **Frontend**: `frontend/src/services/api.js`'e API fonksiyonu ekleyin
4. **Component**: `frontend/src/components/` altında yeni component oluşturun

### Veritabanı Değişiklikleri

```bash
# Değişiklikleri SQL dosyasına kaydedin
# Sonra çalıştırın:
psql -U postgres -d kkp_db -f migration.sql
```

## 📞 Destek

Herhangi bir sorun için:
- GitHub Issues: [Proje Repository]
- Email: [İletişim Email]

## 📜 Lisans

Bu proje Akgün Paketleme için özel olarak geliştirilmiştir.

---

**K.K.P. Platform v1.0.0** | Oluşturulma Tarihi: 29.12.2025
