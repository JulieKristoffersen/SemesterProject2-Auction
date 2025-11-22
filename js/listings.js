const API_URL = "https://v2.api.noroff.dev/auction/listings";
const listingsContainer = document.querySelector("section.grid");
const searchInput = document.querySelector("input[placeholder='Search listings...']");
let allListings = [];
let currentCategory = "all";
let user = JSON.parse(localStorage.getItem("user"));

async function getAllListings() {
  let listings = [];
  let page = 1;
  let totalPages = 1;

  do {
    const res = await fetch(`${API_URL}?_active=true&_bids=true&_seller=true&_page=${page}&_limit=20&_sort=created:desc`);
    const json = await res.json();
    listings.push(...json.data);
    totalPages = json.meta.pageCount || 1;
    page++;
  } while (page <= totalPages);

  listings.sort((a, b) => new Date(b.created) - new Date(a.created));

  return listings;
}

function renderCategoryBar() {
  const bar = document.getElementById("category-bar");
  bar.innerHTML = ""; 

  const tagSet = new Set();
  allListings.forEach(l => l.tags?.forEach(tag => tagSet.add(tag.toLowerCase())));

  if (tagSet.size === 0) tagSet.add("uncategorized");

  const categories = ["all", ...Array.from(tagSet).slice(0, 5)];

  categories.forEach(cat => {
    const btn = document.createElement("button");
    btn.textContent = cat.charAt(0).toUpperCase() + cat.slice(1);
    btn.className = "px-4 py-2 rounded-full text-sm font-medium border border-gray-300 bg-white hover:bg-blue-100 transition category-btn";
    if (cat === "all") btn.classList.add("bg-blue-600", "text-white", "border-blue-600");

    btn.addEventListener("click", () => {
      currentCategory = cat.toLowerCase();
      document.querySelectorAll(".category-btn").forEach(b =>
        b.classList.remove("bg-blue-600", "text-white", "border-blue-600")
      );
      btn.classList.add("bg-blue-600", "text-black", "border-blue-600");
      renderListings(allListings);
    });

    bar.appendChild(btn);
  });

  mainWrapper.insertBefore(bar, listingsContainer);
}

async function loadListings() {
  try {
    allListings = await getAllListings();
    renderCategoryBar();
    renderListings(allListings);
  } catch (err) {
    console.error("Error fetching listings:", err);
    listingsContainer.innerHTML = `<p class="text-center text-gray-500 col-span-full">Failed to load listings.</p>`;
  }
}

function renderListings(listings) {
  listingsContainer.innerHTML = "";

  let filtered = listings;
  if (currentCategory !== "all") {
    filtered = listings.filter(l => l.tags?.some(tag => tag.toLowerCase() === currentCategory));
  }

  const query = searchInput.value.toLowerCase();
  if (query) {
    filtered = filtered.filter(l =>
      l.title.toLowerCase().includes(query) ||
      l.description?.toLowerCase().includes(query)
    );
  }

  if (!filtered.length) {
    listingsContainer.innerHTML = `<p class="text-gray-500 col-span-full text-center">No listings found.</p>`;
    return;
  }

  filtered.forEach(l => {
    const imageUrl = l.media?.[0]?.url || "https://via.placeholder.com/600x400?text=No+Image";
    const endsAt = new Date(l.endsAt).toLocaleString();
    const sellerName = l.seller?.name || "Unknown";
    const bidsCount = l._count?.bids || 0;
    const isOwnListing = user && l.seller?.email === user.email;

    let highestBid = 0;
    if (l.bids && l.bids.length > 0) {
      highestBid = Math.max(...l.bids.map(b => b.amount));
    }

    const card = document.createElement("article");
    card.className = `bg-white shadow-lg rounded-2xl overflow-hidden hover:shadow-xl transition flex flex-col ${isOwnListing ? 'border-4 border-green-500' : ''}`;

    card.innerHTML = `
      <div class="relative">
        <img src="${imageUrl}" alt="${l.media?.[0]?.alt || 'Listing image'}" class="h-64 w-full object-cover"/>
        <span class="absolute top-3 left-3 bg-blue-600 text-white text-xs font-semibold px-3 py-1 rounded-full shadow">
          ${bidsCount} ${bidsCount === 1 ? 'bid' : 'bids'}
        </span>
        ${isOwnListing ? `<span class="absolute top-3 right-3 bg-green-600 text-white text-xs font-semibold px-3 py-1 rounded-full shadow">Your Listing</span>` : ''}
      </div>
      <div class="p-5 flex flex-col flex-1">
        <h3 class="font-semibold text-xl mb-1">${l.title}</h3>
        <p class="text-gray-500 text-sm mb-1">Seller: ${sellerName}</p>
        <p class="text-gray-500 text-sm mb-1">Ends: ${endsAt}</p>
        <p class="text-gray-700 font-medium mb-2">Highest Bid: $${highestBid}</p>
        <div class="flex flex-wrap gap-2 mt-2 mb-3">
          ${l.tags?.map(tag => `<span class="bg-gray-200 text-gray-800 px-2 py-1 rounded-full text-xs">${tag}</span>`).join('')}
        </div>
        <button class="view-details mt-auto bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition">
          View Details
        </button>
      </div>
    `;

    card.querySelector(".view-details").addEventListener("click", () => openModal(l));
    listingsContainer.appendChild(card);
  });
}

function openModal(listing) {
  const existing = document.getElementById("listing-modal");
  if (existing) existing.remove();

  const modal = document.createElement("div");
  modal.id = "listing-modal";
  modal.className = "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4";

  let highestBid = 0;
  if (listing.bids && listing.bids.length > 0) {
    highestBid = Math.max(...listing.bids.map(b => b.amount));
  }

  const sortedBids = listing.bids ? [...listing.bids].sort((a,b)=>new Date(b.created)-new Date(a.created)) : [];
  const bidHistoryHTML = sortedBids.length
    ? sortedBids.map(b => {
        const isOwnBid = user && b.bidder?.email === user.email;
        return `
          <div class="p-3 rounded-lg flex justify-between items-center border ${isOwnBid ? 'bg-blue-100 border-blue-400' : 'bg-gray-100 border-gray-300'}">
            <p class="text-gray-800 font-semibold">${b.bidder?.name || 'Unknown bidder'}</p>
            <p class="font-bold ${isOwnBid ? 'text-blue-700' : 'text-blue-600'}">$${b.amount}</p>
          </div>
        `;
      }).join("")
    : `<p class="text-gray-500">No bids yet.</p>`;

  modal.innerHTML = `
    <div class="bg-white rounded-xl w-full max-w-2xl overflow-y-auto max-h-[90vh] p-6 relative">
      <button id="close-modal" class="absolute top-3 right-3 text-gray-500 hover:text-gray-800 text-xl">&times;</button>
      <img src="${listing.media?.[0]?.url || 'https://via.placeholder.com/600x400'}" alt="${listing.media?.[0]?.alt || ''}" class="w-full h-64 object-cover rounded-lg mb-4">
      <h2 class="text-2xl font-bold mb-2">${listing.title}</h2>
      <p class="text-gray-700 mb-2">${listing.description || ''}</p>
      <p class="text-gray-500 mb-1">Seller: ${listing.seller?.name || 'Unknown'}</p>
      <p class="text-gray-500 mb-1">Ends: ${new Date(listing.endsAt).toLocaleString()}</p>
      <p class="text-gray-700 font-medium mb-2">Highest Bid: $${highestBid}</p>
      <p class="text-gray-500 mb-3">${listing._count?.bids || 0} bids</p>
      <h3 class="text-lg font-semibold mb-2">Bid History</h3>
      <div class="flex flex-col gap-2 mb-6">${bidHistoryHTML}</div>
      ${user && listing.seller?.email !== user.email ? `
        <div class="flex gap-2">
          <input type="number" id="bid-amount" placeholder="Enter your bid" class="flex-1 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"/>
          <button id="place-bid" class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition">Place Bid</button>
        </div>
        <p id="bid-message" class="mt-2 text-sm text-red-500"></p>
      ` : user ? `<p class="text-red-500 font-medium">This is your listing.</p>` : `<p class="text-red-500 font-medium">Login to bid.</p>`}
    </div>
  `;

  document.body.appendChild(modal);
  modal.querySelector("#close-modal").addEventListener("click", () => modal.remove());

  const bidBtn = modal.querySelector("#place-bid");
  if (bidBtn) {
    bidBtn.addEventListener("click", async () => {
      const amount = parseFloat(modal.querySelector("#bid-amount").value);
      const message = modal.querySelector("#bid-message");
      if (!amount || amount <= highestBid) {
        message.textContent = `Your bid must be higher than $${highestBid}`;
        return;
      }

      try {
        const res = await fetch(`${API_URL}/${listing.id}/bids`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${user.accessToken}`,
            "X-Noroff-API-Key": user.apiKey
          },
          body: JSON.stringify({ amount })
        });
        if (!res.ok) throw new Error("Bid failed");
        message.textContent = "Bid placed successfully!";
        message.classList.remove("text-red-500");
        message.classList.add("text-green-600");

        loadListings();
      } catch (err) {
        console.error(err);
        message.textContent = "Failed to place bid. Try again.";
      }
    });
  }
}

searchInput.addEventListener("input", () => renderListings(allListings));

loadListings();
