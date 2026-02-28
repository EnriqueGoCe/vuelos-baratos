require('dotenv').config();
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { sequelize, Airport } = require('../models');

function parseCsvLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
      continue;
    }

    current += char;
  }

  result.push(current);
  return result;
}

async function flushBatch(batch) {
  if (batch.length === 0) return;

  await Airport.bulkCreate(batch, {
    updateOnDuplicate: ['name', 'city', 'country', 'country_code']
  });
  batch.length = 0;
}

async function importCsv(csvPath) {
  const absolutePath = path.resolve(csvPath);
  if (!fs.existsSync(absolutePath)) {
    throw new Error(`No existe el archivo: ${absolutePath}`);
  }

  console.log(`Leyendo CSV: ${absolutePath}`);
  await sequelize.authenticate();
  console.log('MySQL conectado');

  const stream = fs.createReadStream(absolutePath, { encoding: 'utf8' });
  const rl = readline.createInterface({ input: stream, crlfDelay: Infinity });

  let headers = [];
  const batch = [];
  let processed = 0;
  let imported = 0;

  for await (const line of rl) {
    if (!line.trim()) continue;

    if (headers.length === 0) {
      headers = parseCsvLine(line);
      continue;
    }

    processed += 1;
    const values = parseCsvLine(line);
    const row = {};

    for (let i = 0; i < headers.length; i += 1) {
      row[headers[i]] = values[i] || '';
    }

    const iata = (row.iata_code || '').trim().toUpperCase();
    const isoCountry = (row.iso_country || '').trim().toUpperCase();
    const name = (row.name || '').trim();
    const city = (row.municipality || '').trim() || name || 'Unknown';

    if (!/^[A-Z]{3}$/.test(iata)) continue;
    if (!/^[A-Z]{2}$/.test(isoCountry)) continue;
    if (!name) continue;

    batch.push({
      iata_code: iata,
      name: name.slice(0, 255),
      city: city.slice(0, 100),
      country: isoCountry,
      country_code: isoCountry
    });
    imported += 1;

    if (batch.length >= 1000) {
      await flushBatch(batch);
      process.stdout.write(`\rProcesadas: ${processed} | Candidatas IATA: ${imported}`);
    }
  }

  await flushBatch(batch);
  console.log(`\nImportacion terminada. Procesadas: ${processed} | Candidatas IATA: ${imported}`);
}

async function main() {
  const csvPath = process.argv[2];
  if (!csvPath) {
    console.error('Uso: node scripts/import-airports-csv.js <ruta-airports.csv>');
    process.exit(1);
  }

  try {
    await importCsv(csvPath);
    process.exit(0);
  } catch (error) {
    console.error('Error importando CSV:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { importCsv };
