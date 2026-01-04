import React, { useState, useEffect } from 'react';
import {
  Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Chip, Button, CircularProgress, Alert, Typography
} from '@mui/material';
import { CheckCircle as CheckCircleIcon } from '@mui/icons-material';
import { temizlemeTakipAPI } from '../../services/api';
import KaliteKontrolModal from './KaliteKontrolModal';

function KaliteKontrolTab() {
  const [partiler, setPartiler] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedParti, setSelectedParti] = useState(null);
  const [kaliteModalOpen, setKaliteModalOpen] = useState(false);
  const [selectedPartiUrunler, setSelectedPartiUrunler] = useState([]);

  useEffect(() => {
    fetchKaliteKontrolPartiler();
  }, []);

  const fetchKaliteKontrolPartiler = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await temizlemeTakipAPI.getPartiler({ durum: 'kalite_kontrol' });
      setPartiler(data);
    } catch (err) {
      console.error('Kalite kontrol partileri yüklenirken hata:', err);
      setError(err.response?.data?.error || 'Kalite kontrol partileri yüklenemedi!');
    } finally {
      setLoading(false);
    }
  };

  const handleKaliteKontrol = async (parti) => {
    try {
      // Parti ürünlerini çek
      const partiDetay = await temizlemeTakipAPI.getParti(parti.id);
      setSelectedParti(parti);
      setSelectedPartiUrunler(partiDetay.urunler || []);
      setKaliteModalOpen(true);
    } catch (err) {
      console.error('Parti ürünleri yüklenirken hata:', err);
      alert('Parti detayları yüklenemedi!');
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('tr-TR');
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">
          Kalite Kontrole Bekleyen Partiler ({partiler.length})
        </Typography>
        <Button
          variant="outlined"
          onClick={fetchKaliteKontrolPartiler}
        >
          Yenile
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>Parti No</TableCell>
              <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>İrsaliye No</TableCell>
              <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>Gidiş Tarihi</TableCell>
              <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>Dönüş Tarihi</TableCell>
              <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>Dönüş Adet</TableCell>
              <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>Dönüş KG</TableCell>
              <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>İşlem</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {partiler.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">
                    Kalite kontrole bekleyen parti bulunamadı
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              partiler.map((parti) => (
                <TableRow key={parti.id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {parti.parti_no}
                      {parti.tekrar_temizlik_sayisi > 0 && (
                        <Chip
                          label={`T${parti.tekrar_temizlik_sayisi}`}
                          size="small"
                          color="secondary"
                        />
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>{parti.irsaliye_no || '-'}</TableCell>
                  <TableCell>{formatDate(parti.gidis_tarihi)}</TableCell>
                  <TableCell>{formatDate(parti.donus_tarihi)}</TableCell>
                  <TableCell>{parti.donus_adet || 0}</TableCell>
                  <TableCell>{parti.donus_kg || 0} kg</TableCell>
                  <TableCell>
                    <Button
                      variant="contained"
                      color="success"
                      size="small"
                      startIcon={<CheckCircleIcon />}
                      onClick={() => handleKaliteKontrol(parti)}
                    >
                      Kalite Kontrol
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Kalite Kontrol Modal */}
      {selectedParti && (
        <KaliteKontrolModal
          open={kaliteModalOpen}
          onClose={() => {
            setKaliteModalOpen(false);
            setSelectedParti(null);
            setSelectedPartiUrunler([]);
          }}
          parti={selectedParti}
          urunler={selectedPartiUrunler}
          onSuccess={() => {
            setKaliteModalOpen(false);
            setSelectedParti(null);
            setSelectedPartiUrunler([]);
            fetchKaliteKontrolPartiler();
          }}
        />
      )}
    </Box>
  );
}

export default KaliteKontrolTab;
