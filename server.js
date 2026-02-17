require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

const { sequelize } = require('./models');
const authRoutes = require('./routes/auth.routes');
const searchRoutes = require('./routes/search.routes');
const alertsRoutes = require('./routes/alerts.routes');
const pricesRoutes = require('./routes/prices.routes');
const flexibleRoutes = require('./routes/flexible.routes');
const airportsRoutes = require('./routes/airports.routes');
const { startAlertJob } = require('./jobs/check-alerts.job');
const { startCleanupJob } = require('./jobs/cleanup-cache.job');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares globales
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Archivos estaticos
app.use(express.static(path.join(__dirname, 'public')));

// Rutas API
app.use('/api/auth', authRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/alerts', alertsRoutes);
app.use('/api/prices', pricesRoutes);
app.use('/api/flexible', flexibleRoutes);
app.use('/api/airports', airportsRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// SPA fallback - servir index.html para rutas no-API
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  } else {
    res.status(404).json({ error: 'Endpoint no encontrado' });
  }
});

// Manejo global de errores
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production'
      ? 'Error interno del servidor'
      : err.message
  });
});

// Iniciar servidor
async function start() {
  try {
    await sequelize.authenticate();
    console.log('MySQL conectado correctamente');

    await sequelize.sync({ alter: process.env.NODE_ENV === 'development' });
    console.log('Modelos sincronizados');

    // Iniciar jobs programados
    startAlertJob();
    startCleanupJob();

    app.listen(PORT, () => {
      console.log(`Servidor corriendo en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Error al iniciar el servidor:', error);
    process.exit(1);
  }
}

start();

module.exports = app;
