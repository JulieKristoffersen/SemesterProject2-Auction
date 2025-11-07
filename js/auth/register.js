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
      venueManager: false,  
    };

    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error("Registration failed. Check your data.");

      const result = await res.json();

      const loginRes = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.email, password: data.password }),
      });

      if (!loginRes.ok) throw new Error("Automatic login failed.");

      const loggedInUser = await loginRes.json();

      loggedInUser.data.credits = 1000;

      localStorage.setItem("user", JSON.stringify(loggedInUser.data));

      message.textContent = "Registration successful! You are now logged in.";
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
