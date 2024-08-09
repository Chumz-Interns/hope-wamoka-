document.addEventListener("DOMContentLoaded", () => {
  const productsContainer = document.getElementById("products-container");
  const cartContainer = document.getElementById("cart-container");
  const confirmOrderButton = document.getElementById("confirm-order");
  const modal = document.getElementById("order-confirmation-modal");
  const newOrderButton = document.getElementById("new-order-button");
  const closeButton = document.querySelector(".close-button");
  const orderSummaryContainer = document.getElementById("order-summary");
  const emptyCart = document.getElementById("empty-cart");
  const cartCount = document.getElementById("cart-count");
  const orderTotal = document.getElementById("order-total");
  const carbonNeutralDiv = document.getElementById("carbon-neutral");
  let cart = [];

  const fetchProducts = async () => {
    try {
      const response = await fetch("data.json");
      const products = await response.json();
      products.forEach((product) => {
        const productElement = document.createElement("div");
        productElement.classList.add("product");
        productElement.innerHTML = `
        <div class="image-container">
          <img src="${product.image.desktop}" alt="${product.name}">
          <div class="cart-controls" id="controls-${
            product.id
          } class="product-image">
            <button class="add-to-cart">Add to Cart</button>
          </div>
        </div>
        <div>
          <p>${product.category}</p>
          <h3>${product.name}</h3>
          <p class="price">$${product.price.toFixed(2)}</p>
        </div>
        `;
        productElement
          .querySelector(".add-to-cart")
          .addEventListener("click", () => addToCart(product));
        productsContainer.appendChild(productElement);
      });

      updateProductImages();
    } catch (error) {
      console.error("Failed to fetch products:", error);
    }
  };

  const updateProductImages = () => {
    const productElements = document.querySelectorAll(".product");
    const deviceWidth = window.innerWidth;

    productElements.forEach((productElement) => {
      const productId = productElement.dataset.productId;
      const imageElement = productElement.querySelector(".product-image");

      // Find the product in your products array
      const product = products.find((p) => p.id === Number(productId));

      let newSrc = "";

      if (deviceWidth >= 1440) {
        newSrc = `${product.image.desktop}`;
      } else if (deviceWidth >= 1024 && deviceWidth < 1440) {
        newSrc = `${product.image.desktop}`;
      } else if (deviceWidth >= 769 && deviceWidth < 1024) {
        newSrc = `${product.image.tablet}`;
      } else {
        newSrc = `${product.image.mobile}`;
      }

      // Set the new image source
      imageElement.src = newSrc;
    });
  };

  fetchProducts();

  function addToCart(product) {
    const cartItem = cart.find((item) => item.name === product.name);
    if (cartItem) {
      cartItem.quantity++;
    } else {
      cart.push({ ...product, quantity: 1 });
    }
    renderCart();
  }

  function renderCart() {
    cartContainer.innerHTML = "";
    cartCount.textContent = cart.reduce((acc, item) => acc + item.quantity, 0); // Sum the quantities for the count

    if (cart.length === 0) {
      emptyCart.style.display = "block";
      confirmOrderButton.style.display = "none";
    } else {
      emptyCart.style.display = "none";
      confirmOrderButton.style.display = "block";
      cart.forEach((item) => {
        const itemTotal = item.price * item.quantity;
        const cartItemElement = document.createElement("div");
        cartItemElement.classList.add("cart-item");
        cartItemElement.innerHTML = `
          <h3>${item.name}</h3>
        
          <span class="prices">   
            <p><span class="quantity">${item.quantity}x</span> 

    
            $${item.price.toFixed(
              2
            )} <span class="price-total">$${itemTotal.toFixed(2)}</span>
          </p>
            </span>
          <div class="buttons">
            <button class="adjust-quantity">
              <span class="increase">+</span>
              <span class="decrease">-</span>
            </button>
            <span class="remove">&times;</span>
            
          </div>
        `;
        cartItemElement
          .querySelector(".increase")
          .addEventListener("click", () => updateQuantity(item, 1));
        cartItemElement
          .querySelector(".decrease")
          .addEventListener("click", () => updateQuantity(item, -1));
        cartItemElement
          .querySelector(".remove")
          .addEventListener("click", () => removeFromCart(item));
        cartContainer.appendChild(cartItemElement);
      });
      updateOrderTotal();
      displayCarbonNeutral();
    }
  }

  function updateQuantity(item, change) {
    const cartItem = cart.find((cartItem) => cartItem.name === item.name);
    cartItem.quantity += change;
    if (cartItem.quantity <= 0) {
      cart = cart.filter((cartItem) => cartItem.name !== item.name);
    }
    renderCart();
  }

  function removeFromCart(item) {
    cart = cart.filter((cartItem) => cartItem.name !== item.name);
    renderCart();
  }

  function updateOrderTotal() {
    const totalPrice = cart.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );
    orderTotal.innerHTML = `
    <p>  Order Total:  </p>
    <h3>$${totalPrice.toFixed(2)} </h3>
  `;
  }

  function displayCarbonNeutral() {
    carbonNeutralDiv.innerHTML = `
      <img src="assets/images/icon-carbon-neutral.svg" alt="carbon neutral icon">
      <p>This is a <b>carbon-neutral</b> delivery</p>
    `;
    cartContainer.appendChild(carbonNeutralDiv);
  }

  function renderOrderSummary() {
    orderSummaryContainer.innerHTML = "";
    let totalPrice = 0;
    cart.forEach((item) => {
      const itemTotal = item.price * item.quantity;
      totalPrice += itemTotal;
      const summaryItem = document.createElement("div");
      summaryItem.classList.add("summary-item");
      summaryItem.innerHTML = `
        <img src="${item.image.thumbnail}" alt="${item.name}">
        <div class="details">
        <h3>${item.name}</h3>
        
          <span class="prices">
            <p>
            <span class="quantity">${item.quantity}x</span> 
             
           @ $${item.price.toFixed(2)} 
            <span class="price-total">$${itemTotal.toFixed(2)}</span>
          </p>
            </span>
            </div>
      `;
      orderSummaryContainer.appendChild(summaryItem);
    });
    const totalElement = document.createElement("div");
    totalElement.classList.add("summary-total");
    totalElement.innerHTML = `<p>Order Total</>
    <h3> $${totalPrice.toFixed(2)}</h3>`;
    orderSummaryContainer.appendChild(totalElement);
  }

  confirmOrderButton.addEventListener("click", () => {
    console.log("Confirm Order button clicked");
    renderOrderSummary();
    modal.style.display = "block";
  });

  closeButton.addEventListener("click", () => {
    modal.style.display = "none";
  });

  newOrderButton.addEventListener("click", () => {
    cart = [];
    renderCart();

    modal.style.display = "none";
  });

  window.addEventListener("click", (event) => {
    if (event.target === modal) {
      modal.style.display = "none";
    }
  });

  renderCart();
});
