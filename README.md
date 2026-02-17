# ✈️ Vuelos Baratos

Buscador y comparador de vuelos baratos. Compara precios en tiempo real entre múltiples aerolíneas usando las APIs de **Amadeus** y **Kiwi**, con alertas de precio por email, historial de precios y calendario de fechas flexibles.

![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-4.x-000000?logo=express&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-8.x-4479A1?logo=mysql&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-blue)

---

## 📸 Características

- **Búsqueda de vuelos** — Compara precios de Amadeus y Kiwi en una sola búsqueda
- **Alertas de precio** — Recibe un email cuando el precio baje de tu objetivo
- **Historial de precios** — Gráficas con la evolución del precio de una ruta
- **Fechas flexibles** — Calendario visual con el precio más barato por día
- **Autocompletado** — Busca aeropuertos por ciudad, nombre o código IATA
- **Cache inteligente** — Dos niveles (memoria + BD) para respuestas rápidas
- **Rate limiting** — Control de cuota por provider y protección de la API

---

## 🛠️ Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| Frontend | JavaScript Vanilla + HTML + CSS |
| Backend | Node.js + Express.js |
| Base de datos | MySQL + Sequelize ORM |
| Cache | node-cache (memoria) + MySQL (persistente) |
| Jobs | node-cron (tareas programadas) |
| Email | Nodemailer |
| Gráficas | Chart.js |
| Validación | express-validator |
| Auth | JWT + bcrypt |

### APIs de vuelos
- **[Amadeus for Developers](https://developers.amadeus.com/)** — API primaria (~2000 llamadas/mes gratis)
- **[Kiwi.com Tequila](https://tequila.kiwi.com/)** — API secundaria (tier gratuito)

---

## 📁 Estructura del Proyecto

```
├── server.js                    # Entry point Express
├── config/
│   ├── database.js              # Conexión MySQL con Sequelize
│   └── auth.js                  # Configuración JWT
├── models/                      # Modelos Sequelize
│   ├── User.js
│   ├── Alert.js
│   ├── PriceHistory.js
│   ├── SearchCache.js
│   ├── Airport.js
│   └── ApiUsage.js
├── providers/                   # Adaptadores de APIs de vuelos
│   ├── amadeus.provider.js
│   ├── kiwi.provider.js
│   ├── aggregator.js            # Combina y deduplica resultados
│   └── rate-limiter.js          # Control de cuota por provider
├── services/                    # Lógica de negocio
│   ├── search.service.js        # Búsqueda con cache + providers
│   ├── alert.service.js         # CRUD alertas + verificación
│   ├── price-tracker.service.js # Historial de precios
│   └── notification.service.js  # Envío de emails
├── routes/                      # Rutas Express
├── controllers/                 # Lógica de cada ruta
├── middleware/                   # Auth JWT, validación, rate limiting
├── jobs/                        # Tareas programadas (node-cron)
│   ├── check-alerts.job.js      # Verifica alertas cada 4 horas
│   └── cleanup-cache.job.js     # Limpia cache expirado cada hora
├── public/                      # Frontend estático
│   ├── index.html               # Página principal + buscador
│   ├── search.html              # Resultados de búsqueda
│   ├── alerts.html              # Dashboard de alertas
│   ├── flexible.html            # Calendario fechas flexibles
│   ├── login.html               # Login / Registro
│   ├── css/
│   └── js/
├── scripts/
│   ├── migrate.js               # Crear/actualizar tablas
│   └── seed-airports.js         # Cargar 55 aeropuertos
└── tests/                       # Tests con Jest
```

---

## 🚀 Instalación

### Requisitos previos
- **Node.js** >= 18
- **MySQL** >= 8.0
- Cuentas gratuitas en [Amadeus](https://developers.amadeus.com/) y/o [Kiwi Tequila](https://tequila.kiwi.com/)

### 1. Clonar el repositorio

```bash
git clone https://github.com/EnriqueGoCe/vuelos-baratos.git
cd vuelos-baratos
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

```bash
cp .env.example .env
```

Edita `.env` con tus credenciales:

```env
# Base de datos
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_password
DB_NAME=vuelos_baratos
DB_PORT=3306

# APIs de vuelos
AMADEUS_CLIENT_ID=tu_client_id
AMADEUS_CLIENT_SECRET=tu_client_secret
KIWI_API_KEY=tu_kiwi_key

# JWT
JWT_SECRET=tu_secret_seguro

# Email (opcional, para alertas)
SMTP_HOST=smtp.tu-servidor.com
SMTP_PORT=465
SMTP_USER=alertas@tudominio.com
SMTP_PASS=tu_password
```

### 4. Crear la base de datos

Crea la base de datos en MySQL:

```sql
CREATE DATABASE vuelos_baratos CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 5. Ejecutar migraciones y seed

```bash
npm run migrate
npm run seed
```

### 6. Iniciar el servidor

```bash
# Desarrollo (con hot reload)
npm run dev

# Producción
npm start
```

Abre **http://localhost:3000** en tu navegador.

---

## 📡 API Endpoints

### Búsqueda
| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/api/search?origin=MAD&destination=BCN&departureDate=2026-03-15` | Buscar vuelos |
| `GET` | `/api/flexible?origin=MAD&destination=BCN` | Precios por fecha |
| `GET` | `/api/airports/search?q=madrid` | Autocompletado aeropuertos |
| `GET` | `/api/prices/history?origin=MAD&destination=BCN&departureDate=2026-03-15` | Historial de precios |

### Autenticación
| Método | Ruta | Descripción |
|--------|------|-------------|
| `POST` | `/api/auth/register` | Registro `{email, name, password}` |
| `POST` | `/api/auth/login` | Login `{email, password}` |
| `GET` | `/api/auth/profile` | Perfil (requiere JWT) |

### Alertas (requieren JWT)
| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/api/alerts` | Listar mis alertas |
| `POST` | `/api/alerts` | Crear alerta |
| `PUT` | `/api/alerts/:id` | Actualizar alerta |
| `DELETE` | `/api/alerts/:id` | Eliminar alerta |

---

## 🧪 Tests

```bash
npm test
```

Ejecuta los tests unitarios con Jest para providers (Amadeus, Kiwi, Aggregator) y services (Search, Alerts).

---

## 🌐 Despliegue en Hostinger

Hostinger Business incluye Node.js y MySQL, compatible al 100% con este stack.

1. Crear base de datos MySQL desde **hPanel**
2. Subir proyecto vía **Git + SSH** o File Manager
3. Configurar `.env` en el servidor con las credenciales de producción
4. Configurar Node.js desde hPanel (entry point: `server.js`)
5. Ejecutar vía SSH:
   ```bash
   npm install
   npm run migrate
   npm run seed
   ```
6. El servidor queda corriendo con node-cron verificando alertas automáticamente

---

## 📄 Licencia

MIT
