-- K.K.P. Platform - Actual Local Database Schema
-- Exported: 2026-01-03T17:33:25.786Z

CREATE TABLE gorev_notlar (id integer DEFAULT nextval('gorev_notlar_id_seq'::regclass) NOT NULL, gorev_id integer, ekleyen character varying(100), metin text NOT NULL, tarih timestamp without time zone DEFAULT CURRENT_TIMESTAMP);

CREATE TABLE gorevler (id integer DEFAULT nextval('gorevler_id_seq'::regclass) NOT NULL, baslik character varying(255) NOT NULL, aciklama text, aciliyet character varying(20) DEFAULT 'normal'::character varying, atanan character varying(100), tamamlandi boolean DEFAULT false, sira integer, olusturma_tarihi timestamp without time zone DEFAULT CURRENT_TIMESTAMP, updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP, baslama_tarihi date, bitis_tarihi date);

CREATE TABLE hatali_urunler (id integer DEFAULT nextval('hatali_urunler_id_seq'::regclass) NOT NULL, parti_no character varying(100) NOT NULL, urun_kodu character varying(100) NOT NULL, temizleme_problemi integer DEFAULT 0, vuruk_problem integer DEFAULT 0, capagi_alinmayan integer DEFAULT 0, polisaj integer DEFAULT 0, kaynak_az integer DEFAULT 0, kaynak_akintisi integer DEFAULT 0, ici_capakli integer DEFAULT 0, pim_girmeyen integer DEFAULT 0, boncuklu integer DEFAULT 0, yamuk integer DEFAULT 0, gramaji_dusuk integer DEFAULT 0, hurda integer DEFAULT 0, guncelleme_tarihi timestamp without time zone DEFAULT CURRENT_TIMESTAMP);

CREATE TABLE hatali_urunler_log (id integer DEFAULT nextval('hatali_urunler_log_id_seq'::regclass) NOT NULL, parti_no character varying(100) NOT NULL, kayit_tarihi timestamp without time zone DEFAULT CURRENT_TIMESTAMP, kayit_yapan character varying(100), veriler jsonb NOT NULL, toplam_hata integer DEFAULT 0, notlar text);

CREATE TABLE is_emirleri (id integer DEFAULT nextval('is_emirleri_id_seq'::regclass) NOT NULL, is_emri_no character varying(100) NOT NULL, model character varying(100) NOT NULL, alt_grup character varying(10), sablon_tipi character varying(50), malzeme_adi character varying(200), malzeme_kodu character varying(50), siparis_adeti integer, uretim_adeti integer, tarih date, durum character varying(50) DEFAULT 'BEKLEMEDE'::character varying, operasyonlar jsonb, notlar text, olusturan character varying(100), created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP, updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP);

CREATE TABLE is_emri_operasyon_takip (id integer DEFAULT nextval('is_emri_operasyon_takip_id_seq'::regclass) NOT NULL, is_emri_id integer, operasyon_sira integer, operasyon_adi character varying(200), makine_no character varying(100), baslangic_zamani timestamp without time zone, bitis_zamani timestamp without time zone, baslangic_kg numeric, iskarta_adet integer, kasa_numarasi character varying(100), operator character varying(100), durum character varying(50) DEFAULT 'BEKLEMEDE'::character varying, notlar text, created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP);

CREATE TABLE is_emri_sablonlari (id integer DEFAULT nextval('is_emri_sablonlari_id_seq'::regclass) NOT NULL, model character varying(100) NOT NULL, alt_grup character varying(10) NOT NULL, sablon_tipi character varying(50), is_emri_no_prefix character varying(50), malzeme_adi character varying(200), malzeme_kodu character varying(50), operasyonlar jsonb, created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP, updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP);

CREATE TABLE kesim_olculeri (id integer DEFAULT nextval('kesim_olculeri_id_seq'::regclass) NOT NULL, model character varying(100) NOT NULL, alt_grup character varying(50), parca character varying(50), dis_cap numeric, et_kalinligi numeric, uzunluk integer, genisletme numeric, punch character varying(100), birim_agirlik numeric, created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP, updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP);

CREATE TABLE mamul_history (id integer DEFAULT nextval('mamul_history_id_seq'::regclass) NOT NULL, category category_type NOT NULL, item_name character varying(255) NOT NULL, action character varying(50) NOT NULL, amount integer NOT NULL, reason text NOT NULL, old_stock integer, new_stock integer, created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP);

CREATE TABLE mamul_izolasyon (id integer DEFAULT nextval('mamul_izolasyon_id_seq'::regclass) NOT NULL, name character varying(255) NOT NULL, kullanilan_urunler _text[], stock integer DEFAULT 0, created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP, updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP);

CREATE TABLE mamul_koli (id integer DEFAULT nextval('mamul_koli_id_seq'::regclass) NOT NULL, name character varying(255) NOT NULL, dimensions character varying(100), icine_giren_urunler text, stock integer DEFAULT 0, created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP, updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP);

CREATE TABLE mamul_kutu (id integer DEFAULT nextval('mamul_kutu_id_seq'::regclass) NOT NULL, name character varying(255) NOT NULL, dimensions character varying(100), icine_giren_urun text, stock integer DEFAULT 0, created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP, updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP);

CREATE TABLE mamul_tapa (id integer DEFAULT nextval('mamul_tapa_id_seq'::regclass) NOT NULL, name character varying(255) NOT NULL, stock integer DEFAULT 0, created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP, updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP);

CREATE TABLE recete_malzemeler (id integer DEFAULT nextval('recete_malzemeler_id_seq'::regclass) NOT NULL, urun_id integer, malzeme_tipi character varying(50) NOT NULL, malzeme_kodu character varying(100) NOT NULL, malzeme_adi character varying(255), adet integer DEFAULT 1 NOT NULL, birim character varying(20) DEFAULT 'adet'::character varying, kategori character varying(50), notlar text, olusturma_tarihi timestamp without time zone DEFAULT CURRENT_TIMESTAMP);

CREATE TABLE simulasyon_stok (id integer DEFAULT nextval('simulasyon_stok_id_seq'::regclass) NOT NULL, malzeme_turu category_type NOT NULL, urun_adi character varying(255) NOT NULL, olculeri character varying(255), mevcut_adet integer DEFAULT 0, ekleyen character varying(100), son_guncelleme timestamp without time zone DEFAULT CURRENT_TIMESTAMP);

CREATE TABLE simulasyon_stok_hareket_log (id integer DEFAULT nextval('simulasyon_stok_hareket_log_id_seq'::regclass) NOT NULL, stok_id integer, islem_turu character varying(20) NOT NULL, miktar integer NOT NULL, onceki_stok integer NOT NULL, yeni_stok integer NOT NULL, yapan character varying(100) NOT NULL, sebep text, tarih timestamp without time zone DEFAULT CURRENT_TIMESTAMP);

CREATE TABLE siparis_degisiklik_log (id integer DEFAULT nextval('siparis_degisiklik_log_id_seq'::regclass) NOT NULL, siparis_id integer, degistiren character varying(100), degisiklik_turu character varying(50) NOT NULL, eski_deger text, yeni_deger text, aciklama text, tarih timestamp without time zone DEFAULT CURRENT_TIMESTAMP);

CREATE TABLE siparis_gonderimler (id integer DEFAULT nextval('siparis_gonderimler_id_seq'::regclass) NOT NULL, siparis_id integer, gonderen character varying(100) NOT NULL, gonderilen_adet integer NOT NULL, gonderim_tarihi timestamp without time zone DEFAULT CURRENT_TIMESTAMP, notlar text);

CREATE TABLE siparis_hazirlik (id integer DEFAULT nextval('siparis_hazirlik_id_seq'::regclass) NOT NULL, tarih date NOT NULL, operator character varying(100) NOT NULL, siparis_no character varying(100) NOT NULL, urun_kodu character varying(255) NOT NULL, siparis_adet integer NOT NULL, gonderilen_adet integer DEFAULT 0, durum character varying(50) DEFAULT 'beklemede'::character varying, malzeme_koli boolean DEFAULT false, malzeme_kutu boolean DEFAULT false, malzeme_izolasyon boolean DEFAULT false, malzeme_tapa boolean DEFAULT false, malzeme_poset boolean DEFAULT false, notlar text, olusturma_tarihi timestamp without time zone DEFAULT CURRENT_TIMESTAMP, son_guncelleme timestamp without time zone DEFAULT CURRENT_TIMESTAMP);

CREATE TABLE siparis_hesaplama_kayitlari (id integer DEFAULT nextval('siparis_hesaplama_kayitlari_id_seq'::regclass) NOT NULL, urun_kodu character varying(100) NOT NULL, siparis_adet integer NOT NULL, hesaplayan character varying(100) NOT NULL, hesaplama_tarihi timestamp without time zone DEFAULT CURRENT_TIMESTAMP, hesaplama_sonucu jsonb NOT NULL, stok_dusumleri_yapildi boolean DEFAULT false, stok_dusum_tarihi timestamp without time zone, stok_dusumleri_yapan character varying(100), eslestirme_sonuclari jsonb, notlar text);

CREATE TABLE surec_hareket_log (id integer DEFAULT nextval('surec_hareket_log_id_seq'::regclass) NOT NULL, urun_id integer, islem_tipi character varying(50) NOT NULL, kaynak character varying(50), hedef character varying(50), adet integer NOT NULL, kg numeric, yapan character varying(100), notlar text, created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP);

CREATE TABLE surec_kalan (id integer DEFAULT nextval('surec_kalan_id_seq'::regclass) NOT NULL, urun_id integer, adet integer DEFAULT 0, notlar text, tapali_bekleyen_notlar text, updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP, updated_by character varying(100));

CREATE TABLE surec_sevk_edilen (id integer DEFAULT nextval('surec_sevk_edilen_id_seq'::regclass) NOT NULL, tip character varying(50) DEFAULT 'Joint'::character varying, urun_kodu_base character varying(255) NOT NULL, tarih date NOT NULL, adet integer NOT NULL, gonderildigi_yer character varying(255), irsaliye_numarasi character varying(100), notlar text, created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP, created_by character varying(100));

CREATE TABLE surec_sevke_hazir (id integer DEFAULT nextval('surec_sevke_hazir_id_seq'::regclass) NOT NULL, urun_kodu_base character varying(255) NOT NULL, adet integer DEFAULT 0, koli_sayisi integer DEFAULT 0, updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP, updated_by character varying(100));

CREATE TABLE surec_temizlemede_olan (id integer DEFAULT nextval('surec_temizlemede_olan_id_seq'::regclass) NOT NULL, urun_id integer, adet integer DEFAULT 0, updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP, updated_by character varying(100));

CREATE TABLE surec_temizlemeden_gelen (id integer DEFAULT nextval('surec_temizlemeden_gelen_id_seq'::regclass) NOT NULL, urun_id integer, kg numeric DEFAULT 0, adet integer DEFAULT 0, updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP, updated_by character varying(100));

CREATE TABLE surec_temizlemeye_gidecek (id integer DEFAULT nextval('surec_temizlemeye_gidecek_id_seq'::regclass) NOT NULL, urun_id integer, adet integer DEFAULT 0, updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP, updated_by character varying(100));

CREATE TABLE surec_urunler (id integer DEFAULT nextval('surec_urunler_id_seq'::regclass) NOT NULL, tip character varying(10) NOT NULL, urun_kodu character varying(255) NOT NULL, urun_kodu_base character varying(255) NOT NULL, aktif boolean DEFAULT true, created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP);

CREATE TABLE teknik_resimler_dosyalar (id integer DEFAULT nextval('teknik_resimler_dosyalar_id_seq'::regclass) NOT NULL, kategori_id integer, dosya_adi character varying(255) NOT NULL, dosya_yolu character varying(500) NOT NULL, dosya_boyutu integer, yukleyen character varying(100), created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP);

CREATE TABLE teknik_resimler_kategoriler (id integer DEFAULT nextval('teknik_resimler_kategoriler_id_seq'::regclass) NOT NULL, kategori_adi character varying(100) NOT NULL, created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP);

CREATE TABLE teknik_resimler_login_log (id integer DEFAULT nextval('teknik_resimler_login_log_id_seq'::regclass) NOT NULL, kullanici_adi character varying(100), basarili boolean, ip_adresi character varying(50), created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP);

CREATE TABLE urun_agirliklari_fittinglar (id integer DEFAULT nextval('urun_agirliklari_fittinglar_id_seq'::regclass) NOT NULL, tip character varying(50) NOT NULL, boyut character varying(50) NOT NULL, agirlik numeric NOT NULL, created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP, updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP);

CREATE TABLE urun_agirliklari_hesaplamalar (id integer DEFAULT nextval('urun_agirliklari_hesaplamalar_id_seq'::regclass) NOT NULL, hesaplama_tipi character varying(50) NOT NULL, urun_kodu character varying(100), kalite character varying(10), adet integer NOT NULL, birim_agirlik numeric NOT NULL, toplam_agirlik numeric NOT NULL, batch_id character varying(50), batch_detay text, yapan character varying(100), created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP);

CREATE TABLE urun_agirliklari_master (id integer DEFAULT nextval('urun_agirliklari_master_id_seq'::regclass) NOT NULL, urun_kodu character varying(50) NOT NULL, agirlik_a numeric NOT NULL, agirlik_b numeric NOT NULL, agirlik_c numeric NOT NULL, agirlik_d numeric NOT NULL, created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP, updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP);

CREATE TABLE urun_recetesi (id integer DEFAULT nextval('urun_recetesi_id_seq'::regclass) NOT NULL, urun_kodu character varying(100) NOT NULL, urun_adi character varying(255) NOT NULL, aciklama text, koli_tipi character varying(50), koli_kapasitesi integer DEFAULT 1, olusturma_tarihi timestamp without time zone DEFAULT CURRENT_TIMESTAMP, guncelleme_tarihi timestamp without time zone DEFAULT CURRENT_TIMESTAMP, kutu_tipi character varying(50));

CREATE TABLE urun_siparis_degisiklik_log (id integer DEFAULT nextval('urun_siparis_degisiklik_log_id_seq'::regclass) NOT NULL, siparis_id integer, degistiren character varying(100), degisiklik_turu character varying(50) NOT NULL, eski_deger text, yeni_deger text, aciklama text, tarih timestamp without time zone DEFAULT CURRENT_TIMESTAMP);

CREATE TABLE urun_siparisler (id integer DEFAULT nextval('urun_siparisler_id_seq'::regclass) NOT NULL, urun_adi character varying(255) NOT NULL, adet_miktar character varying(100), olcu character varying(100), talep_eden character varying(100), aciklama text, durum character varying(50) DEFAULT 'bekleniyor'::character varying, gelen_adet character varying(100), gelen_notlar text, olusturma_tarihi timestamp without time zone DEFAULT CURRENT_TIMESTAMP, gelis_tarihi timestamp without time zone);

CREATE TABLE urun_tanimlari (id integer DEFAULT nextval('urun_tanimlari_id_seq'::regclass) NOT NULL, urun_kodu character varying(255) NOT NULL, urun_adi character varying(255) NOT NULL, kategori character varying(50), kutu_kodu character varying(50), koli_kodu character varying(50), izolasyon_kodu character varying(255), tapa_boyutu character varying(50), izolasyonsuz boolean DEFAULT false, aciklama text, created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP);

CREATE TABLE users (id integer DEFAULT nextval('users_id_seq'::regclass) NOT NULL, name character varying(100) NOT NULL, created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP);

