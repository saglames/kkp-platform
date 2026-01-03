const { analyzeExcelFile } = require('../utils/excelAnalyzer');

async function main() {
  try {
    console.log('=== Kesim Ölçüleri Analizi ===\n');
    const kesimAnalysis = await analyzeExcelFile('C:/Users/ESAT/Desktop/1.xlsx');
    console.log(JSON.stringify(kesimAnalysis, null, 2));

    console.log('\n\n=== İş Emri Şablon Analizi (A.xlsx) ===\n');
    const templateAnalysis = await analyzeExcelFile('C:/Users/ESAT/Desktop/Yeni klasör/A.xlsx');
    console.log(JSON.stringify(templateAnalysis, null, 2));
  } catch (error) {
    console.error('Analiz hatası:', error.message);
  }
}

main();
