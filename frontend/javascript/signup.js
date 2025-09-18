// frontend/javascript/signup.js
document.getElementById("signupForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  // ✅ Basic validation
  if (!name || !email || !password) {
    alert("⚠️ Please fill in all fields!");
    return;
  }

  try {
    // 👇 point to your local backend running on port 5000
    const response = await fetch("http://127.0.0.1:5000/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await response.json();

    if (response.ok) {
      alert("✅ Signup successful! Please login to continue.");
      

      window.location.href = "index.html";

    } else {
      alert(`❌ ${data.error || "Signup failed!"}`);
    }
  } catch (error) {
    console.error("Signup error:", error);
    alert("⚠️ Could not connect to server. Please try again later.");
  }
});
