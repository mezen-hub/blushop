// -----------------------------
// Configuration
// -----------------------------
const CART_KEY = "mezen_cart_v1";
const DELIVERY_COST = 7;
let cart = JSON.parse(localStorage.getItem(CART_KEY) || "[]");

// DOM Elements
const cartItems = document.getElementById("cartItems");
const cartTotal = document.getElementById("drawerTotal");
const cartCount = document.getElementById("cartCount");
const drawer = document.getElementById("cartDrawer");
const openCartBtn = document.getElementById("openCartBtn");
const closeCartBtn = document.getElementById("closeCartBtn");
const checkoutBtn = document.getElementById("checkoutBtn");
const checkoutModal = document.getElementById("checkoutModal");
const closeCheckoutBtn = document.getElementById("closeCheckoutBtn");
const backdrop = document.getElementById("backdrop");
const checkoutForm = document.getElementById("checkoutForm");
const cartError = document.getElementById("cartError");
const cartMessage = document.getElementById("cartMessage");

// Modal produit
const productModal = document.getElementById("productModal");
const closeProductBtn = document.getElementById("closeProductBtn");
const modalProductName = document.getElementById("modalProductName");
const modalProductImg = document.getElementById("modalProductImg");
const modalProductPrice = document.getElementById("modalProductPrice");
const addToCartBtn = document.getElementById("addToCartBtn");
const sizeOptions = document.getElementById("sizeOptions");

let currentProduct = null;
let selectedSize = null;

// -----------------------------
// Toast message bleu
// -----------------------------
function showCartMessage(text) {
  if (!cartMessage) return;
  cartMessage.textContent = text;
  cartMessage.classList.add("show");
  setTimeout(() => {
    cartMessage.classList.remove("show");
  }, 2000);
}

// -----------------------------
// Sauvegarder panier
// -----------------------------
function saveCart() {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

// -----------------------------
// Mettre à jour affichage panier
// -----------------------------
function updateCart() {
  if (!cartItems) return;
  cartItems.innerHTML = "";
  let total = 0;

  cart.forEach((item, index) => {
    const div = document.createElement("div");
    div.className = "cart-item";
    div.innerHTML = `
      <div class="cart-item-info">
        <span class="cart-item-name">${item.name} (${item.size})</span>
        <span class="cart-item-price">${(item.price * item.quantity).toFixed(2)} DT</span>
      </div>
      <div class="cart-qty">
        <button data-index="${index}" class="dec">-</button>
        <span>${item.quantity}</span>
        <button data-index="${index}" class="inc">+</button>
        <button data-index="${index}" class="del">🗑️</button>
      </div>
    `;
    cartItems.appendChild(div);
    total += item.price * item.quantity;
  });

  if (cart.length > 0) {
    const delivery = document.createElement("div");
    delivery.className = "cart-item";
    delivery.innerHTML = `
      <div class="cart-item-info">
        <span class="cart-item-name">Livraison</span>
        <span class="cart-item-price">${DELIVERY_COST.toFixed(2)} DT</span>
      </div>
    `;
    cartItems.appendChild(delivery);
    total += DELIVERY_COST;
  }

  cartTotal.textContent = total.toFixed(2);

  // compteur total basé sur toutes les quantités
  cartCount.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Boutons +
  document.querySelectorAll(".inc").forEach(btn => {
    btn.onclick = () => {
      cart[btn.dataset.index].quantity++;
      saveCart();
      updateCart();
    };
  });

  // Boutons -
  document.querySelectorAll(".dec").forEach(btn => {
    btn.onclick = () => {
      const i = btn.dataset.index;
      if (cart[i].quantity > 1) cart[i].quantity--;
      else cart.splice(i, 1);
      saveCart();
      updateCart();
    };
  });

  // Boutons delete
  document.querySelectorAll(".del").forEach(btn => {
    btn.onclick = () => {
      cart.splice(btn.dataset.index, 1);
      saveCart();
      updateCart();
    };
  });
}

// -----------------------------
// Ajouter au panier
// -----------------------------
function addToCart(name, price, size) {
  const existing = cart.find(i => i.name === name && i.size === size);
  if (existing) existing.quantity++;
  else cart.push({ name, price: parseFloat(price), size, quantity: 1 });

  saveCart();
  updateCart();
  showCartMessage("✅ Produit ajouté au panier !");
}

// -----------------------------
// Ouvrir/fermer panier
// -----------------------------
openCartBtn.onclick = () => drawer.classList.add("open");
closeCartBtn.onclick = () => drawer.classList.remove("open");

// -----------------------------
// Commander
// -----------------------------
checkoutBtn.onclick = () => {
  if (cart.length === 0) {
    cartError.textContent = "❌ Ajoute un article avant de commander.";
    cartError.style.display = "block";
    setTimeout(() => (cartError.style.display = "none"), 2000);
    return;
  }
  checkoutModal.classList.add("open");
  backdrop.classList.add("open");
};

closeCheckoutBtn.onclick = () => closeModal(checkoutModal);
backdrop.onclick = () => {
  closeModal(checkoutModal);
  closeModal(productModal);
};

// -----------------------------
// Modal produit et tailles
// -----------------------------
document.querySelectorAll(".card").forEach(card => {
  card.addEventListener("click", () => {
    const name = card.dataset.name;
    const price = parseFloat(card.dataset.price);
    const type = card.dataset.type;

    currentProduct = { name, price, type };
    selectedSize = null;

    modalProductName.textContent = name;
    modalProductImg.src = card.dataset.img;
    modalProductPrice.textContent = price + " DT";

    if (sizeOptions) sizeOptions.innerHTML = "";
    let sizes = [];
    if (type === "clothes") sizes = ["XS","S","M","L"];
    else if (type === "shoes") sizes = ["39","40","41","42"];

    sizes.forEach(sz => {
      const btn = document.createElement("button");
      btn.className = "size-btn";
      btn.textContent = sz;
      btn.onclick = () => {
        selectedSize = sz;
        addToCartBtn.disabled = false;
        document.querySelectorAll(".size-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
      };
      sizeOptions.appendChild(btn);
    });

    addToCartBtn.disabled = true;
    productModal.classList.add("open");
    backdrop.classList.add("open");
  });
});

closeProductBtn.onclick = () => closeModal(productModal);

addToCartBtn.onclick = () => {
  if (!currentProduct || !selectedSize) return;
  addToCart(currentProduct.name, currentProduct.price, selectedSize);
  closeModal(productModal);
};

// -----------------------------
// Fermer modal
// -----------------------------
function closeModal(modal) {
  if (!modal) return;
  modal.classList.remove("open");
  backdrop.classList.remove("open");
}

// -----------------------------
// Envoyer commande via EmailJS
// -----------------------------
checkoutForm.onsubmit = (e) => {
  e.preventDefault();

  if (cart.length === 0) {
    cartError.textContent = "❌ Ajoute un article avant de commander.";
    cartError.style.display = "block";
    setTimeout(() => (cartError.style.display = "none"), 2000);
    return;
  }

  const formData = new FormData(checkoutForm);
  const data = {
    last_name: formData.get("lastname"),
    first_name: formData.get("name"),
    address: formData.get("address"),
    phone: formData.get("phone"),
    order_details: cart.map(i => `${i.name} (${i.size}) x${i.quantity}`).join(", ")
      + ` | Total: ${(cart.reduce((sum,i)=>sum+i.price*i.quantity,0) + DELIVERY_COST).toFixed(2)} DT`
  };

  emailjs.send("service_9zzdutd", "template_wbuc4vg", data, "eo6vME_HyVkNwZyqu")
    .then(() => {
      showCartMessage("✅ Commande envoyée !");
      cart = [];
      saveCart();
      updateCart();
      closeModal(checkoutModal);
    })
    .catch(() => {
      showCartMessage("❌ Erreur lors de l'envoi.");
    });
};

// -----------------------------
// Init
// -----------------------------
updateCart();





