const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const pool = require('../db');
const streamifier = require('streamifier');

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Multer memory storage (upload to memory first, then to Cloudinary)
const storage = multer.memoryStorage();

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

// Helper function to upload to Cloudinary
const uploadToCloudinary = (buffer, filename, kategoriId) => {
  return new Promise((resolve, reject) => {
    // Türkçe karakterleri değiştir
    const safeName = filename
      .replace(/ğ/g, 'g').replace(/Ğ/g, 'G')
      .replace(/ü/g, 'u').replace(/Ü/g, 'U')
      .replace(/ş/g, 's').replace(/Ş/g, 'S')
      .replace(/ı/g, 'i').replace(/İ/g, 'I')
      .replace(/ö/g, 'o').replace(/Ö/g, 'O')
      .replace(/ç/g, 'c').replace(/Ç/g, 'C')
      .replace(/\s+/g, '-')
      .replace('.pdf', '');

    const timestamp = Date.now();
    const publicId = `teknik-resimler/${kategoriId}/${timestamp}-${safeName}`;

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'raw',
        public_id: publicId,
        folder: `teknik-resimler/${kategoriId}`
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    );

    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
};

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

    // Upload to Cloudinary
    const cloudinaryResult = await uploadToCloudinary(
      req.file.buffer,
      req.file.originalname,
      kategori_id || 'genel'
    );

    const result = await pool.query(
      `INSERT INTO teknik_resimler_dosyalar
       (kategori_id, dosya_adi, dosya_yolu, dosya_boyutu, yukleyen)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        kategori_id,
        req.file.originalname,
        cloudinaryResult.secure_url, // Cloudinary URL
        cloudinaryResult.bytes,
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
    res.status(500).json({ error: 'Dosya yüklenemedi: ' + error.message });
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
    const cloudinaryUrl = file.dosya_yolu;

    // Redirect to Cloudinary URL
    res.redirect(cloudinaryUrl);
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

    // Cloudinary'den dosyayı sil
    // URL'den public_id'yi çıkar
    try {
      // URL format: https://res.cloudinary.com/{cloud_name}/raw/upload/v{version}/{public_id}.pdf
      const urlParts = file.dosya_yolu.split('/upload/');
      if (urlParts.length > 1) {
        const pathAfterUpload = urlParts[1].split('/').slice(1).join('/'); // Skip version number
        const publicId = pathAfterUpload.replace('.pdf', '');

        await cloudinary.uploader.destroy(publicId, { resource_type: 'raw' });
      }
    } catch (cloudinaryError) {
      console.error('Error deleting from Cloudinary:', cloudinaryError);
      // Cloudinary'den silinmese bile DB'den sil
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
