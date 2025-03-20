import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Store = () => {
  const [pokemons, setPokemons] = useState([]);
  const [cart, setCart] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const pokemonsPerPage = 12;
  const totalPages = Math.ceil(pokemons.length / pokemonsPerPage);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchPokemons = async () => {
      try {
        const response = await axios.get("https://pokeapi.co/api/v2/pokemon?limit=121");
        const details = await Promise.all(
          response.data.results.map((poke) => axios.get(poke.url))
        );
        setPokemons(details.map((res) => res.data));
      } catch (error) {
        console.error("Error al obtener los Pokémon", error);
      }
    };

    fetchPokemons();
  }, [navigate]);

  const addToCart = async (pokemon) => {
    const email = localStorage.getItem("email");
    if (!email) {
      alert("Error: No hay un usuario autenticado.");
      return;
    }

    const item = {
      email,
      name: pokemon.name,
      price: (pokemon.base_experience * 10).toFixed(2),
      image: pokemon.sprites.front_default,
    };

    try {
      await axios.post("http://localhost:5000/api/cart", item);
      setCart((prevCart) => [...prevCart, item]); // Actualiza el estado del carrito
      alert(`${pokemon.name} agregado al carrito.`);
    } catch (error) {
      console.error("Error al agregar al carrito", error);
      alert("No se pudo agregar el Pokémon al carrito.");
    }
  };

  const paginatedPokemons = pokemons.slice(
    currentPage * pokemonsPerPage,
    (currentPage + 1) * pokemonsPerPage
  );

  return (
    <div style={styles.container}>
      {/* Barra superior */}
      <div style={styles.topBar}>
        <h1 style={styles.title}>Tienda de Pokémon</h1>
        <div style={styles.cartSection}>
          <span style={styles.cartIcon}>🛒</span>
          <span style={styles.cartCount}>{cart.length}</span>
        </div>
      </div>

      {/* Contenido principal */}
      <div style={styles.grid}>
        {paginatedPokemons.map((pokemon) => (
          <div key={pokemon.id} style={styles.card}>
            <h3 style={styles.pokemonName}>{pokemon.name}</h3>
            <img
              src={pokemon.sprites.front_default}
              alt={pokemon.name}
              style={styles.pokemonImage}
            />
            <p style={styles.price}>
              Precio: <strong>${(pokemon.base_experience * 10).toFixed(2)}</strong>
            </p>
            <div style={styles.buttonContainer}>
              <button style={styles.cartButton} onClick={() => addToCart(pokemon)}>
                Agregar al carrito
              </button>
              <button style={styles.buyButton}>Comprar</button>
            </div>
          </div>
        ))}
      </div>

      {/* Paginación */}
      <div style={styles.pagination}>
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 0))}
          disabled={currentPage === 0}
        >
          ⬅️ Anterior
        </button>
        <span style={{ margin: "0 15px" }}>
          Página <strong>{currentPage + 1}</strong> de <strong>{totalPages || 1}</strong>
        </span>
        <button
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages - 1))}
          disabled={currentPage >= totalPages - 1}
        >
          Siguiente ➡️
        </button>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    height: "100vh",
    width: "100vw",
    backgroundColor: "#f0f0f0",
    fontFamily: "'Arial', sans-serif",
    margin: "0",
    overflow: "hidden",
  },
  topBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "20px",
    backgroundColor: "#3c5aa6",
    color: "#ffffff",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
    width: "100%",
  },
  title: {
    margin: "0",
    fontSize: "2rem",
    color: "#ffcb05",
    textShadow: "2px 2px 0 #3c5aa6",
  },
  cartSection: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  cartIcon: {
    fontSize: "1.5rem",
  },
  cartCount: {
    fontSize: "1.2rem",
    fontWeight: "bold",
  },
  grid: {
    flex: "1",
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "20px",
    padding: "20px",
    width: "100%",
    maxWidth: "1200px",
    margin: "0 auto",
    boxSizing: "border-box",
    overflowY: "auto",
  },
  card: {
    backgroundColor: "#ffffff",
    border: "1px solid #ddd",
    borderRadius: "10px",
    padding: "20px",
    textAlign: "center",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
    transition: "transform 0.3s ease, box-shadow 0.3s ease",
  },
  pokemonName: {
    fontSize: "1.5rem",
    color: "#3c5aa6",
    marginBottom: "10px",
  },
  pokemonImage: {
    width: "120px",
    height: "120px",
    marginBottom: "10px",
  },
  price: {
    fontSize: "1.2rem",
    color: "#333",
    marginBottom: "20px",
  },
  buttonContainer: {
    display: "flex",
    justifyContent: "center",
    gap: "10px",
  },
  cartButton: {
    padding: "10px 20px",
    borderRadius: "5px",
    border: "none",
    backgroundColor: "#3c5aa6",
    color: "#ffffff",
    fontSize: "1rem",
    fontWeight: "bold",
    cursor: "pointer",
    transition: "background-color 0.3s ease",
  },
  buyButton: {
    padding: "10px 20px",
    borderRadius: "5px",
    border: "none",
    backgroundColor: "#ffcb05",
    color: "#3c5aa6",
    fontSize: "1rem",
    fontWeight: "bold",
    cursor: "pointer",
    transition: "background-color 0.3s ease",
  },
  pagination: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "20px",
    padding: "20px",
    backgroundColor: "#3c5aa6",
    color: "#ffffff",
    fontSize: "1.2rem",
    fontWeight: "bold",
  },
};

export default Store;
