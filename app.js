const categories=[{name:"Grocery & daily needs",icon:"🛒",count:"Everyday essentials"},{name:"Electronics",icon:"🎧",count:"Gadgets & accessories"},{name:"Fashion",icon:"👕",count:"Clothing & lifestyle"},{name:"Home & kitchen",icon:"🏠",count:"Home essentials"},{name:"Hardware",icon:"🔧",count:"Tools & supplies"},{name:"Beauty & personal care",icon:"🧴",count:"Care & wellness"},{name:"Stationery",icon:"✏️",count:"School & office"},{name:"Toys & games",icon:"🧸",count:"Play & learning"},{name:"Footwear",icon:"👟",count:"Shoes & sandals"},{name:"Mobile accessories",icon:"📱",count:"Phone essentials"},{name:"Packaging",icon:"📦",count:"Business supplies"},{name:"More categories",icon:"✳️",count:"Explore everything"}];
const products=[{id:1,name:"Everyday grocery combo",category:"Grocery & daily needs",icon:"🛍️",price:850,unit:"per combo",moq:"MOQ: 5 combos",tag:"Popular",bg:"#f2f3e8"},{id:2,name:"Wireless earbuds",category:"Electronics",icon:"🎧",price:399,unit:"per piece",moq:"MOQ: 10 pieces",tag:"Trending",bg:"#e9eff4"},{id:3,name:"Cotton T-shirt pack",category:"Fashion",icon:"👕",price:699,unit:"per pack",moq:"MOQ: 5 packs",tag:"Bulk deal",bg:"#f3eae5"},{id:4,name:"Kitchen storage set",category:"Home & kitchen",icon:"🍱",price:520,unit:"per set",moq:"MOQ: 6 sets",tag:"Popular",bg:"#e9f1eb"},{id:5,name:"Hand tool kit",category:"Hardware",icon:"🧰",price:1100,unit:"per kit",moq:"MOQ: 3 kits",tag:"New",bg:"#f1eee5"},{id:6,name:"Personal care bundle",category:"Beauty & personal care",icon:"🧴",price:475,unit:"per bundle",moq:"MOQ: 8 bundles",tag:"Bulk deal",bg:"#f3eaf0"},{id:7,name:"Notebook carton",category:"Stationery",icon:"📚",price:620,unit:"per carton",moq:"MOQ: 2 cartons",tag:"Popular",bg:"#e9edf5"},{id:8,name:"Kids learning toys",category:"Toys & games",icon:"🧸",price:560,unit:"per set",moq:"MOQ: 4 sets",tag:"New",bg:"#f4eee4"}];
const state={category:"All",cart:{}};const $=s=>document.querySelector(s);const money=n=>"₹"+n.toLocaleString("en-IN");
function renderCategories(){$("#categoryGrid").innerHTML=categories.map(c=>`<button class="category-card ${state.category===c.name?"selected":""}" data-category="${c.name}"><span class="cat-icon">${c.icon}</span><b>${c.name}</b><small>${c.count}</small></button>`).join("");}
function renderFilters(){const names=["All",...new Set(products.map(p=>p.category))];$("#filterRow").innerHTML=names.map(n=>`<button class="filter ${state.category===n?"active":""}" data-filter="${n}">${n==="All"?"All products":n}</button>`).join("");}
function renderProducts(){let list=products.filter(p=>(state.category==="All"||p.category===state.category)&&((p.name+" "+p.category).toLowerCase().includes($("#search").value.toLowerCase())));const sort=$("#sortSelect").value;if(sort==="low")list.sort((a,b)=>a.price-b.price);if(sort==="high")list.sort((a,b)=>b.price-a.price);$("#productGrid").innerHTML=list.length?list.map(p=>`<article class="product-card"><div class="product-visual" style="background:${p.bg}"><small>${p.tag}</small><span>${p.icon}</span></div><div class="product-info"><span class="category">${p.category}</span><h3>${p.name}</h3><div class="price-row"><strong>${money(p.price)}</strong><small>${p.unit}</small></div><div class="moq">${p.moq}</div><button class="add-button" data-add="${p.id}">＋ Add to cart</button></div></article>`).join(""):`<p class="empty-cart">No matching products. Try another search or category.</p>`;}
function cartCount(){return Object.values(state.cart).reduce((a,b)=>a+b,0)}
function renderCart(){$("#cartCount").textContent=cartCount();const entries=Object.entries(state.cart);$("#cartItems").innerHTML=entries.length?entries.map(([id,q])=>{const p=products.find(x=>x.id===+id);return `<div class="cart-item"><div><b>${p.name}</b><small>${money(p.price)} · ${p.moq}</small></div><div class="qty-controls"><button data-qty="${id}" data-delta="-1">−</button><b>${q}</b><button data-qty="${id}" data-delta="1">+</button></div></div>`}).join(""):`<div class="empty-cart">Your cart is waiting.<br><small>Add products to get started.</small></div>`;const total=entries.reduce((sum,[id,q])=>sum+products.find(p=>p.id===+id).price*q,0);$("#cartTotal").textContent=money(total);}
function toast(msg){const el=$("#toast");el.textContent=msg;el.classList.add("show");setTimeout(()=>el.classList.remove("show"),2200)}
function setCategory(c){state.category=c;renderCategories();renderFilters();renderProducts();$("#catalogue").scrollIntoView({behavior:"smooth"});}
function openCart(){renderCart();$("#overlay").classList.add("show");$("#cartDrawer").classList.add("show")}
function closeCart(){$("#overlay").classList.remove("show");$("#cartDrawer").classList.remove("show")}
function openSeller(){$("#sellerModal").classList.add("show");$("#overlay").classList.add("show");if(typeof loadSellerProducts==="function")loadSellerProducts()}
function closeSeller(){$("#sellerModal").classList.remove("show");$("#overlay").classList.remove("show")}
$("#categoryGrid").addEventListener("click",e=>{const b=e.target.closest("[data-category]");if(b)setCategory(b.dataset.category)});
$("#filterRow").addEventListener("click",e=>{const b=e.target.closest("[data-filter]");if(b){state.category=b.dataset.filter;renderCategories();renderFilters();renderProducts()}});
$("#productGrid").addEventListener("click",e=>{const b=e.target.closest("[data-add]");if(b){const id=b.dataset.add;state.cart[id]=(state.cart[id]||0)+1;renderCart();toast("Added to your cart") }});
$("#cartItems").addEventListener("click",e=>{const b=e.target.closest("[data-qty]");if(!b)return;const id=b.dataset.qty;state.cart[id]+=+b.dataset.delta;if(state.cart[id]<=0)delete state.cart[id];renderCart()});
$("#search").addEventListener("input",renderProducts);$("#sortSelect").addEventListener("change",renderProducts);$("#cartOpen").addEventListener("click",openCart);$("#cartClose").addEventListener("click",closeCart);$("#overlay").addEventListener("click",()=>{closeCart();closeSeller();if(typeof hideAuth==="function")hideAuth();if($("#adminModal")){$("#adminModal").classList.remove("show");}});
["sellerNav","heroSeller","sellerCta"].forEach(id=>$("#"+id).addEventListener("click",openSeller));$("#modalClose").addEventListener("click",closeSeller);
$("#mobileMenu").addEventListener("click",()=>$(".topbar").classList.toggle("menu-open"));
$("#checkoutBtn").addEventListener("click",()=>toast("Order enquiry will be enabled after backend setup."));
$("#sellerForm").addEventListener("submit",async e=>{e.preventDefault();const msg=$("#formMessage");if(!window.marketSupabase){msg.textContent="Account service is not configured.";return;}const {data:{user}}=await window.marketSupabase.auth.getUser();if(!user){msg.textContent="Please sign in first, then submit your seller application.";return;}const f=new FormData(e.currentTarget);const {error}=await window.marketSupabase.from("seller_applications").insert({user_id:user.id,business_name:f.get("business"),contact_name:f.get("name"),phone:f.get("phone"),category:f.get("category")});msg.textContent=error?error.message:"Application submitted! Status: pending admin review.";if(!error)e.currentTarget.reset();});
renderCategories();renderFilters();renderProducts();renderCart();
const SUPABASE_URL="https://vhnelmarhqvsncgczazk.supabase.co";const SUPABASE_PUBLISHABLE_KEY="sb_publishable_2uLOLMsuzy2vI9FPe2GbrQ_M94h136I";window.marketSupabase=window.supabase?.createClient(SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY)||null;let authMode="signin";function showAuth(){$("#authModal").classList.add("show");$("#overlay").classList.add("show");}function hideAuth(){$("#authModal").classList.remove("show");$("#overlay").classList.remove("show");}function setAuthMessage(m){$("#authMessage").textContent=m;}function updateAuthButton(user){$("#authOpen").textContent=user?(user.email?.split("@")[0]||"My account")+" · Sign out":"Sign in / Join";const admin=!!(user?.app_metadata?.role==="admin");$("#adminNav").hidden=!admin;}$("#authOpen").addEventListener("click",async()=>{if(!window.marketSupabase){toast("Account service unavailable");return;}const {data:{user}}=await window.marketSupabase.auth.getUser();if(user){await window.marketSupabase.auth.signOut();updateAuthButton(null);toast("Signed out");}else showAuth();});$("#authClose").addEventListener("click",hideAuth);$("#authToggle").addEventListener("click",()=>{authMode=authMode==="signin"?"signup":"signin";$("#authTitle").textContent=authMode==="signin"?"Welcome back":"Create your account";$("#authHelp").textContent=authMode==="signin"?"Sign in to continue.":"Join as a retailer and discover wholesale products.";$("#authSubmit").textContent=authMode==="signin"?"Sign in":"Create account";$("#authToggle").textContent=authMode==="signin"?"Create account":"I already have an account";$("#fullNameLabel").hidden=authMode!=="signup";setAuthMessage("");});$("#authForm").addEventListener("submit",async e=>{e.preventDefault();if(!window.marketSupabase){setAuthMessage("Account service unavailable. Refresh and try again.");return;}const f=new FormData(e.currentTarget);$("#authSubmit").disabled=true;let result;if(authMode==="signup"){result=await window.marketSupabase.auth.signUp({email:f.get("email"),password:f.get("password"),options:{data:{full_name:f.get("full_name")}}});if(!result.error&&result.data.user)await window.marketSupabase.from("profiles").upsert({id:result.data.user.id,full_name:f.get("full_name")||""});}else result=await window.marketSupabase.auth.signInWithPassword({email:f.get("email"),password:f.get("password")});$("#authSubmit").disabled=false;if(result.error){setAuthMessage(result.error.message);return;}if(authMode==="signup"&&!result.data.session){setAuthMessage("Account created. Check your email to confirm, then sign in.");return;}updateAuthButton(result.data.user);setAuthMessage("Signed in successfully.");setTimeout(hideAuth,700);});if(window.marketSupabase){window.marketSupabase.auth.getUser().then(({data})=>updateAuthButton(data.user));window.marketSupabase.auth.onAuthStateChange((_event,session)=>updateAuthButton(session?.user||null));}

// Authenticated backend API client. The demo catalogue is deliberately not orderable
// until real UUID-backed supplier products and a delivery-address form are connected.
window.marketplaceApi = {
  async request(path, options = {}) {
    if (!window.marketSupabase) throw new Error("Account service is not configured");
    const { data: { session } } = await window.marketSupabase.auth.getSession();
    if (!session?.access_token) throw new Error("Please sign in first");
    const response = await fetch(SUPABASE_URL + "/functions/v1/marketplace-api/" + path, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        "apikey": SUPABASE_PUBLISHABLE_KEY,
        "Authorization": "Bearer " + session.access_token,
        ...(options.headers || {})
      }
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.error || "Marketplace API request failed");
    return result;
  },
  placeOrder({ items, delivery_address, buyer_note = "" }) {
    return this.request("orders", {
      method: "POST",
      body: JSON.stringify({ items, delivery_address, buyer_note })
    });
  },
  getMyOrders() {
    return this.request("orders", { method: "GET" });
  }
};


// Seller product upload and listing dashboard.
const PRODUCT_IMAGE_BUCKET = "product-images";
function setProductMessage(message, isError = false) {
  const el = document.querySelector("#productMessage");
  if (el) { el.textContent = message; el.style.color = isError ? "#b42318" : ""; }
}
async function loadSellerProducts() {
  const panel = document.querySelector("#sellerProductsPanel");
  if (!panel || !window.marketSupabase) return;
  const supabase = window.marketSupabase;
  const notice = document.querySelector("#sellerProductNotice");
  const form = document.querySelector("#productForm");
  const list = document.querySelector("#myProducts");
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    notice.textContent = "Sign in first. Seller applications need admin approval before you can list products.";
    form.hidden = true; list.textContent = "Sign in to view your listings."; return;
  }
  const { data: application, error: appError } = await supabase.from("seller_applications")
    .select("status").eq("user_id", user.id).order("created_at", { ascending: false }).limit(1).maybeSingle();
  if (appError) { notice.textContent = "Could not check seller approval. Please retry."; form.hidden = true; return; }
  if (!application) {
    notice.textContent = "Submit the seller application above. Your product listing access opens after admin approval.";
    form.hidden = true; list.textContent = "No seller application found."; return;
  }
  if (application.status !== "approved") {
    notice.textContent = "Seller application status: " + application.status + ". Product uploads unlock after approval.";
    form.hidden = true; list.textContent = "Your application is awaiting approval."; return;
  }
  notice.textContent = "Seller approved. Add products below; new listings remain hidden until admin activation.";
  form.hidden = false;
  const { data: products, error } = await supabase.from("products")
    .select("id,name,category,price_paise,unit,minimum_quantity,stock_quantity,image_url,is_active,created_at")
    .eq("seller_user_id", user.id).order("created_at", { ascending: false }).limit(100);
  if (error) { list.textContent = "Unable to load products."; return; }
  list.innerHTML = products?.length ? products.map(p => `
    <article class="my-product">
      ${p.image_url ? `<img src="${p.image_url}" alt="">` : ""}
      <div><b>${escapeProductText(p.name)}</b><small>${escapeProductText(p.category)} · ₹${(p.price_paise / 100).toFixed(2)} / ${escapeProductText(p.unit)}</small>
      <small>MOQ ${p.minimum_quantity} · Stock ${p.stock_quantity} · ${p.is_active ? "Live" : "Pending admin approval"}</small></div>
    </article>`).join("") : "No products listed yet.";
}
function escapeProductText(value) {
  return String(value ?? "").replace(/[&<>"']/g, ch => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[ch]));
}
document.querySelector("#productForm")?.addEventListener("submit", async event => {
  event.preventDefault();
  const form = event.currentTarget;
  const submit = document.querySelector("#productSubmit");
  const file = form.elements.image.files[0];
  if (!window.marketSupabase || !file) { setProductMessage("Sign in and choose a product photo.", true); return; }
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 5 * 1024 * 1024) {
    setProductMessage("Use JPG, PNG or WEBP image up to 5 MB.", true); return;
  }
  submit.disabled = true; setProductMessage("Uploading product photo…");
  try {
    const supabase = window.marketSupabase;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Please sign in first.");
    const { data: application, error: appError } = await supabase.from("seller_applications")
      .select("status").eq("user_id", user.id).eq("status", "approved").limit(1).maybeSingle();
    if (appError) throw appError;
    if (!application) throw new Error("Your seller account is not approved yet.");
    const ext = file.type === "image/jpeg" ? "jpg" : file.type.split("/")[1];
    const path = user.id + "/" + crypto.randomUUID() + "." + ext;
    const { error: uploadError } = await supabase.storage.from(PRODUCT_IMAGE_BUCKET).upload(path, file, { contentType: file.type, upsert: false });
    if (uploadError) throw uploadError;
    const { data: publicData } = supabase.storage.from(PRODUCT_IMAGE_BUCKET).getPublicUrl(path);
    const data = new FormData(form);
    const pricePaise = Math.round(Number(data.get("price")) * 100);
    if (!Number.isSafeInteger(pricePaise) || pricePaise < 1) throw new Error("Enter a valid wholesale price.");
    const product = {
      seller_user_id: user.id, name: String(data.get("name")).trim(),
      description: String(data.get("description") || "").trim(), category: data.get("category"),
      price_paise: pricePaise, unit: String(data.get("unit")).trim(),
      minimum_quantity: Number(data.get("minimum_quantity")), stock_quantity: Number(data.get("stock_quantity")),
      image_url: publicData.publicUrl, is_active: false
    };
    const { error: insertError } = await supabase.from("products").insert(product);
    if (insertError) {
      await supabase.storage.from(PRODUCT_IMAGE_BUCKET).remove([path]);
      throw insertError;
    }
    form.reset(); setProductMessage("Product submitted. It will appear in the public catalogue after admin approval.");
    await loadSellerProducts();
  } catch (error) {
    setProductMessage(error.message || "Product upload failed. Please try again.", true);
  } finally { submit.disabled = false; }
});


// Admin dashboard: visibility and all mutations rely on trusted app_metadata role
// plus the matching database RLS policies. No client-side role escalation is exposed.
function openAdmin(){ $("#adminModal").classList.add("show"); $("#overlay").classList.add("show"); loadAdminDashboard(); }
$("#adminNav")?.addEventListener("click",openAdmin);
$("#adminClose")?.addEventListener("click",()=>{$("#adminModal").classList.remove("show");$("#overlay").classList.remove("show");});
function adminNotice(message,isError=false){const el=$("#adminMessage");el.textContent=message;el.style.color=isError?"#b42318":"";}
async function loadAdminDashboard(){
 const supabase=window.marketSupabase;
 if(!supabase){adminNotice("Account service unavailable.",true);return;}
 const {data:{user}}=await supabase.auth.getUser();
 if(!user||user.app_metadata?.role!=="admin"){adminNotice("Administrator access required. Ask the project owner to grant the admin role securely in Supabase Auth app_metadata.",true);$("#adminApplications").textContent="Not authorized." ;$("#adminProducts").textContent="Not authorized.";return;}
 adminNotice("Administrator access verified.");
 const [apps,products]=await Promise.all([
  supabase.from("seller_applications").select("id,user_id,business_name,contact_name,phone,category,status,created_at").order("created_at",{ascending:false}).limit(100),
  supabase.from("products").select("id,seller_user_id,name,category,price_paise,unit,minimum_quantity,stock_quantity,image_url,is_active,created_at").order("created_at",{ascending:false}).limit(100)
 ]);
 if(apps.error){$("#adminApplications").textContent="Could not load seller applications: "+apps.error.message;}else{
  $("#adminApplications").innerHTML=apps.data.length?apps.data.map(x=>`<article class="admin-row"><div><b>${escapeProductText(x.business_name)}</b><small>${escapeProductText(x.contact_name)} · ${escapeProductText(x.phone)}</small><small>${escapeProductText(x.category)} · ${escapeProductText(x.status)}</small></div><div class="admin-actions">${x.status!=="approved"?`<button data-app-action="approved" data-id="${x.id}">Approve</button>`:""}${x.status!=="rejected"?`<button data-app-action="rejected" data-id="${x.id}">Reject</button>`:""}</div></article>`).join(""):"No seller applications yet.";
 }
 if(products.error){$("#adminProducts").textContent="Could not load products: "+products.error.message;}else{
  $("#adminProducts").innerHTML=products.data.length?products.data.map(x=>`<article class="admin-row"><div class="admin-product-main">${x.image_url?`<img src="${x.image_url}" alt="">`:""}<div><b>${escapeProductText(x.name)}</b><small>${escapeProductText(x.category)} · ₹${(x.price_paise/100).toFixed(2)} / ${escapeProductText(x.unit)}</small><small>MOQ ${x.minimum_quantity} · Stock ${x.stock_quantity} · ${x.is_active?"Live":"Pending"}</small></div></div><div class="admin-actions"><button data-product-active="${!x.is_active}" data-id="${x.id}">${x.is_active?"Deactivate":"Activate"}</button></div></article>`).join(""):"No products submitted yet.";
 }
}
$("#adminApplications")?.addEventListener("click",async e=>{
 const b=e.target.closest("[data-app-action]");if(!b)return;b.disabled=true;
 const {error}=await window.marketSupabase.from("seller_applications").update({status:b.dataset.appAction,reviewed_at:new Date().toISOString()}).eq("id",b.dataset.id);
 if(error)adminNotice("Seller review failed: "+error.message,true);else{adminNotice("Seller application updated.");await loadAdminDashboard();}b.disabled=false;
});
$("#adminProducts")?.addEventListener("click",async e=>{
 const b=e.target.closest("[data-product-active]");if(!b)return;b.disabled=true;
 const {error}=await window.marketSupabase.from("products").update({is_active:b.dataset.productActive==="true"}).eq("id",b.dataset.id);
 if(error)adminNotice("Product update failed: "+error.message,true);else{adminNotice("Product visibility updated.");await loadAdminDashboard();}b.disabled=false;
});
