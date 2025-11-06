const sidebarContainer = document.getElementById("sidebar-container");
function renderSidebar(user) {
  let sidebarHTML = '';

  if (user) {
    sidebarHTML = `
      <aside class="bg-slate-800 text-white p-6 flex flex-col justify-between h-screen">
        <div>
          <!-- User Info -->
          <div class="flex flex-col items-center mb-6">
            <img src="${user.avatar?.url || 'https://via.placeholder.com/100'}" 
                 alt="${user.avatar?.alt || 'User avatar'}" 
                 class="w-24 h-24 rounded-full mb-4 object-cover">
            <h2 class="text-xl font-bold">${user.name}</h2>
            <p class="text-gray-300 mt-1">Credits: <strong>${user.credits || 0}</strong></p>
          </div>

          <!-- Buttons -->
          <div class="space-y-3 mb-8">
            <a href="my-listings.html" class="block w-full bg-blue-500 text-center py-2 rounded-lg font-medium hover:bg-blue-600 transition">My Listings</a>
            <a href="edit-profile.html" class="block w-full border border-blue-400 text-blue-300 text-center py-2 rounded-lg font-medium hover:bg-blue-600 hover:text-white transition">Edit Profile</a>
            <button id="logoutBtn" class="w-full bg-red-500 text-center py-2 rounded-lg font-medium hover:bg-red-600 transition">Logout</button>
          </div>

          <!-- How it works -->
          <div class="mb-8">
            <h2 class="text-lg font-semibold mb-4 text-blue-300">How it works</h2>
            <div class="space-y-4">
              <div class="bg-slate-700 p-3 rounded-lg">
                <h3 class="font-semibold text-white">1. See Listings</h3>
                <p class="text-gray-300 text-sm">Browse active auctions from other users.</p>
              </div>
              <div class="bg-slate-700 p-3 rounded-lg">
                <h3 class="font-semibold text-white">2. Bid on Items</h3>
                <p class="text-gray-300 text-sm">Place your bids and compete to win unique items.</p>
              </div>
              <div class="bg-slate-700 p-3 rounded-lg">
                <h3 class="font-semibold text-white">3. Follow the Auction</h3>
                <p class="text-gray-300 text-sm">Track progress and see who wins when time runs out.</p>
              </div>
            </div>
          </div>
        </div>

        <footer class="text-xs text-gray-400 mt-8 text-center">
          © 2025 Auction House. All rights reserved.
        </footer>
      </aside>
    `;
  } else {
    sidebarHTML = `
      <aside class="bg-slate-800 text-white p-6 flex flex-col justify-between h-screen">
        <div>
          <h1 class="text-2xl font-bold mb-6">Auction House</h1>
          <p class="text-sm text-gray-300 mb-8">
            Buy and sell items using credits! New users start with <strong>1,000 credits</strong> when they register.
          </p>
          <div class="space-y-3 mb-8">
            <a href="login.html" class="block w-full bg-blue-500 text-center py-2 rounded-lg font-medium hover:bg-blue-600 transition">Log In</a>
            <a href="register.html" class="block w-full border border-blue-400 text-blue-300 text-center py-2 rounded-lg font-medium hover:bg-blue-600 hover:text-white transition">Register</a>
          </div>

          <!-- How it works -->
          <div class="mb-8">
            <h2 class="text-lg font-semibold mb-4 text-blue-300">How it works</h2>
            <div class="space-y-4">
              <div class="bg-slate-700 p-3 rounded-lg">
                <h3 class="font-semibold text-white">1. See Listings</h3>
                <p class="text-gray-300 text-sm">Browse active auctions from other users.</p>
              </div>
              <div class="bg-slate-700 p-3 rounded-lg">
                <h3 class="font-semibold text-white">2. Bid on Items</h3>
                <p class="text-gray-300 text-sm">Place your bids and compete to win unique items.</p>
              </div>
              <div class="bg-slate-700 p-3 rounded-lg">
                <h3 class="font-semibold text-white">3. Follow the Auction</h3>
                <p class="text-gray-300 text-sm">Track progress and see who wins when time runs out.</p>
              </div>
            </div>
          </div>
        </div>

        <footer class="text-xs text-gray-400 mt-8 text-center">
          © 2025 Auction House. All rights reserved.
        </footer>
      </aside>
    `;
  }

  sidebarContainer.innerHTML = sidebarHTML;
  if (user) {
    document.getElementById("logoutBtn").addEventListener("click", () => {
      localStorage.removeItem("user");
      window.location.reload();
    });
  }
}
const storedUser = JSON.parse(localStorage.getItem("user"));
renderSidebar(storedUser);
