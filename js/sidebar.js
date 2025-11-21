import { API_URL } from "./auth/config.js";
import { setupHamburgerMenu } from "../js/hamburger.js";

const apiKey = "c792f01b-a403-4b8b-8dcb-86fd6c4c3c19";
const sidebarContainer = document.getElementById("sidebar-container");

let user = JSON.parse(localStorage.getItem("user"));

async function fetchUserProfile() {
  if (!user) return null;
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

function renderLoginForm() {
  sidebarContainer.innerHTML = `
    <div class="flex flex-col justify-between h-full overflow-y-auto p-6">
      <div>
        <h1 class="text-2xl font-bold mb-6">Auction House</h1>
        <p class="text-gray-300 mb-6">
          Log in to place bids, create listings, and track your credits.
          You can still browse listings while logged out.
        </p>

        <form id="loginForm" class="space-y-3 mb-6">
          <input type="email" name="email" placeholder="Email" class="w-full border px-3 py-2 rounded text-black" required />
          <input type="password" name="password" placeholder="Password" class="w-full border px-3 py-2 rounded text-black" required />
          <button type="submit" class="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition">
            Log In
          </button>
          <p id="message" class="text-sm text-red-500"></p>
        </form>

        <p class="text-gray-400 text-sm text-center mb-6">
          New user? <a href="register.html" class="text-blue-400 hover:text-blue-600">Register here</a>
        </p>

        <!-- How it works -->
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

  const loginForm = document.getElementById("loginForm");
  const message = document.getElementById("message");

  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const formData = new FormData(loginForm);
    const data = {
      email: formData.get("email"),
      password: formData.get("password")
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

      renderSidebar(); 
    } catch (err) {
      message.textContent = err.message;
      message.classList.add("text-red-500");
    }
  });
}

async function renderSidebar() {
  if (!user) {
    renderLoginForm();
    return;
  }

  const profile = await fetchUserProfile();
  if (!profile) {
    renderLoginForm();
    return;
  }

  sidebarContainer.innerHTML = `
    <div class="flex flex-col justify-between h-full overflow-y-auto p-6 relative">
     <button id="logoutBtn" 
                  class="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-sm font-medium transition absolute top-4 right-4">
            Logout
          </button>

      <div class="flex flex-col items-center mt-10">
        <img src="${profile.avatar?.url || 'https://via.placeholder.com/100'}" 
             alt="${profile.avatar?.alt || 'User avatar'}" 
             class="w-28 h-28 rounded-full mb-4 object-cover border-2 border-gray-300">
        <h2 class="text-xl font-bold">${profile.name}</h2>
        <p class="text-gray-300 mt-1">Credits: <strong>${profile.credits}</strong></p>
        <a href="profile.html" class="mt-4 w-full bg-blue-500 text-center py-2 rounded-lg font-medium hover:bg-blue-600 transition">
          My Profile
        </a>
      </div>

      <!-- How it works -->
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

  document.getElementById("logoutBtn").addEventListener("click", () => {
    localStorage.removeItem("user");
    user = null;
    renderLoginForm();
  });
}

renderSidebar();
setupHamburgerMenu("#sidebar-container");
