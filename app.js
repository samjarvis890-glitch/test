// Demo data & app logic for Swiggy-style clone
(() => {
  const restaurants = [
    {
      id: 'r1',
      name: 'Spice Villa',
      cuisine: ['North Indian', 'Biryani'],
      rating: 4.5,
      eta: 32,
      costForTwo: 400,
      img: 'https://picsum.photos/seed/spice/400/240',
      tags: ['Biryani', 'North Indian'],
      menu: [
        { id:'m1', name:'Hyderabadi Biryani', price:220, desc:'Aromatic basmati rice with tender meat and spices.' },
        { id:'m2', name:'Butter Chicken', price:200, desc:'Creamy tomato gravy and soft chicken pieces.' },
        { id:'m3', name:'Paneer Tikka', price:180, desc:'Spiced cottage cheese, grilled to perfection.' }
      ]
    },
    {
      id: 'r2',
      name: 'Green Bowl',
      cuisine: ['Healthy', 'Salads'],
      rating: 4.7,
      eta: 25,
      costForTwo: 350,
      img: 'https://picsum.photos/seed/green/400/240',
      tags: ['Healthy', 'Salad'],
      menu: [
        { id:'m4', name:'Quinoa Bowl', price:210, desc:'Quinoa, roasted veggies, avocado and tahini.' },
        { id:'m5', name:'Greek Salad', price:150, desc:'Feta, cucumbers, olives and lemon dressing.' },
      ]
    },
    {
      id: 'r3',
      name: 'Sushi House',
      cuisine: ['Japanese'],
      rating: 4.4,
      eta: 38,
      costForTwo: 900,
      img: 'https://picsum.photos/seed/sushi/400/240',
      tags: ['Sushi', 'Japanese'],
      menu: [
        { id:'m6', name:'California Roll', price:320, desc:'Crab, avocado, cucumber.' },
        { id:'m7', name:'Salmon Sashimi', price:420, desc:'Fresh salmon slices.' },
      ]
    },
    {
      id: 'r4',
      name: 'Pasta & More',
      cuisine: ['Italian'],
      rating: 4.2,
      eta: 30,
      costForTwo: 550,
      img: 'https://picsum.photos/seed/pasta/400/240',
      tags: ['Pasta', 'Italian'],
      menu: [
        { id:'m8', name:'Spaghetti Carbonara', price:260, desc:'Creamy sauce with pancetta.' },
        { id:'m9', name:'Margherita Pizza', price:300, desc:'Classic tomato, basil & mozarella.' },
      ]
    },
    {
      id: 'r5',
      name: 'Curry Corner',
      cuisine: ['South Indian', 'Seafood'],
      rating: 4.3,
      eta: 28,
      costForTwo: 420,
      img: 'https://picsum.photos/seed/curry/400/240',
      tags: ['Curry', 'Seafood'],
      menu: [
        { id:'m10', name:'Fish Curry', price:260, desc:'Coastal spices, coconut base.' },
        { id:'m11', name:'Masala Dosa', price:120, desc:'Crispy dosa served with chutney & sambar.' },
      ]
    }
  ];

  // App state
  let state = {
    query: '',
    selectedCuisines: new Set(),
    sort: 'relevance',
    cart: {}, // {menuId: {item, qty, restaurantId}}
  };

  // DOM
  const restaurantsEl = document.getElementById('restaurants');
  const cuisineChipsEl = document.getElementById('cuisine-chips');
  const searchInput = document.getElementById('search');
  const clearSearchBtn = document.getElementById('clear-search');
  const sortSelect = document.getElementById('sort-select');
  const cartBtn = document.getElementById('cart-btn');
  const cartDrawer = document.getElementById('cart-drawer');
  const cartCount = document.getElementById('cart-count');
  const cartBody = document.getElementById('cart-body');
  const cartItemsCount = document.getElementById('cart-items-count');
  const cartSubtotal = document.getElementById('cart-subtotal');
  const cartClose = document.getElementById('close-cart');
  const clearCartBtn = document.getElementById('clear-cart');
  const checkoutBtn = document.getElementById('checkout-btn');
  const menuModal = document.getElementById('menu-modal');
  const checkoutModal = document.getElementById('checkout-modal');

  // Initialize UI
  document.getElementById('year').textContent = new Date().getFullYear();
  document.getElementById('hero-location').textContent = 'Koramangala';
  document.getElementById('location-text').textContent = 'Koramangala, Bengaluru';

  // Utility: unique cuisines
  const cuisines = Array.from(new Set(restaurants.flatMap(r => r.cuisine))).sort();

  function renderCuisineChips(){
    cuisineChipsEl.innerHTML = '';
    cuisines.forEach(c => {
      const btn = document.createElement('button');
      btn.className = 'chip';
      btn.textContent = c;
      btn.dataset.c = c;
      if(state.selectedCuisines.has(c)) btn.classList.add('active');
      btn.addEventListener('click', () => {
        if(state.selectedCuisines.has(c)) state.selectedCuisines.delete(c);
        else state.selectedCuisines.add(c);
        renderCuisineChips();
        renderRestaurants();
      });
      cuisineChipsEl.appendChild(btn);
    });
  }

  // Filtering + sorting
  function filterAndSort(data){
    let out = data.slice();

    // search
    const q = state.query.trim().toLowerCase();
    if(q){
      out = out.filter(r => {
        const hay = (r.name + ' ' + r.cuisine.join(' ') + ' ' + r.tags.join(' ')).toLowerCase();
        return hay.includes(q);
      });
    }

    // cuisines filter
    if(state.selectedCuisines.size){
      out = out.filter(r => r.cuisine.some(c => state.selectedCuisines.has(c)));
    }

    // sort
    switch(state.sort){
      case 'rating': out.sort((a,b)=> b.rating - a.rating); break;
      case 'delivery-time': out.sort((a,b)=> a.eta - b.eta); break;
      case 'cost-asc': out.sort((a,b)=> a.costForTwo - b.costForTwo); break;
      case 'cost-desc': out.sort((a,b)=> b.costForTwo - a.costForTwo); break;
      default: /* relevance = default order */ break;
    }
    return out;
  }

  function createRestaurantCard(r){
    const c = document.createElement('article');
    c.className = 'restaurant-card';
    c.innerHTML = `
      <img class="restaurant-img" src="${r.img}" alt="${r.name}" />
      <div class="restaurant-info">
        <h3>${r.name}</h3>
        <div class="muted row">
          <div>${r.cuisine.join(' • ')}</div>
        </div>
        <div class="row" style="margin-top:8px;gap:12px">
          <div class="badge">${r.rating} ★</div>
          <div class="muted">${r.eta} mins</div>
          <div class="muted">₹${r.costForTwo} for two</div>
        </div>
      </div>
      <div class="card-right">
        <div class="muted" style="font-size:13px">Offers</div>
        <button class="btn primary open-menu" data-id="${r.id}">View menu</button>
      </div>
    `;
    // Open menu handler
    c.querySelector('.open-menu').addEventListener('click', () => openMenu(r.id));
    return c;
  }

  function renderRestaurants(){
    restaurantsEl.innerHTML = '';
    const list = filterAndSort(restaurants);
    if(!list.length){
      restaurantsEl.innerHTML = `<div class="muted">No restaurants found. Try clearing filters or search terms.</div>`;
      return;
    }
    list.forEach(r => restaurantsEl.appendChild(createRestaurantCard(r)));
  }

  // Menu modal
  const modalBackdrop = document.getElementById('modal-backdrop');
  const menuRestaurantImg = document.getElementById('menu-restaurant-img');
  const menuRestaurantName = document.getElementById('menu-restaurant-name');
  const menuRestaurantMeta = document.getElementById('menu-restaurant-meta');
  const menuItemsEl = document.getElementById('menu-items');
  const closeModalBtn = document.getElementById('close-modal');
  const addSelectedBtn = document.getElementById('add-selected');

  let currentMenuRestaurant = null;
  let selectedMenuItems = new Map();

  function openMenu(restaurantId){
    const r = restaurants.find(rr => rr.id === restaurantId);
    if(!r) return;
    currentMenuRestaurant = r;
    selectedMenuItems.clear();
    menuRestaurantImg.src = r.img;
    menuRestaurantImg.alt = r.name;
    menuRestaurantName.textContent = r.name;
    menuRestaurantMeta.textContent = `${r.cuisine.join(' • ')} • ${r.eta} mins • ₹${r.costForTwo} for two`;
    menuItemsEl.innerHTML = '';
    r.menu.forEach(mi => {
      const item = document.createElement('div');
      item.className = 'menu-item';
      item.innerHTML = `
        <div style="flex:1">
          <h4>${mi.name}</h4>
          <div class="muted" style="font-size:13px">${mi.desc}</div>
        </div>
        <div style="display:flex;flex-direction:column;align-items:flex-end;gap:8px">
          <div class="price">₹${mi.price}</div>
          <div style="display:flex;gap:6px;align-items:center">
            <button class="btn ghost dec" data-id="${mi.id}" aria-label="decrease">−</button>
            <div class="qty" id="qty-${mi.id}">0</div>
            <button class="btn primary inc" data-id="${mi.id}" aria-label="increase">+</button>
          </div>
        </div>
      `;
      menuItemsEl.appendChild(item);

      item.querySelector('.inc').addEventListener('click', () => {
        const prev = selectedMenuItems.get(mi.id) || 0;
        selectedMenuItems.set(mi.id, prev + 1);
        updateQtyDisplay(mi.id);
      });
      item.querySelector('.dec').addEventListener('click', () => {
        const prev = selectedMenuItems.get(mi.id) || 0;
        if(prev <= 1) selectedMenuItems.delete(mi.id);
        else selectedMenuItems.set(mi.id, prev - 1);
        updateQtyDisplay(mi.id);
      });
    });

    // Show modal
    menuModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function updateQtyDisplay(menuId){
    const el = document.getElementById(`qty-${menuId}`);
    const v = selectedMenuItems.get(menuId) || 0;
    if(el) el.textContent = v;
  }

  function closeMenu(){
    menuModal.setAttribute('aria-hidden','true');
    document.body.style.overflow = '';
  }

  closeModalBtn.addEventListener('click', closeMenu);
  modalBackdrop.addEventListener('click', closeMenu);

  addSelectedBtn.addEventListener('click', () => {
    if(!currentMenuRestaurant) return;
    // Add selected items to cart
    for(const [menuId, qty] of selectedMenuItems.entries()){
      const item = currentMenuRestaurant.menu.find(m => m.id === menuId);
      if(!item) continue;
      addToCart(currentMenuRestaurant.id, item, qty);
    }
    selectedMenuItems.clear();
    // reset qty displays (in case modal still open)
    currentMenuRestaurant.menu.forEach(mi => updateQtyDisplay(mi.id));
    closeMenu();
    openCart();
  });

  // Cart logic
  function addToCart(restaurantId, item, qty=1){
    // single-restaurant constraint (optional): for demo, allow mixing but show small note
    const key = item.id;
    if(state.cart[key]){
      state.cart[key].qty += qty;
    } else {
      state.cart[key] = { item: {...item}, qty: qty, restaurantId };
    }
    renderCart();
  }

  function removeFromCart(key){
    delete state.cart[key];
    renderCart();
  }

  function changeQty(key, delta){
    if(!state.cart[key]) return;
    state.cart[key].qty += delta;
    if(state.cart[key].qty <= 0) removeFromCart(key);
    renderCart();
  }

  function computeCart(){
    const entries = Object.entries(state.cart);
    const items = entries.length;
    const subtotal = entries.reduce((s, [k,v])=> s + (v.item.price * v.qty), 0);
    return { items, subtotal, entries };
  }

  function renderCart(){
    const { items, subtotal, entries } = computeCart();
    cartCount.textContent = items;
    cartItemsCount.textContent = items;
    cartSubtotal.textContent = subtotal;
    cartBody.innerHTML = '';
    if(!entries.length){
      cartBody.innerHTML = `<div class="muted">Your cart is empty. Add tasty dishes from menus.</div>`;
      return;
    }
    entries.forEach(([k, v]) => {
      const el = document.createElement('div');
      el.className = 'cart-item';
      el.innerHTML = `
        <div style="flex:1">
          <div style="font-weight:700">${v.item.name}</div>
          <div class="muted">₹${v.item.price} • ${v.qty} ×</div>
        </div>
        <div style="display:flex;flex-direction:column;align-items:flex-end;gap:6px">
          <div style="font-weight:700">₹${v.item.price * v.qty}</div>
          <div style="display:flex;gap:6px">
            <button class="btn ghost dec" data-key="${k}">−</button>
            <div style="padding:6px 8px;border-radius:8px;background:#f3f4f6">${v.qty}</div>
            <button class="btn primary inc" data-key="${k}">+</button>
          </div>
        </div>
      `;
      cartBody.appendChild(el);

      el.querySelector('.dec').addEventListener('click', () => changeQty(k, -1));
      el.querySelector('.inc').addEventListener('click', () => changeQty(k, +1));
    });
  }

  // Cart drawer open/close
  function openCart(){
    cartDrawer.classList.add('open');
    cartDrawer.setAttribute('aria-hidden', 'false');
  }
  function closeCart(){
    cartDrawer.classList.remove('open');
    cartDrawer.setAttribute('aria-hidden', 'true');
  }
  cartBtn.addEventListener('click', () => {
    renderCart();
    openCart();
  });
  cartClose.addEventListener('click', () => closeCart());

  clearCartBtn.addEventListener('click', () => {
    state.cart = {};
    renderCart();
  });

  // Checkout
  checkoutBtn.addEventListener('click', () => {
    closeCart();
    checkoutModal.setAttribute('aria-hidden','false');
    document.body.style.overflow = 'hidden';
  });
  document.getElementById('close-checkout').addEventListener('click', () => {
    checkoutModal.setAttribute('aria-hidden','true');
    document.body.style.overflow = '';
  });
  document.getElementById('place-order').addEventListener('click', () => {
    const { items, subtotal } = computeCart();
    if(items === 0){
      alert('Your cart is empty!');
      return;
    }
    const name = document.getElementById('cust-name').value.trim() || 'Guest';
    const phone = document.getElementById('cust-phone').value.trim() || 'N/A';
    const address = document.getElementById('cust-address').value.trim() || 'N/A';
    // Demo order summary
    alert(`Order placed (demo)\nName: ${name}\nPhone: ${phone}\nAddress: ${address}\nItems: ${items}\nSubtotal: ₹${subtotal}`);
    // Clear cart & close modal
    state.cart = {};
    renderCart();
    checkoutModal.setAttribute('aria-hidden','true');
    document.body.style.overflow = '';
  });

  // Search & sort handlers
  searchInput.addEventListener('input', (e) => {
    state.query = e.target.value;
    renderRestaurants();
  });
  clearSearchBtn.addEventListener('click', () => {
    searchInput.value = '';
    searchInput.focus();
    state.query = '';
    renderRestaurants();
  });
  sortSelect.addEventListener('change', (e) => {
    state.sort = e.target.value;
    renderRestaurants();
  });

  // Keyboard shortcuts (nice-to-have)
  window.addEventListener('keydown', (e) => {
    if(e.key === 'k' && (e.ctrlKey || e.metaKey)){
      e.preventDefault();
      searchInput.focus();
    }
    if(e.key === 'Escape'){
      closeMenu();
      closeCart();
      checkoutModal.setAttribute('aria-hidden','true');
    }
  });

  // Initial render
  renderCuisineChips();
  renderRestaurants();
  renderCart();
})();
