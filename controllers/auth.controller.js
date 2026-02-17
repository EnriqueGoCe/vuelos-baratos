const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { jwtSecret, jwtExpiresIn, saltRounds } = require('../config/auth');

function generateToken(user) {
  return jwt.sign({ id: user.id, email: user.email }, jwtSecret, { expiresIn: jwtExpiresIn });
}

async function register(req, res) {
  try {
    const { email, name, password } = req.body;

    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(409).json({ error: 'Este email ya esta registrado' });
    }

    const password_hash = await bcrypt.hash(password, saltRounds);
    const user = await User.create({ email, name, password_hash });

    const token = generateToken(user);
    res.status(201).json({
      token,
      user: { id: user.id, email: user.email, name: user.name }
    });
  } catch (err) {
    console.error('Error en registro:', err);
    res.status(500).json({ error: 'Error al registrar usuario' });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    const token = generateToken(user);
    res.json({
      token,
      user: { id: user.id, email: user.email, name: user.name }
    });
  } catch (err) {
    console.error('Error en login:', err);
    res.status(500).json({ error: 'Error al iniciar sesion' });
  }
}

async function getProfile(req, res) {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ['id', 'email', 'name', 'created_at']
    });
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener perfil' });
  }
}

module.exports = { register, login, getProfile };
