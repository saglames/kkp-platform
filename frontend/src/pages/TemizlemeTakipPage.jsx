import React, { useState } from 'react';
import { Box, Tabs, Tab, Typography, Paper } from '@mui/material';
import PartiListesi from '../components/TemizlemeTakip/PartiListesi';
import KaliteKontrolTab from '../components/TemizlemeTakip/KaliteKontrolTab';
import RaporlarTab from '../components/TemizlemeTakip/RaporlarTab';

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`temizleme-takip-tabpanel-${index}`}
      aria-labelledby={`temizleme-takip-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function TemizlemeTakipPage() {
  const [currentTab, setCurrentTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: '#1976d2', mb: 3 }}>
        🧹 Temizleme Takip Sistemi
      </Typography>

      <Paper sx={{ width: '100%' }}>
        <Tabs
          value={currentTab}
          onChange={handleTabChange}
          aria-label="temizleme takip tabs"
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            '& .MuiTab-root': { fontWeight: 'bold' }
          }}
        >
          <Tab label="📋 Parti Listesi" />
          <Tab label="✅ Kalite Kontrol" />
          <Tab label="📊 Raporlar" />
        </Tabs>

        <TabPanel value={currentTab} index={0}>
          <PartiListesi />
        </TabPanel>

        <TabPanel value={currentTab} index={1}>
          <KaliteKontrolTab />
        </TabPanel>

        <TabPanel value={currentTab} index={2}>
          <RaporlarTab />
        </TabPanel>
      </Paper>
    </Box>
  );
}

export default TemizlemeTakipPage;
