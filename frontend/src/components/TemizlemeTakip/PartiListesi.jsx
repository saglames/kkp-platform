import React, { useState, useEffect } from 'react';
import {
  Box, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Chip, TextField, MenuItem, Select, FormControl, InputLabel,
  IconButton, Tooltip, CircularProgress, Alert, Typography
} from '@mui/material';
import { Add as AddIcon, Visibility as ViewIcon, Delete as DeleteIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import { temizlemeTakipAPI } from '../../services/api';
import PartiOlusturModal from './PartiOlusturModal';
import PartiDetayModal from './PartiDetayModal';

function PartiListesi() {
  const [partiler, setPartiler] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    durum: '',
    parti_no: ''
  });
  const [olusturModalOpen, setOlusturModalOpen] = useState(false);
  const [detayModalOpen, setDetayModalOpen] = useState(false);
  const [selectedParti, setSelectedParti] = useState(null);

  useEffect(() => {
    fetchPartiler();

    // Eğer localStorage'da ön seçili ürünler varsa modal'ı otomatik aç
    const savedItems = localStorage.getItem('parti_urunler');
    if (savedItems) {
      setOlusturModalOpen(true);
    }
  }, [filters]);

  const fetchPartiler = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (filters.durum) params.durum = filters.durum;
      if (filters.parti_no) params.parti_no = filters.parti_no;

      const data = await temizlemeTakipAPI.getPartiler(params);
      setPartiler(data);
    } catch (err) {
      console.error('Parti listesi yüklenirken hata:', err);
      setError(err.response?.data?.error || 'Parti listesi yüklenemedi!');
    } finally {
      setLoading(false);
    }
  };

  const handleViewParti = (parti) => {
    setSelectedParti(parti);
    setDetayModalOpen(true);
  };

  const handleDeleteParti = async (id) => {
    if (!window.confirm('Bu partiyi silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      await temizlemeTakipAPI.deleteParti(id);
      alert('Parti silindi!');
      fetchPartiler();
    } catch (err) {
      console.error('Parti silme hatası:', err);
      alert(err.response?.data?.error || 'Parti silinemedi!');
    }
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

  const getDurumLabel = (durum) => {
    const labels = {
      'gonderildi': 'Gönderildi',
      'temizlemede': 'Temizlemede',
      'kalite_kontrol': 'Kalite Kontrol',
      'kabul': 'Kabul',
      'red': 'Red',
      'tekrar_temizlik': 'Tekrar Temizlik'
    };
    return labels[durum] || durum;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('tr-TR');
  };

  return (
    <Box>
      {/* Filtreler ve Butonlar */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap', alignItems: 'center' }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOlusturModalOpen(true)}
          sx={{ fontWeight: 'bold' }}
        >
          Yeni Parti Oluştur
        </Button>

        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Durum</InputLabel>
          <Select
            value={filters.durum}
            label="Durum"
            onChange={(e) => setFilters({ ...filters, durum: e.target.value })}
          >
            <MenuItem value="">Tümü</MenuItem>
            <MenuItem value="gonderildi">Gönderildi</MenuItem>
            <MenuItem value="temizlemede">Temizlemede</MenuItem>
            <MenuItem value="kalite_kontrol">Kalite Kontrol</MenuItem>
            <MenuItem value="kabul">Kabul</MenuItem>
            <MenuItem value="red">Red</MenuItem>
            <MenuItem value="tekrar_temizlik">Tekrar Temizlik</MenuItem>
          </Select>
        </FormControl>

        <TextField
          label="Parti No"
          value={filters.parti_no}
          onChange={(e) => setFilters({ ...filters, parti_no: e.target.value })}
          sx={{ minWidth: 200 }}
        />

        <Tooltip title="Yenile">
          <IconButton onClick={fetchPartiler} color="primary">
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Hata Mesajı */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Loading */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Parti Listesi Tablosu */}
      {!loading && (
        <TableContainer component={Paper} sx={{ maxHeight: 600 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>Parti No</TableCell>
                <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>İrsaliye No</TableCell>
                <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>Gidiş Tarihi</TableCell>
                <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>Gidiş (Adet/KG)</TableCell>
                <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>Dönüş Tarihi</TableCell>
                <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>Dönüş (Adet/KG)</TableCell>
                <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>Durum</TableCell>
                <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>İşlemler</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {partiler.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">Parti bulunamadı</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                partiler.map((parti) => (
                  <TableRow key={parti.id} hover>
                    <TableCell>{parti.parti_no}</TableCell>
                    <TableCell>{parti.irsaliye_no || '-'}</TableCell>
                    <TableCell>{formatDate(parti.gidis_tarihi)}</TableCell>
                    <TableCell>
                      {parti.gidis_adet} adet / {parti.gidis_kg ? `${parti.gidis_kg} kg` : '-'}
                    </TableCell>
                    <TableCell>{formatDate(parti.donus_tarihi)}</TableCell>
                    <TableCell>
                      {parti.donus_adet || 0} adet / {parti.donus_kg ? `${parti.donus_kg} kg` : '-'}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getDurumLabel(parti.durum)}
                        color={getDurumColor(parti.durum)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Tooltip title="Detayları Gör">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleViewParti(parti)}
                        >
                          <ViewIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Sil">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDeleteParti(parti.id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Modaller */}
      <PartiOlusturModal
        open={olusturModalOpen}
        onClose={() => setOlusturModalOpen(false)}
        onSuccess={() => {
          setOlusturModalOpen(false);
          fetchPartiler();
        }}
      />

      {selectedParti && (
        <PartiDetayModal
          open={detayModalOpen}
          onClose={() => {
            setDetayModalOpen(false);
            setSelectedParti(null);
          }}
          parti={selectedParti}
          onRefresh={fetchPartiler}
        />
      )}
    </Box>
  );
}

export default PartiListesi;
