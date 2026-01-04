import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, IconButton, Autocomplete, Box, Typography, Alert
} from '@mui/material';
import { Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import { temizlemeTakipAPI, tumSurecAPI } from '../../services/api';

function PartiOlusturModal({ open, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    parti_no: '',
    irsaliye_no: '',
    gidis_tarihi: new Date().toISOString().split('T')[0],
    gidis_notlar: ''
  });
  const [urunler, setUrunler] = useState([]);
  const [mevcutUrunler, setMevcutUrunler] = useState([]);
  const [selectedUrun, setSelectedUrun] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (open) {
      fetchUrunler();
      loadPreSelectedItems();
    }
  }, [open]);

  const fetchUrunler = async () => {
    try {
      const data = await tumSurecAPI.getUrunler();
      setMevcutUrunler(data);
    } catch (err) {
      console.error('Ürün listesi yüklenirken hata:', err);
      setError('Ürün listesi yüklenemedi!');
    }
  };

  const loadPreSelectedItems = () => {
    try {
      const savedItems = localStorage.getItem('parti_urunler');
      if (savedItems) {
        const items = JSON.parse(savedItems);

        // localStorage'daki ürünleri parti formatına çevir
        const formattedUrunler = items.map(item => ({
          urun_id: item.id,
          urun_kodu: item.urun_kodu,
          tip: item.tip,
          gidis_adet: item.adet || 0,
          gidis_kg: 0 // KG kullanıcı tarafından girilecek
        }));

        setUrunler(formattedUrunler);

        // localStorage'ı temizle
        localStorage.removeItem('parti_urunler');
      }
    } catch (err) {
      console.error('Ön seçili ürünler yüklenirken hata:', err);
    }
  };

  const handleAddUrun = () => {
    if (!selectedUrun) {
      alert('Lütfen bir ürün seçin!');
      return;
    }

    // Ürün zaten eklendi mi kontrol et
    if (urunler.find(u => u.urun_id === selectedUrun.id)) {
      alert('Bu ürün zaten eklenmiş!');
      return;
    }

    setUrunler([
      ...urunler,
      {
        urun_id: selectedUrun.id,
        urun_kodu: selectedUrun.urun_kodu,
        tip: selectedUrun.tip,
        gidis_adet: 0,
        gidis_kg: 0
      }
    ]);
    setSelectedUrun(null);
  };

  const handleRemoveUrun = (index) => {
    setUrunler(urunler.filter((_, i) => i !== index));
  };

  const handleUrunChange = (index, field, value) => {
    const updated = [...urunler];
    updated[index][field] = parseFloat(value) || 0;
    setUrunler(updated);
  };

  const calculateTotals = () => {
    const totalAdet = urunler.reduce((sum, u) => sum + (u.gidis_adet || 0), 0);
    const totalKg = urunler.reduce((sum, u) => sum + (u.gidis_kg || 0), 0);
    return { totalAdet, totalKg };
  };

  const handleSubmit = async () => {
    // Validasyon
    if (!formData.parti_no) {
      alert('Parti numarası gerekli!');
      return;
    }

    if (urunler.length === 0) {
      alert('En az bir ürün ekleyin!');
      return;
    }

    const hasInvalidUrun = urunler.some(u => u.gidis_adet <= 0);
    if (hasInvalidUrun) {
      alert('Tüm ürünler için gidiş adet girilmeli!');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { totalAdet, totalKg } = calculateTotals();

      const data = {
        ...formData,
        gidis_adet: totalAdet,
        gidis_kg: totalKg,
        urunler,
        yapan: 'Kullanıcı' // TODO: Gerçek kullanıcı adı
      };

      await temizlemeTakipAPI.createParti(data);
      alert('Parti başarıyla oluşturuldu!');
      onSuccess();
      handleReset();
    } catch (err) {
      console.error('Parti oluşturma hatası:', err);
      setError(err.response?.data?.error || 'Parti oluşturulamadı!');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      parti_no: '',
      irsaliye_no: '',
      gidis_tarihi: new Date().toISOString().split('T')[0],
      gidis_notlar: ''
    });
    setUrunler([]);
    setSelectedUrun(null);
    setError(null);
  };

  const { totalAdet, totalKg } = calculateTotals();

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle sx={{ bgcolor: '#1976d2', color: 'white', fontWeight: 'bold' }}>
        🆕 Yeni Parti Oluştur
      </DialogTitle>

      <DialogContent sx={{ mt: 2 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Parti Bilgileri */}
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 3 }}>
          <TextField
            label="Parti No *"
            value={formData.parti_no}
            onChange={(e) => setFormData({ ...formData, parti_no: e.target.value })}
            fullWidth
          />
          <TextField
            label="İrsaliye No"
            value={formData.irsaliye_no}
            onChange={(e) => setFormData({ ...formData, irsaliye_no: e.target.value })}
            fullWidth
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
            label="Gidiş Notlar"
            value={formData.gidis_notlar}
            onChange={(e) => setFormData({ ...formData, gidis_notlar: e.target.value })}
            fullWidth
            multiline
            rows={1}
          />
        </Box>

        {/* Ürün Ekleme */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>Ürünler</Typography>
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <Autocomplete
              options={mevcutUrunler}
              getOptionLabel={(option) => `${option.urun_kodu} (${option.tip})`}
              value={selectedUrun}
              onChange={(e, newValue) => setSelectedUrun(newValue)}
              renderInput={(params) => <TextField {...params} label="Ürün Seçin" />}
              sx={{ flex: 1 }}
            />
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddUrun}
            >
              Ekle
            </Button>
          </Box>

          {/* Ürün Listesi Tablosu */}
          {urunler.length > 0 && (
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Ürün Kodu</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Tip</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Gidiş Adet *</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Gidiş KG</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>İşlem</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {urunler.map((urun, index) => (
                    <TableRow key={index}>
                      <TableCell>{urun.urun_kodu}</TableCell>
                      <TableCell>{urun.tip}</TableCell>
                      <TableCell>
                        <TextField
                          type="number"
                          value={urun.gidis_adet}
                          onChange={(e) => handleUrunChange(index, 'gidis_adet', e.target.value)}
                          size="small"
                          fullWidth
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          type="number"
                          value={urun.gidis_kg}
                          onChange={(e) => handleUrunChange(index, 'gidis_kg', e.target.value)}
                          size="small"
                          fullWidth
                        />
                      </TableCell>
                      <TableCell>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleRemoveUrun(index)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                  {/* Toplam Satırı */}
                  <TableRow>
                    <TableCell colSpan={2} align="right" sx={{ fontWeight: 'bold' }}>
                      TOPLAM:
                    </TableCell>
                    <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>
                      {totalAdet} adet
                    </TableCell>
                    <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>
                      {totalKg.toFixed(2)} kg
                    </TableCell>
                    <TableCell />
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          )}
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
          disabled={loading || urunler.length === 0}
        >
          {loading ? 'Kaydediliyor...' : 'Parti Oluştur'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default PartiOlusturModal;
