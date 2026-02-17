require('dotenv').config();
const { sequelize, Airport } = require('../models');

// Aeropuertos principales de Europa y Latinoamerica
const airports = [
  // Espana
  { iata_code: 'MAD', name: 'Adolfo Suarez Madrid-Barajas', city: 'Madrid', country: 'Espana', country_code: 'ES' },
  { iata_code: 'BCN', name: 'Josep Tarradellas Barcelona-El Prat', city: 'Barcelona', country: 'Espana', country_code: 'ES' },
  { iata_code: 'PMI', name: 'Palma de Mallorca', city: 'Palma de Mallorca', country: 'Espana', country_code: 'ES' },
  { iata_code: 'AGP', name: 'Malaga-Costa del Sol', city: 'Malaga', country: 'Espana', country_code: 'ES' },
  { iata_code: 'ALC', name: 'Alicante-Elche', city: 'Alicante', country: 'Espana', country_code: 'ES' },
  { iata_code: 'SVQ', name: 'Sevilla-San Pablo', city: 'Sevilla', country: 'Espana', country_code: 'ES' },
  { iata_code: 'VLC', name: 'Valencia', city: 'Valencia', country: 'Espana', country_code: 'ES' },
  { iata_code: 'BIO', name: 'Bilbao', city: 'Bilbao', country: 'Espana', country_code: 'ES' },
  { iata_code: 'TFS', name: 'Tenerife Sur', city: 'Tenerife', country: 'Espana', country_code: 'ES' },
  { iata_code: 'LPA', name: 'Gran Canaria', city: 'Las Palmas', country: 'Espana', country_code: 'ES' },
  { iata_code: 'IBZ', name: 'Ibiza', city: 'Ibiza', country: 'Espana', country_code: 'ES' },
  { iata_code: 'SCQ', name: 'Santiago de Compostela', city: 'Santiago', country: 'Espana', country_code: 'ES' },

  // Europa principal
  { iata_code: 'LHR', name: 'London Heathrow', city: 'Londres', country: 'Reino Unido', country_code: 'GB' },
  { iata_code: 'LGW', name: 'London Gatwick', city: 'Londres', country: 'Reino Unido', country_code: 'GB' },
  { iata_code: 'STN', name: 'London Stansted', city: 'Londres', country: 'Reino Unido', country_code: 'GB' },
  { iata_code: 'CDG', name: 'Charles de Gaulle', city: 'Paris', country: 'Francia', country_code: 'FR' },
  { iata_code: 'ORY', name: 'Paris Orly', city: 'Paris', country: 'Francia', country_code: 'FR' },
  { iata_code: 'FRA', name: 'Frankfurt am Main', city: 'Frankfurt', country: 'Alemania', country_code: 'DE' },
  { iata_code: 'MUC', name: 'Munich Franz Josef Strauss', city: 'Munich', country: 'Alemania', country_code: 'DE' },
  { iata_code: 'BER', name: 'Berlin Brandenburg', city: 'Berlin', country: 'Alemania', country_code: 'DE' },
  { iata_code: 'AMS', name: 'Amsterdam Schiphol', city: 'Amsterdam', country: 'Paises Bajos', country_code: 'NL' },
  { iata_code: 'FCO', name: 'Leonardo da Vinci-Fiumicino', city: 'Roma', country: 'Italia', country_code: 'IT' },
  { iata_code: 'MXP', name: 'Milan Malpensa', city: 'Milan', country: 'Italia', country_code: 'IT' },
  { iata_code: 'LIS', name: 'Humberto Delgado', city: 'Lisboa', country: 'Portugal', country_code: 'PT' },
  { iata_code: 'OPO', name: 'Francisco Sa Carneiro', city: 'Oporto', country: 'Portugal', country_code: 'PT' },
  { iata_code: 'BRU', name: 'Brussels Airport', city: 'Bruselas', country: 'Belgica', country_code: 'BE' },
  { iata_code: 'ZRH', name: 'Zurich Airport', city: 'Zurich', country: 'Suiza', country_code: 'CH' },
  { iata_code: 'VIE', name: 'Vienna International', city: 'Viena', country: 'Austria', country_code: 'AT' },
  { iata_code: 'CPH', name: 'Copenhagen Kastrup', city: 'Copenhague', country: 'Dinamarca', country_code: 'DK' },
  { iata_code: 'OSL', name: 'Oslo Gardermoen', city: 'Oslo', country: 'Noruega', country_code: 'NO' },
  { iata_code: 'ARN', name: 'Stockholm Arlanda', city: 'Estocolmo', country: 'Suecia', country_code: 'SE' },
  { iata_code: 'HEL', name: 'Helsinki-Vantaa', city: 'Helsinki', country: 'Finlandia', country_code: 'FI' },
  { iata_code: 'DUB', name: 'Dublin Airport', city: 'Dublin', country: 'Irlanda', country_code: 'IE' },
  { iata_code: 'ATH', name: 'Athens Eleftherios Venizelos', city: 'Atenas', country: 'Grecia', country_code: 'GR' },
  { iata_code: 'IST', name: 'Istanbul Airport', city: 'Estambul', country: 'Turquia', country_code: 'TR' },
  { iata_code: 'WAW', name: 'Warsaw Chopin', city: 'Varsovia', country: 'Polonia', country_code: 'PL' },
  { iata_code: 'PRG', name: 'Vaclav Havel Prague', city: 'Praga', country: 'Republica Checa', country_code: 'CZ' },
  { iata_code: 'BUD', name: 'Budapest Ferenc Liszt', city: 'Budapest', country: 'Hungria', country_code: 'HU' },
  { iata_code: 'OTP', name: 'Bucharest Henri Coanda', city: 'Bucarest', country: 'Rumania', country_code: 'RO' },

  // Americas
  { iata_code: 'JFK', name: 'John F. Kennedy International', city: 'Nueva York', country: 'Estados Unidos', country_code: 'US' },
  { iata_code: 'LAX', name: 'Los Angeles International', city: 'Los Angeles', country: 'Estados Unidos', country_code: 'US' },
  { iata_code: 'MIA', name: 'Miami International', city: 'Miami', country: 'Estados Unidos', country_code: 'US' },
  { iata_code: 'MEX', name: 'Benito Juarez International', city: 'Ciudad de Mexico', country: 'Mexico', country_code: 'MX' },
  { iata_code: 'CUN', name: 'Cancun International', city: 'Cancun', country: 'Mexico', country_code: 'MX' },
  { iata_code: 'BOG', name: 'El Dorado International', city: 'Bogota', country: 'Colombia', country_code: 'CO' },
  { iata_code: 'LIM', name: 'Jorge Chavez International', city: 'Lima', country: 'Peru', country_code: 'PE' },
  { iata_code: 'GRU', name: 'Guarulhos International', city: 'Sao Paulo', country: 'Brasil', country_code: 'BR' },
  { iata_code: 'EZE', name: 'Ministro Pistarini (Ezeiza)', city: 'Buenos Aires', country: 'Argentina', country_code: 'AR' },
  { iata_code: 'SCL', name: 'Arturo Merino Benitez', city: 'Santiago', country: 'Chile', country_code: 'CL' },
  { iata_code: 'HAV', name: 'Jose Marti International', city: 'La Habana', country: 'Cuba', country_code: 'CU' },
  { iata_code: 'PTY', name: 'Tocumen International', city: 'Ciudad de Panama', country: 'Panama', country_code: 'PA' },
  { iata_code: 'SJO', name: 'Juan Santamaria International', city: 'San Jose', country: 'Costa Rica', country_code: 'CR' },

  // Africa / Oriente Medio
  { iata_code: 'CMN', name: 'Mohammed V International', city: 'Casablanca', country: 'Marruecos', country_code: 'MA' },
  { iata_code: 'RAK', name: 'Marrakech Menara', city: 'Marrakech', country: 'Marruecos', country_code: 'MA' },
  { iata_code: 'DXB', name: 'Dubai International', city: 'Dubai', country: 'Emiratos Arabes', country_code: 'AE' },
  { iata_code: 'DOH', name: 'Hamad International', city: 'Doha', country: 'Catar', country_code: 'QA' },

  // Asia
  { iata_code: 'NRT', name: 'Narita International', city: 'Tokio', country: 'Japon', country_code: 'JP' },
  { iata_code: 'BKK', name: 'Suvarnabhumi Airport', city: 'Bangkok', country: 'Tailandia', country_code: 'TH' },
  { iata_code: 'SIN', name: 'Singapore Changi', city: 'Singapur', country: 'Singapur', country_code: 'SG' }
];

async function seed() {
  try {
    console.log('Conectando a MySQL...');
    await sequelize.authenticate();

    console.log('Sincronizando modelo Airport...');
    await Airport.sync({ force: true });

    console.log(`Insertando ${airports.length} aeropuertos...`);
    await Airport.bulkCreate(airports, { ignoreDuplicates: true });

    console.log('Seed de aeropuertos completado exitosamente');
    process.exit(0);
  } catch (error) {
    console.error('Error en seed:', error);
    process.exit(1);
  }
}

seed();
