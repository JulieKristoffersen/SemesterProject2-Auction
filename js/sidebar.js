import { API_URL } from "../js/auth/config.js";
import { setupHamburgerMenu } from "../js/hamburger.js";

const apiKey = "c792f01b-a403-4b8b-8dcb-86fd6c4c3c19";
const sidebarContainer = document.getElementById("sidebar-container");
const user = JSON.parse(localStorage.getItem("user"));
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

async function renderSidebar() {
  const profile = await fetchUserProfile();
  if (!profile) return;

  sidebarContainer.innerHTML = `
    <div class="flex flex-col justify-between h-full p-6 relative">
      <button id="logoutBtn" class="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-medium hover:bg-red-600 transition">Logout</button>

      <div class="flex flex-col items-center mt-10">
        <img src="${profile.avatar?.url || 'https://via.placeholder.com/100'}" 
             alt="${profile.avatar?.alt || 'User avatar'}" 
             class="w-28 h-28 rounded-full mb-4 object-cover border-2 border-gray-300">
        <h2 class="text-xl font-bold">${profile.name}</h2>
        <p class="text-gray-300 mt-1">Credits: <strong>${profile.credits}</strong></p>
        <a href="profile.html" class="mt-4 w-full bg-blue-500 text-center py-2 rounded-lg font-medium hover:bg-blue-600 transition">My Profile</a>
      </div>

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

      <footer class="text-xs text-gray-400 mt-6 text-center">
        © 2025 Auction House. All rights reserved.
      </footer>
    </div>
  `;

  // Logout
  document.getElementById("logoutBtn").addEventListener("click", () => {
    localStorage.removeItem("user");
    window.location.href = "login.html";
  });
}

renderSidebar();
setupHamburgerMenu();
