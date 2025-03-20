import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const Home = () => {
  const [pokemonImages, setPokemonImages] = useState([]); // Estado para las imágenes de Pokémon
  const [currentImageIndex, setCurrentImageIndex] = useState(0); // Estado para el índice de la imagen actual

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

  return (
    <div
      style={{
        ...styles.container,
        backgroundImage: `url(${pokemonImages[currentImageIndex]})`,
      }}
    >
      <div style={styles.overlay}>
        <h1 style={styles.title}>Bienvenido a la tienda de Pokémon</h1>
        <nav style={styles.nav}>
          <Link to="/register" style={styles.link}>
            Registrarse
          </Link>{" "}
          |{" "}
          <Link to="/login" style={styles.link}>
            Iniciar Sesión
          </Link>
        </nav>
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
  title: {
    fontSize: "2.5rem",
    color: "#3c5aa6",
    textShadow: "2px 2px 0 #ffcb05",
    marginBottom: "20px",
    animation: "bounce 1.5s infinite", // Animación de rebote
  },
  nav: {
    fontSize: "1.2rem",
  },
  link: {
    color: "#3c5aa6",
    textDecoration: "none",
    fontWeight: "bold",
    transition: "color 0.3s ease",
  },
  linkHover: {
    color: "#ffcb05",
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

export default Home;