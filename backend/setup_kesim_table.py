#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import psycopg2
import os
from dotenv import load_dotenv

# .env dosyasını yükle
load_dotenv()

def create_table():
    try:
        # Veritabanına bağlan
        conn = psycopg2.connect(
            host=os.getenv('DB_HOST', 'localhost'),
            port=os.getenv('DB_PORT', '5432'),
            database=os.getenv('DB_NAME', 'kkp_platform'),
            user=os.getenv('DB_USER', 'postgres'),
            password=os.getenv('DB_PASSWORD', '')
        )

        cursor = conn.cursor()

        # Tablo oluştur
        print("Kesim ölçüleri tablosu oluşturuluyor...")

        cursor.execute("""
            CREATE TABLE IF NOT EXISTS kesim_olculeri (
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

        # Index'ler
        cursor.execute("""
            CREATE INDEX IF NOT EXISTS idx_kesim_olculeri_model
            ON kesim_olculeri(model)
        """)

        cursor.execute("""
            CREATE INDEX IF NOT EXISTS idx_kesim_olculeri_alt_grup
            ON kesim_olculeri(alt_grup)
        """)

        # Trigger function
        cursor.execute("""
            CREATE OR REPLACE FUNCTION update_kesim_olculeri_timestamp()
            RETURNS TRIGGER AS $$
            BEGIN
                NEW.updated_at = CURRENT_TIMESTAMP;
                RETURN NEW;
            END;
            $$ LANGUAGE plpgsql
        """)

        # Trigger
        cursor.execute("""
            DROP TRIGGER IF EXISTS kesim_olculeri_updated_at ON kesim_olculeri
        """)

        cursor.execute("""
            CREATE TRIGGER kesim_olculeri_updated_at
                BEFORE UPDATE ON kesim_olculeri
                FOR EACH ROW
                EXECUTE FUNCTION update_kesim_olculeri_timestamp()
        """)

        conn.commit()
        print("✅ Tablo başarıyla oluşturuldu!")

        cursor.close()
        conn.close()

    except Exception as e:
        print(f"❌ Hata: {e}")
        if 'conn' in locals():
            conn.rollback()
            conn.close()

if __name__ == '__main__':
    create_table()
