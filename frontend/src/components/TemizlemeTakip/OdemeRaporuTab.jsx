import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Button, Chip, CircularProgress, Alert, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions, Grid, Card, CardContent, Divider
} from '@mui/material';
import {
  Visibility as ViewIcon, Calculate as CalculateIcon,
  AttachMoney as MoneyIcon, CheckCircle, Cancel
} from '@mui/icons-material';
import { temizlemeTakipAPI } from '../../services/api';

function OdemeRaporuTab() {
  const [partiler, setPartiler] = useState([]);
  const [ozet, setOzet] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [detayModalOpen, setDetayModalOpen] = useState(false);
  const [selectedParti, setSelectedParti] = useState(null);
  const [partiDetay, setPartiDetay] = useState(null);
  const [hesaplamaLoading, setHesaplamaLoading] = useState(false);

  useEffect(() => {
    fetchOdemeRaporu();
  }, []);

  const fetchOdemeRaporu = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await temizlemeTakipAPI.getOdemeRaporu();
      setPartiler(data.partiler);
      setOzet(data.ozet);
    } catch (err) {
      console.error('Ödeme raporu yükleme hatası:', err);
      setError(err.response?.data?.error || 'Ödeme raporu yüklenemedi!');
    } finally {
      setLoading(false);
    }
  };

  const handleOdemeHesapla = async (parti) => {
    setHesaplamaLoading(true);
    try {
      await temizlemeTakipAPI.odemeHesapla(parti.id);
      alert('Ödeme hesaplandı!');
      fetchOdemeRaporu();
    } catch (err) {
      console.error('Ödeme hesaplama hatası:', err);
      alert(err.response?.data?.error || 'Ödeme hesaplanamadı!');
    } finally {
      setHesaplamaLoading(false);
    }
  };

  const handleDetayGoster = async (parti) => {
    try {
      const detay = await temizlemeTakipAPI.getOdemeDetay(parti.id);
      setSelectedParti(parti);
      setPartiDetay(detay);
      setDetayModalOpen(true);
    } catch (err) {
      console.error('Detay yükleme hatası:', err);
      alert('Detaylar yüklenemedi!');
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('tr-TR');
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(amount || 0);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Özet Kartlar */}
      {ozet && (
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={3}>
            <Card sx={{ bgcolor: '#e3f2fd' }}>
              <CardContent>
                <Typography variant="body2" color="text.secondary">Toplam Parti</Typography>
                <Typography variant="h4" fontWeight="bold">{ozet.toplam_parti}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card sx={{ bgcolor: '#fff3e0' }}>
              <CardContent>
                <Typography variant="body2" color="text.secondary">Toplam Ödenecek</Typography>
                <Typography variant="h5" fontWeight="bold" color="#f57c00">
                  {formatCurrency(ozet.toplam_odenecek_tutar)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card sx={{ bgcolor: '#e8f5e9' }}>
              <CardContent>
                <Typography variant="body2" color="text.secondary">Ödenen</Typography>
                <Typography variant="h5" fontWeight="bold" color="#2e7d32">
                  {formatCurrency(ozet.toplam_odenen_tutar)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card sx={{ bgcolor: '#ffebee' }}>
              <CardContent>
                <Typography variant="body2" color="text.secondary">Kalan Borç</Typography>
                <Typography variant="h5" fontWeight="bold" color="#d32f2f">
                  {formatCurrency(ozet.kalan_borc)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Parti Listesi */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>Parti No</TableCell>
              <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>Gidiş Tarihi</TableCell>
              <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>Dönüş Tarihi</TableCell>
              <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>Gönderilen</TableCell>
              <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>Gelen</TableCell>
              <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>Ödenecek</TableCell>
              <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>Ödenmeyecek</TableCell>
              <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>Tutar</TableCell>
              <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>Durum</TableCell>
              <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>İşlemler</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {partiler.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">Ödeme raporu bulunamadı</Typography>
                </TableCell>
              </TableRow>
            ) : (
              partiler.map((parti) => (
                <TableRow key={parti.id} hover>
                  <TableCell>{parti.parti_no}</TableCell>
                  <TableCell>{formatDate(parti.gidis_tarihi)}</TableCell>
                  <TableCell>{formatDate(parti.donus_tarihi)}</TableCell>
                  <TableCell>
                    {parti.gidis_adet} adet<br />
                    {parti.gidis_kg} kg
                  </TableCell>
                  <TableCell>
                    {parti.donus_adet} adet<br />
                    {parti.donus_kg} kg
                  </TableCell>
                  <TableCell sx={{ bgcolor: '#e8f5e9' }}>
                    <Typography fontWeight="bold" color="#2e7d32">
                      {parti.toplam_odenecek_adet || 0} adet
                    </Typography>
                    <Typography fontWeight="bold" color="#2e7d32">
                      {parseFloat(parti.toplam_odenecek_kg || 0).toFixed(2)} kg
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ bgcolor: '#ffebee' }}>
                    <Typography fontWeight="bold" color="#d32f2f">
                      {parti.toplam_odenmeyecek_adet || 0} adet
                    </Typography>
                    <Typography fontWeight="bold" color="#d32f2f">
                      {parseFloat(parti.toplam_odenmeyecek_kg || 0).toFixed(2)} kg
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {parti.odenecek_tutar ? (
                      <Typography fontWeight="bold" color="primary">
                        {formatCurrency(parti.odenecek_tutar)}
                      </Typography>
                    ) : (
                      <Button
                        size="small"
                        startIcon={<CalculateIcon />}
                        onClick={() => handleOdemeHesapla(parti)}
                        disabled={hesaplamaLoading}
                      >
                        Hesapla
                      </Button>
                    )}
                  </TableCell>
                  <TableCell>
                    {parti.odeme_durumu === 'odendi' && (
                      <Chip label="Ödendi" color="success" size="small" icon={<CheckCircle />} />
                    )}
                    {parti.odeme_durumu === 'kismen_odendi' && (
                      <Chip label="Kısmen Ödendi" color="warning" size="small" />
                    )}
                    {parti.odeme_durumu === 'odenecek' && (
                      <Chip label="Ödenecek" color="error" size="small" />
                    )}
                    {parti.odeme_durumu === 'beklemede' && (
                      <Chip label="Beklemede" color="default" size="small" />
                    )}
                  </TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => handleDetayGoster(parti)}
                    >
                      <ViewIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Detay Modal */}
      <Dialog open={detayModalOpen} onClose={() => setDetayModalOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ bgcolor: '#2196f3', color: 'white', fontWeight: 'bold' }}>
          💰 Ödeme Detayı: {selectedParti?.parti_no}
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          {partiDetay && (
            <>
              {/* Özet */}
              <Paper sx={{ p: 2, mb: 2, bgcolor: '#f5f5f5' }}>
                <Typography variant="h6" gutterBottom>Özet</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Gönderilen:</Typography>
                    <Typography fontWeight="bold">
                      {partiDetay.parti.gidis_adet} adet / {partiDetay.parti.gidis_kg} kg
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Gelen:</Typography>
                    <Typography fontWeight="bold">
                      {partiDetay.parti.donus_adet} adet / {partiDetay.parti.donus_kg} kg
                    </Typography>
                  </Grid>
                </Grid>
                <Divider sx={{ my: 2 }} />
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="success.main">Ödenecek:</Typography>
                    <Typography fontWeight="bold" color="success.main">
                      {partiDetay.urunler.reduce((sum, u) => sum + (u.odenecek_adet || 0), 0)} adet
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="error.main">Ödenmeyecek:</Typography>
                    <Typography fontWeight="bold" color="error.main">
                      {partiDetay.urunler.reduce((sum, u) => sum + (u.odenmeyecek_adet || 0), 0)} adet
                    </Typography>
                  </Grid>
                </Grid>
                {partiDetay.parti.odenecek_tutar && (
                  <>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="h5" color="primary" fontWeight="bold">
                      Toplam: {formatCurrency(partiDetay.parti.odenecek_tutar)}
                    </Typography>
                  </>
                )}
              </Paper>

              {/* Ürün Detayları */}
              <Typography variant="h6" gutterBottom>Ürün Bazlı Detay</Typography>
              <TableContainer component={Paper}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold' }}>Ürün</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Gönderilen</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Gelen</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', bgcolor: '#e8f5e9' }}>Ödenecek</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', bgcolor: '#ffebee' }}>Ödenmeyecek</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {partiDetay.urunler.map((urun, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{urun.urun_kodu}</TableCell>
                        <TableCell>
                          {urun.gidis_adet} adet<br />
                          {urun.gidis_kg} kg
                        </TableCell>
                        <TableCell>
                          {urun.donus_adet} adet<br />
                          {urun.donus_kg} kg
                        </TableCell>
                        <TableCell sx={{ bgcolor: '#e8f5e9' }}>
                          <Typography fontWeight="bold" color="success.main">
                            {urun.odenecek_adet || 0} adet
                          </Typography>
                          <Typography fontWeight="bold" color="success.main">
                            {parseFloat(urun.odenecek_kg || 0).toFixed(2)} kg
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ bgcolor: '#ffebee' }}>
                          <Typography fontWeight="bold" color="error.main">
                            {urun.odenmeyecek_adet || 0} adet
                          </Typography>
                          <Typography fontWeight="bold" color="error.main">
                            {parseFloat(urun.odenmeyecek_kg || 0).toFixed(2)} kg
                          </Typography>
                          {urun.odenmeyecek_adet > 0 && (
                            <Typography variant="caption" color="text.secondary">
                              (Kalite red / tekrar temizlik)
                            </Typography>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetayModalOpen(false)}>Kapat</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default OdemeRaporuTab;
