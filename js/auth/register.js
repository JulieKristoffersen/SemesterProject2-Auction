import { API_URL } from "../auth/config.js";

const registerForm = document.getElementById("registerForm");
if (registerForm) {
  const message = document.getElementById("message");

  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(registerForm);
    const data = {
      name: formData.get("name"),
      email: formData.get("email"),
      password: formData.get("password"),
    };

    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const registerResult = await res.json();

      if (!res.ok) {
        throw new Error(registerResult.errors?.[0]?.message || "Registration failed.");
      }

      const loginRes = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.email, password: data.password }),
      });

      const loggedInUser = await loginRes.json();

      if (!loginRes.ok) {
        throw new Error(loggedInUser.errors?.[0]?.message || "Automatic login failed.");
      }

      const user = {
        name: loggedInUser.data.name,
        email: loggedInUser.data.email,
        accessToken: loggedInUser.data.accessToken,
        apiKey: loggedInUser.data.apiKey
      };

      localStorage.setItem("user", JSON.stringify(user));

      message.textContent = "Registration successful! Redirecting...";
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
