require('dotenv').config();
const { sequelize } = require('../models');

async function migrate() {
  try {
    console.log('Conectando a MySQL...');
    await sequelize.authenticate();
    console.log('Conexion exitosa');

    console.log('Sincronizando modelos...');
    await sequelize.sync({ alter: true });
    console.log('Migracion completada exitosamente');

    process.exit(0);
  } catch (error) {
    console.error('Error en migracion:', error);
    process.exit(1);
  }
}

migrate();
