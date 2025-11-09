const nomeInput = document.getElementById("cliente-nome");
const telefoneInput = document.getElementById("cliente-telefone");
const menu = document.getElementById("menu");
const cartBtn = document.getElementById("cart-btn");
const cartModal = document.getElementById("cart-modal");
const cartItemsContainer = document.getElementById("cart-items");
const cartTotal = document.getElementById("cart-total");
const checkoutBtn = document.getElementById("checkout-btn");
const closeModalBtn = document.getElementById("close-modal-btn");
const cartCounter = document.getElementById("cart-count");
const addressInput = document.getElementById("address");
const addressWarn = document.getElementById("address-warn");
const spanItem = document.getElementById("date-span");

let cart = [];

// Carrega carrinho salvo
function loadCart() {
  const savedCart = localStorage.getItem("cart");
  if (savedCart) {
    cart = JSON.parse(savedCart);
    updateCartModal();
  }
}

// Salva carrinho no localStorage
function saveCart() {
  localStorage.setItem("cart", JSON.stringify(cart));
}

// Verifica se restaurante está aberto
function checkRestaurantOpen() {
  const hora = new Date().getHours();
  return hora >= 18 && hora < 22;
}

// Atualiza status do restaurante
if (spanItem) {
  const isOpen = checkRestaurantOpen();
  spanItem.classList.remove(isOpen ? "bg-red-500" : "bg-green-600");
  spanItem.classList.add(isOpen ? "bg-green-600" : "bg-red-500");
}

// Abrir e fechar modal
cartBtn.addEventListener("click", () => {
  updateCartModal();
  cartModal.style.display = "flex";
});
cartModal.addEventListener("click", (e) => {
  if (e.target === cartModal) cartModal.style.display = "none";
});
closeModalBtn.addEventListener("click", () => {
  cartModal.style.display = "none";
});

// Adiciona item ao carrinho
menu.addEventListener("click", (e) => {
  const btn = e.target.closest(".add-to-cart-btn");
  if (btn) {
    const name = btn.getAttribute("data-name");
    const price = parseFloat(btn.getAttribute("data-price"));
    addToCart(name, price);
  }
});

function addToCart(name, price) {
  const item = cart.find(i => i.name === name);
  if (item) item.quantity++;
  else cart.push({ name, price, quantity: 1 });

  updateCartModal();
  saveCart();
  showToast(`${name} adicionado ao carrinho!`);
}

// Atualiza carrinho no modal
function updateCartModal() {
  cartItemsContainer.innerHTML = "";
  let total = 0;

  cart.forEach(item => {
    const el = document.createElement("div");
    el.classList.add("flex", "justify-between", "mb-4", "flex-col");
    el.innerHTML = `
      <div class="flex items-center justify-between">
        <div>
          <p class="font-medium">${item.name}</p>
          <p>Qtd: ${item.quantity}</p>
          <p class="font-medium mt-2">R$ ${item.price.toFixed(2)}</p>
        </div>
        <button class="remove-from-cart-btn" data-name="${item.name}">
          Remover
        </button>
      </div>`;
    cartItemsContainer.appendChild(el);
    total += item.price * item.quantity;
  });

  cartTotal.textContent = total.toFixed(2);
  cartCounter.innerText = cart.length;
}

// Remoção de itens
cartItemsContainer.addEventListener("click", (e) => {
  if (e.target.classList.contains("remove-from-cart-btn")) {
    const name = e.target.getAttribute("data-name");
    removeItemCart(name);
  }
});

function removeItemCart(name) {
  const index = cart.findIndex(i => i.name === name);
  if (index !== -1) {
    const item = cart[index];
    if (item.quantity > 1) item.quantity--;
    else cart.splice(index, 1);

    updateCartModal();
    saveCart();
    showToast(`${item.name} removido do carrinho!`);
  }
}

// Validação de endereço
addressInput.addEventListener("input", (e) => {
  if (e.target.value !== "") {
    addressInput.classList.remove("border-red-500");
    addressWarn?.classList.add("hidden");
  }
});

// Finalizar pedido (envio para backend)
checkoutBtn.addEventListener("click", async () => {
  if (!checkRestaurantOpen()) {
    showToast("Ops, o restaurante está fechado!", "error");
    return;
  }

  if (cart.length === 0) {
    showToast("Adicione itens ao carrinho.", "error");
    return;
  }

  if (addressInput.value === "") {
    addressWarn?.classList.remove("hidden");
    addressInput.classList.add("border-red-500");
    showToast("Digite um endereço válido.", "error");
    return;
  }

  try {
    const response = await fetch("https://tcc-uh9r.onrender.com/pedido", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
  cliente_nome: nomeInput.value,
  cliente_telefone: telefoneInput.value,
  itens: cart,
  endereco: addressInput.value,
  total: parseFloat(cartTotal.textContent.replace("R$", "").replace(",", "."))
}),
    });

    if (response.ok) {
      showToast("Pedido enviado com sucesso!");
      cart = [];
      saveCart();
      updateCartModal();
      cartModal.style.display = "none";
    } else {
      showToast("Erro ao enviar pedido!", "error");
    }
  } catch (err) {
    console.error(err);
    showToast("Erro de conexão com o servidor!", "error");
  }
});

// Toast de feedback
function showToast(msg, type = "success") {
  Toastify({
    text: msg,
    duration: 3000,
    gravity: "top",
    position: "right",
    close: true,
    style: {
      background: type === "error" ? "#EF4444" : "#10B981",
    },
  }).showToast();
}


const API = "https://tcc-uh9r.onrender.com";

async function adicionarProduto() {
  const nome = document.getElementById("novo_nome").value;
  const preco = parseFloat(document.getElementById("novo_preco").value);
  const mais_vendido = document.getElementById("novo_mv").checked;
  const imagem = document.getElementById("novo_img").value;

  if (!nome.trim()) {
    showNotification('Por favor, preencha o nome do produto', 'error');
    document.getElementById("novo_nome").focus();
    return;
  }

  if (isNaN(preco) || preco <= 0) {
    showNotification('Por favor, insira um preço válido', 'error');
    document.getElementById("novo_preco").focus();
    return;
  }

  try {
    const response = await fetch(`${API}/api/produtos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome, preco, mais_vendido, imagem })
    });

    if (response.ok) {
      showNotification('Produto adicionado com sucesso!', 'success');
      document.getElementById("novo_nome").value = "";
      document.getElementById("novo_preco").value = "";
      document.getElementById("novo_mv").checked = false;
      document.getElementById("novo_img").value = "";
      carregar();
    } else {
      const text = await response.text();
      console.error('Erro do servidor:', text);
      showNotification('Falha ao adicionar o produto', 'error');
    }
  } catch (err) {
    console.error("Erro ao adicionar produto:", err);
    showNotification('Falha ao adicionar o produto', 'error');
  }
}
