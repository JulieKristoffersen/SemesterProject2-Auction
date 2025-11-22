import { API_URL } from "../js/auth/config.js";
import { setupHamburgerMenu } from "../js/hamburger.js";

const apiKey = "c792f01b-a403-4b8b-8dcb-86fd6c4c3c19";
const sidebarContainer = document.getElementById("sidebar-container");
const ownListingsContainer = document.getElementById("ownListings");
const createSection = document.getElementById("create-section");
const createForm = document.getElementById("createListingForm");
const createMessage = document.getElementById("createMessage");
const resetFormBtn = document.getElementById("resetFormBtn");

let user = JSON.parse(localStorage.getItem("user")) || null;

function authHeaders(includeContentType = true) {
  const h = {};
  if (includeContentType) h["Content-Type"] = "application/json";
  if (user?.accessToken) h["Authorization"] = `Bearer ${user.accessToken}`;
  if (apiKey) h["X-Noroff-API-Key"] = apiKey;
  return h;
}

async function fetchUserProfile() {
  if (!user) return null;
  try {
    const res = await fetch(`${API_URL}/auction/profiles/${user.name}`, {
      headers: authHeaders(false)
    });
    const json = await res.json();
    if (!res.ok) {
      console.error("fetchUserProfile error", json);
      return null;
    }
    return json.data;
  } catch (err) {
    console.error(err);
    return null;
  }
}

async function fetchOwnListings() {
  if (!user) return [];
  try {
    const res = await fetch(`${API_URL}/auction/profiles/${user.name}/listings?_bids=true&_seller=true`, {
      headers: authHeaders(false)
    });
    const json = await res.json();
    if (!res.ok) {
      console.error("fetchOwnListings error", json);
      return [];
    }
    return json.data || [];
  } catch (err) {
    console.error(err);
    return [];
  }
}

function renderLoginFormInSidebar() {
  sidebarContainer.innerHTML = `
    <div class="flex flex-col justify-between h-full overflow-y-auto">
      <div>
        <h1 class="text-2xl font-bold mb-6">Auction House</h1>
        <p class="text-gray-300 mb-6">Log in to place bids, create listings, and track your credits. You can still browse listings without logging in.</p>
        
        <form id="sidebarLoginForm" class="space-y-3 mb-6">
          <input type="email" name="email" placeholder="Email" class="w-full border px-3 py-2 rounded text-black" required />
          <input type="password" name="password" placeholder="Password" class="w-full border px-3 py-2 rounded text-black" required />
          <button type="submit" class="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition">Log In</button>
          <p id="sidebar-login-message" class="text-sm text-red-500 mt-2"></p>
        </form>
        
        <p class="text-gray-400 text-sm text-center mb-6">
          New user? <a href="register.html" class="text-blue-400 hover:text-blue-600">Register here</a>
        </p>

        <div class="mt-8 space-y-3">
          <h2 class="text-lg font-semibold mb-2 text-blue-300 text-center">How it works</h2>
          <div class="space-y-3">
            <div class="bg-slate-700 p-3 rounded-lg hover:bg-slate-600 transition">
              <h3 class="font-semibold text-white">1. See Listings</h3>
              <p class="text-gray-300 text-sm">Browse active auctions from other users.</p>
            </div>
            <div class="bg-slate-700 p-3 rounded-lg hover:bg-slate-600 transition">
              <h3 class="font-semibold text-white">2. Bid on Items</h3>
              <p class="text-gray-300 text-sm">Place your bids and compete to win unique items.</p>
            </div>
            <div class="bg-slate-700 p-3 rounded-lg hover:bg-slate-600 transition">
              <h3 class="font-semibold text-white">3. Follow the Auction</h3>
              <p class="text-gray-300 text-sm">Track progress and see who wins when time runs out.</p>
            </div>
          </div>
        </div>
      </div>

      <footer class="text-xs text-gray-400 mt-6 text-center">
        © 2025 Auction House. All rights reserved.
      </footer>
    </div>
  `;

  const loginForm = document.getElementById("sidebarLoginForm");
  const msg = document.getElementById("sidebar-login-message");

  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    msg.textContent = "";
    const formData = new FormData(loginForm);
    const data = {
      email: formData.get("email"),
      password: formData.get("password"),
    };

    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      const loginData = await res.json();
      if (!res.ok) throw new Error(loginData.errors?.[0]?.message || "Login failed.");

      const keyRes = await fetch(`${API_URL}/auth/create-api-key`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${loginData.data.accessToken}`
        },
        body: JSON.stringify({ name: "auction-client-key" })
      });
      const keyData = await keyRes.json();
      if (!keyRes.ok) throw new Error(keyData.errors?.[0]?.message || "Failed to create API key.");

      user = {
        name: loginData.data.name,
        email: loginData.data.email,
        accessToken: loginData.data.accessToken,
        apiKey: keyData.data.key
      };
      localStorage.setItem("user", JSON.stringify(user));

      await renderSidebar();
      await renderOwnListings();
      createSection.scrollIntoView({ behavior: "smooth" });
    } catch (err) {
      msg.textContent = err.message;
      console.error(err);
    }
  });
}

async function renderSidebar() {
  if (!user) {
    renderLoginFormInSidebar();
    ownListingsContainer.innerHTML = "";
    createSection.style.display = "none";
    return;
  }

  const profile = await fetchUserProfile();
  if (!profile) {
    renderLoginFormInSidebar();
    ownListingsContainer.innerHTML = "";
    createSection.style.display = "none";
    return;
  }

  createSection.style.display = "block";

  const predefinedAvatars = [
    "https://i.pravatar.cc/100",
    "https://i.pravatar.cc/150",
  ];

  sidebarContainer.innerHTML = `
    <aside class="bg-slate-800 text-white p-6 flex flex-col justify-between h-screen relative overflow-y-auto">
      <div>
        <div class="flex justify-between items-center mb-6">
          <img id="currentAvatar" src="${profile.avatar?.url || predefinedAvatars[0]}" 
               alt="${profile.avatar?.alt || 'avatar'}" 
               class="w-12 h-12 rounded-full object-cover">
          <button id="logoutBtn" 
                  class="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-sm font-medium transition">
            Logout
          </button>
        </div>

        <h2 class="text-xl font-bold mb-1">${profile.name}</h2>
        <p class="text-green-400 font-semibold mb-4">Credits: ${profile.credits || 0}</p>

        <h3 class="text-lg font-semibold mb-2 text-blue-300">Choose Avatar</h3>
        <div class="grid grid-cols-2 gap-2 mb-4">
          ${predefinedAvatars.map(url => `
            <img src="${url}" alt="avatar" 
                 class="w-12 h-12 rounded-full cursor-pointer hover:ring-2 hover:ring-blue-400" 
                 data-url="${url}">
          `).join('')}
        </div>

        <form id="updateAvatarForm" class="mb-6 space-y-2">
          <input type="text" name="avatarUrl" placeholder="Custom Avatar URL" 
                 class="w-full border px-3 py-1 rounded text-black">
          <input type="text" name="avatarAlt" placeholder="Avatar Alt Text" 
                 class="w-full border px-3 py-1 rounded text-black">
          <button type="submit" 
                  class="w-full bg-blue-600 text-white py-1 rounded hover:bg-blue-700 transition text-sm">
            Update Avatar
          </button>
        </form>

        <div class="mt-8 space-y-3">
          <h2 class="text-lg font-semibold mb-2 text-blue-300 text-center">How it works</h2>
          <div class="space-y-3">
            <div class="bg-slate-700 p-3 rounded-lg hover:bg-slate-600 transition">
              <h3 class="font-semibold text-white">1. Create Listing</h3>
              <p class="text-gray-300 text-sm">Post your items for auction to start receiving bids.</p>
            </div>
            <div class="bg-slate-700 p-3 rounded-lg hover:bg-slate-600 transition">
              <h3 class="font-semibold text-white">2. Track Your Auctions</h3>
              <p class="text-gray-300 text-sm">Keep an eye on your listings and monitor bids in real time.</p>
            </div>
            <div class="bg-slate-700 p-3 rounded-lg hover:bg-slate-600 transition">
              <h3 class="font-semibold text-white">3. Get Your Credit</h3>
              <p class="text-gray-300 text-sm">Receive credits for sold items and use them to bid on new listings.</p>
            </div>
          </div>
        </div>
      </div>
      <footer class="text-xs text-gray-400 mt-6 text-center">
        © 2025 Auction House. All rights reserved.
      </footer>
    </aside>
  `;

  document.querySelectorAll("#sidebar-container img[data-url]").forEach(img => {
    img.addEventListener("click", async () => {
      try {
        const res = await fetch(`${API_URL}/auction/profiles/${user.name}`, {
          method: "PUT",
          headers: authHeaders(),
          body: JSON.stringify({ avatar: { url: img.dataset.url, alt: "User avatar" } })
        });
        if (!res.ok) throw new Error("Failed to update avatar");
        await renderSidebar();
      } catch (err) {
        console.error(err);
        alert("Failed to update avatar");
      }
    });
  });

  const updateAvatarForm = document.getElementById("updateAvatarForm");
  updateAvatarForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const avatarUrl = e.target.avatarUrl.value;
    const avatarAlt = e.target.avatarAlt.value || "User avatar";
    if (!avatarUrl) return;
    try {
      const res = await fetch(`${API_URL}/auction/profiles/${user.name}`, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify({ avatar: { url: avatarUrl, alt: avatarAlt } })
      });
      if (!res.ok) throw new Error("Failed to update avatar");
      await renderSidebar();
    } catch (err) {
      console.error(err);
      alert("Failed to update avatar");
    }
  });

  const logoutBtn = document.getElementById("logoutBtn");
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("user");
    user = null;
    ownListingsContainer.innerHTML = "";
    createSection.style.display = "none";
    renderSidebar(); 
  });
}

async function renderOwnListings() {
  if (!user) {
    ownListingsContainer.innerHTML = `<p class="text-gray-500">Login to see your listings.</p>`;
    return;
  }

  const listings = await fetchOwnListings();
  ownListingsContainer.innerHTML = listings.map(listing => {
    const isExpired = new Date(listing.endsAt) < new Date();
    const totalBids = listing._count?.bids || 0;
    return `
    <article class="bg-white shadow rounded-lg overflow-hidden hover:shadow-lg transition p-6 relative flex flex-col">
      ${isExpired ? '<span class="absolute top-2 left-2 bg-gray-600 text-white px-2 py-1 text-xs rounded">Expired</span>' : ''}
      <button 
        class="absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-1 rounded hover:bg-red-700 deleteListingBtn"
        data-id="${listing.id}">
        Delete
      </button>
      <div class="flex-1">
        <h3 class="font-semibold text-xl mb-2">${listing.title}</h3>
        <p class="text-gray-500 text-sm mb-2">Ends: ${new Date(listing.endsAt).toLocaleString()}</p>
        <p class="text-gray-700 text-sm mb-2">${listing.description}</p>
        ${listing.media?.length ? 
          `<img src="${listing.media[0].url}" alt="${listing.media[0].alt}" class="h-48 w-full object-cover mb-2 rounded">` 
          : ''}
      </div>
      <div class="flex justify-between mt-2 items-center">
        <span class="bg-blue-600 text-white px-2 py-1 rounded text-xs font-medium">
          ${totalBids} ${totalBids === 1 ? 'bid' : 'bids'}
        </span>
        <button 
          class="bg-green-600 text-white text-xs px-3 py-1 rounded hover:bg-green-700 viewListingBtn" 
          data-id="${listing.id}">
          View
        </button>
      </div>
    </article>`;
  }).join('');

  attachDeleteListeners();
  attachViewListeners();
}

function attachDeleteListeners() {
  document.querySelectorAll(".deleteListingBtn").forEach(btn => {
    btn.addEventListener("click", async () => {
      const listingId = btn.dataset.id;
      if (!confirm("Are you sure you want to delete this listing?")) return;

      try {
        const res = await fetch(`${API_URL}/auction/listings/${listingId}`, {
          method: "DELETE",
          headers: authHeaders(false)
        });
        if (!res.ok) throw new Error("Delete failed");
        await renderOwnListings();
      } catch (err) {
        console.error(err);
        alert("Failed to delete listing");
      }
    });
  });
}

function attachViewListeners() {
  document.querySelectorAll(".viewListingBtn").forEach(btn => {
    btn.addEventListener("click", async () => {
      const listingId = btn.dataset.id;
      const listings = await fetchOwnListings();
      const listing = listings.find(l => l.id === listingId);
      if (!listing) return;
      openModal(listing);
    });
  });
}

function openModal(listing) {
  const existing = document.getElementById("listing-modal");
  if (existing) existing.remove();

  const isOwner = listing.seller?.name === user?.name;
  let highestBid = listing.bids?.length ? Math.max(...listing.bids.map(b => b.amount)) : 0;

  const sortedBids = listing.bids ? [...listing.bids].sort((a, b) => new Date(b.created) - new Date(a.created)) : [];
  const highestAmount = sortedBids.length ? Math.max(...sortedBids.map(b => b.amount)) : 0;

  const bidHistoryHTML = sortedBids.length
    ? sortedBids.map(b => {
        const isMyBid = user && b.bidder?.email === user.email;
        const bidderName = b.bidder?.name || "Unknown bidder";
        return `
          <div class="p-3 rounded-lg flex justify-between items-center border ${isMyBid ? 'bg-blue-100 border-blue-400' : 'bg-gray-50 border-gray-200'}">
            <div>
              <p class="text-gray-800 font-semibold">${bidderName} ${isMyBid ? '<span class="text-xs bg-green-600 text-white px-2 py-0.5 rounded ml-2">YOU</span>' : ''}</p>
              <p class="text-xs text-gray-500">${new Date(b.created).toLocaleString()}</p>
            </div>
            <p class="font-bold ${b.amount === highestAmount ? 'text-blue-600' : 'text-gray-700'}">$${b.amount}</p>
          </div>
        `;
      }).join("")
    : `<p class="text-gray-500">No bids yet.</p>`;

  const modal = document.createElement("div");
  modal.id = "listing-modal";
  modal.className = "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4";

  modal.innerHTML = `
    <div class="bg-white rounded-xl w-full max-w-2xl overflow-y-auto max-h-[90vh] p-6 relative">
      <button id="close-modal" class="absolute top-3 right-3 text-gray-500 hover:text-gray-800 text-xl">&times;</button>
      <img src="${listing.media?.[0]?.url || 'https://via.placeholder.com/600x400'}" alt="${listing.media?.[0]?.alt || ''}" class="w-full h-64 object-cover rounded-lg mb-4">
      <h2 class="text-2xl font-bold mb-2">${listing.title}</h2>
      <p class="text-gray-700 mb-2">${listing.description || ''}</p>
      <p class="text-gray-500 mb-1">Seller: ${listing.seller?.name || 'Unknown'}</p>
      <p class="text-gray-500 mb-1">Ends: ${new Date(listing.endsAt).toLocaleString()}</p>
      <p class="text-gray-700 font-medium mb-2">Highest Bid: $${highestBid}</p>
      <p class="text-gray-500 mb-3">${listing._count?.bids || 0} ${listing._count?.bids === 1 ? 'bid' : 'bids'}</p>

      <h3 class="text-lg font-semibold mb-2">Bid History</h3>
      <div class="flex flex-col gap-2 mb-6">
        ${bidHistoryHTML}
      </div>

      ${!isOwner ? `
        ${user ? `
          <div class="flex gap-2">
            <input type="number" id="bid-amount" placeholder="Enter your bid" class="flex-1 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"/>
            <button id="place-bid" class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition">Place Bid</button>
          </div>
          <p id="bid-message" class="mt-2 text-sm text-red-500"></p>
        ` : `<p class="text-red-500 font-medium">Login to place bids.</p>`}
      ` : `<p class="text-red-500 font-medium">You cannot bid on your own listing.</p>`}
    </div>
  `;

  document.body.appendChild(modal);

  modal.querySelector("#close-modal").addEventListener("click", () => modal.remove());

  const bidBtn = modal.querySelector("#place-bid");
  if (bidBtn) {
    bidBtn.addEventListener("click", async () => {
      const amount = parseFloat(modal.querySelector("#bid-amount").value);
      const message = modal.querySelector("#bid-message");
      if (!amount || amount <= highestAmount) {
        message.textContent = `Your bid must be higher than $${highestAmount}`;
        return;
      }
      try {
        const res = await fetch(`${API_URL}/auction/listings/${listing.id}/bids`, {
          method: "POST",
          headers: authHeaders(),
          body: JSON.stringify({ amount })
        });
        const json = await res.json();
        if (!res.ok) {
          console.error(json);
          throw new Error(json.errors?.[0]?.message || "Bid failed");
        }
        message.classList.remove("text-red-500");
        message.classList.add("text-green-600");
        message.textContent = "Bid placed successfully!";
        await renderOwnListings();
        setTimeout(() => modal.remove(), 800);
      } catch (err) {
        console.error(err);
        message.textContent = err.message || "Failed to place bid. Try again.";
      }
    });
  }
}

createForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!user) {
    createMessage.textContent = "You must be logged in to create a listing.";
    createMessage.className = "text-sm text-red-500";
    return;
  }

  const form = e.target;
  const title = form.title.value.trim();
  const endsAt = form.endsAt.value;
  const description = form.description.value.trim();
  const mediaUrl = form.mediaUrl.value.trim();

  if (!title || !endsAt) {
    createMessage.textContent = "Title and end date are required.";
    createMessage.className = "text-sm text-red-500";
    return;
  }

  const body = {
    title,
    description,
    endsAt: new Date(endsAt).toISOString(),
    media: mediaUrl ? [{ url: mediaUrl, alt: title }] : []
  };

  try {
    const res = await fetch(`${API_URL}/auction/listings`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(body)
    });
    const json = await res.json();
    if (!res.ok) {
      console.error("create listing error", json);
      throw new Error(json.errors?.[0]?.message || "Failed to create listing");
    }
    createMessage.textContent = "Listing created!";
    createMessage.className = "text-sm text-green-600";
    form.reset();
    await renderOwnListings();
  } catch (err) {
    console.error(err);
    createMessage.textContent = err.message || "Failed to create listing";
    createMessage.className = "text-sm text-red-500";
  }
});

resetFormBtn?.addEventListener("click", () => {
  createForm.reset();
  createMessage.textContent = "";
});

async function init() {
  await renderSidebar();
  await renderOwnListings();
  setupHamburgerMenu(); 
}

init();
