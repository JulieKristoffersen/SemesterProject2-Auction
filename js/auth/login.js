const API_URL = "https://v2.api.noroff.dev";

const loginForm = document.getElementById("loginForm");
if (loginForm) {
  const message = document.getElementById("message");

  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(loginForm);
    const data = {
      email: formData.get("email"),
      password: formData.get("password"),
    };

    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error("Login failed. Check email/password.");
      
      const result = await res.json();
      localStorage.setItem("user", JSON.stringify(result.data));
      message.textContent = "Login successful! Redirecting...";
      message.classList.remove("text-red-500");
      message.classList.add("text-green-500");
      setTimeout(() => {
        window.location.href = "index.html";
      }, 1000);
    } catch (err) {
      message.textContent = err.message;
    }
  });
}
