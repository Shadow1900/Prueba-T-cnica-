require("dotenv").config();
const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 5000;
const SECRET_KEY = "tu_clave_secreta"; // Usa una clave fuerte en producción

// Configuración de conexión a MySQL
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "12345",
  database: "poke_store",
});

// Conectar a la base de datos
db.connect((err) => {
  if (err) {
    console.error("Error al conectar a la base de datos:", err);
    return;
  }
  console.log("🟢 Conectado a MySQL - Base de datos poke_store");
});

// Ruta de registro de usuario
app.post("/api/register", (req, res) => {
  const { name, email, password } = req.body;

  // Encriptar la contraseña
  const hashedPassword = bcrypt.hashSync(password, 10);

  const sql = "INSERT INTO users (name, email, password) VALUES (?, ?, ?)";
  db.query(sql, [name, email, hashedPassword], (err, result) => {
    if (err) {
      console.error("Error al registrar usuario:", err);
      return res.status(500).json({ error: "Error en el servidor" });
    }
    res.json({ message: "Usuario registrado correctamente" });
  });
});

// Ruta de inicio de sesión
app.post("/api/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Correo y contraseña son obligatorios" });
  }

  const sql = "SELECT * FROM users WHERE email = ?";
  db.query(sql, [email], (err, results) => {
    if (err) {
      console.error("Error en la consulta:", err);
      return res.status(500).json({ error: "Error en el servidor" });
    }

    if (results.length === 0) {
      return res.status(401).json({ error: "Usuario no encontrado" });
    }

    const user = results[0];

    // Verificar la contraseña con bcrypt
    const passwordMatch = bcrypt.compareSync(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: "Contraseña incorrecta" });
    }

    // Generar token JWT
    const token = jwt.sign({ id: user.id, email: user.email }, SECRET_KEY, {
      expiresIn: "1h",
    });
    console.log("Ejecutando consulta:", sql, [email]);

    res.json({ message: "Inicio de sesión exitoso", token, user });
  });
});

// Ruta para agregar un Pokémon al carrito
app.post("/api/cart", (req, res) => {
  const { email, name, price, image } = req.body;

  if (!email || !name || !price || !image) {
    return res.status(400).json({ error: "Todos los campos son obligatorios" });
  }

  // Verificar si el Pokémon ya está en el carrito
  const checkSql = "SELECT * FROM cart_items WHERE user_email = ? AND pokemon_name = ?";
  db.query(checkSql, [email, name], (err, results) => {
    if (err) {
      console.error("Error al verificar el carrito:", err);
      return res.status(500).json({ error: "Error en el servidor" });
    }

    if (results.length > 0) {
      // Si ya existe, incrementar la cantidad
      const updateSql = "UPDATE cart_items SET quantity = quantity + 1 WHERE user_email = ? AND pokemon_name = ?";
      db.query(updateSql, [email, name], (err, result) => {
        if (err) {
          console.error("Error al actualizar la cantidad:", err);
          return res.status(500).json({ error: "Error en el servidor" });
        }
        return res.json({ message: "Cantidad actualizada en el carrito" });
      });
    } else {
      // Si no existe, insertar nuevo (pokemon_id se autogenera)
      const insertSql = "INSERT INTO cart_items (user_email, pokemon_name, pokemon_image, price, quantity) VALUES (?, ?, ?, ?, 1)";
      db.query(insertSql, [email, name, image, price], (err, result) => {
        if (err) {
          console.error("Error al agregar al carrito:", err);
          return res.status(500).json({ error: "Error en el servidor" });
        }
        res.json({ message: "Pokémon agregado al carrito", insertedId: result.insertId });
      });
    }
  });
});



// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
