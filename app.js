"use strict";

// Public, read-only catalogue. No authentication, account creation, forms,
// checkout, cart, seller uploads, or personal profile data are used here.
const SUPABASE_URL = "https://vhnelmarhqvsncgczazk.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_2uLOLMsuzy2vI9FPe2GbrQ_M94h136I";

const categories = [
  {name:"Grocery & daily needs",icon:"🛒",count:"Everyday essentials"},
  {name:"Electronics",icon:"🎧",count:"Gadgets & accessories"},
  {name:"Fashion",icon:"👕",count:"Clothing & lifestyle"},
  {name:"Home & kitchen",icon:"🏠",count:"Home essentials"},
  {name:"Hardware",icon:"🔧",count:"Tools & supplies"},
  {name:"Beauty & personal care",icon:"🧴",count:"Care & wellness"},
  {name:"Stationery",icon:"✏️",count:"School & office"},
  {name:"Toys & games",icon:"🧸",count:"Play & learning"},
  {name:"Footwear",icon:"👟",count:"Shoes & sandals"},
  {name:"Mobile accessories",icon:"📱",count:"Phone essentials"},
  {name:"Packaging",icon:"📦",count:"Business supplies"},
  {name:"More categories",icon:"✳️",count:"Explore everything"}
];
const demoProducts = [
  {id:"demo-1",name:"Everyday grocery combo",category:"Grocery & daily needs",icon:"🛍️",price:850,unit:"per combo",moq:"MOQ: 5 combos",tag:"Preview",bg:"#f2f3e8"},
  {id:"demo-2",name:"Wireless earbuds",category:"Electronics",icon:"🎧",price:399,unit:"per piece",moq:"MOQ: 10 pieces",tag:"Preview",bg:"#e9eff4"},
  {id:"demo-3",name:"Cotton T-shirt pack",category:"Fashion",icon:"👕",price:699,unit:"per pack",moq:"MOQ: 5 packs",tag:"Preview",bg:"#f3eae5"},
  {id:"demo-4",name:"Kitchen storage set",category:"Home & kitchen",icon:"🍱",price:520,unit:"per set",moq:"MOQ: 6 sets",tag:"Preview",bg:"#e9f1eb"},
  {id:"demo-5",name:"Hand tool kit",category:"Hardware",icon:"🧰",price:1100,unit:"per kit",moq:"MOQ: 3 kits",tag:"Preview",bg:"#f1eee5"},
  {id:"demo-6",name:"Personal care bundle",category:"Beauty & personal care",icon:"🧴",price:475,unit:"per bundle",moq:"MOQ: 8 bundles",tag:"Preview",bg:"#f3eaf0"},
  {id:"demo-7",name:"Notebook carton",category:"Stationery",icon:"📚",price:620,unit:"per carton",moq:"MOQ: 2 cartons",tag:"Preview",bg:"#e9edf5"},
  {id:"demo-8",name:"Kids learning toys",category:"Toys & games",icon:"🧸",price:560,unit:"per set",moq:"MOQ: 4 sets",tag:"Preview",bg:"#f4eee4"}
];
const state = {category:"All", products:demoProducts};
const $ = selector => document.querySelector(selector);
const money = amount => "₹" + Number(amount || 0).toLocaleString("en-IN");
const escapeText = value => String(value ?? "").replace(/[&<>"']/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]));

function renderCategories() {
  $("#categoryGrid").innerHTML = categories.map(category =>
    `<button class="category-card ${state.category===category.name?"selected":""}" data-category="${escapeText(category.name)}"><span class="cat-icon">${category.icon}</span><b>${escapeText(category.name)}</b><small>${escapeText(category.count)}</small></button>`
  ).join("");
}
function renderFilters() {
  const names = ["All", ...new Set(state.products.map(product => product.category))];
  $("#filterRow").innerHTML = names.map(name =>
    `<button class="filter ${state.category===name?"active":""}" data-filter="${escapeText(name)}">${name==="All"?"All products":escapeText(name)}</button>`
  ).join("");
}
function renderProducts() {
  const query = $("#search").value.trim().toLowerCase();
  let list = state.products.filter(product =>
    (state.category==="All" || product.category===state.category) &&
    (product.name+" "+product.category+" "+(product.description||"")).toLowerCase().includes(query)
  );
  const sort = $("#sortSelect").value;
  if (sort==="low") list.sort((a,b)=>a.price-b.price);
  if (sort==="high") list.sort((a,b)=>b.price-a.price);
  $("#productGrid").innerHTML = list.length ? list.map(product =>
    `<article class="product-card"><div class="product-visual" style="background:${escapeText(product.bg||"#eef2e8")}"><small>${escapeText(product.tag||"Listed")}</small>${product.imageUrl? `<img class="product-photo" src="${escapeText(product.imageUrl)}" alt="${escapeText(product.name)}" loading="lazy" referrerpolicy="no-referrer">` : `<span>${escapeText(product.icon||"📦")}</span>`}</div><div class="product-info"><span class="category">${escapeText(product.category)}</span><h3>${escapeText(product.name)}</h3><div class="price-row"><strong>${money(product.price)}</strong><small>${escapeText(product.unit||"")}</small></div><div class="moq">${escapeText(product.moq||"")}</div></div></article>`
  ).join("") : '<p class="empty-cart">No matching products. Try another search or category.</p>';
}
function selectCategory(category) {
  state.category = category;
  renderCategories();
  renderFilters();
  renderProducts();
  $("#catalogue").scrollIntoView({behavior:"smooth"});
}

$("#categoryGrid").addEventListener("click", event => {
  const button = event.target.closest("[data-category]");
  if (button) selectCategory(button.dataset.category);
});
$("#filterRow").addEventListener("click", event => {
  const button = event.target.closest("[data-filter]");
  if (!button) return;
  state.category = button.dataset.filter;
  renderCategories();
  renderFilters();
  renderProducts();
});
$("#search").addEventListener("input", renderProducts);
$("#sortSelect").addEventListener("change", renderProducts);
$("#mobileMenu").addEventListener("click", () => $(".topbar").classList.toggle("menu-open"));

async function loadPublicCatalogue() {
  try {
    const response = await fetch(
      SUPABASE_URL + "/rest/v1/products?select=id,name,description,category,price_paise,unit,minimum_quantity,image_url,is_owner&is_active=eq.true&order=created_at.desc&limit=200",
      {headers:{apikey:SUPABASE_PUBLISHABLE_KEY,Authorization:"Bearer "+SUPABASE_PUBLISHABLE_KEY}}
    );
    if (!response.ok) throw new Error("Public catalogue request failed ("+response.status+")");
    const rows = await response.json();
    if (Array.isArray(rows) && rows.length) {
      state.products = rows.map(product => ({
        id:product.id,name:product.name,description:product.description,category:product.category,
        price:Number(product.price_paise||0)/100,unit:"per "+(product.unit||"unit"),
        moq:"MOQ: "+(product.minimum_quantity||1)+" "+(product.unit||"unit"),
        tag:product.is_owner?"Official Store":"Verified listing",bg:"#eef2e8",icon:"📦",
        imageUrl:product.image_url||""
      }));
      $("#catalogueDescription").textContent = "Live public product listings. Browsing does not require an account.";
    } else {
      $("#catalogueDescription").textContent = "Demo preview products are shown until public listings are available.";
    }
  } catch (error) {
    console.warn("Showing the local demo catalogue:", error.message);
    $("#catalogueDescription").textContent = "Demo preview catalogue. Live listings are temporarily unavailable.";
  }
  renderCategories();
  renderFilters();
  renderProducts();
}

renderCategories();
renderFilters();
renderProducts();
loadPublicCatalogue();
