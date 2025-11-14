import { API_URL } from "../js/auth/config.js";
import { setupHamburgerMenu } from "../js/hamburger.js";

const apiKey = "c792f01b-a403-4b8b-8dcb-86fd6c4c3c19";
const sidebarContainer = document.getElementById("sidebar-container");
const ownListingsContainer = document.getElementById("ownListings");
let user = JSON.parse(localStorage.getItem("user"));
if (!user) window.location.href = "login.html";

async function fetchUserProfile() {
  try {
    const res = await fetch(`${API_URL}/auction/profiles/${user.name}`, {
      headers: {
        Authorization: `Bearer ${user.accessToken}`,
        "X-Noroff-API-Key": apiKey
      }
    });
    const data = await res.json();
    return data.data;
  } catch (err) {
    console.error(err);
    return null;
  }
}

async function fetchOwnListings() {
  try {
    const res = await fetch(`${API_URL}/auction/profiles/${user.name}/listings`, {
      headers: {
        Authorization: `Bearer ${user.accessToken}`,
        "X-Noroff-API-Key": apiKey
      }
    });
    const data = await res.json();
    return data.data || [];
  } catch (err) {
    console.error(err);
    return [];
  }
}

async function renderSidebar() {
  const profile = await fetchUserProfile();

  const predefinedAvatars = [
    "https://i.pravatar.cc/100?img=1",
    "https://i.pravatar.cc/100?img=2",
  ];

  sidebarContainer.innerHTML = `
    <aside class="bg-slate-800 text-white p-6 flex flex-col justify-between h-screen relative overflow-y-auto">
      <div>
        <div class="flex justify-between items-center mb-6">
          <img id="currentAvatar" src="${profile.avatar?.url || predefinedAvatars[0]}" 
               alt="${profile.avatar?.alt || 'avatar'}" 
               class="w-12 h-12 rounded-full object-cover">
          <button id="logoutBtn" 
                  class="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-sm font-medium transition absolute top-4 right-4">
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
    </aside>
  `;

  document.querySelectorAll("#sidebar-container img[data-url]").forEach(img => {
    img.addEventListener("click", async () => {
      try {
        await fetch(`${API_URL}/auction/profiles/${user.name}`, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${user.accessToken}`,
            "Content-Type": "application/json",
            "X-Noroff-API-Key": apiKey
          },
          body: JSON.stringify({ avatar: { url: img.dataset.url, alt: "User avatar" } })
        });
        renderSidebar();
      } catch (err) {
        console.error(err);
        alert("Failed to update avatar");
      }
    });
  });

  document.getElementById("logoutBtn").addEventListener("click", () => {
    localStorage.removeItem("user");
    window.location.href = "login.html";
  });

  document.getElementById("updateAvatarForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const avatarUrl = e.target.avatarUrl.value;
    const avatarAlt = e.target.avatarAlt.value || "User avatar";
    if (!avatarUrl) return;
    try {
      await fetch(`${API_URL}/auction/profiles/${user.name}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${user.accessToken}`,
          "Content-Type": "application/json",
          "X-Noroff-API-Key": apiKey
        },
        body: JSON.stringify({ avatar: { url: avatarUrl, alt: avatarAlt } })
      });
      renderSidebar();
    } catch (err) {
      console.error(err);
      alert("Failed to update avatar");
    }
  });
}

async function renderOwnListings() {
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
        ${listing.media.length ? 
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
        await fetch(`${API_URL}/auction/listings/${listingId}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${user.accessToken}`,
            "X-Noroff-API-Key": apiKey
          }
        });
        renderOwnListings();
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

  const isOwner = listing.seller?.name === user.name;
  let highestBid = listing.bids?.length ? Math.max(...listing.bids.map(b => b.amount)) : 0;

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
      <div class="flex flex-wrap gap-2 mb-4">
        ${listing.tags?.map(tag => `<span class="bg-gray-200 text-gray-800 px-2 py-1 rounded-full text-xs">${tag}</span>`).join('')}
      </div>

      ${!isOwner ? `
      <div class="flex gap-2">
        <input type="number" id="bid-amount" placeholder="Enter your bid" class="flex-1 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"/>
        <button id="place-bid" class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition">Place Bid</button>
      </div>
      <p id="bid-message" class="mt-2 text-sm text-red-500"></p>
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

      if (!amount || amount <= highestBid) {
        message.textContent = `Your bid must be higher than $${highestBid}`;
        return;
      }

      try {
        const res = await fetch(`${API_URL}/auction/listings/${listing.id}/bids`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.accessToken}`
          },
          body: JSON.stringify({ amount })
        });

        if (!res.ok) throw new Error("Bid failed");

        message.textContent = "Bid placed successfully!";
        message.classList.remove("text-red-500");
        message.classList.add("text-green-600");

        renderOwnListings();
      } catch (err) {
        message.textContent = "Failed to place bid. Try again.";
      }
    });
  }
}

document.getElementById("createListingForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const form = e.target;
  const body = {
    title: form.title.value,
    description: form.description.value,
    endsAt: form.endsAt.value,
    media: form.mediaUrl.value ? [{ url: form.mediaUrl.value, alt: form.title.value }] : []
  };
  try {
    await fetch(`${API_URL}/auction/listings`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${user.accessToken}`,
        "Content-Type": "application/json",
        "X-Noroff-API-Key": apiKey
      },
      body: JSON.stringify(body)
    });
    form.reset();
    renderOwnListings();
  } catch (err) {
    console.error(err);
    alert("Failed to create listing");
  }
});

renderSidebar();
renderOwnListings();
setupHamburgerMenu();
