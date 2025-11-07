export function setupHamburgerMenu(sidebarSelector = "#sidebar-container") {
  const sidebar = document.querySelector(sidebarSelector);

  if (!sidebar) {
    console.warn("Sidebar element not found for hamburger menu.");
    return;
  }

  const hamburgerBtn = document.createElement("button");
  hamburgerBtn.id = "hamburgerBtn";
  hamburgerBtn.innerHTML = "☰";
  hamburgerBtn.className =
    "md:hidden fixed top-4 left-4 z-50 bg-blue-600 text-white p-2 rounded shadow-lg focus:outline-none";

  document.body.appendChild(hamburgerBtn);

  sidebar.classList.add(
    "fixed",
    "md:relative",
    "top-0",
    "left-0",
    "bg-slate-800",
    "text-white",
    "w-64",
    "h-screen",
    "transform",
    "-translate-x-full",
    "md:translate-x-0",
    "transition-transform",
    "duration-300",
    "z-40"
  );

  hamburgerBtn.addEventListener("click", () => {
    sidebar.classList.toggle("-translate-x-full");
  });

  document.addEventListener("click", (event) => {
    const isClickInsideSidebar = sidebar.contains(event.target);
    const isClickOnButton = hamburgerBtn.contains(event.target);
    if (!isClickInsideSidebar && !isClickOnButton && window.innerWidth < 768) {
      sidebar.classList.add("-translate-x-full");
    }
  });
}
