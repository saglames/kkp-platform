# User Guide - Temizleme Takip System

**Version:** 1.0
**Last Updated:** 2026-01-04

## Table of Contents

1. [Introduction](#introduction)
2. [Accessing the System](#accessing-the-system)
3. [Batch Management](#batch-management)
4. [Quality Control](#quality-control)
5. [Payment Tracking](#payment-tracking)
6. [Reports](#reports)
7. [Troubleshooting](#troubleshooting)

## Introduction

The Temizleme Takip (Cleaning Tracking) system helps you manage products sent for external cleaning services. It tracks:

- When products are sent for cleaning
- When they return
- Quality inspection results
- Payment calculations
- Historical data and analytics

## Accessing the System

### Navigation

1. Log into the KKP Platform
2. Navigate to **Tüm Süreç** section
3. Select **Temizleme Takip** tab

### Main Interface

The main screen shows:
- **Batch List (Parti Listesi)**: All cleaning batches
- **Filter Options**: Search and filter batches
- **Action Buttons**: Create new batches

## Batch Management

### Creating a New Batch

There are two ways to create a batch:

#### Method 1: Standard Batch Creation

**Use when:** You're sending products already in the system

1. Click **"Yeni Parti Oluştur"** (New Batch) button
2. Fill in batch information:
   - **Parti No** (required): Unique batch number (e.g., P-2024-001)
   - **İrsaliye No**: Waybill number (optional)
   - **Gidiş Tarihi** (required): Departure date
   - **Gidiş Notlar**: Any departure notes

3. Add products:
   - Select product from dropdown
   - Click **"Ekle"** (Add)
   - Enter **Gidiş Adet** (quantity) for each product
   - Optionally enter **Gidiş KG** (weight)

4. Review totals at the bottom
5. Click **"Parti Oluştur"** (Create Batch)

**Example:**
```
Parti No: P-2024-001
İrsaliye No: IRS-12345
Gidiş Tarihi: 2024-01-15

Products:
- JOINT-45-A: 500 pieces, 150 kg
- JOINT-50-B: 300 pieces, 95 kg

Total: 800 pieces, 245 kg
```

#### Method 2: Manual Entry

**Use when:** Product is not in the system (external/special items)

1. Click **"Manuel Giriş"** (Manual Entry) button
2. Fill in:
   - **Parti No** (required)
   - **Gidiş Tarihi** (required)
   - **Ürün Kodu** (required): Type the product code manually
   - **Gidiş Adet** (required): Quantity
   - **Gidiş KG**: Weight (optional)
   - **Notlar**: Any notes

3. Click **"Manuel Parti Oluştur"**

**Note:** The system will create the product if it doesn't exist.

### Integration with Tüm Süreç

When you create a batch:
- Products are automatically moved to **"Temizlemede Olan"** status
- The movement is logged in the system
- You can track them in the Tüm Süreç workflow

### Viewing Batch Details

1. In the batch list, click the **eye icon** (👁️) next to any batch
2. The detail modal shows:
   - Batch summary (dates, quantities, status)
   - Product list with quantities
   - Quality control history
   - Payment information (if applicable)

### Recording Return

When products return from cleaning:

1. Open batch details
2. Click **"Dönüş Kaydet"** (Record Return) button
3. Fill in:
   - **Dönüş Tarihi** (required): Return date
   - **Dönüş Adet**: Total returned quantity
   - **Dönüş KG**: Total returned weight
   - **Dönüş Notlar**: Any notes about the return

4. For each product, enter:
   - **Dönüş Adet**: Quantity returned
   - **Dönüş KG**: Weight returned

5. Click **"Dönüşü Kaydet"** (Save Return)

**What happens:**
- Batch status changes to **"Kalite Kontrol"** (Quality Control)
- Products move from "Temizlemede Olan" to "Temizlemeden Gelen"
- The system calculates losses (if any)

**Note:** You'll see calculated differences:
- Red numbers indicate losses
- Green numbers indicate gains (rare)

### Filtering and Searching

Use the filters at the top:

**Durum (Status) Filter:**
- **Gönderildi**: Sent for cleaning
- **Kalite Kontrol**: Awaiting quality inspection
- **Kabul**: Accepted (passed QC)
- **Red**: Rejected
- **Tekrar Temizlik**: Being re-cleaned

**Parti No Filter:**
- Type partial batch number to search
- Example: "P-2024" finds all batches starting with P-2024

**Date Filters:**
- Filter by departure date range

### Deleting a Batch

**⚠️ Warning:** This cannot be undone!

1. Click the **trash icon** (🗑️) next to the batch
2. Confirm deletion
3. The batch and all related data will be permanently deleted

**Important:** Deletion does NOT reverse inventory movements. Use with caution!

## Quality Control

### Performing Quality Inspection

After a batch returns, perform quality control:

1. Open batch details (must be in "Kalite Kontrol" status)
2. Click **"Kalite Kontrol Yap"** (Perform QC)
3. Enter **Kontrol Edilen Adet** (Inspected quantity)

### Recording Defects

For each product, expand the accordion and enter defects by category:

**Defect Categories:**
- **Temizleme Hatalı**: Cleaning not done properly
- **Vuruk**: Dents or deformations
- **Kapağı Alınmayan**: Cap not removed
- **Polisaj**: Polishing issues
- **Kaynak Az**: Insufficient welding
- **Kaynak Akıntısı**: Welding leaks
- **İçi Çapaklı**: Internal burrs
- **Pim Girmeyen**: Pin won't fit
- **Boncuklu**: Beaded surface
- **Yamuk**: Crooked/misaligned
- **Gramajı Düşük**: Underweight
- **Hurda**: Complete scrap

**Example:**
```
Product: JOINT-45-A (295 returned)
Defects:
- Temizleme Hatalı: 5 pieces
- Vuruk: 3 pieces
- Polisaj: 2 pieces
Total Defects: 10 pieces
```

### Making a Decision

Select one of three options:

#### 1. Kabul (Accept) ✅

**When:** Quality is acceptable

**What happens:**
- Batch is marked as accepted
- Defective items are excluded from payment
- Products move to **"Sevke Hazır"** (Ready to Ship)
- Payment can be calculated

**Example:**
```
Returned: 295 pieces
Defects: 10 pieces
Payable: 285 pieces
```

#### 2. Red (Reject) ❌

**When:** Quality is unacceptable, cannot be fixed

**What happens:**
- Batch is marked as rejected
- No payment is calculated
- Products remain in rejected state

#### 3. Tekrar Temizlik (Re-clean) 🔄

**When:** Quality issues can be fixed by re-cleaning

**What happens:**
- New batch is created with suffix (e.g., P-2024-001-T1)
- Products are sent back to cleaning
- Original batch is marked as re-cleaned
- Counter increments (T1, T2, T3, etc.)

### Quality Notes

Add any notes in the **Açıklama** (Description) field:
- Why was it accepted/rejected?
- Specific issues found
- Recommendations for next time

### Error Rate Indicator

The system automatically calculates error rate:

```
Error Rate = (Total Defects / Inspected Quantity) × 100
```

**Visual Indicators:**
- **Green box**: Error rate < 10% (Good quality)
- **Red box**: Error rate > 10% (Poor quality)
- **Warning**: Error rate > 15% suggests re-cleaning

## Payment Tracking

### Calculating Payment

After quality control acceptance:

1. Open batch details
2. Click **"Ödeme Hesapla"** (Calculate Payment) tab
3. Click **"Hesapla"** button

**The system:**
- Retrieves current pricing
- Calculates payment per product
- Excludes defective items
- Shows detailed breakdown

**Payment Formula:**
```
Payment = (Payable Quantity × Price per Piece) + (Payable Weight × Price per KG)
```

**Example:**
```
Product: JOINT-45-A
Returned: 295 pieces, 89 kg
Defects: 10 pieces, 3 kg
Payable: 285 pieces, 86 kg

Pricing:
- Per piece: ₺5.50
- Per kg: ₺0.75

Payment = (285 × ₺5.50) + (86 × ₺0.75)
        = ₺1,567.50 + ₺64.50
        = ₺1,632.00
```

### Recording Payments

To record a payment:

1. In the payment tab, click **"Ödeme Kaydet"** (Record Payment)
2. Fill in:
   - **Ödeme Tutarı** (required): Payment amount
   - **Ödeme Tarihi** (required): Payment date
   - **Ödeme Yöntemi**: Payment method (e.g., "Bank Transfer")
   - **Açıklama**: Payment notes

3. Click **"Kaydet"** (Save)

**Payment Status:**
- **Ödenecek** (To be paid): No payment yet
- **Kısmen Ödendi** (Partially paid): Some payment made
- **Ödendi** (Paid): Fully paid

**Partial Payments:**
You can record multiple partial payments. The system tracks:
- Total amount to be paid
- Total amount paid so far
- Remaining balance

### Payment History

View all payments made for a batch:
- Payment amount
- Payment date
- Payment method
- Who recorded it
- Notes

## Reports

### Summary Report

View overall statistics:

1. Go to **Raporlar** tab
2. Click **Özet Raporu** (Summary Report)

**Shows:**
- Total batches
- Status distribution (pie chart)
- Average quality rate
- Total losses (weight and quantity)

### Product-Based Loss Report

Analyze losses by product:

1. Go to **Raporlar** → **Ürün Bazlı Kayıp**

**Shows:**
- Product code
- Total sent vs returned
- Total losses
- Number of batches
- Loss rate

**Use this to:**
- Identify problematic products
- Negotiate with cleaning service
- Improve packaging/handling

### Payment Report

Track payment status:

1. Go to **Raporlar** → **Ödeme Raporu**
2. Optional: Filter by payment status

**Shows:**
- Batch number
- Dates
- Amount to be paid
- Amount paid
- Payment status
- Remaining balance

**Summary Section:**
- Total batches
- Total amount to be paid
- Total amount paid
- Total remaining debt

### Quality Control Statistics

View quality trends:

1. Go to **Kalite Kontrol** tab
2. View charts showing:
   - Acceptance rate
   - Rejection rate
   - Re-cleaning rate
   - Average error rate over time

## Troubleshooting

### Common Issues

#### "Ürün bulunamadı" (Product not found)

**Solution:** Use **Manuel Giriş** to create the product first.

#### Cannot record return

**Problem:** Batch not in correct status

**Solution:** Ensure batch status is "Gönderildi" before recording return.

#### Payment calculation shows ₺0.00

**Problem:** No pricing configured or QC not done

**Solution:**
1. Ensure quality control is completed and accepted
2. Check that pricing is configured (Settings → Fiyatlandırma)

#### Products not showing in Tüm Süreç

**Problem:** Inventory sync issue

**Solution:**
1. Refresh the page
2. Check batch status
3. Contact system administrator if issue persists

#### Cannot delete batch

**Problem:** Batch has dependent records

**Solution:** This is intentional. Contact administrator for data corrections.

### Best Practices

1. **Use consistent batch numbering**
   - Example format: P-YYYY-NNN (P-2024-001, P-2024-002, etc.)

2. **Record returns promptly**
   - Don't wait days to record returns
   - Ensure accurate inventory

3. **Perform QC immediately**
   - Quality control should be done as soon as products return
   - Document defects while fresh

4. **Regular payment reconciliation**
   - Review payment reports weekly
   - Record payments as they happen

5. **Add detailed notes**
   - Future reference
   - Communication with cleaning service
   - Dispute resolution

6. **Export reports regularly**
   - For accounting
   - For management review
   - For vendor evaluation

### Tips for Efficiency

- **Keyboard shortcuts**: Use Tab to navigate between fields
- **Copy batch numbers**: Use Ctrl+C / Ctrl+V for batch numbers
- **Filter before export**: Apply filters before exporting reports
- **Bookmark the page**: Quick access to the system

## Glossary

| Turkish Term | English | Description |
|--------------|---------|-------------|
| Parti | Batch | Group of products sent for cleaning |
| İrsaliye | Waybill | Shipping document |
| Gidiş | Departure | When products leave |
| Dönüş | Return | When products come back |
| Kalite Kontrol | Quality Control | Inspection process |
| Hata | Defect | Quality issue |
| Ödeme | Payment | Money to be paid |
| Sevke Hazır | Ready to Ship | Inventory state after QC |

## Getting Help

If you encounter issues:

1. Check this user guide
2. Check the troubleshooting section
3. Contact your system administrator
4. Contact the development team

## Appendix: Workflow Diagram

```
┌─────────────────┐
│  Create Batch   │
│  (Parti Oluştur)│
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│   Gönderildi    │
│   (Sent)        │
└────────┬────────┘
         │ Record Return
         ↓
┌─────────────────┐
│ Kalite Kontrol  │
│ (QC Pending)    │
└────────┬────────┘
         │ Perform QC
         ↓
    ┌────┴────┐
    │         │
    ↓         ↓         ↓
┌───────┐ ┌──────┐ ┌─────────────┐
│ Kabul │ │ Red  │ │Tekrar       │
│Accept │ │Reject│ │Temizlik     │
└───┬───┘ └──────┘ │Re-clean     │
    │              └──────┬──────┘
    │                     │
    ↓                     ↓
┌────────────┐      ┌─────────────┐
│Sevke Hazır │      │ New Batch   │
│Ready Ship  │      │ Created     │
└─────┬──────┘      └─────────────┘
      │
      ↓
┌─────────────┐
│  Payment    │
│  Process    │
└─────────────┘
```

---

**Version History:**

| Date | Version | Changes |
|------|---------|---------|
| 2026-01-04 | 1.0 | Initial user guide created |
