require("dotenv").config();
const express = require("express");
const mysql = require("mysql2/promise"); // Usamos la versión con promesas
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 5000;
const SECRET_KEY = "tu_clave_secreta"; // Usa una clave fuerte en producción

// Configuración de conexión a MySQL
const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "12345",
  database: "poke_store",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Verificar que el pool esté funcionando
db.getConnection()
  .then((connection) => {
    console.log("🟢 Conectado a MySQL - Base de datos poke_store");
    connection.release(); // Liberar la conexión de vuelta al pool
  })
  .catch((err) => {
    console.error("Error al conectar a la base de datos:", err);
  });

// Ruta de registro de usuario
app.post("/api/register", async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Encriptar la contraseña
    const hashedPassword = bcrypt.hashSync(password, 10);

    const sql = "INSERT INTO users (name, email, password) VALUES (?, ?, ?)";
    await db.query(sql, [name, email, hashedPassword]);

    res.json({ message: "Usuario registrado correctamente" });
  } catch (err) {
    console.error("Error al registrar usuario:", err);
    res.status(500).json({ error: "Error en el servidor" });
  }
});

// Ruta de inicio de sesión
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Correo y contraseña son obligatorios" });
  }

  try {
    const sql = "SELECT * FROM users WHERE email = ?";
    const [results] = await db.query(sql, [email]);

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

    res.json({ message: "Inicio de sesión exitoso", token, user });
  } catch (err) {
    console.error("Error en la consulta:", err);
    res.status(500).json({ error: "Error en el servidor" });
  }
});

// Ruta para agregar un Pokémon al carrito
app.post("/api/cart", async (req, res) => {
  const { email, name, price, image } = req.body;

  if (!email || !name || !price || !image) {
    return res.status(400).json({ error: "Todos los campos son obligatorios" });
  }

  try {
    // Verificar si el Pokémon ya está en el carrito
    const checkSql = "SELECT * FROM cart_items WHERE user_email = ? AND pokemon_name = ?";
    const [results] = await db.query(checkSql, [email, name]);

    if (results.length > 0) {
      // Si ya existe, incrementar la cantidad
      const updateSql = "UPDATE cart_items SET quantity = quantity + 1 WHERE user_email = ? AND pokemon_name = ?";
      await db.query(updateSql, [email, name]);

      return res.json({ message: "Cantidad actualizada en el carrito" });
    } else {
      // Si no existe, insertar nuevo
      const insertSql = "INSERT INTO cart_items (user_email, pokemon_name, pokemon_image, price, quantity) VALUES (?, ?, ?, ?, 1)";
      const [result] = await db.query(insertSql, [email, name, image, price]);

      res.json({ message: "Pokémon agregado al carrito", insertedId: result.insertId });
    }
  } catch (err) {
    console.error("Error al agregar al carrito:", err);
    res.status(500).json({ error: "Error en el servidor" });
  }
});

// Ruta para obtener el carrito de un usuario
app.get("/api/cart", async (req, res) => {
  const email = req.query.email;
  if (!email) {
    return res.status(400).json({ error: "Falta el email" });
  }

  try {
    const sql = "SELECT * FROM cart_items WHERE user_email = ?";
    const [results] = await db.query(sql, [email]);

    res.json(results);
  } catch (err) {
    console.error("Error al obtener el carrito:", err);
    res.status(500).json({ error: "Error en el servidor" });
  }
});

// Ruta para actualizar la cantidad de un ítem en el carrito
app.put("/api/cart/update-quantity", async (req, res) => {
  const { email, itemId, newQuantity } = req.body;

  try {
    const query = `
      UPDATE cart_items
      SET quantity = ?
      WHERE id = ? AND user_email = ?;
    `;
    await db.query(query, [newQuantity, itemId, email]);

    res.status(200).json({ message: "Cantidad actualizada correctamente" });
  } catch (error) {
    console.error("Error al actualizar la cantidad", error);
    res.status(500).json({ error: "Error al actualizar la cantidad" });
  }
});

app.delete("/api/cart/remove-item", async (req, res) => {
  const { email, itemId } = req.body;

  try {
    const query = `
      DELETE FROM cart_items
      WHERE id = ? AND user_email = ?;
    `;
    await db.query(query, [itemId, email]);
    res.status(200).json({ message: "Ítem eliminado correctamente" });
  } catch (error) {
    console.error("Error al eliminar el ítem", error);
    res.status(500).json({ error: "Error al eliminar el ítem" });
  }
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});