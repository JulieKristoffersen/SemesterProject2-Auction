import { API_URL } from "../auth/config.js";

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

      const loginData = await res.json();

      if (!res.ok) {
        throw new Error(loginData.errors?.[0]?.message || "Login failed.");
      }

      const keyRes = await fetch(`${API_URL}/auth/create-api-key`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${loginData.data.accessToken}`,
        },
        body: JSON.stringify({ name: "auction-client-key" }),
      });

      const keyData = await keyRes.json();

      if (!keyRes.ok) {
        throw new Error(keyData.errors?.[0]?.message || "Failed to create API key.");
      }

      const user = {
        name: loginData.data.name,
        email: loginData.data.email,
        accessToken: loginData.data.accessToken,
        apiKey: keyData.data.key, 
      };

      localStorage.setItem("user", JSON.stringify(user));

      message.textContent = "Login successful! Redirecting...";
      message.classList.remove("text-red-500");
      message.classList.add("text-green-500");

      setTimeout(() => {
        window.location.href = "index.html";
      }, 1000);

    } catch (err) {
      message.textContent = err.message;
      message.classList.add("text-red-500");
    }
  });
}
