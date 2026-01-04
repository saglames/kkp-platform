# Temizleme Takip (Cleaning Tracking) System

**Version:** 1.0
**Last Updated:** 2026-01-04
**Status:** Production

## Overview

The Temizleme Takip (Cleaning Tracking) System is a comprehensive solution for managing the cleaning process of manufactured products. It tracks batches (partiler) from the moment they are sent for cleaning through quality control and back into inventory. The system includes payment calculations, quality control workflows, and comprehensive reporting.

## Table of Contents

1. [System Architecture](#system-architecture)
2. [Key Features](#key-features)
3. [Database Schema](#database-schema)
4. [Quick Start](#quick-start)
5. [Documentation Index](#documentation-index)
6. [Technical Stack](#technical-stack)
7. [Related Systems](#related-systems)

## System Architecture

The Temizleme Takip system follows a layered architecture:

```
Frontend (React)
    └── Components (PartiListesi, KaliteKontrol, etc.)
        └── API Layer (temizlemeTakipAPI)
            └── Backend (Express.js)
                └── Database (PostgreSQL)
```

### Key Components

- **Frontend**: Material-UI based React components
- **Backend**: Express.js RESTful API with transaction support
- **Database**: PostgreSQL with ACID compliance
- **Integration**: Connects to Tüm Süreç workflow system

## Key Features

### 1. Batch Management (Parti Yönetimi)
- Create batches with multiple products
- Manual entry for external products
- Track departure and return information
- Monitor weight and quantity differences

### 2. Quality Control (Kalite Kontrol)
- Detailed defect categorization (12 defect types)
- Error rate calculation
- Three decision paths: Accept, Reject, Re-clean
- Product-level defect tracking

### 3. Payment System (Ödeme Sistemi)
- Automatic payment calculation based on quality control
- Configurable pricing (per kg and per piece)
- Payment tracking and history
- Defective products are excluded from payment

### 4. Workflow Integration
- Integrates with Tüm Süreç workflow
- Updates inventory states automatically
- Tracks product movement across stages:
  - Temizlemeye Gidecek → Temizlemede Olan → Temizlemeden Gelen → Sevke Hazır

### 5. Reporting & Analytics
- Summary reports with KPIs
- Product-based loss reports
- Payment reports
- Quality control history

## Database Schema

The system uses 6 main tables:

1. **temizleme_partiler** - Batch master data
2. **temizleme_parti_urunler** - Product details per batch
3. **temizleme_kalite_kontrol_log** - Quality control history
4. **temizleme_fiyatlandirma** - Pricing configuration
5. **temizleme_odeme_log** - Payment history
6. **hatali_urunler** - Defective products tracking (shared table)

See [database-schema.md](./database-schema.md) for detailed schema documentation.

## Quick Start

### Prerequisites

- Node.js 14+ and npm
- PostgreSQL 12+
- Access to the KKP platform database

### Database Setup

Run the migration script to create tables and indexes:

```bash
node backend/migrate-temizleme-schema.js
```

### Backend Setup

The API routes are automatically loaded via Express:

```javascript
// In backend/index.js (or app.js)
const temizlemeTakipRoutes = require('./routes/temizlemeTakip');
app.use('/api/temizleme-takip', temizlemeTakipRoutes);
```

### Frontend Setup

Import and use the Temizleme Takip component:

```javascript
import PartiListesi from './components/TemizlemeTakip/PartiListesi';

function TemizlemeTakipPage() {
  return <PartiListesi />;
}
```

## Documentation Index

- **[API Documentation](./api-documentation.md)** - Complete API endpoint reference
- **[Database Schema](./database-schema.md)** - Database tables, relationships, and ER diagram
- **[User Guide](./user-guide.md)** - Frontend feature walkthrough
- **[Integration Guide](./integration-guide.md)** - How the system integrates with Tüm Süreç
- **[Data Flow](./data-flow.md)** - State transitions and data movement
- **[Development Guide](./development-guide.md)** - For developers extending the system

## Technical Stack

### Backend
- **Framework**: Express.js
- **Database**: PostgreSQL with pg driver
- **Transaction Management**: PostgreSQL transactions (BEGIN/COMMIT/ROLLBACK)
- **Validation**: Built-in request validation

### Frontend
- **Framework**: React 18+
- **UI Library**: Material-UI (MUI) v5
- **State Management**: React Hooks (useState, useEffect)
- **HTTP Client**: Axios

### Database
- **DBMS**: PostgreSQL 12+
- **Features Used**:
  - Generated columns (STORED)
  - JSONB for flexible data
  - Foreign keys with CASCADE
  - Indexes for performance
  - Transactions for data integrity

## Related Systems

### Tüm Süreç (Complete Workflow)
The Temizleme Takip system is tightly integrated with the Tüm Süreç workflow system:

- **surec_temizlemede_olan**: Tracks products currently in cleaning
- **surec_temizlemeden_gelen**: Products returned from cleaning awaiting QC
- **surec_sevke_hazir**: Products approved for shipping
- **surec_hareket_log**: Movement history log

See [integration-guide.md](./integration-guide.md) for detailed integration documentation.

### Hatalı Ürünler (Defective Products)
Quality control results are recorded in the shared `hatali_urunler` table for comprehensive defect tracking.

## Support & Maintenance

### Common Issues

1. **Batch not appearing**: Check if products are properly linked via `surec_urunler`
2. **Payment calculation errors**: Verify pricing configuration is active
3. **Quality control failing**: Ensure batch is in correct state (kalite_kontrol)

### Maintenance Tasks

- **Regular**: Review quality control statistics weekly
- **Monthly**: Archive old batches (>6 months)
- **As Needed**: Update pricing configuration

## Future Enhancements

Planned features for future releases:

- [ ] Batch export to Excel/PDF
- [ ] Email notifications for quality control
- [ ] Dashboard with real-time statistics
- [ ] Mobile app for quality control
- [ ] Barcode/QR code scanning
- [ ] Multi-language support

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-01-04 | Initial release with complete functionality |

## License

Internal use only - KKP Platform

## Contact

For questions or support, contact the development team.
