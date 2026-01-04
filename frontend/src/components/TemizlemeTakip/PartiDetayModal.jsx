import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
  Box, Typography, Chip, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Divider, CircularProgress, Alert
} from '@mui/material';
import {
  Timeline, TimelineItem, TimelineSeparator, TimelineConnector,
  TimelineContent, TimelineDot, TimelineOppositeContent
} from '@mui/lab';
import {
  CheckCircle as CheckIcon, Cancel as CancelIcon,
  Loop as LoopIcon, Send as SendIcon
} from '@mui/icons-material';
import { temizlemeTakipAPI } from '../../services/api';
import PartiDonusModal from './PartiDonusModal';
import KaliteKontrolModal from './KaliteKontrolModal';

function PartiDetayModal({ open, onClose, parti, onRefresh }) {
  const [detayData, setDetayData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [donusModalOpen, setDonusModalOpen] = useState(false);
  const [kaliteModalOpen, setKaliteModalOpen] = useState(false);

  useEffect(() => {
    if (open && parti) {
      fetchDetay();
    }
  }, [open, parti]);

  const fetchDetay = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await temizlemeTakipAPI.getParti(parti.id);
      setDetayData(data);
    } catch (err) {
      console.error('Parti detay yüklenirken hata:', err);
      setError(err.response?.data?.error || 'Parti detayı yüklenemedi!');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleString('tr-TR');
  };

  const getDurumColor = (durum) => {
    const colors = {
      'gonderildi': 'primary',
      'temizlemede': 'warning',
      'kalite_kontrol': 'info',
      'kabul': 'success',
      'red': 'error',
      'tekrar_temizlik': 'secondary'
    };
    return colors[durum] || 'default';
  };

  if (loading) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
        <DialogContent sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </DialogContent>
      </Dialog>
    );
  }

  if (!detayData) return null;

  const { parti: partiInfo, urunler, kaliteGecmis } = detayData;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle sx={{ bgcolor: '#1976d2', color: 'white', fontWeight: 'bold' }}>
        📦 Parti Detayı: {partiInfo.parti_no}
      </DialogTitle>

      <DialogContent sx={{ mt: 2 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Parti Bilgileri */}
        <Paper sx={{ p: 2, mb: 3, bgcolor: '#f5f5f5' }}>
          <Typography variant="h6" gutterBottom>📋 Genel Bilgiler</Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            <Box>
              <Typography variant="body2" color="text.secondary">Parti No:</Typography>
              <Typography variant="body1" fontWeight="bold">{partiInfo.parti_no}</Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">İrsaliye No:</Typography>
              <Typography variant="body1">{partiInfo.irsaliye_no || '-'}</Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">Durum:</Typography>
              <Chip
                label={partiInfo.durum}
                color={getDurumColor(partiInfo.durum)}
                size="small"
              />
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">Oluşturan:</Typography>
              <Typography variant="body1">{partiInfo.created_by || '-'}</Typography>
            </Box>
          </Box>
        </Paper>

        {/* Gidiş - Dönüş Karşılaştırma */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="h6" gutterBottom>📊 Gidiş - Dönüş Karşılaştırma</Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 3 }}>
            {/* Gidiş */}
            <Box>
              <Typography variant="subtitle2" color="primary" gutterBottom>➡️ Gidiş</Typography>
              <Typography variant="body2">Tarih: {formatDate(partiInfo.gidis_tarihi)}</Typography>
              <Typography variant="body2">Adet: <strong>{partiInfo.gidis_adet}</strong></Typography>
              <Typography variant="body2">KG: <strong>{partiInfo.gidis_kg || '-'}</strong></Typography>
              {partiInfo.gidis_notlar && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Not: {partiInfo.gidis_notlar}
                </Typography>
              )}
            </Box>

            {/* Dönüş */}
            <Box>
              <Typography variant="subtitle2" color="success.main" gutterBottom>⬅️ Dönüş</Typography>
              <Typography variant="body2">Tarih: {formatDate(partiInfo.donus_tarihi)}</Typography>
              <Typography variant="body2">Adet: <strong>{partiInfo.donus_adet || 0}</strong></Typography>
              <Typography variant="body2">KG: <strong>{partiInfo.donus_kg || '-'}</strong></Typography>
              {partiInfo.donus_notlar && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Not: {partiInfo.donus_notlar}
                </Typography>
              )}
            </Box>

            {/* Farklar */}
            <Box>
              <Typography variant="subtitle2" color="error.main" gutterBottom>📉 Farklar</Typography>
              <Typography variant="body2">
                Adet: <strong style={{ color: partiInfo.adet_farki < 0 ? 'red' : 'green' }}>
                  {partiInfo.adet_farki || 0} {partiInfo.adet_farki < 0 ? '(Kayıp)' : ''}
                </strong>
              </Typography>
              <Typography variant="body2">
                KG: <strong style={{ color: partiInfo.kg_farki < 0 ? 'red' : 'green' }}>
                  {partiInfo.kg_farki || 0} {partiInfo.kg_farki < 0 ? '(Kayıp)' : ''}
                </strong>
              </Typography>
            </Box>
          </Box>
        </Paper>

        {/* Ürün Listesi */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="h6" gutterBottom>📦 Ürünler</Typography>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>Ürün Kodu</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Tip</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Gidiş Adet</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Gidiş KG</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Dönüş Adet</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Dönüş KG</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Fark (Adet)</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Fark (KG)</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {urunler.map((urun) => (
                  <TableRow key={urun.id}>
                    <TableCell>{urun.urun_kodu}</TableCell>
                    <TableCell>{urun.tip}</TableCell>
                    <TableCell>{urun.gidis_adet}</TableCell>
                    <TableCell>{urun.gidis_kg || '-'}</TableCell>
                    <TableCell>{urun.donus_adet || 0}</TableCell>
                    <TableCell>{urun.donus_kg || '-'}</TableCell>
                    <TableCell style={{ color: urun.adet_farki < 0 ? 'red' : 'inherit' }}>
                      {urun.adet_farki || 0}
                    </TableCell>
                    <TableCell style={{ color: urun.kg_farki < 0 ? 'red' : 'inherit' }}>
                      {urun.kg_farki || 0}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        {/* Kalite Kontrol Geçmişi */}
        {kaliteGecmis && kaliteGecmis.length > 0 && (
          <Paper sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6" gutterBottom>✅ Kalite Kontrol Geçmişi</Typography>
            <Timeline>
              {kaliteGecmis.map((log, index) => (
                <TimelineItem key={log.id}>
                  <TimelineOppositeContent color="text.secondary">
                    {formatDate(log.karar_tarihi)}
                  </TimelineOppositeContent>
                  <TimelineSeparator>
                    <TimelineDot
                      color={
                        log.karar === 'kabul' ? 'success' :
                        log.karar === 'red' ? 'error' :
                        'secondary'
                      }
                    >
                      {log.karar === 'kabul' ? <CheckIcon /> :
                       log.karar === 'red' ? <CancelIcon /> :
                       <LoopIcon />}
                    </TimelineDot>
                    {index < kaliteGecmis.length - 1 && <TimelineConnector />}
                  </TimelineSeparator>
                  <TimelineContent>
                    <Typography variant="subtitle2">
                      Karar: <strong>{log.karar}</strong>
                    </Typography>
                    <Typography variant="body2">Karar Veren: {log.karar_veren}</Typography>
                    <Typography variant="body2">
                      Hata Oranı: {log.hata_orani}% ({log.hata_tespit_edilen_adet}/{log.kontrol_edilen_adet})
                    </Typography>
                    {log.aciklama && (
                      <Typography variant="body2" color="text.secondary">
                        {log.aciklama}
                      </Typography>
                    )}
                  </TimelineContent>
                </TimelineItem>
              ))}
            </Timeline>
          </Paper>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2, bgcolor: '#f5f5f5', gap: 1 }}>
        <Box sx={{ flex: 1 }} />

        {/* Dönüş Kaydet Butonu (sadece gönderildi/temizlemede durumunda) */}
        {['gonderildi', 'temizlemede'].includes(partiInfo.durum) && !partiInfo.donus_tarihi && (
          <Button
            variant="contained"
            color="success"
            startIcon={<SendIcon />}
            onClick={() => setDonusModalOpen(true)}
          >
            Dönüş Kaydet
          </Button>
        )}

        {/* Kalite Kontrol Butonu (sadece kalite_kontrol durumunda) */}
        {partiInfo.durum === 'kalite_kontrol' && (
          <Button
            variant="contained"
            color="info"
            startIcon={<CheckIcon />}
            onClick={() => setKaliteModalOpen(true)}
          >
            Kalite Kontrol Yap
          </Button>
        )}

        <Button onClick={onClose}>Kapat</Button>
      </DialogActions>

      {/* Dönüş Modal */}
      <PartiDonusModal
        open={donusModalOpen}
        onClose={() => setDonusModalOpen(false)}
        parti={partiInfo}
        urunler={urunler}
        onSuccess={() => {
          setDonusModalOpen(false);
          fetchDetay();
          onRefresh();
        }}
      />

      {/* Kalite Kontrol Modal */}
      <KaliteKontrolModal
        open={kaliteModalOpen}
        onClose={() => setKaliteModalOpen(false)}
        parti={partiInfo}
        urunler={urunler}
        onSuccess={() => {
          setKaliteModalOpen(false);
          fetchDetay();
          onRefresh();
        }}
      />
    </Dialog>
  );
}

export default PartiDetayModal;
