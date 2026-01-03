#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import pandas as pd
import psycopg2
from psycopg2.extras import execute_values

# Excel dosyası yolu
EXCEL_FILE = r'C:\Users\ESAT\Desktop\854.xlsx'

# Veritabanı bağlantı bilgileri
DB_CONFIG = {
    'host': 'localhost',
    'port': '5432',
    'database': 'kkp_db',
    'user': 'postgres',
    'password': 'postgres'
}

def main():
    try:
        print("Veritabanına bağlanıyor...")
        conn = psycopg2.connect(**DB_CONFIG)
        cursor = conn.cursor()

        # Tablo oluştur (önce varsa sil)
        print("\nKesim olculeri tablosu olusturuluyor...")
        cursor.execute("DROP TABLE IF EXISTS kesim_olculeri CASCADE")

        cursor.execute("""
            CREATE TABLE kesim_olculeri (
                id SERIAL PRIMARY KEY,
                model VARCHAR(100) NOT NULL,
                alt_grup VARCHAR(50),
                parca VARCHAR(50),
                dis_cap DECIMAL(10,2),
                et_kalinligi DECIMAL(10,2),
                uzunluk INTEGER,
                genisletme DECIMAL(10,2),
                punch VARCHAR(100),
                birim_agirlik DECIMAL(10,2),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)

        cursor.execute("""
            CREATE INDEX IF NOT EXISTS idx_kesim_olculeri_model
            ON kesim_olculeri(model)
        """)

        cursor.execute("""
            CREATE INDEX IF NOT EXISTS idx_kesim_olculeri_alt_grup
            ON kesim_olculeri(alt_grup)
        """)

        conn.commit()
        print("[OK] Tablo olusturuldu!")

        # Excel dosyasını oku
        print(f"\nExcel dosyası okunuyor: {EXCEL_FILE}")
        df = pd.read_excel(EXCEL_FILE)

        print(f"Toplam {len(df)} satır bulundu")

        # Kolon isimlerini düzenle
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
        df = df.where(pd.notnull(df), None)

        # Artık temizlemeye gerek yok, tablo yeni oluşturuldu

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
        conn.commit()

        print(f"[OK] Basariyla {len(records)} kayit eklendi!")

        # İstatistikler
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
        print(f"[HATA] {e}")
        import traceback
        traceback.print_exc()
        if 'conn' in locals():
            conn.rollback()
            conn.close()

if __name__ == '__main__':
    main()
