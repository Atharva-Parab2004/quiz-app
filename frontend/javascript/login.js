// frontend/javascript/login.js
document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value.trim();

  // ✅ Validation
  if (!email || !password) {
    alert("⚠️ Please enter both email and password!");
    return;
  }

  try {
    const response = await fetch("http://127.0.0.1:5000/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (response.ok) {
      alert(`✅ Welcome, ${data.name || "User"}! 🎉`);

      // ✅ Save user details for quiz use
      localStorage.setItem("userName", data.name || "");
      localStorage.setItem("userEmail", email);

      // ✅ Redirect to quiz page
      window.location.href = "quiz.html";
    } else {
      alert(`❌ ${data.error || "Login failed!"}`);
    }
  } catch (error) {
    console.error("❌ Login error:", error);
    alert("⚠️ Could not connect to server. Please try again later.");
  }
});
