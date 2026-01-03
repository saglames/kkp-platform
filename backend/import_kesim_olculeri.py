#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import pandas as pd
import psycopg2
from psycopg2.extras import execute_values
import os
from dotenv import load_dotenv

# .env dosyasını yükle
load_dotenv()

# Excel dosyası yolu
EXCEL_FILE = r'C:\Users\ESAT\Desktop\854.xlsx'

# Veritabanı bağlantısı
def get_db_connection():
    return psycopg2.connect(
        host=os.getenv('DB_HOST', 'localhost'),
        port=os.getenv('DB_PORT', '5432'),
        database=os.getenv('DB_NAME', 'kkp_platform'),
        user=os.getenv('DB_USER', 'postgres'),
        password=os.getenv('DB_PASSWORD', '')
    )

def import_kesim_olculeri():
    try:
        # Excel dosyasını oku
        print(f"Excel dosyası okunuyor: {EXCEL_FILE}")
        df = pd.read_excel(EXCEL_FILE)

        print(f"Toplam {len(df)} satır bulundu")
        print(f"Kolonlar: {df.columns.tolist()}")

        # Kolon isimlerini düzenle (Türkçe karakterler için)
        column_mapping = {
            'Model': 'model',
            'Alt Grup': 'alt_grup',
            'Parça': 'parca',
            'Dış Çap (mm)': 'dis_cap',
            'Et Kalınlığı (mm)': 'et_kalinligi',
            'Uzunluk (mm)': 'uzunluk',
            'Genişletme': 'genisletme',
            'Punch': 'punch',
            'Birim Ağırlık (g)': 'birim_agirlik'
        }

        df = df.rename(columns=column_mapping)

        # NaN değerlerini None'a çevir
        df = df.where(pd.notnull(df), None)

        # Veritabanına bağlan
        conn = get_db_connection()
        cursor = conn.cursor()

        # Önce tabloyu temizle (opsiyonel)
        print("\nMevcut verileri temizliyor...")
        cursor.execute("TRUNCATE TABLE kesim_olculeri RESTART IDENTITY CASCADE")

        # Verileri hazırla
        records = []
        for _, row in df.iterrows():
            records.append((
                row['model'],
                row['alt_grup'],
                row['parca'],
                row['dis_cap'],
                row['et_kalinligi'],
                row['uzunluk'],
                row['genisletme'],
                row['punch'],
                row['birim_agirlik']
            ))

        # Toplu insert
        print(f"\n{len(records)} kayıt veritabanına ekleniyor...")
        insert_query = """
            INSERT INTO kesim_olculeri (
                model, alt_grup, parca, dis_cap, et_kalinligi,
                uzunluk, genisletme, punch, birim_agirlik
            ) VALUES %s
        """

        execute_values(cursor, insert_query, records)

        # Değişiklikleri kaydet
        conn.commit()

        print(f"✅ Başarıyla {len(records)} kayıt eklendi!")

        # İstatistikleri göster
        cursor.execute("SELECT COUNT(*) FROM kesim_olculeri")
        total = cursor.fetchone()[0]

        cursor.execute("SELECT COUNT(DISTINCT model) FROM kesim_olculeri")
        models = cursor.fetchone()[0]

        print(f"\nİstatistikler:")
        print(f"- Toplam kayıt: {total}")
        print(f"- Benzersiz model sayısı: {models}")

        cursor.close()
        conn.close()

    except Exception as e:
        print(f"❌ Hata: {e}")
        if 'conn' in locals():
            conn.rollback()
            conn.close()

if __name__ == '__main__':
    import_kesim_olculeri()
