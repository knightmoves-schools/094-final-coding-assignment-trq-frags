const CART_KEY = 'store_cart_v1'
function qs(sel){return document.querySelector(sel)}
function qsa(sel){return Array.from(document.querySelectorAll(sel))}
function saveCart(cart){
  localStorage.setItem(CART_KEY,JSON.stringify(cart))
  // notify same-page listeners
  document.dispatchEvent(new CustomEvent('cart:updated'))
}
function loadCart(){try{return JSON.parse(localStorage.getItem(CART_KEY))||[]}catch(e){return []}}
function renderCart(){
  const list = qs('#cartList');
  const cart = loadCart();
  list.innerHTML = '';
  if(cart.length===0){list.innerHTML='<div class="small ghost center">Your cart is empty</div>';qs('#cartTotal').textContent='$0.00';return}
  let total=0
  cart.forEach((it,i)=>{
    total += it.price
    const el = document.createElement('div'); el.className='cart-item';
    el.innerHTML = `
      <img src="${it.image}" alt="${it.name}">
      <div class="grow">
        <div>${it.name}</div>
        <div class="small ghost">${it.description||''}</div>
      </div>
      <div class="price">$${it.price.toFixed(2)}</div>
      <button class="add-btn" data-remove="${i}">Remove</button>
    `
    list.appendChild(el)
  })
  qs('#cartTotal').textContent=`$${total.toFixed(2)}`
}
function addToCart(product){const cart=loadCart();cart.push(product);saveCart(cart);renderCart();}
function removeFromCart(index){const cart=loadCart();cart.splice(index,1);saveCart(cart);renderCart();}
function clearCart(){localStorage.removeItem(CART_KEY);renderCart();}
function showClearConfirm(){
  const m = qs('#modalClear'); if(!m) return; m.classList.add('show'); m.setAttribute('aria-hidden','false');
}
function hideModal(){
  const m = qs('#modalClear'); if(!m) return; m.classList.remove('show'); m.setAttribute('aria-hidden','true');
}
function setup(){
  // add-to-cart buttons (if any)
  qsa('.add-to-cart').forEach(btn=>btn.addEventListener('click',e=>{
    const id=btn.dataset.id; const prod = PRODUCTS.find(p=>p.id===id); addToCart(prod);
    btn.textContent='Added ✓'; setTimeout(()=>btn.textContent='Add',300);
  }))

  // cart list click (if present)
  const cartList = qs('#cartList'); if(cartList) cartList.addEventListener('click',e=>{
    if(e.target.dataset.remove){removeFromCart(Number(e.target.dataset.remove))}
  })

  // checkout button (if present)
  const checkoutBtn = qs('#checkout'); if(checkoutBtn) checkoutBtn.addEventListener('click',()=>{
    const cart=loadCart(); if(cart.length===0){alert('Cart is empty'); return}
    // redirect to the payment page
  location.href = '/Webpages/webpage.html'
  })

  // search (if present)
  const searchEl = qs('#search'); if(searchEl) searchEl.addEventListener('input',e=>{
    const q = e.target.value.toLowerCase(); qsa('.product').forEach(el=>{
      const name = el.dataset.name.toLowerCase(); el.style.display = name.includes(q)?'block':'none'
    })
  })
  renderCart();
}

// products
const PRODUCTS = [
  {id:'p-roblox',name:'Roblox Account',price:1.99,description:'Starter account with items',image:'https://images.unsplash.com/photo-1545235617-9465dfgdfggdff9c6c04f?w=800&q=60'},
  {id:'p-minecraft',name:'Minecraft Account',price:4.50,description:'Minecraft accs',image:'https://images.unsplash.com/photo-1541807084-5c52b6bfdgdfgdfg6b7f4?w=800&q=60'},
  {id:'p-vpn',name:'VPN Service - 1mo',price:3.99,description:'VPN',image:'https://images.unsplash.com/photo-1504384308090-c894fddfgdfgdfgcc538d?w=800&q=60'},
  {id:'p-bundle',name:'Starter Bundle',price:10.99,description:'Roblox + Robux bundle',image:'https://images.unsplash.com/photo-1515879218367-8466dfgdfgd910aaa4?w=800&q=60'}
]

function buildProducts(){
  const grid = qs('#products');
  if(!grid) return; // run only on pages with product grid
  grid.innerHTML=''
  PRODUCTS.forEach(p=>{
    const el = document.createElement('div'); el.className='product card'; el.dataset.name = p.name;
    el.innerHTML = `
      <img src="${p.image}" alt="${p.name}">
      <div style="margin-top:8px;display:flex;justify-content:space-between;align-items:center">
        <div>
          <div style="font-weight:700">${p.name}</div>
          <div class="small ghost">${p.description}</div>
        </div>
        <div class="price">$${p.price.toFixed(2)}</div>
      </div>
      <div style="margin-top:10px;display:flex;gap:8px">
        <button class="add-btn add-to-cart" data-id="${p.id}">Add</button>
        <button class="add-btn" onclick="showProductModal('${p.id}')">See more</button>
      </div>
    `
    grid.appendChild(el)
  })
}

function showProductModal(id){
  const p = PRODUCTS.find(x=>x.id===id); if(!p) return;
  const m = qs('#modalProduct'); if(!m) return; m.classList.add('show'); m.setAttribute('aria-hidden','false');
  qs('#productTitle').textContent = p.name;
  qs('#productImage').src = p.image;
  qs('#productImage').alt = p.name;
  qs('#productDesc').textContent = p.description || '';
  // options area
  const opts = qs('#productOptions'); opts.innerHTML = '';
  // sample options (quantity / variations)
  const opt1 = document.createElement('div'); opt1.className='option'; opt1.textContent='Quantity: 1'; opts.appendChild(opt1);
  const opt2 = document.createElement('div'); opt2.className='option'; opt2.textContent='Instant delivery'; opts.appendChild(opt2);
  // wire add button
  qs('#productAdd').onclick = ()=>{ addToCart(p); hideProductModal(); }
  // wire open page button
  const openBtn = m.querySelector('.add-btn');
  if(openBtn){ openBtn.onclick = ()=>{ location.href = `/products/${p.id}.html` } }
}
function hideProductModal(){ const m = qs('#modalProduct'); if(!m) return; m.classList.remove('show'); m.setAttribute('aria-hidden','true'); }

document.addEventListener('DOMContentLoaded',()=>{
  // Always setup common listeners and render cart if present
  setup();
  // Build products only on pages that have a products grid
  buildProducts();
})
// Live re-render on same page when cart changes
document.addEventListener('cart:updated',()=>{
  if(qs('#cartList')) renderCart();
});

// Expose helpers globally so product pages and modals can use them
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.renderCart = renderCart;
window.clearCart = clearCart;

// Live updates across tabs/pages when localStorage changes
window.addEventListener('storage', (e)=>{
  if(e.key === CART_KEY){
    // re-render if cart UI exists on this page
    if(qs('#cartList')) renderCart();
  }
});
