# Sipariş Hazırlığı Yeni Alan Eklemeleri

## Tarih: 2026-01-09

## Değişiklikler

### 1. Kaldırılan Özellikler
- ❌ Eski boolean malzeme checklistleri (malzeme_koli, malzeme_kutu, malzeme_izolasyon, malzeme_tapa, malzeme_poset)
  - **NOT:** Bu alanlar veritabanında tutulur (eski veriler kaybolmasın), sadece UI'dan kaldırıldı

### 2. Eklenen Özellikler

#### Eksik Malzeme Adetleri (INTEGER kolonları)
- `eksik_koli` - Eksik koli adedi
- `eksik_kutu` - Eksik kutu adedi
- `eksik_izolasyon` - Eksik izolasyon adedi
- `eksik_tapa` - Eksik tapa adedi
- `eksik_poset` - Eksik poşet adedi
- `eksik_ek_parca` - Eksik ek parça adedi

#### Hazır Malzeme Adetleri (INTEGER kolonları)
- `hazir_koli` - Hazır koli adedi
- `hazir_kutu` - Hazır kutu adedi
- `hazir_izolasyon` - Hazır izolasyon adedi
- `hazir_ek_parca` - Hazır ek parça adedi

#### Tarih Alanları
- `siparis_tarihi` (DATE) - Sipariş tarihi (zorunlu)
- `tamamlanma_tarihi` (DATE) - Tamamlanma tarihi (opsiyonel)

#### Arama Özelliği
- Ürün koduna göre arama (frontend filtreleme)

## Migration Dosyası
`backend/migrations/siparis-hazirlik-yeni-alanlar.sql`

## Migration Nasıl Çalıştırılır

### Render.com PostgreSQL (Production)
1. Render Dashboard'a git
2. PostgreSQL database'e tıkla
3. "Connect" -> "External Connection" -> "PSQL Command" kopyala
4. Local terminal'de komutu çalıştır (database'e bağlan)
5. Migration SQL'i çalıştır:
   ```sql
   \i backend/migrations/siparis-hazirlik-yeni-alanlar.sql
   ```

   VEYA doğrudan SQL içeriğini kopyala-yapıştır

### Alternatif: Render Shell üzerinden
```bash
cd backend/migrations
psql $DATABASE_URL -f siparis-hazirlik-yeni-alanlar.sql
```

## Deploy Sonrası Kontrol

### Backend Kontrolü
```bash
curl https://kkp-backend.onrender.com/api/kalite-kontrol/siparis-hazirlik
```

Dönen JSON'da yeni alanları kontrol et:
- `eksik_koli`, `eksik_kutu`, `eksik_izolasyon`, `eksik_tapa`, `eksik_poset`, `eksik_ek_parca`
- `hazir_koli`, `hazir_kutu`, `hazir_izolasyon`, `hazir_ek_parca`
- `siparis_tarihi`, `tamamlanma_tarihi`

### Frontend Kontrolü
1. https://kkp-frontend.onrender.com/ aç
2. Kalite Kontrol -> Sipariş Hazırlığı
3. Yeni sipariş ekle butonuna tıkla
4. Modal'da yeni alanları kontrol et:
   - ✅ Eksik Malzeme Mevçudiyeti (6 input)
   - ✅ Hazır Malzeme (4 input)
   - ✅ Sipariş Tarihi
   - ✅ Tamamlanma Tarihi
5. Tabloda yeni kolonları kontrol et:
   - ✅ Sipariş Tarihi
   - ✅ Tamamlanma Tarihi
   - ✅ Eksik Malzeme
   - ✅ Hazır Malzeme
6. Arama kutusuna ürün kodu yaz (örn: "MXJ"), filtrelemeyi test et

## Modified Files

### Backend (3 dosya)
- `backend/routes/kaliteKontrol.js` - POST ve PUT endpoints güncellendi
- `backend/migrations/siparis-hazirlik-yeni-alanlar.sql` - Migration SQL
- `backend/migrations/README-siparis-hazirlik.md` - Bu dokümantasyon

### Frontend (2 dosya)
- `frontend/src/components/KaliteKontrol/SiparisHazirlikModal.jsx` - Form yeniden yapılandı
- `frontend/src/components/KaliteKontrol/SiparisHazirlik.jsx` - Tablo ve arama eklendi

## Notlar
- Eski `malzeme_*` boolean alanları veritabanında KORUNDU (veri kaybı yok)
- Eski kayıtlar için `siparis_tarihi` otomatik olarak `tarih` alanından kopyalandı
- Tamamlanmış siparişler için `tamamlanma_tarihi` otomatik olarak `son_guncelleme` tarihinden alındı
- Tüm değişiklikler `siparis_degisiklik_log` tablosuna kaydedilmeye devam eder
