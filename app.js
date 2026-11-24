const categories=[{name:"Grocery & daily needs",icon:"🛒",count:"Everyday essentials"},{name:"Electronics",icon:"🎧",count:"Gadgets & accessories"},{name:"Fashion",icon:"👕",count:"Clothing & lifestyle"},{name:"Home & kitchen",icon:"🏠",count:"Home essentials"},{name:"Hardware",icon:"🔧",count:"Tools & supplies"},{name:"Beauty & personal care",icon:"🧴",count:"Care & wellness"},{name:"Stationery",icon:"✏️",count:"School & office"},{name:"Toys & games",icon:"🧸",count:"Play & learning"},{name:"Footwear",icon:"👟",count:"Shoes & sandals"},{name:"Mobile accessories",icon:"📱",count:"Phone essentials"},{name:"Packaging",icon:"📦",count:"Business supplies"},{name:"More categories",icon:"✳️",count:"Explore everything"}];
let products=[{id:1,name:"Everyday grocery combo",category:"Grocery & daily needs",icon:"🛍️",price:850,unit:"per combo",moq:"MOQ: 5 combos",tag:"Popular",bg:"#f2f3e8"},{id:2,name:"Wireless earbuds",category:"Electronics",icon:"🎧",price:399,unit:"per piece",moq:"MOQ: 10 pieces",tag:"Trending",bg:"#e9eff4"},{id:3,name:"Cotton T-shirt pack",category:"Fashion",icon:"👕",price:699,unit:"per pack",moq:"MOQ: 5 packs",tag:"Bulk deal",bg:"#f3eae5"},{id:4,name:"Kitchen storage set",category:"Home & kitchen",icon:"🍱",price:520,unit:"per set",moq:"MOQ: 6 sets",tag:"Popular",bg:"#e9f1eb"},{id:5,name:"Hand tool kit",category:"Hardware",icon:"🧰",price:1100,unit:"per kit",moq:"MOQ: 3 kits",tag:"New",bg:"#f1eee5"},{id:6,name:"Personal care bundle",category:"Beauty & personal care",icon:"🧴",price:475,unit:"per bundle",moq:"MOQ: 8 bundles",tag:"Bulk deal",bg:"#f3eaf0"},{id:7,name:"Notebook carton",category:"Stationery",icon:"📚",price:620,unit:"per carton",moq:"MOQ: 2 cartons",tag:"Popular",bg:"#e9edf5"},{id:8,name:"Kids learning toys",category:"Toys & games",icon:"🧸",price:560,unit:"per set",moq:"MOQ: 4 sets",tag:"New",bg:"#f4eee4"}];
const state={category:"All",cart:{},catalogueLive:false};const $=s=>document.querySelector(s);const money=n=>"₹"+n.toLocaleString("en-IN");
function renderCategories(){$("#categoryGrid").innerHTML=categories.map(c=>`<button class="category-card ${state.category===c.name?"selected":""}" data-category="${c.name}"><span class="cat-icon">${c.icon}</span><b>${c.name}</b><small>${c.count}</small></button>`).join("");}
function renderFilters(){const names=["All",...new Set(products.map(p=>p.category))];$("#filterRow").innerHTML=names.map(n=>`<button class="filter ${state.category===n?"active":""}" data-filter="${n}">${n==="All"?"All products":n}</button>`).join("");}
function renderProducts(){let list=products.filter(p=>(state.category==="All"||p.category===state.category)&&((p.name+" "+p.category).toLowerCase().includes($("#search").value.toLowerCase())));const sort=$("#sortSelect").value;if(sort==="low")list.sort((a,b)=>a.price-b.price);if(sort==="high")list.sort((a,b)=>b.price-a.price);$("#productGrid").innerHTML=list.length?list.map(p=>`<article class="product-card"><div class="product-visual" style="background:${p.bg}"><small>${escapeProductText(p.tag)}</small>${p.imageUrl?`<img class="product-photo" src="${escapeProductText(p.imageUrl)}" alt="${escapeProductText(p.name)}" loading="lazy">`:`<span>${p.icon}</span>`}</div><div class="product-info"><span class="category">${escapeProductText(p.category)}</span><h3>${escapeProductText(p.name)}</h3><div class="price-row"><strong>${money(p.price)}</strong><small>${p.unit}</small></div><div class="moq">${p.moq}</div><button class="add-button" data-add="${p.id}">＋ Add to cart</button></div></article>`).join(""):`<p class="empty-cart">No matching products. Try another search or category.</p>`;}
function cartCount(){return Object.values(state.cart).reduce((a,b)=>a+b,0)}
function renderCart(){$("#cartCount").textContent=cartCount();const entries=Object.entries(state.cart);$("#cartItems").innerHTML=entries.length?entries.map(([id,q])=>{const p=products.find(x=>String(x.id)===String(id));return `<div class="cart-item"><div><b>${p.name}</b><small>${money(p.price)} · ${p.moq}</small></div><div class="qty-controls"><button data-qty="${id}" data-delta="-1">−</button><b>${q}</b><button data-qty="${id}" data-delta="1">+</button></div></div>`}).join(""):`<div class="empty-cart">Your cart is waiting.<br><small>Add products to get started.</small></div>`;const total=entries.reduce((sum,[id,q])=>sum+products.find(p=>String(p.id)===String(id)).price*q,0);$("#cartTotal").textContent=money(total);}
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
$("#search").addEventListener("input",renderProducts);$("#sortSelect").addEventListener("change",renderProducts);$("#cartOpen").addEventListener("click",openCart);$("#cartClose").addEventListener("click",closeCart);$("#overlay").addEventListener("click",()=>{closeCart();closeSeller();if(typeof hideAuth==="function")hideAuth();if(typeof closeCheckout==="function")closeCheckout();if($("#ordersModal"))$("#ordersModal").classList.remove("show");if($("#adminModal")){$("#adminModal").classList.remove("show");}});
["sellerNav","heroSeller","sellerCta"].forEach(id=>$("#"+id).addEventListener("click",openSeller));$("#modalClose").addEventListener("click",closeSeller);
$("#mobileMenu").addEventListener("click",()=>$(".topbar").classList.toggle("menu-open"));
$("#checkoutBtn").addEventListener("click",async()=>{
 if(!state.catalogueLive){toast("Live seller products are not available yet.");return;}
 if(!Object.keys(state.cart).length){toast("Add products to your cart first.");return;}
 if(!window.marketSupabase){toast("Account service is unavailable.");return;}
 const {data:{user}}=await window.marketSupabase.auth.getUser();
 if(!user){closeCart();showAuth();setAuthMessage("Sign in to submit your order request.");return;}
 closeCart();$("#checkoutMessage").textContent="";$("#checkoutModal").classList.add("show");$("#overlay").classList.add("show");
});
function closeCheckout(){$("#checkoutModal").classList.remove("show");$("#overlay").classList.remove("show");}
$("#checkoutClose").addEventListener("click",closeCheckout);
$("#checkoutForm").addEventListener("submit",async event=>{
 event.preventDefault();
 const form=event.currentTarget;const button=$("#placeOrderBtn");const message=$("#checkoutMessage");
 if(!state.catalogueLive){message.textContent="The live catalogue changed. Refresh and try again.";return;}
 const data=new FormData(form);
 const items=Object.entries(state.cart).map(([product_id,quantity])=>({product_id,quantity}));
 const delivery_address={full_name:String(data.get("full_name")).trim(),phone:String(data.get("phone")).trim(),address_line:String(data.get("address_line")).trim(),city:String(data.get("city")).trim(),state:String(data.get("state")).trim(),pincode:String(data.get("pincode")).trim(),country:"India"};
 button.disabled=true;message.textContent="Submitting your order request…";
 try{
  const result=await window.marketplaceApi.placeOrder({items,delivery_address,buyer_note:String(data.get("buyer_note")||"").trim()});
  state.cart={};renderCart();form.reset();closeCheckout();toast("Order request submitted: #"+String(result.order_id).slice(0,8));
 }catch(error){message.textContent=error.message||"Could not submit order. Please retry."; }
 finally{button.disabled=false;}
});
$("#sellerForm").addEventListener("submit",async event=>{
 event.preventDefault();
 const form=event.currentTarget;
 const button=form.querySelector('button[type="submit"]');
 const msg=$("#formMessage");
 msg.textContent="";
 if(!window.marketSupabase){msg.textContent="Account service is unavailable. Please refresh and retry.";return;}
 button.disabled=true;
 button.textContent="Submitting…";
 try{
  const {data:{user},error:authError}=await window.marketSupabase.auth.getUser();
  if(authError)throw authError;
  if(!user){
   msg.textContent="Pehle account mein sign in karein. Sign in ke baad isi form ko dobara submit karein.";
   showAuth();
   setAuthMessage("Sign in karein ya Create account banayein. Phir Become a seller form submit karein.");
   return;
  }
  const f=new FormData(form);
  const application={user_id:user.id,business_name:String(f.get("business")).trim(),contact_name:String(f.get("name")).trim(),phone:String(f.get("phone")).trim(),category:String(f.get("category")),status:"pending"};
  const {data:existing,error:lookupError}=await window.marketSupabase.from("seller_applications").select("id,status").eq("user_id",user.id).order("created_at",{ascending:false}).limit(1).maybeSingle();
  if(lookupError)throw lookupError;
  if(existing){
   msg.textContent="Aapki seller application pehle se maujood hai. Status: "+existing.status+".";
   await loadSellerProducts();
   return;
  }
  const {error}=await window.marketSupabase.from("seller_applications").insert(application);
  if(error)throw error;
  form.reset();
  msg.textContent="Application successfully submit ho gayi! Status: Pending admin approval.";
  await loadSellerProducts();
 }catch(error){
  msg.textContent="Application submit nahi hui: "+(error?.message||"Unknown error")+". Dobara try karein.";
 }finally{
  button.disabled=false;
  button.textContent="Submit interest →";
 }
});
renderCategories();renderFilters();renderProducts();renderCart();
const SUPABASE_URL="https://vhnelmarhqvsncgczazk.supabase.co";const SUPABASE_PUBLISHABLE_KEY="sb_publishable_2uLOLMsuzy2vI9FPe2GbrQ_M94h136I";window.marketSupabase=window.supabase?.createClient(SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY)||null;let authMode="signin";function showAuth(){$("#authModal").classList.add("show");$("#overlay").classList.add("show");}function hideAuth(){$("#authModal").classList.remove("show");$("#overlay").classList.remove("show");}function setAuthMessage(m){$("#authMessage").textContent=m;}function updateAuthButton(user){$("#authOpen").textContent=user?(user.email?.split("@")[0]||"My account")+" · Sign out":"Sign in / Join";const admin=!!(user?.app_metadata?.role==="admin");$("#adminNav").hidden=!admin;$("#ordersNav").hidden=!user;}$("#authOpen").addEventListener("click",async()=>{if(!window.marketSupabase){toast("Account service unavailable");return;}const {data:{user}}=await window.marketSupabase.auth.getUser();if(user){await window.marketSupabase.auth.signOut();updateAuthButton(null);toast("Signed out");}else showAuth();});$("#authClose").addEventListener("click",hideAuth);$("#authToggle").addEventListener("click",()=>{authMode=authMode==="signin"?"signup":"signin";$("#authTitle").textContent=authMode==="signin"?"Welcome back":"Create your account";$("#authHelp").textContent=authMode==="signin"?"Sign in to continue.":"Join as a retailer and discover wholesale products.";$("#authSubmit").textContent=authMode==="signin"?"Sign in":"Create account";$("#authToggle").textContent=authMode==="signin"?"Create account":"I already have an account";$("#fullNameLabel").hidden=authMode!=="signup";setAuthMessage("");});$("#authForm").addEventListener("submit",async e=>{e.preventDefault();if(!window.marketSupabase){setAuthMessage("Account service unavailable. Refresh and try again.");return;}const f=new FormData(e.currentTarget);$("#authSubmit").disabled=true;let result;if(authMode==="signup"){result=await window.marketSupabase.auth.signUp({email:f.get("email"),password:f.get("password"),options:{data:{full_name:f.get("full_name")},emailRedirectTo:window.location.origin+"/"}});if(!result.error&&result.data.user)await window.marketSupabase.from("profiles").upsert({id:result.data.user.id,full_name:f.get("full_name")||""});}else result=await window.marketSupabase.auth.signInWithPassword({email:f.get("email"),password:f.get("password")});$("#authSubmit").disabled=false;if(result.error){setAuthMessage(result.error.message);return;}if(authMode==="signup"&&!result.data.session){setAuthMessage("Account created. Check your email to confirm, then sign in.");return;}updateAuthButton(result.data.user);setAuthMessage("Signed in successfully.");setTimeout(hideAuth,700);});if(window.marketSupabase){window.marketSupabase.auth.getUser().then(({data})=>updateAuthButton(data.user));window.marketSupabase.auth.onAuthStateChange((_event,session)=>{updateAuthButton(session?.user||null);if(typeof loadSellerProducts==="function")loadSellerProducts();});}

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

async function openMyOrders(){
 $("#ordersModal").classList.add("show");$("#overlay").classList.add("show");
 const message=$("#ordersMessage"),list=$("#myOrdersList");
 message.textContent="Loading your orders…";list.innerHTML="";
 try{
  const result=await window.marketplaceApi.getMyOrders();
  const orders=result.orders||[];
  message.textContent=orders.length?orders.length+" order request(s)":"You have not placed any orders yet.";
  list.innerHTML=orders.map(order=>{
   const items=(order.order_items||[]).map(item=>`<li>${escapeProductText(item.product_name)} × ${item.quantity} — ${money(item.line_total_paise/100)}</li>`).join("");
   return `<article class="buyer-order"><div><b>Order #${escapeProductText(String(order.id).slice(0,8))}</b><span>${escapeProductText(order.status)}</span></div><small>${new Date(order.created_at).toLocaleString("en-IN")}</small><strong>${money(order.subtotal_paise/100)}</strong><ul>${items}</ul></article>`;
  }).join("");
 }catch(error){message.textContent=error.message||"Unable to load your orders.";}
}
$("#ordersNav")?.addEventListener("click",openMyOrders);
$("#ordersClose")?.addEventListener("click",()=>{$("#ordersModal").classList.remove("show");$("#overlay").classList.remove("show");});



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
    notice.textContent = "No seller application found. Fill and submit the Become a seller form above; uploads unlock after admin approval.";
    form.hidden = true; list.textContent = "Seller application not found yet. Submit the seller form above, then sign in after email confirmation.";
    const projectForm=document.querySelector("#sellerProjectForm"); if(projectForm)projectForm.hidden=true;
    const projectList=document.querySelector("#mySellerProjects"); if(projectList)projectList.textContent="Seller approval is required before project uploads.";
    return;
  }
  if (application.status !== "approved") {
    notice.textContent = "Seller application status: " + application.status + ". Product uploads unlock after approval.";
    form.hidden = true; list.textContent = "Your application is awaiting approval."; return;
  }
  notice.textContent = "Seller approved. You can upload products and digital projects; each submission is reviewed before publishing.";
  form.hidden = false;
  const projectForm=document.querySelector("#sellerProjectForm"); if(projectForm)projectForm.hidden=false;
  await loadSellerProjectList(user.id);
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
async function loadSellerProjectList(userId){
 const list=document.querySelector("#mySellerProjects");if(!list)return;
 const result=await window.marketSupabase.from("seller_projects").select("id,title,category,price_paise,status,created_at,demo_url,file_path").eq("seller_user_id",userId).order("created_at",{ascending:false}).limit(50);
 if(result.error){list.textContent="Could not load project submissions: "+result.error.message;return;}
 list.innerHTML=result.data&&result.data.length?result.data.map(p=>'<article class="my-product"><div><b>'+escapeProductText(p.title)+'</b><small>'+escapeProductText(p.category)+' · '+(p.price_paise?money(p.price_paise/100):"Enquiry price")+'</small><small>Status: '+escapeProductText(p.status)+' · '+(p.file_path?"File attached":"No file")+(p.demo_url?" · Demo link added":"")+'</small></div></article>').join(""):"No project submissions yet.";
}
document.querySelector("#sellerProjectForm")?.addEventListener("submit",async event=>{
 event.preventDefault();const form=event.currentTarget,button=document.querySelector("#sellerProjectSubmit"),message=document.querySelector("#sellerProjectMessage");
 button.disabled=true;message.textContent="Uploading project…";let uploadedPath=null;
 try{
  const userResult=await window.marketSupabase.auth.getUser();const user=userResult.data.user;if(userResult.error)throw userResult.error;if(!user)throw new Error("Please sign in first.");
  const approvedResult=await window.marketSupabase.from("seller_applications").select("id").eq("user_id",user.id).eq("status","approved").limit(1).maybeSingle();
  if(approvedResult.error)throw approvedResult.error;if(!approvedResult.data)throw new Error("Your seller application must be approved before project upload.");
  const data=new FormData(form),file=data.get("project_file"),title=String(data.get("title")||"").trim(),description=String(data.get("description")||"").trim(),category=String(data.get("category")||"").trim(),price=Math.round(Number(data.get("price"))*100),demo=String(data.get("demo_url")||"").trim();
  if(!Number.isSafeInteger(price)||price<0)throw new Error("Enter a valid project price.");
  if(demo&&new URL(demo).protocol!=="https:")throw new Error("Demo URL must use HTTPS.");
  if(file instanceof File&&file.size){
   if(file.size>25*1024*1024)throw new Error("Project file must be 25 MB or smaller.");
   const allowed=["application/zip","application/x-zip-compressed","application/pdf","image/jpeg","image/png","image/webp","text/plain"];
   if(!allowed.includes(file.type))throw new Error("Only ZIP, PDF, JPG, PNG, WEBP or TXT files are allowed.");
   const ext=(file.name.split(".").pop()||"").toLowerCase();if(!["zip","pdf","jpg","jpeg","png","webp","txt"].includes(ext))throw new Error("Unsupported project file extension.");
   uploadedPath=user.id+"/"+crypto.randomUUID()+"."+ext;
   const upload=await window.marketSupabase.storage.from("seller-project-files").upload(uploadedPath,file,{contentType:file.type,upsert:false});if(upload.error)throw upload.error;
  }
  const insert=await window.marketSupabase.from("seller_projects").insert({seller_user_id:user.id,title:title,description:description,category:category,price_paise:price,demo_url:demo||null,file_path:uploadedPath,status:"pending"});
  if(insert.error)throw insert.error;
  form.reset();form.querySelector('[name="price"]').value="0";message.textContent="Project submitted for admin review. It will be published after approval.";await loadSellerProjectList(user.id);
 }catch(err){if(uploadedPath)await window.marketSupabase.storage.from("seller-project-files").remove([uploadedPath]);message.textContent=err.message||"Project upload failed.";}
 finally{button.disabled=false;}
});
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
      image_url: publicData.publicUrl, is_active: true
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
// Owner-only product creation and bulk CSV import.
function ownerProductPayload(row,userId){
 const name=String(row.name||"").trim(),category=String(row.category||"").trim(),unit=String(row.unit||"piece").trim();
 const price=Number(row.price_rupees??row.price),moq=Number(row.minimum_quantity??1),stock=Number(row.stock_quantity??0),image=String(row.image_url||"").trim();
 if(!name||name.length>120||!category||category.length>80||!unit||unit.length>40)throw new Error("Name, category and unit are required.");
 if(!Number.isFinite(price)||price<=0||price*100>2147483647)throw new Error("Price must be a positive rupee amount.");
 if(!Number.isInteger(moq)||moq<1||!Number.isInteger(stock)||stock<0)throw new Error("MOQ must be at least 1 and stock cannot be negative.");
 if(image&&!/^https:\/\//i.test(image))throw new Error("Image URL must start with https://");
 return {seller_user_id:userId,name,description:String(row.description||"").trim().slice(0,2000),category,price_paise:Math.round(price*100),unit,minimum_quantity:moq,stock_quantity:stock,image_url:image||null,is_active:false,is_owner:true};
}
function parseProductCsv(source){
 const rows=[];let row=[],cell="",quoted=false;
 for(let i=0;i<source.length;i++){const ch=source[i];if(quoted){if(ch==='"'&&source[i+1]==='"'){cell+='"';i++;}else if(ch==='"')quoted=false;else cell+=ch;}else if(ch==='"')quoted=true;else if(ch===","){row.push(cell);cell="";}else if(ch==="\n"){row.push(cell);rows.push(row);row=[];cell="";}else if(ch!=="\r")cell+=ch;}
 if(quoted)throw new Error("CSV has an unclosed quoted field.");if(cell.length||row.length){row.push(cell);rows.push(row);}
 const clean=rows.filter(r=>r.some(v=>String(v).trim()));if(clean.length<2)throw new Error("CSV needs a header and at least one product.");
 const headers=clean[0].map(v=>String(v).trim().toLowerCase()),missing=["name","category","price_rupees"].filter(k=>!headers.includes(k));if(missing.length)throw new Error("Missing CSV columns: "+missing.join(", "));
 return clean.slice(1).map((r,i)=>{const o={};headers.forEach((k,n)=>o[k]=r[n]??"");o.minimum_quantity=o.minimum_quantity||"1";o.stock_quantity=o.stock_quantity||"0";o.unit=o.unit||"piece";o.csv_row=i+2;return o;});
}
$("#downloadProductCsv")?.addEventListener("click",()=>{const sample="name,description,category,price_rupees,unit,minimum_quantity,stock_quantity,image_url\nPremium rice 25 kg,Wholesale rice bag,Grocery & daily needs,1250,bag,5,100,\n";const blob=new Blob([sample],{type:"text/csv;charset=utf-8"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download="owner-products-template.csv";a.click();URL.revokeObjectURL(url);});
$("#ownerProductForm")?.addEventListener("submit",async e=>{e.preventDefault();const form=e.currentTarget,msg=$("#ownerProductMessage"),button=form.querySelector('button[type="submit"]');button.disabled=true;msg.textContent="Saving…";try{const {data:{user}}=await window.marketSupabase.auth.getUser();if(!user||user.app_metadata?.role!=="admin")throw new Error("Admin access required.");const formData=new FormData(form),row=Object.fromEntries(formData);const payload=ownerProductPayload(row,user.id);const photo=formData.get("owner_image");if(photo instanceof File&&photo.size){if(photo.size>5*1024*1024)throw new Error("Product photo must be 5 MB or smaller.");const ext={"image/jpeg":"jpg","image/png":"png","image/webp":"webp"}[photo.type];if(!ext)throw new Error("Photo must be JPG, PNG or WEBP.");const path=user.id+"/owner-"+crypto.randomUUID()+"."+ext;const {error:uploadError}=await window.marketSupabase.storage.from("product-images").upload(path,photo,{contentType:photo.type,upsert:false});if(uploadError)throw uploadError;payload.image_url=window.marketSupabase.storage.from("product-images").getPublicUrl(path).data.publicUrl;}const {error}=await window.marketSupabase.from("products").insert(payload);if(error)throw error;form.reset();form.querySelector('[name="unit"]').value="piece";form.querySelector('[name="minimum_quantity"]').value="1";form.querySelector('[name="stock_quantity"]').value="0";msg.textContent="Product added as Pending. Activate it in Product approvals.";await loadAdminDashboard();}catch(err){msg.textContent=err.message||"Could not add product.";}finally{button.disabled=false;}});
$("#importProductCsv")?.addEventListener("click",async()=>{const file=$("#ownerCsvFile")?.files?.[0],msg=$("#ownerCsvMessage"),button=$("#importProductCsv");if(!file){msg.textContent="Choose a CSV file first.";return;}button.disabled=true;msg.textContent="Validating…";try{if(file.size>2*1024*1024)throw new Error("CSV must be 2 MB or smaller.");const rows=parseProductCsv(await file.text());if(rows.length>500)throw new Error("Maximum 500 products per file.");const {data:{user}}=await window.marketSupabase.auth.getUser();if(!user||user.app_metadata?.role!=="admin")throw new Error("Admin access required.");const payload=rows.map(row=>{try{return ownerProductPayload(row,user.id);}catch(err){throw new Error("CSV row "+row.csv_row+": "+err.message);}});for(let i=0;i<payload.length;i+=50){const {error}=await window.marketSupabase.from("products").insert(payload.slice(i,i+50));if(error)throw new Error("Import stopped at row "+(i+2)+": "+error.message);}msg.textContent=payload.length+" products imported as Pending. Activate them in Product approvals.";$("#ownerCsvFile").value="";await loadAdminDashboard();}catch(err){msg.textContent=err.message||"CSV import failed.";}finally{button.disabled=false;}});

async function loadAdminDashboard(){
 const supabase=window.marketSupabase;
 if(!supabase){adminNotice("Account service unavailable.",true);return;}
 const {data:{user}}=await supabase.auth.getUser();
 if(!user||user.app_metadata?.role!=="admin"){adminNotice("Administrator access required. Ask the project owner to grant the admin role securely in Supabase Auth app_metadata.",true);$("#adminApplications").textContent="Not authorized." ;$("#adminProducts").textContent="Not authorized.";$("#adminSellerProjects").textContent="Not authorized.";return;}
 adminNotice("Administrator access verified.");
 const [apps,products,projects,orders]=await Promise.all([
  supabase.from("seller_applications").select("id,user_id,business_name,contact_name,phone,category,status,created_at").order("created_at",{ascending:false}).limit(100),
  supabase.from("products").select("id,seller_user_id,name,category,price_paise,unit,minimum_quantity,stock_quantity,image_url,is_active,is_owner,created_at").order("created_at",{ascending:false}).limit(100),
   supabase.from("seller_projects").select("id,seller_user_id,title,description,category,price_paise,demo_url,file_path,status,created_at").order("created_at",{ascending:false}).limit(100),
  supabase.from("orders").select("id,buyer_user_id,status,subtotal_paise,delivery_address,buyer_note,created_at,order_items(id,product_name,quantity,unit_price_paise,line_total_paise),supplier_fulfilments(id,supplier_name,supplier_contact,status,tracking_reference,internal_note)").order("created_at",{ascending:false}).limit(100)
 ]);
 if(apps.error){$("#adminApplications").textContent="Could not load seller applications: "+apps.error.message;}else{
  $("#adminApplications").innerHTML=apps.data.length?apps.data.map(x=>`<article class="admin-row"><div><b>${escapeProductText(x.business_name)}</b><small>${escapeProductText(x.contact_name)} · ${escapeProductText(x.phone)}</small><small>${escapeProductText(x.category)} · ${escapeProductText(x.status)}</small></div><div class="admin-actions">${x.status!=="approved"?`<button data-app-action="approved" data-id="${x.id}">Approve</button>`:""}${x.status!=="rejected"?`<button data-app-action="rejected" data-id="${x.id}">Reject</button>`:""}</div></article>`).join(""):"No seller applications yet.";
 }
 if(products.error){$("#adminProducts").textContent="Could not load products: "+products.error.message;}else{
  $("#adminProducts").innerHTML=products.data.length?products.data.map(x=>`<article class="admin-row"><div class="admin-product-main">${x.image_url?`<img src="${x.image_url}" alt="">`:""}<div><b>${escapeProductText(x.name)}${x.is_owner?' <span class="owner-product-badge">Official Store · Verified Owner</span>':""}</b><small>${escapeProductText(x.category)} · ₹${(x.price_paise/100).toFixed(2)} / ${escapeProductText(x.unit)}</small><small>MOQ ${x.minimum_quantity} · Stock ${x.stock_quantity} · ${x.is_active?"Live":"Pending"}</small></div></div><div class="admin-actions"><button data-product-active="${!x.is_active}" data-id="${x.id}">${x.is_active?"Deactivate":"Activate"}</button></div></article>`).join(""):"No products submitted yet.";
 }
 if(projects.error){$("#adminSellerProjects").textContent="Could not load projects: "+projects.error.message;}else{
  $("#adminSellerProjects").innerHTML=projects.data.length?projects.data.map(p=>'<article class="admin-row"><div><b>'+escapeProductText(p.title)+'</b><small>'+escapeProductText(p.category)+' · '+money(p.price_paise/100)+'</small><small>'+escapeProductText(p.description)+'</small><small>'+(p.file_path?'<button type="button" data-project-file="'+escapeProductText(p.file_path)+'">Review private file</button>':"No file")+' · '+escapeProductText(p.status)+'</small>'+(p.demo_url?'<small><a href="'+escapeProductText(p.demo_url)+'" target="_blank" rel="noopener">Open demo</a></small>':"")+'</div><div class="admin-actions">'+(p.status!=="approved"?'<button data-project-action="approved" data-id="'+p.id+'">Approve</button>':"")+(p.status!=="rejected"?'<button data-project-action="rejected" data-id="'+p.id+'">Reject</button>':"")+'</div></article>').join(""):"No project submissions yet.";
 }
 if(orders.error){$("#adminOrders").textContent="Could not load orders: "+orders.error.message;}else{
  const orderStates=["placed","confirmed","forwarded","dispatched","delivered","cancelled"];
  $("#adminOrders").innerHTML=orders.data.length?orders.data.map(o=>{
   const fulfil=o.supplier_fulfilments?.[0]||{};
   const items=(o.order_items||[]).map(i=>escapeProductText(i.product_name)+" × "+i.quantity).join(", ");
   const delivery=o.delivery_address&&typeof o.delivery_address==="object"?o.delivery_address:{};
   const address=[delivery.full_name,delivery.phone,delivery.address_line,delivery.city,delivery.state,delivery.pincode,delivery.country].filter(Boolean).join(", ");
   const waMessage=[
    "NEW WHOLESALE DELIVERY REQUEST",
    "Marketplace order: "+o.id,
    "Order total: "+money(o.subtotal_paise/100),
    "Items: "+(o.order_items||[]).map(i=>i.product_name+" x "+i.quantity).join("; "),
    "Recipient: "+(delivery.full_name||""),
    "Customer mobile: "+(delivery.phone||""),
    "Delivery address: "+[delivery.address_line,delivery.city,delivery.state,delivery.pincode,delivery.country].filter(Boolean).join(", "),
    "Buyer note: "+(o.buyer_note||"None"),
    "Please confirm availability and delivery timeline."
   ].join("\\n");
   return `<article class="admin-order"><div class="admin-order-head"><div><b>Order #${o.id.slice(0,8)}</b><small>${new Date(o.created_at).toLocaleString("en-IN")} · ${escapeProductText(o.status)}</small><small>${money(o.subtotal_paise/100)} · ${escapeProductText(items)}</small><small>Delivery: ${escapeProductText(address)}</small>${o.buyer_note?`<small>Note: ${escapeProductText(o.buyer_note)}</small>`:""}</div></div>
    <div class="admin-order-controls"><label>Order status<select data-order-status>${orderStates.map(st=>`<option value="${st}" ${o.status===st?"selected":""}>${st}</option>`).join("")}</select><button data-save-order="${o.id}">Update status</button></label></div>
    <form class="supplier-form" data-supplier-order="${o.id}"><b>Supplier handoff</b><input name="supplier_name" required placeholder="Supplier / party name" value="${escapeProductText(fulfil.supplier_name||"")}"><input name="supplier_contact" placeholder="Supplier WhatsApp number (include country code)" value="${escapeProductText(fulfil.supplier_contact||"")}"><div class="admin-order-controls"><select name="status">${["not_forwarded","forwarded","accepted","dispatched","delivered"].map(st=>`<option value="${st}" ${(fulfil.status||"not_forwarded")===st?"selected":""}>${st.replaceAll("_"," ")}</option>`).join("")}</select><input name="tracking_reference" placeholder="Tracking / LR number" value="${escapeProductText(fulfil.tracking_reference||"")}"></div><textarea name="internal_note" rows="2" placeholder="Internal note">${escapeProductText(fulfil.internal_note||"")}</textarea><button type="submit">Save supplier handoff</button><button type="button" data-whatsapp-forward data-message="${encodeURIComponent(waMessage)}">Prepare WhatsApp order</button><small>WhatsApp opens a prefilled draft only. Review customer delivery details and tap Send yourself.</small></form></article>`;
  }).join(""):"No orders received yet.";
 }
}
$("#adminOrders")?.addEventListener("click",async e=>{
 const wa=e.target.closest("[data-whatsapp-forward]");
 if(wa){
  const form=wa.closest("[data-supplier-order]");
  const raw=String(new FormData(form).get("supplier_contact")||"");
  const phone=raw.replace(/[^0-9]/g,"");
  if(phone.length<10||phone.length>15){adminNotice("Enter supplier WhatsApp number with country code (10–15 digits).",true);return;}
  const message=decodeURIComponent(wa.dataset.message||"");
  window.open("https://wa.me/"+phone+"?text="+encodeURIComponent(message),"_blank","noopener,noreferrer");
  return;
 }
 const b=e.target.closest("[data-save-order]");if(!b)return;
 const row=b.closest(".admin-order");const status=row.querySelector("[data-order-status]").value;b.disabled=true;
 const {error}=await window.marketSupabase.from("orders").update({status}).eq("id",b.dataset.saveOrder);
 if(error)adminNotice("Order status update failed: "+error.message,true);else{adminNotice("Order status updated.");await loadAdminDashboard();}b.disabled=false;
});
$("#adminOrders")?.addEventListener("submit",async e=>{
 const form=e.target.closest("[data-supplier-order]");if(!form)return;e.preventDefault();
 const f=new FormData(form);const orderId=form.dataset.supplierOrder;
 const payload={order_id:orderId,supplier_name:String(f.get("supplier_name")).trim(),supplier_contact:String(f.get("supplier_contact")||"").trim()||null,status:f.get("status"),tracking_reference:String(f.get("tracking_reference")||"").trim()||null,internal_note:String(f.get("internal_note")||"").trim(),updated_at:new Date().toISOString()};
 const b=form.querySelector('button[type="submit"]');b.disabled=true;
 const {error}=await window.marketSupabase.from("supplier_fulfilments").upsert(payload,{onConflict:"order_id"});
 if(error)adminNotice("Supplier handoff save failed: "+error.message,true);else{adminNotice("Supplier handoff saved. Contact supplier separately to actually forward the order.");await loadAdminDashboard();}b.disabled=false;
});
$("#adminSellerProjects")?.addEventListener("click",async e=>{
 const fileButton=e.target.closest("[data-project-file]");
 if(fileButton){fileButton.disabled=true;const signed=await window.marketSupabase.storage.from("seller-project-files").createSignedUrl(fileButton.dataset.projectFile,60);fileButton.disabled=false;if(signed.error)adminNotice("Could not open project file: "+signed.error.message,true);else window.location.assign(signed.data.signedUrl);return;}
 const b=e.target.closest("[data-project-action]");if(!b)return;b.disabled=true;
 const result=await window.marketSupabase.from("seller_projects").update({status:b.dataset.projectAction,reviewed_at:new Date().toISOString()}).eq("id",b.dataset.id);
 if(result.error)adminNotice("Project review failed: "+result.error.message,true);else{adminNotice("Project submission updated.");await loadAdminDashboard();}b.disabled=false;
});
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


// Load approved, active products from the live database. Demo cards remain visible
// only as clearly marked fallback content until the first approved seller listing exists.
async function loadPublicProducts(){
 if(!window.marketSupabase)return;
 const {data,error}=await window.marketSupabase.from("products")
  .select("id,name,description,category,price_paise,unit,minimum_quantity,stock_quantity,image_url,is_owner")
  .eq("is_active",true).order("created_at",{ascending:false}).limit(200);
 if(error){console.warn("Live catalogue unavailable; showing demo catalogue.",error.message);return;}
 if(!data?.length){state.catalogueLive=false;const head=document.querySelector("#catalogue .section-head p");if(head)head.textContent="Sample catalogue preview — approved seller products will appear here.";return;}
 state.catalogueLive=true;products=data.map(p=>({
  id:p.id,name:p.name,description:p.description,category:p.category,
  price:p.price_paise/100,unit:"per "+p.unit,moq:"MOQ: "+p.minimum_quantity+" "+p.unit,
  tag:p.is_owner?"Official Store · Verified Owner":"Verified listing",bg:"#eef2e8",icon:"📦",imageUrl:p.image_url,isOwner:p.is_owner
 }));
 state.cart={};renderFilters();renderProducts();renderCart();
 const head=document.querySelector("#catalogue .section-head p");if(head)head.textContent="Live products listed by approved marketplace sellers.";
}

loadPublicProducts();
