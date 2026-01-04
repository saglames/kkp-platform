import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, Grid, Card, CardContent, CircularProgress,
  Alert, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Select, MenuItem, FormControl, InputLabel, Button
} from '@mui/material';
import {
  TrendingUp, TrendingDown, Assessment, CheckCircle, Cancel, Loop
} from '@mui/icons-material';
import { temizlemeTakipAPI } from '../../services/api';

function RaporlarTab() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [ozet, setOzet] = useState(null);
  const [urunBazli, setUrunBazli] = useState([]);
  const [period, setPeriod] = useState('son_30_gun');

  useEffect(() => {
    fetchRaporlar();
  }, [period]);

  const fetchRaporlar = async () => {
    setLoading(true);
    setError(null);
    try {
      const [ozetData, urunData] = await Promise.all([
        temizlemeTakipAPI.getRaporOzet(),
        temizlemeTakipAPI.getRaporUrunBazli()
      ]);
      setOzet(ozetData);
      setUrunBazli(urunData);
    } catch (err) {
      console.error('Rapor yükleme hatası:', err);
      setError(err.response?.data?.error || 'Raporlar yüklenemedi!');
    } finally {
      setLoading(false);
    }
  };

  const handleExportExcel = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/temizleme-takip/raporlar/export?period=${period}`,
        { credentials: 'include' }
      );
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `temizleme-rapor-${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Excel export hatası:', err);
      alert('Excel export başarısız!');
    }
  };

  if (loading && !ozet) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Filtre ve Export */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'center' }}>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Dönem</InputLabel>
          <Select
            value={period}
            label="Dönem"
            onChange={(e) => setPeriod(e.target.value)}
          >
            <MenuItem value="son_7_gun">Son 7 Gün</MenuItem>
            <MenuItem value="son_30_gun">Son 30 Gün</MenuItem>
            <MenuItem value="son_90_gun">Son 90 Gün</MenuItem>
            <MenuItem value="bu_yil">Bu Yıl</MenuItem>
            <MenuItem value="tum_zamanlar">Tüm Zamanlar</MenuItem>
          </Select>
        </FormControl>

        <Button variant="outlined" onClick={handleExportExcel}>
          Excel İndir
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Özet Kartlar */}
      {ozet && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {/* Toplam Parti */}
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: '#e3f2fd' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Assessment sx={{ fontSize: 40, color: '#1976d2' }} />
                  <Box>
                    <Typography variant="h4" fontWeight="bold">
                      {ozet.toplam_parti}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Toplam Parti
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Kalite Oranı */}
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: ozet.ortalama_kalite_orani >= 90 ? '#e8f5e9' : '#fff3e0' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CheckCircle sx={{ fontSize: 40, color: ozet.ortalama_kalite_orani >= 90 ? '#2e7d32' : '#f57c00' }} />
                  <Box>
                    <Typography variant="h4" fontWeight="bold">
                      {ozet.ortalama_kalite_orani?.toFixed(1)}%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Ortalama Kalite
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* KG Kaybı */}
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: '#ffebee' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TrendingDown sx={{ fontSize: 40, color: '#d32f2f' }} />
                  <Box>
                    <Typography variant="h4" fontWeight="bold">
                      {ozet.toplam_kg_kaybi?.toFixed(2)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Toplam KG Kaybı
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Adet Kaybı */}
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: '#fce4ec' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Cancel sx={{ fontSize: 40, color: '#c2185b' }} />
                  <Box>
                    <Typography variant="h4" fontWeight="bold">
                      {ozet.toplam_adet_kaybi}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Toplam Adet Kaybı
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Durum Dağılımı */}
      {ozet && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>📊 Durum Dağılımı</Typography>
          <Grid container spacing={2}>
            <Grid item xs={6} sm={4} md={2}>
              <Box sx={{ textAlign: 'center', p: 2, bgcolor: '#e3f2fd', borderRadius: 1 }}>
                <Typography variant="h5" fontWeight="bold">{ozet.durum_dagilimi?.gonderildi || 0}</Typography>
                <Typography variant="body2">Gönderildi</Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={4} md={2}>
              <Box sx={{ textAlign: 'center', p: 2, bgcolor: '#fff3e0', borderRadius: 1 }}>
                <Typography variant="h5" fontWeight="bold">{ozet.durum_dagilimi?.temizlemede || 0}</Typography>
                <Typography variant="body2">Temizlemede</Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={4} md={2}>
              <Box sx={{ textAlign: 'center', p: 2, bgcolor: '#e1f5fe', borderRadius: 1 }}>
                <Typography variant="h5" fontWeight="bold">{ozet.durum_dagilimi?.kalite_kontrol || 0}</Typography>
                <Typography variant="body2">Kalite Kontrol</Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={4} md={2}>
              <Box sx={{ textAlign: 'center', p: 2, bgcolor: '#e8f5e9', borderRadius: 1 }}>
                <Typography variant="h5" fontWeight="bold">{ozet.durum_dagilimi?.kabul || 0}</Typography>
                <Typography variant="body2">Kabul</Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={4} md={2}>
              <Box sx={{ textAlign: 'center', p: 2, bgcolor: '#ffebee', borderRadius: 1 }}>
                <Typography variant="h5" fontWeight="bold">{ozet.durum_dagilimi?.red || 0}</Typography>
                <Typography variant="body2">Red</Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={4} md={2}>
              <Box sx={{ textAlign: 'center', p: 2, bgcolor: '#f3e5f5', borderRadius: 1 }}>
                <Typography variant="h5" fontWeight="bold">{ozet.durum_dagilimi?.tekrar_temizlik || 0}</Typography>
                <Typography variant="body2">Tekrar Temizlik</Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      )}

      {/* Ürün Bazlı Kayıplar */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>📈 Ürün Bazlı Kayıplar</Typography>
        <TableContainer sx={{ maxHeight: 400 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>Ürün Kodu</TableCell>
                <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>Toplam Gidiş</TableCell>
                <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>Toplam Dönüş</TableCell>
                <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>Kayıp (KG)</TableCell>
                <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>Kayıp (Adet)</TableCell>
                <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>Kayıp Oranı (%)</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {urunBazli.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">Veri bulunamadı</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                urunBazli.map((urun, idx) => {
                  const kayipOrani = urun.toplam_gidis_adet > 0
                    ? ((urun.kayip_adet / urun.toplam_gidis_adet) * 100).toFixed(2)
                    : 0;

                  return (
                    <TableRow key={idx} hover>
                      <TableCell>{urun.urun_kodu}</TableCell>
                      <TableCell>
                        {urun.toplam_gidis_kg?.toFixed(2)} kg / {urun.toplam_gidis_adet} adet
                      </TableCell>
                      <TableCell>
                        {urun.toplam_donus_kg?.toFixed(2)} kg / {urun.toplam_donus_adet} adet
                      </TableCell>
                      <TableCell sx={{ color: '#d32f2f', fontWeight: 'bold' }}>
                        {urun.kayip_kg?.toFixed(2)} kg
                      </TableCell>
                      <TableCell sx={{ color: '#d32f2f', fontWeight: 'bold' }}>
                        {urun.kayip_adet} adet
                      </TableCell>
                      <TableCell>
                        <Box
                          sx={{
                            bgcolor: kayipOrani > 10 ? '#ffebee' : kayipOrani > 5 ? '#fff3e0' : '#e8f5e9',
                            px: 1.5,
                            py: 0.5,
                            borderRadius: 1,
                            display: 'inline-block',
                            fontWeight: 'bold',
                            color: kayipOrani > 10 ? '#d32f2f' : kayipOrani > 5 ? '#f57c00' : '#2e7d32'
                          }}
                        >
                          {kayipOrani}%
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
}

export default RaporlarTab;
