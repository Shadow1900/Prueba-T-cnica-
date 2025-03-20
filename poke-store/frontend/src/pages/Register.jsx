import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Register = () => {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [pokemonImages, setPokemonImages] = useState([]); // Estado para las imágenes de Pokémon
  const [currentImageIndex, setCurrentImageIndex] = useState(0); // Estado para el índice de la imagen actual
  const navigate = useNavigate();

  // Función para obtener 20 Pokémon aleatorios
  const fetchRandomPokemon = async () => {
    try {
      const pokemonIds = Array.from({ length: 20 }, () => Math.floor(Math.random() * 898) + 1);
      const pokemonPromises = pokemonIds.map((id) =>
        axios.get(`https://pokeapi.co/api/v2/pokemon/${id}`)
      );
      const pokemonResponses = await Promise.all(pokemonPromises);
      const images = pokemonResponses.map((response) => response.data.sprites.front_default);
      setPokemonImages(images);
    } catch (error) {
      console.error("Error fetching Pokémon:", error);
    }
  };

  // Ejecutamos la función al cargar el componente
  useEffect(() => {
    fetchRandomPokemon();
  }, []);

  // Cambiar la imagen de fondo cada 5 segundos
  useEffect(() => {
    if (pokemonImages.length > 0) {
      const interval = setInterval(() => {
        setCurrentImageIndex((prevIndex) => (prevIndex + 1) % pokemonImages.length);
      }, 5000); // Cambia la imagen cada 5 segundos
      return () => clearInterval(interval);
    }
  }, [pokemonImages]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/api/register", form);
      alert("Usuario registrado con éxito");
      navigate("/login"); 
    } catch (error) {
      alert(error.response?.data?.error || "Error en el registro");
    }
  };

  return (
    <div
      style={{
        ...styles.container,
        backgroundImage: `url(${pokemonImages[currentImageIndex]})`,
      }}
    >
      <div style={styles.overlay}>
        <div style={styles.formContainer}>
          <h2 style={styles.title}>Registro</h2>
          <form onSubmit={handleSubmit} style={styles.form}>
            <input
              type="text"
              name="name"
              placeholder="Nombre"
              onChange={handleChange}
              style={styles.input}
            />
            <input
              type="email"
              name="email"
              placeholder="Correo"
              onChange={handleChange}
              style={styles.input}
            />
            <input
              type="password"
              name="password"
              placeholder="Contraseña"
              onChange={handleChange}
              style={styles.input}
            />
            <button type="submit" style={styles.button}>
              Registrarse
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    width: "100vw",
    backgroundSize: "cover",
    backgroundPosition: "center",
    transition: "background-image 1s ease-in-out", // Transición suave para el fondo
    animation: "fadeIn 1s ease-in-out", // Animación de aparición
  },
  overlay: {
    backgroundColor: "rgba(255, 255, 255, 0.8)", // Fondo semitransparente
    padding: "40px",
    borderRadius: "10px",
    textAlign: "center",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
  },
  formContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    maxWidth: "400px",
  },
  title: {
    fontSize: "2rem",
    color: "#ffcb05",
    textShadow: "2px 2px 0 #3c5aa6",
    marginBottom: "20px",
    animation: "bounce 1.5s infinite", // Animación de rebote
  },
  form: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    width: "100%",
  },
  input: {
    width: "100%",
    padding: "10px",
    margin: "10px 0",
    borderRadius: "5px",
    border: "2px solid #3c5aa6",
    fontSize: "1rem",
    outline: "none",
    transition: "transform 0.3s ease, box-shadow 0.3s ease",
  },
  inputFocus: {
    transform: "scale(1.05)",
    boxShadow: "0 0 8px rgba(60, 90, 166, 0.5)",
  },
  button: {
    width: "100%",
    padding: "10px 20px",
    marginTop: "10px",
    borderRadius: "5px",
    border: "none",
    backgroundColor: "#ffcb05",
    color: "#3c5aa6",
    fontSize: "1rem",
    fontWeight: "bold",
    cursor: "pointer",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
    transition: "background-color 0.3s ease, transform 0.3s ease",
    animation: "bounce 2s infinite", // Animación de rebote
  },
  buttonHover: {
    backgroundColor: "#ffdd57",
    transform: "scale(1.05)",
  },
};

// Definimos las animaciones con CSS
const animations = `
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(-20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes bounce {
    0%, 20%, 50%, 80%, 100% {
      transform: translateY(0);
    }
    40% {
      transform: translateY(-10px);
    }
    60% {
      transform: translateY(-5px);
    }
  }
`;

// Añadimos las animaciones al documento
const styleSheet = document.createElement("style");
styleSheet.type = "text/css";
styleSheet.innerText = animations;
document.head.appendChild(styleSheet);

export default Register;