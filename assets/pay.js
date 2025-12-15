const ORDERS_KEY = 'demo_orders_v1'
function loadOrders(){try{return JSON.parse(localStorage.getItem(ORDERS_KEY))||[]}catch(e){return []}}
function saveOrders(o){localStorage.setItem(ORDERS_KEY,JSON.stringify(o))}
function simulatePayment(details){
  // details: {email, amount, items}
  return new Promise((resolve)=>{
    setTimeout(()=>resolve({ok:true, id:'ORD-'+Date.now()}), 900)
  })
}
async function submitPayment(formData){
  const cart = JSON.parse(localStorage.getItem('store_cart_v1')||'[]')
  const total = cart.reduce((s,i)=>s+(i.price||0),0)
  const resp = await simulatePayment({email:formData.email, amount:total, items:cart})
  if(resp.ok){
    // attach session user if present
    let session=null; try{ session = JSON.parse(localStorage.getItem('demo_session_v1')) }catch(e){session=null}
    const order = {id:resp.id,email:formData.email,amount:total,items:cart,created:Date.now(), userEmail: session && session.email ? session.email : null}
    const orders = loadOrders(); orders.push(order); saveOrders(orders);
    // clear cart
    localStorage.removeItem('store_cart_v1')
    // Attempt to send order email via local server if available (non-blocking)
    try{
      fetch((window.EMAIL_SERVER_URL||'http://localhost:3010') + '/send-order-email',{
        method:'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({email: order.email, order})
      }).then(r=>r.json()).then(j=>console.log('email send result',j)).catch(e=>console.warn('email send failed',e))
    }catch(e){ console.warn('email post failed',e) }
    return {ok:true, orderId:resp.id}
  }
  return {ok:false}
}
