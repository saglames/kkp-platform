require('dotenv').config();
const { Pool } = require('pg');

// Render database'ini kullan
const pool = new Pool({
  connectionString: process.env.RENDER_DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Excel'den okunan izolasyon verileri
const izolasyonData = [
  { name: 'FOG-B335A (A)', cin_adi: '335L大', turk_adi: 'G35B', renk: 'GRİ', stock: 3425, kullanilan: [] },
  { name: 'FOG-B335A (B)', cin_adi: '102SN小', turk_adi: 'G35K', renk: 'GRİ', stock: 5126, kullanilan: ['FOG-B506A (B)'] },
  { name: 'FOG-B506A (B)', cin_adi: '102SN小', turk_adi: 'G35K', renk: 'GRİ', stock: 5126, kullanilan: ['FOG-B335A (B)'] },
  { name: 'FOG-B730A (B)', cin_adi: '10-2切', turk_adi: 'G73K', renk: 'GRİ', stock: 36, kullanilan: [] },
  { name: 'FOG-B1350 (A)', cin_adi: '680PJ大', turk_adi: 'G13B', renk: 'GRİ', stock: 50, kullanilan: [] },
  { name: 'FOG-B1350A (B)', cin_adi: '1350小', turk_adi: 'G13K', renk: 'GRİ', stock: 69, kullanilan: [] },
  { name: 'HZG20B (B)', cin_adi: '2--2', turk_adi: 'G20K', renk: 'GRİ', stock: 26, kullanilan: ['HZG30B (D)'] },
  { name: 'HZG30B (D)', cin_adi: '2--2', turk_adi: 'G20K', renk: 'GRİ', stock: 26, kullanilan: ['HZG20B (B)'] },
  { name: 'HZG20B (A)', cin_adi: '20B大', turk_adi: 'G20B', renk: 'GRİ', stock: 22, kullanilan: ['HZG30B (B)'] },
  { name: 'HZG30B (B)', cin_adi: '20B大', turk_adi: 'G20B', renk: 'GRİ', stock: 22, kullanilan: ['HZG20B (A)'] },
  { name: 'HZG30B (A)', cin_adi: '格力03', turk_adi: 'G30B', renk: 'GRİ', stock: 10, kullanilan: [] },
  { name: 'HZG30B (C)', cin_adi: '180-2', turk_adi: 'G01B', renk: 'GRİ', stock: 37, kullanilan: ['FQ-01B/A (A)'] },
  { name: 'FQ-01B/A (A)', cin_adi: '180-2', turk_adi: 'G01B', renk: 'GRİ', stock: 37, kullanilan: ['HZG30B (C)'] },
  { name: 'FQ01B/A-B', cin_adi: '180-1', turk_adi: 'G01K', renk: 'GRİ', stock: 126, kullanilan: [] },
  { name: 'KHRQ22M20T (A)', cin_adi: '10--1', turk_adi: '20TB', renk: 'GRİ', stock: 411, kullanilan: [] },
  { name: 'KHRQ22M20T (B)', cin_adi: '10--2', turk_adi: '20TK', renk: 'GRİ', stock: 444, kullanilan: [] },
  { name: 'MXJ-YA1509M/R1 (A)', cin_adi: '1509大', turk_adi: 'B15B', renk: 'MAVİ', stock: 7263, kullanilan: ['MXJ-YA1500M'] },
  { name: 'MXJ-YA1500M', cin_adi: '1509大', turk_adi: 'B15B', renk: 'MAVİ', stock: 7263, kullanilan: ['MXJ-YA1509M/R1 (A)'] },
  { name: 'MXJ-YA1509M/R1 (B)', cin_adi: '1509小', turk_adi: 'B15K', renk: 'MAVİ', stock: 6062, kullanilan: ['MXJ-YA2812M (B)', 'MXJ-YA2815M (B)', 'MXJ-YA3419M (B)'] },
  { name: 'MXJ-YA2812M (B)', cin_adi: '1509小', turk_adi: 'B15K', renk: 'MAVİ', stock: 6062, kullanilan: ['MXJ-YA1509M/R1 (B)', 'MXJ-YA2815M (B)', 'MXJ-YA3419M (B)'] },
  { name: 'MXJ-YA2815M (B)', cin_adi: '1509小', turk_adi: 'B15K', renk: 'MAVİ', stock: 6062, kullanilan: ['MXJ-YA1509M/R1 (B)', 'MXJ-YA2812M (B)', 'MXJ-YA3419M (B)'] },
  { name: 'MXJ-YA3419M (B)', cin_adi: '1509小', turk_adi: 'B15K', renk: 'MAVİ', stock: 6062, kullanilan: ['MXJ-YA1509M/R1 (B)', 'MXJ-YA2812M (B)', 'MXJ-YA2815M (B)'] },
  { name: 'MXJ-YA2812M (A)', cin_adi: '2812大', turk_adi: 'B28B', renk: 'MAVİ', stock: 2700, kullanilan: ['MXJ-YA2815M (A)'] },
  { name: 'MXJ-YA2815M (A)', cin_adi: '2812大', turk_adi: 'B28B', renk: 'MAVİ', stock: 2700, kullanilan: ['MXJ-YA2812M (A)'] },
  { name: 'MXJ-YA3419M (A)', cin_adi: '4119大', turk_adi: 'B41B', renk: 'MAVİ', stock: 800, kullanilan: ['MXJ-YA4119M (A)'] },
  { name: 'MXJ-YA4119M (A)', cin_adi: '4119大', turk_adi: 'B41B', renk: 'MAVİ', stock: 800, kullanilan: ['MXJ-YA3419M (A)'] },
  { name: 'MXJ-YA4119M (B)', cin_adi: '4119小', turk_adi: 'B41K', renk: 'MAVİ', stock: 300, kullanilan: [] },
  { name: 'FOG-B335A/Y (A)', cin_adi: '335大', turk_adi: 'Y35B', renk: 'YEŞİL', stock: 245, kullanilan: [] },
  { name: 'FOG-B335A/Y (B)', cin_adi: '335小', turk_adi: 'Y35K', renk: 'YEŞİL', stock: 418, kullanilan: [] },
  { name: 'MXJ-YA2512M/R3 (B)', cin_adi: '2512小', turk_adi: 'B25K', renk: 'MAVİ', stock: 4572, kullanilan: [] },
  { name: 'MXJ-YA2512M/R3 (A)', cin_adi: '2512 大', turk_adi: 'B25B', renk: 'MAVİ', stock: 4687, kullanilan: [] },
  { name: 'FOG-B506A/Y (A)', cin_adi: '506大', turk_adi: 'Y50B', renk: 'YEŞİL', stock: 1243, kullanilan: ['FOG-B730A/Y (A)'] },
  { name: 'FOG-B730A/Y (A)', cin_adi: '506大', turk_adi: 'Y50B', renk: 'YEŞİL', stock: 1243, kullanilan: ['FOG-B506A/Y (A)'] },
  { name: 'FOG-B506A/Y (B)', cin_adi: '180-1', turk_adi: 'Y50K', renk: 'YEŞİL', stock: 128, kullanilan: [] },
  { name: 'FOG-B506A (A)', cin_adi: '30-2切', turk_adi: 'G50B', renk: 'GRİ', stock: 1500, kullanilan: ['FOG-B730A (A)'] },
  { name: 'FOG-B730A (A)', cin_adi: '30-2切', turk_adi: 'G50B', renk: 'GRİ', stock: 1500, kullanilan: ['FOG-B506A (A)'] },
  { name: 'FOG-B730A/Y (B)', cin_adi: '0520-2', turk_adi: 'Y73B', renk: 'YEŞİL', stock: 5, kullanilan: [] },
  { name: 'CMY-Y102SS-TR (A)', cin_adi: '102-S-A', turk_adi: 'G102SB', renk: 'GRİ', stock: 2473, kullanilan: [] },
  { name: 'CMY-Y102SS-TR (B)', cin_adi: '102-S-B', turk_adi: 'G102SK', renk: 'GRİ', stock: 2517, kullanilan: [] },
  { name: 'CMY-102L-A (A)', cin_adi: '102-L-A', turk_adi: 'G102LB', renk: 'GRİ', stock: 3500, kullanilan: ['CMY-202S (A)'] },
  { name: 'CMY-202S (A)', cin_adi: '102-L-A', turk_adi: 'G102LB', renk: 'GRİ', stock: 3500, kullanilan: ['CMY-102L-A (A)'] },
  { name: 'CMY-102L-B', cin_adi: '102-L-B', turk_adi: 'G102LK', renk: 'GRİ', stock: 2000, kullanilan: [] },
  { name: 'CMY-202S (B)', cin_adi: 'T-1', turk_adi: 'G202SK', renk: 'GRİ', stock: 1500, kullanilan: [] }
];

async function updateIzolasyonData() {
  const client = await pool.connect();

  try {
    console.log('🔄 İzolasyon verileri güncelleniyor...\n');

    await client.query('BEGIN');

    // Önce kolonları ekle (varsa atlayacak)
    await client.query(`
      ALTER TABLE mamul_izolasyon
      ADD COLUMN IF NOT EXISTS cin_adi VARCHAR(100),
      ADD COLUMN IF NOT EXISTS turk_adi VARCHAR(50),
      ADD COLUMN IF NOT EXISTS renk VARCHAR(20)
    `);

    console.log('✓ Kolonlar eklendi (veya zaten mevcut)\n');

    let updatedCount = 0;
    let insertedCount = 0;

    for (const item of izolasyonData) {
      // Önce ürünün var olup olmadığını kontrol et
      const checkResult = await client.query(
        'SELECT id, stock FROM mamul_izolasyon WHERE name = $1',
        [item.name]
      );

      if (checkResult.rows.length > 0) {
        // Ürün varsa güncelle
        await client.query(`
          UPDATE mamul_izolasyon
          SET stock = $1,
              cin_adi = $2,
              turk_adi = $3,
              renk = $4,
              kullanilan_urunler = $5,
              updated_at = CURRENT_TIMESTAMP
          WHERE name = $6
        `, [item.stock, item.cin_adi, item.turk_adi, item.renk, item.kullanilan, item.name]);

        updatedCount++;
        const altInfo = item.kullanilan.length > 0 ? ` (Alternatif: ${item.kullanilan.join(', ')})` : '';
        console.log(`✓ Güncellendi: ${item.name.padEnd(25)} | ${item.cin_adi.padEnd(20)} | ${item.turk_adi.padEnd(8)} | ${item.renk.padEnd(6)} | Stok: ${item.stock}${altInfo}`);
      } else {
        // Ürün yoksa ekle
        await client.query(`
          INSERT INTO mamul_izolasyon (name, cin_adi, turk_adi, renk, stock, kullanilan_urunler, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        `, [item.name, item.cin_adi, item.turk_adi, item.renk, item.stock, item.kullanilan]);

        insertedCount++;
        const altInfo = item.kullanilan.length > 0 ? ` (Alternatif: ${item.kullanilan.join(', ')})` : '';
        console.log(`+ Eklendi: ${item.name.padEnd(25)} | ${item.cin_adi.padEnd(20)} | ${item.turk_adi.padEnd(8)} | ${item.renk.padEnd(6)} | Stok: ${item.stock}${altInfo}`);
      }
    }

    await client.query('COMMIT');

    console.log('\n' + '='.repeat(100));
    console.log('✅ GÜNCELLEME TAMAMLANDI!');
    console.log('='.repeat(100));
    console.log(`✓ Güncellenen ürün: ${updatedCount}`);
    console.log(`+ Eklenen ürün: ${insertedCount}`);
    console.log(`📊 Toplam işlem: ${updatedCount + insertedCount}`);
    console.log('\n💡 NOT: Bazı izolasyonlar birden fazla ürün kodunda kullanılabilir (Alternatif bilgisi verilmiştir).');

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ HATA:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

updateIzolasyonData().catch(console.error);
