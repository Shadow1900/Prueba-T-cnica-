import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const email = localStorage.getItem("email");
    if (!email) {
      navigate("/login");
      return;
    }

    const fetchCart = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/cart?email=${email}`);
        setCartItems(response.data);
      } catch (error) {
        console.error("Error al obtener el carrito", error);
      }
    };

    fetchCart();
  }, [navigate]);

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2);
  };

  const calculateTax = () => {
    return (calculateSubtotal() * 0.16).toFixed(2); // 16% de impuestos
  };

  const calculateTotal = () => {
    return (parseFloat(calculateSubtotal()) + parseFloat(calculateTax())).toFixed(2);
  };

  const handleQuantityChange = (id, newQuantity) => {
    if (newQuantity < 1) return; // Evitar cantidades negativas
    const updatedCart = cartItems.map((item) =>
      item.id === id ? { ...item, quantity: newQuantity } : item
    );
    setCartItems(updatedCart);
  };

  const handleRemoveItem = (id) => {
    const updatedCart = cartItems.filter((item) => item.id !== id);
    setCartItems(updatedCart);
  };

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <h1 style={styles.title}>🛒 Tu Carrito</h1>
        <button style={styles.backButton} onClick={() => navigate("/")}>
          ⬅️ Volver a la tienda
        </button>

        {cartItems.length === 0 ? (
          <p style={styles.emptyMessage}>Tu carrito está vacío.</p>
        ) : (
          <div style={styles.cartContent}>
            <div style={styles.itemsContainer}>
              {cartItems.map((item) => (
                <div key={item.id} style={styles.card}>
                  <img src={item.pokemon_image} alt={item.pokemon_name} style={styles.image} />
                  <div style={styles.itemDetails}>
                    <h3 style={styles.itemName}>{item.pokemon_name}</h3>
                    <p style={styles.itemPrice}>Precio unitario: ${item.price}</p>
                    <div style={styles.quantityContainer}>
                      <button
                        style={styles.quantityButton}
                        onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                      >
                        -
                      </button>
                      <span style={styles.quantity}>{item.quantity}</span>
                      <button
                        style={styles.quantityButton}
                        onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                      >
                        +
                      </button>
                    </div>
                    <p style={styles.itemSubtotal}>
                      Subtotal: ${(item.price * item.quantity).toFixed(2)}
                    </p>
                    <button
                      style={styles.removeButton}
                      onClick={() => handleRemoveItem(item.id)}
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div style={styles.summaryContainer}>
              <h2 style={styles.summaryTitle}>Resumen de la compra</h2>
              <div style={styles.summaryRow}>
                <span>Subtotal</span>
                <span>${calculateSubtotal()}</span>
              </div>
              <div style={styles.summaryRow}>
                <span>Impuestos (16%)</span>
                <span>${calculateTax()}</span>
              </div>
              <div style={styles.summaryRow}>
                <strong>Total</strong>
                <strong>${calculateTotal()}</strong>
              </div>
              <button style={styles.checkoutButton}>Pagar ahora</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
    backgroundColor: "#f9f9f9",
    fontFamily: "Arial, sans-serif",
    padding: "0", // Eliminamos el padding para que no haya márgenes no deseados
    margin: "0", // Eliminamos el margen para que no haya espacios no deseados
    width: "100vw", // Ocupa el 100% del ancho de la pantalla
    overflowX: "hidden", // Evita el desbordamiento horizontal
  },
  content: {
    width: "100%",
    maxWidth: "1200px",
    textAlign: "center",
    padding: "20px", // Añadimos un padding interno para que el contenido no toque los bordes
  },
  title: { fontSize: "2rem", marginBottom: "20px", color: "#333" },
  backButton: {
    padding: "10px 15px",
    cursor: "pointer",
    marginBottom: "20px",
    backgroundColor: "#007bff",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    fontSize: "1rem",
  },
  emptyMessage: { fontSize: "1.2rem", color: "gray" },
  cartContent: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    gap: "20px",
    width: "100%",
  },
  itemsContainer: {
    flex: 3,
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  card: {
    display: "flex",
    alignItems: "center",
    padding: "15px",
    border: "1px solid #ddd",
    borderRadius: "10px",
    backgroundColor: "#fff",
    boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
  },
  image: { width: "100px", height: "100px", borderRadius: "10px", marginRight: "20px" },
  itemDetails: { flex: 1, textAlign: "left" },
  itemName: { fontSize: "1.5rem", margin: "0 0 10px 0", color: "#333" },
  itemPrice: { fontSize: "1rem", margin: "0 0 10px 0", color: "#555" },
  quantityContainer: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "10px",
  },
  quantityButton: {
    padding: "5px 10px",
    cursor: "pointer",
    backgroundColor: "#007bff",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    fontSize: "1rem",
  },
  quantity: { fontSize: "1rem", fontWeight: "bold" },
  itemSubtotal: { fontSize: "1rem", margin: "0 0 10px 0", color: "#555" },
  removeButton: {
    padding: "5px 10px",
    cursor: "pointer",
    backgroundColor: "#ff4d4d",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    fontSize: "1rem",
  },
  summaryContainer: {
    flex: 1,
    padding: "20px",
    border: "1px solid #ddd",
    borderRadius: "10px",
    backgroundColor: "#fff",
    boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
    textAlign: "left",
  },
  summaryTitle: { fontSize: "1.5rem", marginBottom: "20px", color: "#333" },
  summaryRow: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "10px",
    fontSize: "1rem",
    color: "#555",
  },
  checkoutButton: {
    width: "100%",
    padding: "10px",
    cursor: "pointer",
    backgroundColor: "#28a745",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    fontSize: "1rem",
    marginTop: "20px",
  },
};

export default Cart;