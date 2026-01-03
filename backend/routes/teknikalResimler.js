const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const pool = require('../db');

// Uploads klasörünü oluştur
const uploadsDir = path.join(__dirname, '../uploads/teknik-resimler');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer configuration for PDF uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const kategoriId = req.body.kategori_id || 'genel';
    const categoryDir = path.join(uploadsDir, kategoriId.toString());

    if (!fs.existsSync(categoryDir)) {
      fs.mkdirSync(categoryDir, { recursive: true });
    }

    cb(null, categoryDir);
  },
  filename: function (req, file, cb) {
    // Türkçe karakterleri değiştir
    const safeName = file.originalname
      .replace(/ğ/g, 'g').replace(/Ğ/g, 'G')
      .replace(/ü/g, 'u').replace(/Ü/g, 'U')
      .replace(/ş/g, 's').replace(/Ş/g, 'S')
      .replace(/ı/g, 'i').replace(/İ/g, 'I')
      .replace(/ö/g, 'o').replace(/Ö/g, 'O')
      .replace(/ç/g, 'c').replace(/Ç/g, 'C');

    const timestamp = Date.now();
    cb(null, `${timestamp}-${safeName}`);
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Sadece PDF dosyaları yüklenebilir!'), false);
    }
  },
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  }
});

// Login endpoint
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const ipAddress = req.ip || req.connection.remoteAddress;

  try {
    // Sabit kullanıcı adı ve şifre kontrolü
    const isValid = username === 'esatakg' && password === 'esatakgsistemi';

    // Login logunu kaydet
    await pool.query(
      'INSERT INTO teknik_resimler_login_log (kullanici_adi, basarili, ip_adresi) VALUES ($1, $2, $3)',
      [username, isValid, ipAddress]
    );

    if (isValid) {
      res.json({
        success: true,
        message: 'Giriş başarılı',
        user: { username: 'esatakg' }
      });
    } else {
      res.status(401).json({
        success: false,
        message: 'Kullanıcı adı veya şifre hatalı!'
      });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Kategorileri getir
router.get('/kategoriler', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM teknik_resimler_kategoriler ORDER BY kategori_adi'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Kategoriler alınamadı' });
  }
});

// Kategoriye göre dosyaları getir
router.get('/dosyalar/:kategoriId', async (req, res) => {
  try {
    const { kategoriId } = req.params;
    const result = await pool.query(
      `SELECT d.*, k.kategori_adi
       FROM teknik_resimler_dosyalar d
       JOIN teknik_resimler_kategoriler k ON d.kategori_id = k.id
       WHERE d.kategori_id = $1
       ORDER BY d.created_at DESC`,
      [kategoriId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching files:', error);
    res.status(500).json({ error: 'Dosyalar alınamadı' });
  }
});

// Tüm dosyaları getir
router.get('/dosyalar', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT d.*, k.kategori_adi
       FROM teknik_resimler_dosyalar d
       JOIN teknik_resimler_kategoriler k ON d.kategori_id = k.id
       ORDER BY d.created_at DESC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching all files:', error);
    res.status(500).json({ error: 'Dosyalar alınamadı' });
  }
});

// PDF dosyası yükle
router.post('/upload', upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Dosya seçilmedi' });
    }

    const { kategori_id } = req.body;
    const yukleyen = req.body.yukleyen || 'esatakg';

    const result = await pool.query(
      `INSERT INTO teknik_resimler_dosyalar
       (kategori_id, dosya_adi, dosya_yolu, dosya_boyutu, yukleyen)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        kategori_id,
        req.file.originalname,
        req.file.path,
        req.file.size,
        yukleyen
      ]
    );

    res.json({
      success: true,
      message: 'Dosya başarıyla yüklendi',
      file: result.rows[0]
    });
  } catch (error) {
    console.error('Upload error:', error);
    // Hata durumunda dosyayı sil
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ error: 'Dosya yüklenemedi' });
  }
});

// PDF dosyasını görüntüle/indir
router.get('/view/:fileId', async (req, res) => {
  try {
    const { fileId } = req.params;

    const result = await pool.query(
      'SELECT * FROM teknik_resimler_dosyalar WHERE id = $1',
      [fileId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Dosya bulunamadı' });
    }

    const file = result.rows[0];
    const filePath = file.dosya_yolu;

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Dosya sistemde bulunamadı' });
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${file.dosya_adi}"`);

    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  } catch (error) {
    console.error('View file error:', error);
    res.status(500).json({ error: 'Dosya açılamadı' });
  }
});

// Dosya sil
router.delete('/dosyalar/:fileId', async (req, res) => {
  try {
    const { fileId } = req.params;

    // Önce dosya bilgisini al
    const result = await pool.query(
      'SELECT * FROM teknik_resimler_dosyalar WHERE id = $1',
      [fileId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Dosya bulunamadı' });
    }

    const file = result.rows[0];

    // Fiziksel dosyayı sil
    if (fs.existsSync(file.dosya_yolu)) {
      fs.unlinkSync(file.dosya_yolu);
    }

    // Veritabanından sil
    await pool.query('DELETE FROM teknik_resimler_dosyalar WHERE id = $1', [fileId]);

    res.json({ success: true, message: 'Dosya silindi' });
  } catch (error) {
    console.error('Delete file error:', error);
    res.status(500).json({ error: 'Dosya silinemedi' });
  }
});

module.exports = router;
