const https = require('https');

function fetchData(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });
}

async function checkDuplicates() {
  try {
    console.log('Checking for duplicates in production...\n');

    const data = await fetchData('https://kkp-platform.onrender.com/api/tum-surec/temizlemeye-gidecek');

    console.log(`Total records: ${data.length}`);

    // Group by urun_id to check for duplicates
    const grouped = {};
    data.forEach(item => {
      if (!grouped[item.urun_id]) {
        grouped[item.urun_id] = [];
      }
      grouped[item.urun_id].push(item);
    });

    // Show duplicates
    let duplicateCount = 0;
    Object.entries(grouped).forEach(([urun_id, items]) => {
      if (items.length > 1) {
        duplicateCount++;
        console.log(`\nDuplicate urun_id ${urun_id}: ${items.length} records`);
        items.forEach(item => {
          console.log(`  - ID: ${item.id}, Adet: ${item.adet}, Ürün: ${item.urun_kodu}`);
        });
      }
    });

    if (duplicateCount === 0) {
      console.log('\n✅ No duplicates found!');
    } else {
      console.log(`\n⚠️ Found ${duplicateCount} products with duplicate records`);
    }

    // Show sample records
    console.log('\nFirst 5 records:');
    data.slice(0, 5).forEach((item, i) => {
      console.log(`${i+1}. ${item.urun_kodu} (ID: ${item.id}, urun_id: ${item.urun_id}) - Adet: ${item.adet}`);
    });

  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkDuplicates();
