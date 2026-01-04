import React, { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Box, Typography, Alert, RadioGroup, FormControlLabel, Radio,
  Accordion, AccordionSummary, AccordionDetails, Chip
} from '@mui/material';
import { ExpandMore as ExpandMoreIcon, CheckCircle, Cancel, Loop } from '@mui/icons-material';
import { temizlemeTakipAPI } from '../../services/api';

const HATA_KATEGORILERI = [
  { key: 'temizleme_problemi', label: 'Temizleme Hatalı' },
  { key: 'vuruk_problem', label: 'Vuruk' },
  { key: 'pim_girmeyen', label: 'Pim Girmeyen' },
  { key: 'capagi_alinmayan', label: 'Kapağı Alınmayan' },
  { key: 'polisaj', label: 'Polisaj' },
  { key: 'kaynak_az', label: 'Kaynak Az' },
  { key: 'kaynak_akintisi', label: 'Kaynak Akıntısı' },
  { key: 'ici_capakli', label: 'İçi Çapaklı' },
  { key: 'boncuklu', label: 'Boncuklu' },
  { key: 'yamuk', label: 'Yamuk' },
  { key: 'gramaji_dusuk', label: 'Gramajı Düşük' },
  { key: 'hurda', label: 'Hurda' }
];

function KaliteKontrolModal({ open, onClose, parti, urunler, onSuccess }) {
  const [karar, setKarar] = useState('kabul');
  const [kontrolEdilenAdet, setKontrolEdilenAdet] = useState(parti?.donus_adet || 0);
  const [aciklama, setAciklama] = useState('');
  const [urunHatalari, setUrunHatalari] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleHataChange = (urunKodu, kategori, value) => {
    setUrunHatalari(prev => ({
      ...prev,
      [urunKodu]: {
        ...prev[urunKodu],
        [kategori]: parseInt(value) || 0
      }
    }));
  };

  const calculateHataOrani = () => {
    const toplamHata = Object.values(urunHatalari).reduce((total, urun) => {
      return total + Object.values(urun).reduce((sum, val) => sum + (val || 0), 0);
    }, 0);

    if (kontrolEdilenAdet === 0) return 0;
    return ((toplamHata / kontrolEdilenAdet) * 100).toFixed(2);
  };

  const handleSubmit = async () => {
    // Validasyon
    if (kontrolEdilenAdet <= 0) {
      alert('Kontrol edilen adet 0\'dan büyük olmalıdır!');
      return;
    }

    if (!karar) {
      alert('Lütfen bir karar seçin!');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const toplamHata = Object.values(urunHatalari).reduce((total, urun) => {
        return total + Object.values(urun).reduce((sum, val) => sum + (val || 0), 0);
      }, 0);

      // Problem kategorileri listesi oluştur
      const problemKategorileri = [];
      Object.entries(urunHatalari).forEach(([urunKodu, hatalar]) => {
        Object.entries(hatalar).forEach(([kategori, adet]) => {
          if (adet > 0) {
            const kategoriLabel = HATA_KATEGORILERI.find(k => k.key === kategori)?.label || kategori;
            problemKategorileri.push(`${urunKodu}: ${kategoriLabel} (${adet})`);
          }
        });
      });

      const data = {
        karar,
        kontrol_edilen_adet: kontrolEdilenAdet,
        hata_adet: toplamHata,
        hata_detay: urunHatalari,
        aciklama,
        problem_kategorileri: problemKategorileri,
        yapan: 'Kullanıcı' // TODO: Gerçek kullanıcı adı
      };

      await temizlemeTakipAPI.kaliteKontrol(parti.id, data);

      let message = 'Kalite kontrol başarıyla tamamlandı!\n\n';
      if (karar === 'kabul') {
        message += 'Parti kabul edildi ve Sevke Hazır\'a taşındı.';
      } else if (karar === 'red') {
        message += 'Parti reddedildi.';
      } else if (karar === 'tekrar_temizlik') {
        message += `Yeni parti oluşturuldu: ${parti.parti_no}-T${(parti.tekrar_temizlik_sayisi || 0) + 1}`;
      }

      alert(message);
      onSuccess();
    } catch (err) {
      console.error('Kalite kontrol hatası:', err);
      setError(err.response?.data?.error || 'Kalite kontrol kaydedilemedi!');
    } finally {
      setLoading(false);
    }
  };

  const hataOrani = calculateHataOrani();

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle sx={{ bgcolor: '#2196f3', color: 'white', fontWeight: 'bold' }}>
        ✅ Kalite Kontrol: {parti?.parti_no}
      </DialogTitle>

      <DialogContent sx={{ mt: 2 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Parti Özeti */}
        <Paper sx={{ p: 2, mb: 3, bgcolor: '#f5f5f5' }}>
          <Typography variant="h6" gutterBottom>📦 Parti Özeti</Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 2 }}>
            <Box>
              <Typography variant="body2" color="text.secondary">Parti No:</Typography>
              <Typography variant="body1" fontWeight="bold">{parti?.parti_no}</Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">Dönüş Adet:</Typography>
              <Typography variant="body1" fontWeight="bold">{parti?.donus_adet}</Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">Dönüş KG:</Typography>
              <Typography variant="body1" fontWeight="bold">{parti?.donus_kg}</Typography>
            </Box>
          </Box>
        </Paper>

        {/* Kontrol Bilgileri */}
        <Box sx={{ mb: 3 }}>
          <TextField
            label="Kontrol Edilen Adet *"
            type="number"
            value={kontrolEdilenAdet}
            onChange={(e) => setKontrolEdilenAdet(parseInt(e.target.value) || 0)}
            fullWidth
            sx={{ mb: 2 }}
          />

          <Box sx={{ p: 2, bgcolor: hataOrani > 10 ? '#ffebee' : '#e8f5e9', borderRadius: 1 }}>
            <Typography variant="h6" sx={{ color: hataOrani > 10 ? '#d32f2f' : '#2e7d32' }}>
              Hata Oranı: {hataOrani}%
            </Typography>
            <Typography variant="body2">
              Toplam Hata: {Object.values(urunHatalari).reduce((total, urun) =>
                total + Object.values(urun).reduce((sum, val) => sum + (val || 0), 0), 0)} adet
            </Typography>
          </Box>
        </Box>

        {/* Ürün Bazlı Hata Girişi */}
        <Typography variant="h6" gutterBottom>🔍 Ürün Bazlı Hata Tespit</Typography>
        {urunler?.map((urun) => (
          <Accordion key={urun.id} sx={{ mb: 1 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>
                {urun.urun_kodu} ({urun.tip}) - Dönüş: {urun.donus_adet} adet
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2 }}>
                {HATA_KATEGORILERI.map((kategori) => (
                  <TextField
                    key={kategori.key}
                    label={kategori.label}
                    type="number"
                    size="small"
                    value={urunHatalari[urun.urun_kodu]?.[kategori.key] || 0}
                    onChange={(e) => handleHataChange(urun.urun_kodu, kategori.key, e.target.value)}
                  />
                ))}
              </Box>
            </AccordionDetails>
          </Accordion>
        ))}

        {/* Karar */}
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" gutterBottom>📋 Karar *</Typography>
          <RadioGroup value={karar} onChange={(e) => setKarar(e.target.value)}>
            <FormControlLabel
              value="kabul"
              control={<Radio />}
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CheckCircle color="success" />
                  <Box>
                    <Typography fontWeight="bold">Kabul</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Parti kabul edilir ve Sevke Hazır'a taşınır
                    </Typography>
                  </Box>
                </Box>
              }
            />
            <FormControlLabel
              value="red"
              control={<Radio />}
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Cancel color="error" />
                  <Box>
                    <Typography fontWeight="bold">Red</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Parti reddedilir
                    </Typography>
                  </Box>
                </Box>
              }
            />
            <FormControlLabel
              value="tekrar_temizlik"
              control={<Radio />}
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Loop color="secondary" />
                  <Box>
                    <Typography fontWeight="bold">Tekrar Temizlik</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Yeni parti oluşturulur ve tekrar temizlemeye gönderilir
                    </Typography>
                  </Box>
                </Box>
              }
            />
          </RadioGroup>
        </Box>

        {/* Açıklama */}
        <TextField
          label="Açıklama / Notlar"
          value={aciklama}
          onChange={(e) => setAciklama(e.target.value)}
          fullWidth
          multiline
          rows={3}
          sx={{ mt: 2 }}
        />

        {/* Uyarılar */}
        {hataOrani > 15 && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            ⚠️ Yüksek hata oranı tespit edildi! ({hataOrani}%) Tekrar temizlik önerilir.
          </Alert>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2, bgcolor: '#f5f5f5' }}>
        <Button onClick={onClose} disabled={loading}>
          İptal
        </Button>
        <Button
          variant="contained"
          color={
            karar === 'kabul' ? 'success' :
            karar === 'red' ? 'error' :
            'secondary'
          }
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? 'Kaydediliyor...' : 'Kararı Kaydet'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default KaliteKontrolModal;
