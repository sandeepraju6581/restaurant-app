// FlavorFly Restaurant - Interactive JavaScript Logical Layer

// 1. STATE & INITIALIZATION
let cart = JSON.parse(localStorage.getItem('flavorfly_cart')) || [];

// DOM Elements
const cartIcon = document.getElementById('cartIcon');
const cartDrawer = document.getElementById('cartDrawer');
const cartBackdrop = document.getElementById('cartBackdrop');
const closeCartBtn = document.getElementById('closeCartBtn');
const cartItemsContainer = document.getElementById('cartItemsContainer');
const cartTotalSpan = document.getElementById('cartTotal');
const checkoutBtn = document.getElementById('checkoutBtn');
const countBadge = document.getElementById('count');
const toastContainer = document.getElementById('toastContainer');

const contactForm = document.getElementById('contactForm');
const contactName = document.getElementById('contactName');
const contactEmail = document.getElementById('contactEmail');
const contactMessage = document.getElementById('contactMessage');

const checkoutModal = document.getElementById('checkoutModal');
const closeModalBtn = document.getElementById('closeModalBtn');

const heroOrderBtn = document.getElementById('heroOrderBtn');

// Initialize UI on load
document.addEventListener('DOMContentLoaded', () => {
  updateCartUI();

  // Scroll to menu from hero
  if (heroOrderBtn) {
    heroOrderBtn.addEventListener('click', () => {
      const menuSection = document.getElementById('menu');
      if (menuSection) {
        menuSection.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }

  // Cart Drawer open/close
  if (cartIcon) cartIcon.addEventListener('click', openCart);
  if (closeCartBtn) closeCartBtn.addEventListener('click', closeCart);
  if (cartBackdrop) cartBackdrop.addEventListener('click', closeCart);

  // Close Success Modal
  if (closeModalBtn) {
    closeModalBtn.addEventListener('click', () => {
      checkoutModal.classList.remove('active');
    });
  }

  // Contact Form Submission
  if (contactForm) {
    contactForm.addEventListener('submit', handleContactSubmit);
    // Add real-time validation clear
    [contactName, contactEmail, contactMessage].forEach(input => {
      if (input) {
        input.addEventListener('input', () => {
          clearValidationError(input);
        });
      }
    });
  }
});

// 2. CART DRAWER OPERATIONS
function openCart() {
  cartDrawer.classList.add('active');
  cartBackdrop.classList.add('active');
  document.body.style.overflow = 'hidden'; // Prevent main page scrolling when cart is open
}

function closeCart() {
  cartDrawer.classList.remove('active');
  cartBackdrop.classList.remove('active');
  document.body.style.overflow = ''; // Re-enable main page scrolling
}

// 3. CART CORE LOGIC
window.addCart = function(button) {
  // Extract item details from DOM relative to the clicked button
  const card = button.closest('.card');
  if (!card) return;

  const imageSrc = card.querySelector('img').src;
  const name = card.querySelector('h3').innerText;
  const priceText = card.querySelector('p').innerText;
  const price = parseInt(priceText.replace(/[^\d]/g, ''));

  // Check if item already exists in cart
  const existingItemIndex = cart.findIndex(item => item.name === name);

  if (existingItemIndex > -1) {
    cart[existingItemIndex].quantity += 1;
  } else {
    cart.push({
      name: name,
      price: price,
      image: imageSrc,
      quantity: 1
    });
  }

  saveCart();
  updateCartUI();
  showToast(`<i class="fas fa-cart-plus"></i> ${name} added to cart!`, 'success');
};

function saveCart() {
  localStorage.setItem('flavorfly_cart', JSON.stringify(cart));
}

function updateCartUI() {
  // Update count badge
  const totalItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  if (countBadge) {
    countBadge.innerText = totalItemsCount;
    // Simple micro-animation on badge update
    countBadge.style.transform = 'scale(1.2)';
    setTimeout(() => {
      countBadge.style.transform = 'scale(1)';
    }, 200);
  }

  // Clear container
  if (!cartItemsContainer) return;
  cartItemsContainer.innerHTML = '';

  if (cart.length === 0) {
    cartItemsContainer.innerHTML = '<div class="cart-empty-message">Your cart is empty.</div>';
    if (checkoutBtn) {
      checkoutBtn.disabled = true;
      checkoutBtn.innerText = 'Cart Empty';
    }
    if (cartTotalSpan) cartTotalSpan.innerText = '₹0';
    return;
  }

  // Render items
  cart.forEach((item, index) => {
    const itemEl = document.createElement('div');
    itemEl.className = 'cart-item';
    itemEl.innerHTML = `
      <img src="${item.image}" alt="${item.name}" class="cart-item-img">
      <div class="cart-item-details">
        <div class="cart-item-title">${item.name}</div>
        <div class="cart-item-price">₹${item.price}</div>
        <div class="cart-item-controls">
          <button class="cart-qty-btn" onclick="changeQty(${index}, -1)">-</button>
          <span class="cart-item-qty">${item.quantity}</span>
          <button class="cart-qty-btn" onclick="changeQty(${index}, 1)">+</button>
        </div>
      </div>
      <button class="cart-item-remove" onclick="removeFromCart(${index})">
        <i class="fas fa-trash-alt"></i>
      </button>
    `;
    cartItemsContainer.appendChild(itemEl);
  });

  // Calculate totals
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const deliveryFee = 40;
  const grandTotal = subtotal + deliveryFee;

  if (cartTotalSpan) {
    cartTotalSpan.innerText = `₹${grandTotal}`;
  }

  if (checkoutBtn) {
    checkoutBtn.disabled = false;
    checkoutBtn.innerText = `Checkout (₹${grandTotal})`;
  }
}

window.changeQty = function(index, amount) {
  if (index < 0 || index >= cart.length) return;
  
  cart[index].quantity += amount;
  
  if (cart[index].quantity <= 0) {
    removeFromCart(index);
  } else {
    saveCart();
    updateCartUI();
  }
};

window.removeFromCart = function(index) {
  if (index < 0 || index >= cart.length) return;
  
  const removedItemName = cart[index].name;
  cart.splice(index, 1);
  
  saveCart();
  updateCartUI();
  showToast(`<i class="fas fa-trash-alt"></i> ${removedItemName} removed from cart.`, 'error');
};

// 4. CHECKOUT
if (checkoutBtn) {
  checkoutBtn.addEventListener('click', () => {
    if (cart.length === 0) return;
    
    // Clear the cart
    cart = [];
    saveCart();
    updateCartUI();
    
    // Close cart drawer
    closeCart();
    
    // Show success modal with micro-animations
    if (checkoutModal) {
      checkoutModal.classList.add('active');
    }
  });
}

// 5. TOAST SYSTEM
function showToast(message, type = 'success') {
  if (!toastContainer) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = message;

  toastContainer.appendChild(toast);

  // Auto-remove toast from DOM after animations complete (3 seconds)
  setTimeout(() => {
    toast.remove();
  }, 3000);
}

// 6. CONTACT FORM VALIDATION
function handleContactSubmit(event) {
  event.preventDefault();
  
  let isValid = true;
  
  // Validation for Name
  if (!contactName.value.trim()) {
    showValidationError(contactName, 'Name is required');
    isValid = false;
  } else {
    clearValidationError(contactName);
  }
  
  // Validation for Email
  const emailVal = contactEmail.value.trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailVal) {
    showValidationError(contactEmail, 'Email is required');
    isValid = false;
  } else if (!emailRegex.test(emailVal)) {
    showValidationError(contactEmail, 'Please enter a valid email address');
    isValid = false;
  } else {
    clearValidationError(contactEmail);
  }
  
  // Validation for Message
  if (!contactMessage.value.trim()) {
    showValidationError(contactMessage, 'Message is required');
    isValid = false;
  } else {
    clearValidationError(contactMessage);
  }
  
  if (isValid) {
    // Show a success animation and message
    showToast('<i class="fas fa-paper-plane"></i> Message sent successfully!', 'success');
    
    // Clear the form
    contactForm.reset();
  } else {
    showToast('<i class="fas fa-exclamation-triangle"></i> Please fix validation errors.', 'error');
  }
}

function showValidationError(inputElement, errorMessage) {
  // Add class for styling
  inputElement.classList.add('invalid');
  
  // Check if error label already exists
  let errorEl = inputElement.nextElementSibling;
  if (!errorEl || !errorEl.classList.contains('validation-error')) {
    errorEl = document.createElement('div');
    errorEl.className = 'validation-error';
    inputElement.parentNode.insertBefore(errorEl, inputElement.nextSibling);
  }
  errorEl.innerText = errorMessage;
}

function clearValidationError(inputElement) {
  inputElement.classList.remove('invalid');
  const errorEl = inputElement.nextElementSibling;
  if (errorEl && errorEl.classList.contains('validation-error')) {
    errorEl.remove();
  }
}

// 7. MENU SEARCH AND FILTER LOGIC
document.addEventListener('DOMContentLoaded', () => {
  const menuSearch = document.getElementById('menuSearch');
  
  if (menuSearch) {
    menuSearch.addEventListener('input', (e) => {
      const searchTerm = e.target.value.toLowerCase().trim();
      const menuCards = document.querySelectorAll('#menu .card');
      
      menuCards.forEach(card => {
        const title = card.querySelector('h3').innerText.toLowerCase();
        if (title.includes(searchTerm)) {
          card.style.display = '';
          card.style.animation = 'fadeIn 0.4s ease forwards';
        } else {
          card.style.display = 'none';
        }
      });

      // Check if no items match, display a "no results" message
      let noResultsMsg = document.getElementById('noResultsMessage');
      const matchCount = Array.from(menuCards).filter(c => c.style.display !== 'none').length;

      if (matchCount === 0) {
        if (!noResultsMsg) {
          noResultsMsg = document.createElement('div');
          noResultsMsg.id = 'noResultsMessage';
          noResultsMsg.style.textAlign = 'center';
          noResultsMsg.style.gridColumn = '1 / -1';
          noResultsMsg.style.padding = '40px 0';
          noResultsMsg.style.fontSize = '18px';
          noResultsMsg.style.color = '#777';
          noResultsMsg.innerHTML = '<i class="fas fa-utensils" style="font-size: 30px; color: #ff6b35; margin-bottom: 10px; display: block;"></i> No dishes found. Try searching for something else!';
          document.querySelector('.menu-container').appendChild(noResultsMsg);
        }
      } else {
        if (noResultsMsg) {
          noResultsMsg.remove();
        }
      }
    });
  }
});
