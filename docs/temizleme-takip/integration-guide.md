# Integration Guide - Temizleme Takip System

**Version:** 1.0
**Last Updated:** 2026-01-04

## Table of Contents

1. [Overview](#overview)
2. [Integration with Tüm Süreç](#integration-with-tüm-süreç)
3. [Data Synchronization](#data-synchronization)
4. [State Management](#state-management)
5. [API Integration](#api-integration)
6. [Frontend Integration](#frontend-integration)
7. [Cross-System Workflows](#cross-system-workflows)
8. [Error Handling](#error-handling)

## Overview

The Temizleme Takip system is deeply integrated with the **Tüm Süreç** (Complete Workflow) system, which manages the entire product lifecycle from manufacturing to shipping. This integration ensures:

- Automatic inventory updates
- Seamless state transitions
- Comprehensive tracking
- Data consistency across systems

### Integration Architecture

```
┌──────────────────────────────────────────────────────┐
│              Tüm Süreç Workflow System               │
│  ┌────────────────────────────────────────────────┐  │
│  │  Temizlemeye → Temizlemede → Temizlemeden →    │  │
│  │   Gidecek        Olan          Gelen          │  │
│  │                                      ↓         │  │
│  │                               Sevke Hazır      │  │
│  └────────────────────────────────────────────────┘  │
└──────────────────┬───────────────────────────────────┘
                   │
                   │ Integration Points
                   ↓
┌──────────────────────────────────────────────────────┐
│           Temizleme Takip System                     │
│  ┌────────────────────────────────────────────────┐  │
│  │  Parti      → Parti      → Kalite             │  │
│  │  Oluştur      Dönüşü       Kontrol            │  │
│  └────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────┘
```

## Integration with Tüm Süreç

### Shared Database Tables

The two systems share these tables:

| Table Name | Purpose | Owner |
|------------|---------|-------|
| **surec_urunler** | Product master data | Tüm Süreç |
| **surec_temizlemeye_gidecek** | Products ready to be sent | Tüm Süreç |
| **surec_temizlemede_olan** | Products currently cleaning | **Shared** |
| **surec_temizlemeden_gelen** | Products returned from cleaning | **Shared** |
| **surec_sevke_hazir** | Products ready for shipping | Tüm Süreç |
| **surec_hareket_log** | Movement history | **Shared** |
| **hatali_urunler** | Defective products | **Shared** |

### Table Structure: surec_urunler

Product master table:

```sql
CREATE TABLE surec_urunler (
  id integer PRIMARY KEY,
  tip varchar(10) NOT NULL,              -- Product type (A/B)
  urun_kodu varchar(255) NOT NULL,       -- Full product code
  urun_kodu_base varchar(255) NOT NULL,  -- Base code (without A/B)
  birim_agirlik numeric,                 -- Unit weight (grams)
  aktif boolean DEFAULT true,
  created_at timestamp DEFAULT CURRENT_TIMESTAMP
);
```

**Example Data:**
```sql
id | tip | urun_kodu    | urun_kodu_base | birim_agirlik
1  | A   | JOINT-45 (A) | JOINT-45       | 300
2  | B   | JOINT-45 (B) | JOINT-45       | 300
3  | A   | JOINT-50 (A) | JOINT-50       | 320
```

### Table Structure: surec_temizlemede_olan

Tracks products currently in cleaning:

```sql
CREATE TABLE surec_temizlemede_olan (
  id integer PRIMARY KEY,
  urun_id integer REFERENCES surec_urunler(id),
  adet integer DEFAULT 0,
  gidis_kg numeric(10,2),              -- Added by Temizleme Takip
  parti_id integer,                    -- Added by Temizleme Takip
  updated_by varchar(100),
  updated_at timestamp DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(urun_id)
);
```

**Key Points:**
- One record per product (UNIQUE constraint)
- Cumulative counts (can have multiple batches)
- Updated when batch is created

### Table Structure: surec_temizlemeden_gelen

Tracks products returned from cleaning:

```sql
CREATE TABLE surec_temizlemeden_gelen (
  id integer PRIMARY KEY,
  urun_id integer REFERENCES surec_urunler(id),
  adet integer DEFAULT 0,
  kg numeric DEFAULT 0,
  parti_id integer,                               -- Added by Temizleme Takip
  kalite_kontrol_durum varchar(50) DEFAULT 'beklemede',  -- Added by Temizleme Takip
  updated_by varchar(100),
  updated_at timestamp DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(urun_id)
);
```

**Quality Control Statuses:**
- `beklemede` - Awaiting QC
- `kabul` - Accepted
- `red` - Rejected

### Table Structure: surec_hareket_log

Movement history log:

```sql
CREATE TABLE surec_hareket_log (
  id integer PRIMARY KEY,
  urun_id integer,
  parti_id integer,                    -- Added by Temizleme Takip
  parti_no varchar(100),               -- Added by Temizleme Takip
  islem_tipi varchar(50) NOT NULL,
  kaynak varchar(50),                  -- Source state
  hedef varchar(50),                   -- Target state
  adet integer NOT NULL,
  kg numeric,
  gidis_kg numeric(10,2),              -- Added by Temizleme Takip
  donus_kg numeric(10,2),              -- Added by Temizleme Takip
  yapan varchar(100),
  notlar text,
  created_at timestamp DEFAULT CURRENT_TIMESTAMP
);
```

**Log Entry Types (islem_tipi):**
- `parti_gonderildi` - Batch sent for cleaning
- `parti_gonderildi_manuel` - Manual batch sent
- `parti_donus` - Batch returned
- `kalite_kontrol` - Quality control performed

## Data Synchronization

### 1. Batch Creation Flow

When a batch is created:

```javascript
async function partiOlustur(partiData, urunler, kullanici) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Create batch record
    const parti = await client.query(`
      INSERT INTO temizleme_partiler (...)
      VALUES (...)
      RETURNING *
    `);

    // 2. Create product records
    for (const urun of urunler) {
      await client.query(`
        INSERT INTO temizleme_parti_urunler (...)
        VALUES (...)
      `);

      // 3. UPDATE TÜM SÜREÇ: Add to "Temizlemede Olan"
      await client.query(`
        INSERT INTO surec_temizlemede_olan (urun_id, adet, parti_id, gidis_kg)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (urun_id)
        DO UPDATE SET
          adet = surec_temizlemede_olan.adet + EXCLUDED.adet,
          gidis_kg = COALESCE(surec_temizlemede_olan.gidis_kg, 0) + EXCLUDED.gidis_kg
      `);
    }

    // 4. LOG: Record movement
    await client.query(`
      INSERT INTO surec_hareket_log (...)
      VALUES (...)
    `);

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  }
}
```

**Inventory Changes:**
- `surec_temizlemede_olan`: **+adet** (incremented)
- Movement logged

### 2. Batch Return Flow

When products return from cleaning:

```javascript
async function partiDonusuKaydet(partiId, donusData, urunler, kullanici) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Update batch with return info
    await client.query(`
      UPDATE temizleme_partiler
      SET donus_tarihi = $1, donus_kg = $2, donus_adet = $3,
          durum = 'kalite_kontrol'
      WHERE id = $4
    `);

    // 2. Update product return quantities
    for (const urun of urunler) {
      await client.query(`
        UPDATE temizleme_parti_urunler
        SET donus_adet = $1, donus_kg = $2
        WHERE parti_id = $3 AND urun_id = $4
      `);

      // 3. UPDATE TÜM SÜREÇ: Decrease "Temizlemede Olan"
      await client.query(`
        UPDATE surec_temizlemede_olan
        SET adet = adet - $1,
            gidis_kg = COALESCE(gidis_kg, 0) - $2
        WHERE urun_id = $3
      `);

      // 4. UPDATE TÜM SÜREÇ: Add to "Temizlemeden Gelen"
      await client.query(`
        INSERT INTO surec_temizlemeden_gelen
          (urun_id, adet, kg, parti_id, kalite_kontrol_durum)
        VALUES ($1, $2, $3, $4, 'beklemede')
        ON CONFLICT (urun_id)
        DO UPDATE SET
          adet = surec_temizlemeden_gelen.adet + EXCLUDED.adet,
          kg = COALESCE(surec_temizlemeden_gelen.kg, 0) + EXCLUDED.kg
      `);
    }

    // 5. LOG
    await client.query(`
      INSERT INTO surec_hareket_log (...)
      VALUES (...)
    `);

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  }
}
```

**Inventory Changes:**
- `surec_temizlemede_olan`: **-adet** (decremented)
- `surec_temizlemeden_gelen`: **+adet** (incremented)
- Movement logged

### 3. Quality Control Flow (Accept)

When QC accepts a batch:

```javascript
// Inside kaliteKontrolYap() function

if (karar === 'kabul') {
  // Get products in batch
  const partiUrunler = await client.query(`
    SELECT pu.*, u.urun_kodu_base, u.urun_kodu
    FROM temizleme_parti_urunler pu
    JOIN surec_urunler u ON pu.urun_id = u.id
    WHERE pu.parti_id = $1
  `);

  for (const urun of partiUrunler.rows) {
    // 1. UPDATE TÜM SÜREÇ: Decrease "Temizlemeden Gelen"
    await client.query(`
      UPDATE surec_temizlemeden_gelen
      SET adet = adet - $1,
          kg = COALESCE(kg, 0) - $2,
          kalite_kontrol_durum = 'kabul'
      WHERE urun_id = $3
    `);

    // 2. UPDATE TÜM SÜREÇ: Add to "Sevke Hazır"
    // NOTE: Groups by BASE code (A and B combined)
    const baseKod = urun.urun_kodu_base.replace(/\s*\([AB]\)\s*$/, '').trim();
    await client.query(`
      INSERT INTO surec_sevke_hazir (urun_kodu_base, adet)
      VALUES ($1, $2)
      ON CONFLICT (urun_kodu_base)
      DO UPDATE SET
        adet = surec_sevke_hazir.adet + EXCLUDED.adet
    `);
  }
}
```

**Inventory Changes:**
- `surec_temizlemeden_gelen`: **-adet** (decremented)
- `surec_sevke_hazir`: **+adet** (incremented, grouped by base code)

### 4. Quality Control Flow (Re-clean)

When QC decides to re-clean:

```javascript
if (karar === 'tekrar_temizlik') {
  // 1. Create new batch with suffix
  const anaParti = await client.query('SELECT * FROM temizleme_partiler WHERE id = $1');
  const partiNo = `${anaParti.parti_no}-T${anaParti.tekrar_temizlik_sayisi + 1}`;

  const yeniParti = await client.query(`
    INSERT INTO temizleme_partiler (parti_no, ana_parti_id, ...)
    VALUES ($1, $2, ...)
    RETURNING *
  `);

  // 2. Copy products to new batch
  const partiUrunler = await client.query(`
    SELECT * FROM temizleme_parti_urunler WHERE parti_id = $1
  `);

  for (const urun of partiUrunler.rows) {
    // Insert into new batch
    await client.query(`
      INSERT INTO temizleme_parti_urunler (parti_id, urun_id, gidis_adet, gidis_kg)
      VALUES ($1, $2, $3, $4)
    `);

    // 3. UPDATE TÜM SÜREÇ: Add back to "Temizlemede Olan"
    await client.query(`
      UPDATE surec_temizlemede_olan
      SET adet = adet + $1,
          gidis_kg = COALESCE(gidis_kg, 0) + $2
      WHERE urun_id = $3
    `);
  }

  // 4. Increment re-clean counter
  await client.query(`
    UPDATE temizleme_partiler
    SET tekrar_temizlik_sayisi = tekrar_temizlik_sayisi + 1
    WHERE id = $1
  `);
}
```

**Batch Naming:**
- Original: `P-2024-001`
- First re-clean: `P-2024-001-T1`
- Second re-clean: `P-2024-001-T2`
- And so on...

## State Management

### Product State Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    Tüm Süreç States                          │
└─────────────────────────────────────────────────────────────┘

Manufacturing
     ↓
Temizlemeye Gidecek (Ready to Send)
     ↓ [Create Batch]
     ↓
┌────────────────────────────────────────────────────────────┐
│ Temizlemede Olan (Currently Cleaning)                      │
│ - Multiple batches can be in cleaning simultaneously       │
│ - Counts are cumulative                                    │
└─────────────┬──────────────────────────────────────────────┘
              ↓ [Record Return]
              ↓
┌────────────────────────────────────────────────────────────┐
│ Temizlemeden Gelen (Returned from Cleaning)                │
│ - Awaiting quality control                                 │
│ - kalite_kontrol_durum = 'beklemede'                       │
└─────────────┬──────────────────────────────────────────────┘
              ↓ [Quality Control]
              ↓
      ┌───────┴────────┐
      │                │                 │
      ↓                ↓                 ↓
    Kabul            Red           Tekrar Temizlik
   (Accept)        (Reject)         (Re-clean)
      │                                  │
      ↓                                  ↓
┌──────────────┐               ┌─────────────────┐
│ Sevke Hazır  │               │ Back to         │
│ (Ready Ship) │               │ Temizlemede Olan│
└──────────────┘               └─────────────────┘
      ↓
   Shipped
```

### State Consistency Rules

1. **Atomicity**: All state changes happen in transactions
2. **Uniqueness**: One record per product in each state table
3. **Cumulative Counts**: Support multiple concurrent batches
4. **Audit Trail**: All movements logged in `surec_hareket_log`

### Validation Rules

Before state transitions:

```javascript
// Before creating batch
if (urunAdet <= 0) {
  throw new Error('Quantity must be positive');
}

// Before recording return
if (batch.durum !== 'gonderildi') {
  throw new Error('Batch must be in sent status');
}

// Before quality control
if (batch.durum !== 'kalite_kontrol') {
  throw new Error('Batch must be in QC status');
}
```

## API Integration

### Tüm Süreç API Endpoints

Used by Temizleme Takip:

```javascript
// Get all products
GET /api/tum-surec/urunler
Response: [{ id, urun_kodu, tip, urun_kodu_base, ... }]

// Get products in specific state
GET /api/tum-surec/temizlemeye-gidecek
GET /api/tum-surec/temizlemede-olan
GET /api/tum-surec/temizlemeden-gelen
GET /api/tum-surec/sevke-hazir
```

### Cross-System Data Flow

#### Creating a Batch from Tüm Süreç

User workflow:
1. User views **Temizlemeye Gidecek** in Tüm Süreç
2. Selects products
3. Clicks **"Temizlemeye Gönder"** button
4. Products are saved to localStorage
5. Redirected to Temizleme Takip
6. Batch creation modal opens with pre-filled products

**Implementation:**

```javascript
// In TumSurec/TemizlemeyeGidecek.jsx
const handleSendToCleaning = (selectedProducts) => {
  // Save to localStorage
  localStorage.setItem('parti_urunler', JSON.stringify(selectedProducts));

  // Redirect to Temizleme Takip
  navigate('/temizleme-takip');
};

// In TemizlemeTakip/PartiOlusturModal.jsx
useEffect(() => {
  const savedItems = localStorage.getItem('parti_urunler');
  if (savedItems) {
    const items = JSON.parse(savedItems);
    setUrunler(items); // Pre-fill the form
    localStorage.removeItem('parti_urunler'); // Clean up
  }
}, []);
```

#### Viewing Batches from Tüm Süreç

User can see which batch a product belongs to:

```javascript
// In TumSurec/TemizlemedOlan.jsx
const [products, setProducts] = useState([]);

useEffect(() => {
  const fetchData = async () => {
    const data = await tumSurecAPI.getTemizlemedOlan();
    // Data includes parti_id for traceability
    setProducts(data);
  };
  fetchData();
}, []);
```

## Frontend Integration

### Component Architecture

```
TumSurecPage
├── TumSurec
│   ├── Anasayfa
│   ├── TemizlemeyeGidecek
│   │   └── [Send to Cleaning button]
│   ├── TemizlemedOlan
│   │   └── [View batch details link]
│   ├── TemizlemedenGelen
│   │   └── [Perform QC link]
│   ├── SevkeHazir
│   └── SevkEdilen

TemizlemeTakipPage
└── PartiListesi
    ├── PartiOlusturModal (receives localStorage data)
    ├── ManuelPartiModal
    ├── PartiDetayModal
    ├── PartiDonusModal
    └── KaliteKontrolModal
```

### Shared API Service

```javascript
// frontend/src/services/api.js

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api'
});

// Tüm Süreç API
export const tumSurecAPI = {
  getUrunler: async () => (await api.get('/tum-surec/urunler')).data,
  getTemizlemedOlan: async () => (await api.get('/tum-surec/temizlemede-olan')).data,
  // ...
};

// Temizleme Takip API
export const temizlemeTakipAPI = {
  createParti: async (data) => (await api.post('/temizleme-takip/partiler', data)).data,
  getPartiler: async (params) => (await api.get('/temizleme-takip/partiler', { params })).data,
  // ...
};
```

## Cross-System Workflows

### Workflow 1: Complete Cleaning Process

```
1. Manufacturing completes
   └─> Products appear in "Temizlemeye Gidecek"

2. User selects products in Tüm Süreç
   └─> Click "Temizlemeye Gönder"

3. Redirected to Temizleme Takip
   └─> Create batch with pre-filled products

4. Batch created
   └─> Products move to "Temizlemede Olan"
   └─> Can view in Tüm Süreç → Temizlemede Olan

5. Products return from cleaning
   └─> Record return in Temizleme Takip
   └─> Products move to "Temizlemeden Gelen"

6. Quality control performed
   └─> If accepted: Products move to "Sevke Hazır"
   └─> If rejected: Marked as rejected
   └─> If re-clean: Products back to "Temizlemede Olan"

7. Products shipped
   └─> Handled by Tüm Süreç shipping module
```

### Workflow 2: Quality Issue Resolution

```
1. QC finds high defect rate
   └─> Decide: Re-clean

2. System creates new batch (e.g., P-2024-001-T1)
   └─> Products return to "Temizlemede Olan"

3. Products re-cleaned and returned
   └─> Record return again

4. QC performed on re-cleaned batch
   └─> If still issues: Can re-clean again (T2, T3, etc.)
   └─> If acceptable: Move to "Sevke Hazır"

5. Defects are tracked
   └─> Recorded in hatali_urunler table
   └─> Available for analysis in both systems
```

### Workflow 3: Payment Processing

```
1. Batch accepted by QC
   └─> Calculate payment (excludes defects)

2. Payment calculated
   └─> Shows in Temizleme Takip payment tab
   └─> Can also be viewed in accounting system (future)

3. Record payments as they occur
   └─> Multiple partial payments supported

4. Generate payment reports
   └─> Export to Excel for accounting
   └─> Reconcile with vendor invoices
```

## Error Handling

### Transaction Failures

All integrations use database transactions:

```javascript
try {
  await client.query('BEGIN');

  // Multiple operations updating both systems
  await updateTemizlemeTakip();
  await updateTumSurec();

  await client.query('COMMIT');
} catch (error) {
  await client.query('ROLLBACK');
  console.error('Integration error:', error);
  throw error;
}
```

**Benefits:**
- All-or-nothing: Either all updates succeed or none do
- No partial state
- Data consistency guaranteed

### Handling Concurrent Updates

Using database constraints:

```sql
-- Only one record per product in each state
ALTER TABLE surec_temizlemede_olan ADD UNIQUE (urun_id);
ALTER TABLE surec_temizlemeden_gelen ADD UNIQUE (urun_id);
ALTER TABLE surec_sevke_hazir ADD UNIQUE (urun_kodu_base);

-- Use ON CONFLICT to handle concurrent inserts
INSERT INTO surec_temizlemede_olan (urun_id, adet)
VALUES ($1, $2)
ON CONFLICT (urun_id)
DO UPDATE SET adet = surec_temizlemede_olan.adet + EXCLUDED.adet;
```

### Error Scenarios

| Error | Cause | Solution |
|-------|-------|----------|
| Product not found | urun_id invalid | Use Manuel Giriş to create product first |
| Negative inventory | Data corruption | Manual correction by admin |
| Transaction timeout | Heavy load | Retry with exponential backoff |
| Constraint violation | Concurrent update | ON CONFLICT handles it automatically |

## Testing Integration

### Integration Test Examples

```javascript
describe('Temizleme Takip Integration', () => {
  it('should update Tum Surec inventory when batch created', async () => {
    // Create batch
    const batch = await createParti({
      parti_no: 'TEST-001',
      urunler: [{ urun_id: 1, gidis_adet: 100 }]
    });

    // Verify: Temizlemede Olan updated
    const temizlemedOlan = await getTemizlemedOlan(1);
    expect(temizlemedOlan.adet).toBe(100);

    // Verify: Log created
    const log = await getHareketLog({ parti_id: batch.id });
    expect(log[0].islem_tipi).toBe('parti_gonderildi');
  });

  it('should move products on QC accept', async () => {
    // ... test QC acceptance flow
  });
});
```

## Best Practices

1. **Always use transactions** for operations affecting multiple systems
2. **Validate state** before transitions
3. **Log all movements** in surec_hareket_log
4. **Handle unique constraints** with ON CONFLICT
5. **Test integration points** thoroughly
6. **Monitor for data drift** between systems
7. **Document cross-system dependencies**

## Troubleshooting

### Debugging Integration Issues

1. **Check logs:**
   ```sql
   SELECT * FROM surec_hareket_log
   WHERE parti_id = <batch_id>
   ORDER BY created_at DESC;
   ```

2. **Verify inventory counts:**
   ```sql
   SELECT
     u.urun_kodu,
     t1.adet as temizlemede,
     t2.adet as gelen,
     t3.adet as sevke_hazir
   FROM surec_urunler u
   LEFT JOIN surec_temizlemede_olan t1 ON u.id = t1.urun_id
   LEFT JOIN surec_temizlemeden_gelen t2 ON u.id = t2.urun_id
   LEFT JOIN surec_sevke_hazir t3 ON u.urun_kodu_base = t3.urun_kodu_base;
   ```

3. **Check batch status:**
   ```sql
   SELECT * FROM temizleme_partiler
   WHERE parti_no = 'P-2024-001';
   ```

### Common Integration Issues

| Issue | Diagnosis | Fix |
|-------|-----------|-----|
| Inventory mismatch | Check hareket_log for missing entries | Manual adjustment + log entry |
| Duplicate products | Check unique constraints | Delete duplicate, keep most recent |
| Orphaned batches | Foreign key violation | Clean up related records first |

## Future Enhancements

Planned integration improvements:

1. **Real-time sync**: WebSocket updates when batches change
2. **API webhooks**: Notify external systems of state changes
3. **Audit dashboard**: Visual monitoring of integration points
4. **Data reconciliation**: Automated checks for consistency
5. **Event sourcing**: Full history of all state changes

---

**Document Version:** 1.0
**Last Reviewed:** 2026-01-04
