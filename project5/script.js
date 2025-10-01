let products = [];
let filteredProducts = [];
let currentPage = 1;
const itemsPerPage = 10;

document.addEventListener("DOMContentLoaded", () => {
    const productsContainer = document.getElementById("products");
    const cartContainer = document.getElementById("cart");
    const cartTotal = document.getElementById("cart-total");
    const searchInput = document.getElementById("search");
    const sortSelect = document.getElementById("sort");
    const pageButtonsContainer = document.getElementById("page-buttons");
    const clearCartBtn = document.getElementById("clear-cart");
    const buyNowBtn = document.getElementById("buy-now");
    const openCartBtn = document.getElementById("open-cart");
    const closeCartBtn = document.getElementById("close-cart");
    const cartPanel = document.getElementById("cart-panel");
    const categoryBtns = document.querySelectorAll(".category-btn");

    // Category filtering
    let selectedCategory = "all";

    categoryBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            // Remove active class from all buttons
            categoryBtns.forEach(b => b.classList.remove("active"));
            // Add active class to clicked button
            btn.classList.add("active");

            // Set selected category
            selectedCategory = btn.dataset.category;

            // Apply filters
            applySearchAndSort();
        });
    });

    // Load products from JSON
    async function loadProducts() {
        const res = await fetch("products.json");
        products = await res.json();

        // Add fake ratings to products if they don't exist
        products = products.map(product => {
            if (!product.rating) {
                product.rating = (Math.random() * 2 + 3).toFixed(1); // Random rating between 3.0-5.0
                product.reviews = Math.floor(Math.random() * 150) + 10; // Random review count 10-160
            }
            return product;
        });

        filteredProducts = [...products];
        renderProducts();
    }

    // Generate star rating HTML
    function generateStars(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

        let starsHtml = '';

        // Full stars
        for (let i = 0; i < fullStars; i++) {
            starsHtml += '<span class="star filled">★</span>';
        }

        // Half star
        if (hasHalfStar) {
            starsHtml += '<span class="star half">★</span>';
        }

        // Empty stars
        for (let i = 0; i < emptyStars; i++) {
            starsHtml += '<span class="star empty">★</span>';
        }

        return starsHtml;
    }

    // Render products for current page
    function renderProducts() {
        const start = (currentPage - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        const pageItems = filteredProducts.slice(start, end);

        productsContainer.innerHTML = pageItems.map(item => {
            const cart = JSON.parse(localStorage.getItem("cart")) || [];
            const itemInCart = cart.filter(cartItem => cartItem.id === item.id).length;

            return `
      <div class="product-card">
        <img src="${item.image}" alt="${item.name}" onclick="openLightbox(${item.id})" />
        <h3>${item.name}</h3>
        <p class="category">${item.category}</p>
        <p class="description">${item.description}</p>
        <div class="rating">
          <div class="stars">${generateStars(item.rating)}</div>
          <span class="rating-text">${item.rating} (${item.reviews} reviews)</span>
        </div>
        <p class="price">$${item.price.toFixed(2)}</p>
        <div class="cart-controls">
          ${itemInCart > 0 ?
                    `<div class="cart-added">
              <span class="checkmark">✓</span>
              <span class="cart-count">${itemInCart} in cart</span>
              <button class="add-more-btn" onclick="addToCart(${item.id}, '${item.name}', ${item.price})">+</button>
            </div>` :
                    `<button class="add-to-cart-btn" onclick="addToCart(${item.id}, '${item.name}', ${item.price})">Add to Cart</button>`
                }
        </div>
      </div>
    `;
        }).join("");

        renderPageButtons();
    }

    // Render pagination buttons
    function renderPageButtons() {
        const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
        pageButtonsContainer.innerHTML = "";

        for (let i = 1; i <= totalPages; i++) {
            const btn = document.createElement("button");
            btn.className = "page-btn" + (i === currentPage ? " active" : "");
            btn.textContent = i;
            btn.onclick = () => {
                currentPage = i;
                renderProducts();
            };
            pageButtonsContainer.appendChild(btn);
        }
    }

    // Add item to cart
    window.addToCart = function (id, name, price) {
        let cart = JSON.parse(localStorage.getItem("cart")) || [];
        cart.push({ id, name, price });
        localStorage.setItem("cart", JSON.stringify(cart));
        renderCart();
        renderProducts(); // Re-render products to update the button states

        // Show a brief animation/feedback
        const addedItem = document.querySelector(`[onclick="addToCart(${id}, '${name}', ${price})"]`);
        if (addedItem) {
            addedItem.style.transform = "scale(0.95)";
            setTimeout(() => {
                addedItem.style.transform = "scale(1)";
            }, 150);
        }
    };

    // Remove item from cart
    window.removeFromCart = function (index) {
        let cart = JSON.parse(localStorage.getItem("cart")) || [];
        cart.splice(index, 1);
        localStorage.setItem("cart", JSON.stringify(cart));
        renderCart();
        renderProducts(); // Re-render products to update the button states
    };

    // Render cart contents
    function renderCart() {
        let cart = JSON.parse(localStorage.getItem("cart")) || [];
        cartContainer.innerHTML = "";
        let total = 0;

        cart.forEach((item, index) => {
            total += item.price;
            cartContainer.innerHTML += `
        <div class="cart-item">
          <span>${item.name} - $${item.price.toFixed(2)}</span>
          <button onclick="removeFromCart(${index})">Remove</button>
        </div>
      `;
        });

        cartTotal.textContent = `Total: $${total.toFixed(2)}`;
    }

    // Search and sort logic
    function applySearchAndSort() {
        const query = searchInput.value.toLowerCase();
        filteredProducts = products.filter(item => {
            const matchesSearch = item.name.toLowerCase().includes(query);
            const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
            return matchesSearch && matchesCategory;
        });

        const sortValue = sortSelect.value;
        if (sortValue === "low") {
            filteredProducts.sort((a, b) => a.price - b.price);
        } else if (sortValue === "high") {
            filteredProducts.sort((a, b) => b.price - a.price);
        } else if (sortValue === "az") {
            filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
        }

        currentPage = 1;
        renderProducts();
    }

    // Pagination controls
    window.nextPage = function () {
        const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
        if (currentPage < totalPages) {
            currentPage++;
            renderProducts();
        }
    };

    window.prevPage = function () {
        if (currentPage > 1) {
            currentPage--;
            renderProducts();
        }
    };

    // Cart panel controls
    openCartBtn.addEventListener("click", () => {
        cartPanel.classList.remove("hidden");
    });

    closeCartBtn.addEventListener("click", () => {
        cartPanel.classList.add("hidden");
    });

    // Cart actions
    clearCartBtn.addEventListener("click", () => {
        localStorage.removeItem("cart");
        renderCart();
        renderProducts(); // Re-render products to update the button states
    });

    buyNowBtn.addEventListener("click", () => {
        window.location.href = "checkout.html";
    });

    // Event listeners
    searchInput.addEventListener("input", applySearchAndSort);
    sortSelect.addEventListener("change", applySearchAndSort);

    // Lightbox functionality
    let currentLightboxIndex = 0;
    const lightbox = document.getElementById("lightbox");
    const lightboxImage = document.getElementById("lightbox-image");
    const lightboxTitle = document.getElementById("lightbox-title");
    const lightboxCategory = document.getElementById("lightbox-category");
    const lightboxPrice = document.getElementById("lightbox-price");
    const closeLightboxBtn = document.getElementById("close-lightbox");
    const prevImageBtn = document.getElementById("prev-image");
    const nextImageBtn = document.getElementById("next-image");

    // Open lightbox with specific product
    window.openLightbox = function (productId) {
        const product = filteredProducts.find(p => p.id === productId);
        if (product) {
            currentLightboxIndex = filteredProducts.findIndex(p => p.id === productId);
            showLightboxImage();
            lightbox.classList.remove("hidden");
            document.body.style.overflow = "hidden"; // Prevent background scrolling
        }
    };

    // Show current image in lightbox
    function showLightboxImage() {
        const product = filteredProducts[currentLightboxIndex];
        if (product) {
            lightboxImage.src = product.image;
            lightboxImage.alt = product.name;
            lightboxTitle.textContent = product.name;
            lightboxCategory.textContent = product.category;
            lightboxPrice.textContent = `$${product.price.toFixed(2)}`;

            // Update navigation buttons
            prevImageBtn.disabled = currentLightboxIndex === 0;
            nextImageBtn.disabled = currentLightboxIndex === filteredProducts.length - 1;
        }
    }

    // Close lightbox
    function closeLightbox() {
        lightbox.classList.add("hidden");
        document.body.style.overflow = "auto"; // Restore scrolling
    }

    // Previous image
    function prevLightboxImage() {
        if (currentLightboxIndex > 0) {
            currentLightboxIndex--;
            showLightboxImage();
        }
    }

    // Next image
    function nextLightboxImage() {
        if (currentLightboxIndex < filteredProducts.length - 1) {
            currentLightboxIndex++;
            showLightboxImage();
        }
    }

    // Lightbox event listeners
    closeLightboxBtn.addEventListener("click", closeLightbox);
    prevImageBtn.addEventListener("click", prevLightboxImage);
    nextImageBtn.addEventListener("click", nextLightboxImage);

    // Close lightbox when clicking outside the image
    lightbox.addEventListener("click", (e) => {
        if (e.target === lightbox) {
            closeLightbox();
        }
    });

    // Keyboard navigation
    document.addEventListener("keydown", (e) => {
        if (!lightbox.classList.contains("hidden")) {
            switch (e.key) {
                case "Escape":
                    closeLightbox();
                    break;
                case "ArrowLeft":
                    prevLightboxImage();
                    break;
                case "ArrowRight":
                    nextLightboxImage();
                    break;
            }
        }
    });

    // Initialize
    loadProducts();
    renderCart();
});