import React, { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField,
  Box, Alert
} from '@mui/material';
import { temizlemeTakipAPI } from '../../services/api';

function ManuelPartiModal({ open, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    parti_no: '',
    irsaliye_no: '',
    gidis_tarihi: new Date().toISOString().split('T')[0],
    urun_kodu: '',
    gidis_adet: '',
    gidis_kg: '',
    gidis_notlar: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async () => {
    // Validasyon
    if (!formData.parti_no) {
      setError('Parti numarası gerekli!');
      return;
    }

    if (!formData.gidis_tarihi) {
      setError('Gidiş tarihi gerekli!');
      return;
    }

    if (!formData.urun_kodu) {
      setError('Ürün kodu gerekli!');
      return;
    }

    if (!formData.gidis_adet || formData.gidis_adet <= 0) {
      setError('Geçerli bir gidiş adet girilmeli!');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = {
        ...formData,
        gidis_adet: parseInt(formData.gidis_adet),
        gidis_kg: parseFloat(formData.gidis_kg) || 0,
        yapan: 'Kullanıcı'
      };

      await temizlemeTakipAPI.createManuelParti(data);
      alert('Manuel parti başarıyla oluşturuldu!');
      onSuccess();
      handleReset();
    } catch (err) {
      console.error('Manuel parti oluşturma hatası:', err);
      setError(err.response?.data?.error || 'Manuel parti oluşturulamadı!');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      parti_no: '',
      irsaliye_no: '',
      gidis_tarihi: new Date().toISOString().split('T')[0],
      urun_kodu: '',
      gidis_adet: '',
      gidis_kg: '',
      gidis_notlar: ''
    });
    setError(null);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ bgcolor: '#2e7d32', color: 'white', fontWeight: 'bold' }}>
        Manuel Parti Girişi
      </DialogTitle>

      <DialogContent sx={{ mt: 2 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Parti No *"
            value={formData.parti_no}
            onChange={(e) => setFormData({ ...formData, parti_no: e.target.value })}
            fullWidth
            placeholder="Örn: P-2024-001"
          />

          <TextField
            label="İrsaliye No"
            value={formData.irsaliye_no}
            onChange={(e) => setFormData({ ...formData, irsaliye_no: e.target.value })}
            fullWidth
            placeholder="Opsiyonel"
          />

          <TextField
            label="Gidiş Tarihi *"
            type="date"
            value={formData.gidis_tarihi}
            onChange={(e) => setFormData({ ...formData, gidis_tarihi: e.target.value })}
            fullWidth
            InputLabelProps={{ shrink: true }}
          />

          <TextField
            label="Ürün Kodu *"
            value={formData.urun_kodu}
            onChange={(e) => setFormData({ ...formData, urun_kodu: e.target.value })}
            fullWidth
            placeholder="Ürün kodunu manuel girin"
          />

          <TextField
            label="Gidiş Adet *"
            type="number"
            value={formData.gidis_adet}
            onChange={(e) => setFormData({ ...formData, gidis_adet: e.target.value })}
            fullWidth
            inputProps={{ min: 1 }}
          />

          <TextField
            label="Gidiş KG"
            type="number"
            value={formData.gidis_kg}
            onChange={(e) => setFormData({ ...formData, gidis_kg: e.target.value })}
            fullWidth
            inputProps={{ min: 0, step: 0.01 }}
            placeholder="Opsiyonel"
          />

          <TextField
            label="Notlar"
            value={formData.gidis_notlar}
            onChange={(e) => setFormData({ ...formData, gidis_notlar: e.target.value })}
            fullWidth
            multiline
            rows={3}
            placeholder="Opsiyonel notlar"
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2, bgcolor: '#f5f5f5' }}>
        <Button onClick={onClose} disabled={loading}>
          İptal
        </Button>
        <Button onClick={handleReset} disabled={loading}>
          Temizle
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading}
          sx={{ bgcolor: '#2e7d32', '&:hover': { bgcolor: '#1b5e20' } }}
        >
          {loading ? 'Kaydediliyor...' : 'Manuel Parti Oluştur'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ManuelPartiModal;
