// Main Application Logic
class KhayrApp {
    constructor() {
    this.currentPage = 'home';
    this.cart = JSON.parse(localStorage.getItem('khayrCart')) || [];
    this.products = []; // ← EMPTY ARRAY, will be filled by fetchProducts()
    this.init();
}

    init() {
        this.setupEventListeners();
        this.setupRouting();
        this.fetchProducts();
        this.updateCartCount();
        this.setupPushNotifications();
    }

    setupRouting() {
    // Handle initial route
    this.handleRouteChange();
    
    // Handle navigation events
    document.addEventListener('click', (e) => {
        if (e.target.matches('[data-page]')) {
            e.preventDefault();
            const page = e.target.getAttribute('data-page');
            this.navigateTo(page);
        }
    });
}
getSanityImageUrl(image, width = 400, height = 400) {
    if (!image?.asset?._ref) return '';
    
    const ref = image.asset._ref;
    // Convert: image-3bdddc1f9afd05657bb1cae9b099ad7cce3abe37-741x741-png
    // To: https://cdn.sanity.io/images/ptktp0wu/production/3bdddc1f9afd05657bb1cae9b099ad7cce3abe37-741x741.png
    const match = ref.match(/image-([^-]+)-(\d+x\d+)-(\w+)/);
    
    if (!match) return '';
    
    const [, imageId, dimensions, extension] = match;
    
    return `https://cdn.sanity.io/images/ptktp0wu/production/${imageId}-${dimensions}.${extension}?w=${width}&h=${height}&fit=crop`;
}
    // Add this method to your KhayrApp class
setupPushNotifications() {
    if ('Notification' in window && 'serviceWorker' in navigator) {
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                console.log('Push notifications granted');
                // Here you would subscribe to push notifications
                this.subscribeToPushNotifications();
            }
        });
    }
}

// Optional: Add subscription method
subscribeToPushNotifications() {
    // This would be where you register with a push service
    console.log('Ready to subscribe to push notifications');
}

    toggleMobileMenu() {
    const nav = document.getElementById('mainNav');
    const menuToggle = document.getElementById('menuToggle');
    const cartSidebar = document.getElementById('cartSidebar');
    
    // Close cart if open
    if (cartSidebar.classList.contains('active')) {
        this.toggleCartSidebar();
    }
    
    const isOpening = !nav.classList.contains('active');
    
    nav.classList.toggle('active');
    menuToggle.classList.toggle('active');
    
    // Only show overlay if menu is active
    const overlay = document.getElementById('overlay');
    if (nav.classList.contains('active')) {
        overlay.classList.add('active');
        // Prevent body scroll when menu is open
        document.body.style.overflow = 'hidden';
    } else {
        overlay.classList.remove('active');
        // Restore body scroll when menu is closed
        document.body.style.overflow = '';
    }
}

closeMobileMenu() {
    const nav = document.getElementById('mainNav');
    const menuToggle = document.getElementById('menuToggle');
    
    nav.classList.remove('active');
    menuToggle.classList.remove('active');
    
    // Remove overlay and restore scroll
    const overlay = document.getElementById('overlay');
    overlay.classList.remove('active');
    document.body.style.overflow = '';
}

    async fetchProducts() {
    try {
        const PROJECT_ID = 'ptktp0wu';
        const DATASET = 'production';
        // Use CDN URL instead of API URL - no CORS issues!
        const url = `https://${PROJECT_ID}.apicdn.sanity.io/v2021-10-21/data/query/${DATASET}?query=*[_type=="product"]`;
        
        const response = await fetch(url);
        const result = await response.json();
        this.products = result.result || [];
        this.renderFeaturedProducts();
        this.renderProducts();
    } catch (error) {
        console.error('Failed to load products:', error);
        this.products = [];
    }
}

    setupEventListeners() {
    // Navigation - Use event delegation for better performance
    document.addEventListener('click', (e) => {
        // Handle nav links
        if (e.target.classList.contains('nav-link')) {
            e.preventDefault();
            const page = e.target.getAttribute('data-page');
            this.navigateTo(page);
            this.closeMobileMenu();
        }
        
        // Handle footer links too
        if (e.target.closest('.footer-section a[data-page]')) {
            e.preventDefault();
            const page = e.target.getAttribute('data-page');
            this.navigateTo(page);
            this.closeMobileMenu();
        }
    });

    // Menu toggle
    document.getElementById('menuToggle').addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent event bubbling
        this.toggleMobileMenu();
    });

    // Search toggle
    document.getElementById('searchToggle').addEventListener('click', () => {
        document.getElementById('searchBar').classList.toggle('active');
    });

    document.getElementById('searchClose').addEventListener('click', () => {
        document.getElementById('searchBar').classList.remove('active');
    });

    // Cart toggle
    document.getElementById('cartToggle').addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent event bubbling
        this.toggleCartSidebar();
    });

    document.getElementById('cartClose').addEventListener('click', () => {
        this.toggleCartSidebar();
    });

    // Overlay click
    document.getElementById('overlay').addEventListener('click', () => {
        const nav = document.getElementById('mainNav');
        const cartSidebar = document.getElementById('cartSidebar');
        
        if (nav.classList.contains('active')) {
            this.closeMobileMenu();
        }
        if (cartSidebar.classList.contains('active')) {
            this.toggleCartSidebar();
        }
    });

    // View cart button in sidebar
    document.getElementById('viewCartBtn').addEventListener('click', () => {
        this.toggleCartSidebar();
        this.navigateTo('cart');
    });

    // Checkout button
    document.getElementById('checkoutBtn').addEventListener('click', () => {
        alert('Checkout functionality would be implemented here!');
    });

    // Category filter
    document.getElementById('categoryFilter').addEventListener('change', (e) => {
        this.renderProducts(e.target.value);
    });

    // Contact form
    document.getElementById('contactForm').addEventListener('submit', (e) => {
        e.preventDefault();
        alert('Thank you for your message! We will get back to you soon.');
        e.target.reset();
    });

    // Back button handling
    window.addEventListener('popstate', (e) => {
        this.handleRouteChange();
    });
}

    handleRouteChange() {
    const path = window.location.pathname;
    let page = 'home';

    if (path === '/products' || path === '/products.html') {
        page = 'products';
        this.renderProducts();
    } else if (path.startsWith('/product/')) {
        const productId = path.split('/')[2];
        page = 'product-detail';
        this.showProductDetail(productId);
    } else if (path === '/about' || path === '/about.html') {
        page = 'about';
    } else if (path === '/contact' || path === '/contact.html') {
        page = 'contact';
    } else if (path === '/cart' || path === '/cart.html') {
        page = 'cart';
        this.renderCart();
    } else {
        // Home page - ensure featured products are rendered
        page = 'home';
        this.renderFeaturedProducts();
    }

    this.showPage(page);
}

    navigateTo(page, productId = null) {
    let path = '/';
    
    if (page === 'products') {
        path = '/products';
    } else if (page === 'product-detail' && productId) {
        path = `/product/${productId}`;
    } else if (page === 'about') {
        path = '/about';
    } else if (page === 'contact') {
        path = '/contact';
    } else if (page === 'cart') {
        path = '/cart';
    }

    // Update URL without reload
    window.history.pushState({}, '', path);
    
    // Scroll to top before handling route change
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
    
    // Handle the route change
    this.handleRouteChange();
}

    showPage(page) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(p => {
        p.classList.remove('active');
    });

    // Show the current page
    const currentPage = document.getElementById(page);
    if (currentPage) {
        currentPage.classList.add('active');
        this.currentPage = page;
    }

    // Update active nav link
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    
    const activeLink = document.querySelector(`.nav-link[data-page="${page}"]`);
    if (activeLink) {
        activeLink.classList.add('active');
    }
}

    renderFeaturedProducts() {
        const featuredContainer = document.getElementById('featuredProducts');
        const featuredProducts = this.products.filter(product => product.featured);
        
        featuredContainer.innerHTML = featuredProducts.map(product => `
            <div class="product-card" data-id="${product.id}">
                <div class="product-image">
                    <img src="${this.getSanityImageUrl(product.image)}" alt="${product.name}" loading="lazy">
                </div>
                <div class="product-info">
                    <h3 class="product-title">${product.name}</h3>
                    <div class="product-price">$${product.price.toFixed(2)}</div>
                    <div class="product-actions">
                        <button class="btn btn-primary add-to-cart" data-id="${product.id}">Add to Cart</button>
                    </div>
                </div>
            </div>
        `).join('');

        // Add event listeners to product cards and add to cart buttons
        featuredContainer.querySelectorAll('.product-card').forEach(card => {
            card.addEventListener('click', (e) => {
                if (!e.target.classList.contains('add-to-cart')) {
                    const productId = card.getAttribute('data-id');
                    this.navigateTo('product-detail', productId);
                }
            });
        });

        featuredContainer.querySelectorAll('.add-to-cart').forEach(button => {
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                const productId = parseInt(button.getAttribute('data-id'));
                this.addToCart(productId);
            });
        });
    }

    renderProducts(category = 'all') {
        const productsContainer = document.getElementById('productsGrid');
        let filteredProducts = this.products;
        
        if (category !== 'all') {
            filteredProducts = this.products.filter(product => product.category === category);
        }
        
        productsContainer.innerHTML = filteredProducts.map(product => `
            <div class="product-image">
                <img src="${this.getSanityImageUrl(product.image)}" alt="${product.name}" loading="lazy">
            </div>
                <div class="product-image">Product Image</div>
                <div class="product-info">
                    <h3 class="product-title">${product.name}</h3>
                    <div class="product-price">$${product.price.toFixed(2)}</div>
                    <div class="product-actions">
                        <button class="btn btn-primary add-to-cart" data-id="${product.id}">Add to Cart</button>
                    </div>
                </div>
            </div>
        `).join('');

        // Add event listeners to product cards and add to cart buttons
        productsContainer.querySelectorAll('.product-card').forEach(card => {
            card.addEventListener('click', (e) => {
                if (!e.target.classList.contains('add-to-cart')) {
                    const productId = card.getAttribute('data-id');
                    this.navigateTo('product-detail', productId);
                }
            });
        });

        productsContainer.querySelectorAll('.add-to-cart').forEach(button => {
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                const productId = parseInt(button.getAttribute('data-id'));
                this.addToCart(productId);
            });
        });
    }

    showProductDetail(productId) {
        const product = this.products.find(p => p.id === parseInt(productId));
        if (!product) return;

        const detailContainer = document.getElementById('productDetail');
        detailContainer.innerHTML = `
            <div class="product-detail-image">Product Image</div>
            <div class="product-detail-info">
                <h2>${product.name}</h2>
                <div class="product-detail-price">$${product.price.toFixed(2)}</div>
                <div class="product-detail-description">
                    <p>${product.description}</p>
                </div>
                <div class="quantity-selector">
                    <button class="decrease-qty">-</button>
                    <input type="number" value="1" min="1" id="productQty">
                    <button class="increase-qty">+</button>
                </div>
                <button class="btn btn-primary add-to-cart-detail" data-id="${product.id}">Add to Cart</button>
            </div>
        `;

        // Add event listeners for quantity selector
        detailContainer.querySelector('.decrease-qty').addEventListener('click', () => {
            const qtyInput = detailContainer.querySelector('#productQty');
            if (parseInt(qtyInput.value) > 1) {
                qtyInput.value = parseInt(qtyInput.value) - 1;
            }
        });

        detailContainer.querySelector('.increase-qty').addEventListener('click', () => {
            const qtyInput = detailContainer.querySelector('#productQty');
            qtyInput.value = parseInt(qtyInput.value) + 1;
        });

        // Add to cart from detail page
        detailContainer.querySelector('.add-to-cart-detail').addEventListener('click', () => {
            const qtyInput = detailContainer.querySelector('#productQty');
            const quantity = parseInt(qtyInput.value);
            this.addToCart(product.id, quantity);
        });

        this.showPage('product-detail');
    }

    addToCart(productId, quantity = 1) {
        const product = this.products.find(p => p.id === productId);
        if (!product) return;

        const existingItem = this.cart.find(item => item.id === productId);
        
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            this.cart.push({
                id: product.id,
                name: product.name,
                price: product.price,
                quantity: quantity,
                image: product.image
            });
        }

        this.saveCart();
        this.updateCartCount();
        this.renderCartSidebar();
        
        // Show confirmation
        this.showCartNotification(`${product.name} added to cart`);
    }

    removeFromCart(productId) {
        this.cart = this.cart.filter(item => item.id !== productId);
        this.saveCart();
        this.updateCartCount();
        this.renderCart();
        this.renderCartSidebar();
    }

    updateCartItemQuantity(productId, newQuantity) {
        if (newQuantity < 1) {
            this.removeFromCart(productId);
            return;
        }

        const item = this.cart.find(item => item.id === productId);
        if (item) {
            item.quantity = newQuantity;
            this.saveCart();
            this.updateCartCount();
            this.renderCart();
            this.renderCartSidebar();
        }
    }

    saveCart() {
        localStorage.setItem('khayrCart', JSON.stringify(this.cart));
    }

    updateCartCount() {
        const count = this.cart.reduce((total, item) => total + item.quantity, 0);
        document.getElementById('cartCount').textContent = count;
    }

    renderCart() {
        const cartContainer = document.getElementById('cartContent');
        
        if (this.cart.length === 0) {
            cartContainer.innerHTML = `
                <div class="empty-cart">
                    <h3>Your cart is empty</h3>
                    <p>Add some products to your cart to see them here.</p>
                    <a href="/products" class="btn btn-primary" data-page="products">Continue Shopping</a>
                </div>
            `;
            
            // Add event listener to the button
            cartContainer.querySelector('a').addEventListener('click', (e) => {
                e.preventDefault();
                this.navigateTo('products');
            });
            
            return;
        }

        const cartItemsHTML = this.cart.map(item => `
            <div class="cart-item-image">
                <img src="${item.image}" alt="${item.name}">
            </div>
                <div class="cart-item-details">
                    <h4>${item.name}</h4>
                    <div class="cart-item-price">$${item.price.toFixed(2)}</div>
                </div>
                <div class="cart-item-quantity">
                    <button class="decrease-qty" data-id="${item.id}">-</button>
                    <span>${item.quantity}</span>
                    <button class="increase-qty" data-id="${item.id}">+</button>
                </div>
                <button class="cart-item-remove" data-id="${item.id}">Remove</button>
            </div>
        `).join('');

        const total = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        cartContainer.innerHTML = `
            ${cartItemsHTML}
            <div class="cart-summary">
                <div class="cart-total">
                    <strong>Total: $${total.toFixed(2)}</strong>
                </div>
                <div class="cart-actions">
                    <button class="btn btn-secondary" id="continueShopping">Continue Shopping</button>
                    <button class="btn btn-primary" id="proceedCheckout">Proceed to Checkout</button>
                </div>
            </div>
        `;

        // Add event listeners
        cartContainer.querySelectorAll('.decrease-qty').forEach(button => {
            button.addEventListener('click', () => {
                const productId = parseInt(button.getAttribute('data-id'));
                const item = this.cart.find(item => item.id === productId);
                if (item) {
                    this.updateCartItemQuantity(productId, item.quantity - 1);
                }
            });
        });

        cartContainer.querySelectorAll('.increase-qty').forEach(button => {
            button.addEventListener('click', () => {
                const productId = parseInt(button.getAttribute('data-id'));
                const item = this.cart.find(item => item.id === productId);
                if (item) {
                    this.updateCartItemQuantity(productId, item.quantity + 1);
                }
            });
        });

        cartContainer.querySelectorAll('.cart-item-remove').forEach(button => {
            button.addEventListener('click', () => {
                const productId = parseInt(button.getAttribute('data-id'));
                this.removeFromCart(productId);
            });
        });

        cartContainer.querySelector('#continueShopping').addEventListener('click', () => {
            this.navigateTo('products');
        });

        cartContainer.querySelector('#proceedCheckout').addEventListener('click', () => {
            alert('Checkout functionality would be implemented here!');
        });
    }

    renderCartSidebar() {
        const sidebarContent = document.getElementById('cartSidebarContent');
        
        if (this.cart.length === 0) {
            sidebarContent.innerHTML = '<p>Your cart is empty</p>';
            document.getElementById('cartTotal').textContent = '0.00';
            return;
        }

        const cartItemsHTML = this.cart.map(item => `
            <div class="cart-sidebar-item">
                <div class="cart-sidebar-item-image">
                    <img src="${item.image}" alt="${item.name}">
                </div>
                <div class="cart-sidebar-item-details">
                    <h4>${item.name}</h4>
                    <div class="cart-sidebar-item-price">$${item.price.toFixed(2)}</div>
                    <div class="cart-sidebar-item-quantity">
                        <button class="decrease-qty" data-id="${item.id}">-</button>
                        <span>${item.quantity}</span>
                        <button class="increase-qty" data-id="${item.id}">+</button>
                    </div>
                </div>
            </div>
        `).join('');

        const total = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        sidebarContent.innerHTML = cartItemsHTML;
        document.getElementById('cartTotal').textContent = total.toFixed(2);

        // Add event listeners for quantity changes in sidebar
        sidebarContent.querySelectorAll('.decrease-qty').forEach(button => {
            button.addEventListener('click', () => {
                const productId = parseInt(button.getAttribute('data-id'));
                const item = this.cart.find(item => item.id === productId);
                if (item) {
                    this.updateCartItemQuantity(productId, item.quantity - 1);
                this.renderCartSidebar();
                this.renderCart();
                this.updateCartCount();
                this.saveCart();
            }
            });
        });

        sidebarContent.querySelectorAll('.increase-qty').forEach(button => {
            button.addEventListener('click', () => {
                const productId = parseInt(button.getAttribute('data-id'));
                const item = this.cart.find(item => item.id === productId);
                if (item) {
                    this.updateCartItemQuantity(productId, item.quantity + 1);
                    this.renderCartSidebar();
                    this.renderCart();
                    this.updateCartCount();
                    this.saveCart();
                }
            });
        });
    }

    toggleCartSidebar() {
    const cartSidebar = document.getElementById('cartSidebar');
    const nav = document.getElementById('mainNav');
    
    // Close menu if open
    if (nav.classList.contains('active')) {
        this.closeMobileMenu();
    }
    
    cartSidebar.classList.toggle('active');
    
    // Only show overlay if cart is active
    const overlay = document.getElementById('overlay');
    if (cartSidebar.classList.contains('active')) {
        overlay.classList.add('active');
        this.renderCartSidebar();
    } else {
        overlay.classList.remove('active');
    }
}

    showCartNotification(message) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'cart-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <span>${message}</span>
            </div>
        `;
        
        // Add styles for notification
        notification.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background-color: var(--deep-emerald);
            color: white;
            padding: 12px 20px;
            border-radius: 4px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 1001;
            transform: translateY(100px);
            opacity: 0;
            transition: transform 0.3s ease, opacity 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateY(0)';
            notification.style.opacity = '1';
        }, 10);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.transform = 'translateY(100px)';
            notification.style.opacity = '0';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new KhayrApp();
});

// Service Worker Registration
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then((registration) => {
                console.log('SW registered: ', registration);
            })
            .catch((registrationError) => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}