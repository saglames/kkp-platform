const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
const allowedOrigins = [
  'http://localhost:3000',
  'https://kkp-frontend.onrender.com',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: function(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS policy violation'));
    }
  },
  credentials: true
}));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

// Routes
const mamulStokRoutes = require('./routes/mamulStok');
const kaliteKontrolRoutes = require('./routes/kaliteKontrol');
const simulasyonStokRoutes = require('./routes/simulasyonStok');
const veriAktarmaRoutes = require('./routes/veriAktarma');
const urunRecetesiRoutes = require('./routes/urunRecetesi');
const hataliUrunlerRoutes = require('./routes/hataliUrunler');
const tumSurecRoutes = require('./routes/tumSurec');
const urunAgirliklariRoutes = require('./routes/urunAgirliklari');
const teknikResimlerRoutes = require('./routes/teknikalResimler');
const kesimOlculeriRoutes = require('./routes/kesimOlculeri');

app.use('/api/mamul-stok', mamulStokRoutes);
app.use('/api/kalite-kontrol', kaliteKontrolRoutes);
app.use('/api/simulasyon-stok', simulasyonStokRoutes);
app.use('/api/veri-aktarma', veriAktarmaRoutes);
app.use('/api/urun-recetesi', urunRecetesiRoutes);
app.use('/api/hatali-urunler', hataliUrunlerRoutes);
app.use('/api/tum-surec', tumSurecRoutes);
app.use('/api/urun-agirliklari', urunAgirliklariRoutes);
app.use('/api/teknik-resimler', teknikResimlerRoutes);
app.use('/api/kesim-olculeri', kesimOlculeriRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'K.K.P. Platform API çalışıyor' });
});

// Database test endpoint
app.get('/api/test-db', async (req, res) => {
  const pool = require('./db');
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({
      success: true,
      message: 'Database connection works!',
      time: result.rows[0].now
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Database setup endpoint (one-time use for deployment)
app.post('/api/setup-database', async (req, res) => {
  const pool = require('./db');
  const fs = require('fs').promises;
  const path = require('path');

  try {
    // Read SQL file
    const sqlFile = path.join(__dirname, 'database.sql');
    console.log('Reading SQL file from:', sqlFile);

    const sql = await fs.readFile(sqlFile, 'utf8');
    console.log('SQL file size:', sql.length, 'bytes');

    // Remove all comment lines first
    const lines = sql.split('\n');
    const sqlWithoutComments = lines
      .filter(line => !line.trim().startsWith('--'))
      .join('\n');

    // Smart split: handle dollar-quoted strings ($$)
    const statements = [];
    let currentStatement = '';
    let inDollarQuote = false;

    for (let i = 0; i < sqlWithoutComments.length; i++) {
      const char = sqlWithoutComments[i];
      const nextChar = sqlWithoutComments[i + 1];

      // Check for $$ delimiter
      if (char === '$' && nextChar === '$') {
        inDollarQuote = !inDollarQuote;
        currentStatement += '$$';
        i++; // skip next $
        continue;
      }

      // If we hit a semicolon and not inside $$, end statement
      if (char === ';' && !inDollarQuote) {
        currentStatement = currentStatement.trim();
        if (currentStatement &&
            !currentStatement.toUpperCase().includes('CREATE DATABASE')) {
          statements.push(currentStatement);
        }
        currentStatement = '';
      } else {
        currentStatement += char;
      }
    }

    // Add last statement if exists
    if (currentStatement.trim() &&
        !currentStatement.toUpperCase().includes('CREATE DATABASE')) {
      statements.push(currentStatement.trim());
    }

    console.log('Found', statements.length, 'SQL statements');

    // Execute each statement separately
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement) {
        console.log(`Executing statement ${i + 1}/${statements.length}`);
        console.log('Statement preview:', statement.substring(0, 100) + '...');
        await pool.query(statement);
      }
    }

    res.json({
      success: true,
      message: `Database setup complete! Executed ${statements.length} statements.`
    });
  } catch (error) {
    console.error('Database setup error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      error: error.message,
      details: error.stack
    });
  }
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint bulunamadı' });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error('Hata:', err);
  res.status(500).json({ error: 'Sunucu hatası', message: err.message });
});

app.listen(PORT, () => {
  console.log(`🚀 K.K.P. Platform Backend ${PORT} portunda çalışıyor`);
  console.log(`📊 API URL: http://localhost:${PORT}/api`);
});
