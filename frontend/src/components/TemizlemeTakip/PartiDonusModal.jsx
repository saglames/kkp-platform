import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Box, Typography, Alert
} from '@mui/material';
import { temizlemeTakipAPI } from '../../services/api';

function PartiDonusModal({ open, onClose, parti, urunler, onSuccess }) {
  const [formData, setFormData] = useState({
    donus_tarihi: new Date().toISOString().split('T')[0],
    donus_notlar: ''
  });
  const [urunDonusleri, setUrunDonusleri] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (open && urunler) {
      // Ürün dönüşlerini initialize et
      setUrunDonusleri(
        urunler.map(u => ({
          urun_id: u.urun_id,
          urun_kodu: u.urun_kodu,
          tip: u.tip,
          gidis_adet: u.gidis_adet,
          gidis_kg: u.gidis_kg,
          donus_adet: 0,
          donus_kg: 0
        }))
      );
    }
  }, [open, urunler]);

  const handleUrunChange = (index, field, value) => {
    const updated = [...urunDonusleri];
    updated[index][field] = parseFloat(value) || 0;
    setUrunDonusleri(updated);
  };

  const calculateTotals = () => {
    const totalDonusAdet = urunDonusleri.reduce((sum, u) => sum + (u.donus_adet || 0), 0);
    const totalDonusKg = urunDonusleri.reduce((sum, u) => sum + (u.donus_kg || 0), 0);
    return { totalDonusAdet, totalDonusKg };
  };

  const handleSubmit = async () => {
    // Validasyon
    if (!formData.donus_tarihi) {
      alert('Dönüş tarihi gerekli!');
      return;
    }

    const hasInvalidUrun = urunDonusleri.some(u => u.donus_adet < 0);
    if (hasInvalidUrun) {
      alert('Dönüş adet negatif olamaz!');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { totalDonusAdet, totalDonusKg } = calculateTotals();

      const data = {
        donus_tarihi: formData.donus_tarihi,
        donus_adet: totalDonusAdet,
        donus_kg: totalDonusKg,
        donus_notlar: formData.donus_notlar,
        urunler: urunDonusleri,
        yapan: 'Kullanıcı' // TODO: Gerçek kullanıcı adı
      };

      await temizlemeTakipAPI.partiDonus(parti.id, data);
      alert('Parti dönüşü başarıyla kaydedildi! Parti kalite kontrole gönderildi.');
      onSuccess();
    } catch (err) {
      console.error('Parti dönüş kaydetme hatası:', err);
      setError(err.response?.data?.error || 'Dönüş kaydedilemedi!');
    } finally {
      setLoading(false);
    }
  };

  const { totalDonusAdet, totalDonusKg } = calculateTotals();

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle sx={{ bgcolor: '#4caf50', color: 'white', fontWeight: 'bold' }}>
        ⬅️ Parti Dönüşü Kaydet: {parti?.parti_no}
      </DialogTitle>

      <DialogContent sx={{ mt: 2 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Dönüş Bilgileri */}
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 3 }}>
          <TextField
            label="Dönüş Tarihi *"
            type="date"
            value={formData.donus_tarihi}
            onChange={(e) => setFormData({ ...formData, donus_tarihi: e.target.value })}
            fullWidth
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="Dönüş Notlar"
            value={formData.donus_notlar}
            onChange={(e) => setFormData({ ...formData, donus_notlar: e.target.value })}
            fullWidth
            multiline
            rows={1}
          />
        </Box>

        {/* Ürün Dönüş Tablosu */}
        <Typography variant="h6" gutterBottom>Ürün Bazlı Dönüş Bilgileri</Typography>
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Ürün Kodu</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Tip</TableCell>
                <TableCell sx={{ fontWeight: 'bold', bgcolor: '#e3f2fd' }}>Gidiş Adet</TableCell>
                <TableCell sx={{ fontWeight: 'bold', bgcolor: '#e3f2fd' }}>Gidiş KG</TableCell>
                <TableCell sx={{ fontWeight: 'bold', bgcolor: '#c8e6c9' }}>Dönüş Adet</TableCell>
                <TableCell sx={{ fontWeight: 'bold', bgcolor: '#c8e6c9' }}>Dönüş KG</TableCell>
                <TableCell sx={{ fontWeight: 'bold', bgcolor: '#ffcdd2' }}>Kayıp Adet</TableCell>
                <TableCell sx={{ fontWeight: 'bold', bgcolor: '#ffcdd2' }}>Kayıp KG</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {urunDonusleri.map((urun, index) => {
                const kayipAdet = urun.gidis_adet - (urun.donus_adet || 0);
                const kayipKg = (urun.gidis_kg || 0) - (urun.donus_kg || 0);

                return (
                  <TableRow key={index}>
                    <TableCell>{urun.urun_kodu}</TableCell>
                    <TableCell>{urun.tip}</TableCell>
                    <TableCell>{urun.gidis_adet}</TableCell>
                    <TableCell>{urun.gidis_kg || '-'}</TableCell>
                    <TableCell>
                      <TextField
                        type="number"
                        value={urun.donus_adet}
                        onChange={(e) => handleUrunChange(index, 'donus_adet', e.target.value)}
                        size="small"
                        fullWidth
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        type="number"
                        value={urun.donus_kg}
                        onChange={(e) => handleUrunChange(index, 'donus_kg', e.target.value)}
                        size="small"
                        fullWidth
                      />
                    </TableCell>
                    <TableCell style={{ color: kayipAdet > 0 ? 'red' : 'inherit' }}>
                      {kayipAdet}
                    </TableCell>
                    <TableCell style={{ color: kayipKg > 0 ? 'red' : 'inherit' }}>
                      {kayipKg.toFixed(2)}
                    </TableCell>
                  </TableRow>
                );
              })}
              {/* Toplam Satırı */}
              <TableRow>
                <TableCell colSpan={2} align="right" sx={{ fontWeight: 'bold' }}>
                  TOPLAM:
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>
                  {parti?.gidis_adet || 0}
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>
                  {parti?.gidis_kg?.toFixed(2) || '-'}
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold', bgcolor: '#c8e6c9' }}>
                  {totalDonusAdet}
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold', bgcolor: '#c8e6c9' }}>
                  {totalDonusKg.toFixed(2)}
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold', bgcolor: '#ffcdd2' }}>
                  {(parti?.gidis_adet || 0) - totalDonusAdet}
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold', bgcolor: '#ffcdd2' }}>
                  {((parti?.gidis_kg || 0) - totalDonusKg).toFixed(2)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>

        <Alert severity="info" sx={{ mt: 2 }}>
          💡 Dönüş kaydedildikten sonra parti otomatik olarak <strong>Kalite Kontrol</strong> aşamasına geçecektir.
        </Alert>
      </DialogContent>

      <DialogActions sx={{ p: 2, bgcolor: '#f5f5f5' }}>
        <Button onClick={onClose} disabled={loading}>
          İptal
        </Button>
        <Button
          variant="contained"
          color="success"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? 'Kaydediliyor...' : 'Dönüşü Kaydet'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default PartiDonusModal;
