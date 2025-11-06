
async function loadSidebar() {
  try {
    const response = await fetch("sidebar.html");
    if (!response.ok) throw new Error("Failed to load sidebar");
    const sidebarHTML = await response.text();
    document.getElementById("sidebar-container").innerHTML = sidebarHTML;
  } catch (error) {
    console.error("Error loading sidebar:", error);
    document.getElementById("sidebar-container").innerHTML = 
      "<aside class='w-1/3 bg-red-100 text-red-600 p-4'>Failed to load sidebar.</aside>";
  }
}
document.addEventListener("DOMContentLoaded", loadSidebar);
