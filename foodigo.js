// ✅ Handles Signup, Login & Logout
document.addEventListener("DOMContentLoaded", () => {
  const signupForm = document.getElementById("signupForm");
  const loginForm = document.getElementById("loginForm");
  const logoutBtn = document.getElementById("logoutBtn");

  /* ---------------- SIGNUP ---------------- */
  if (signupForm) {
    const msg = document.getElementById("signupMsg");

    signupForm.addEventListener("submit", (e) => {
      e.preventDefault();
      msg.textContent = "";

      const name = signupForm.name.value.trim();
      const email = signupForm.email.value.trim();
      const pass = signupForm.password.value.trim();
      const confirm = signupForm.confirm?.value.trim();

      // ✅ Validation
      if (name.length < 2) return (msg.textContent = "Please enter a valid name.");
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(email)) return (msg.textContent = "Enter a valid email address.");
      if (pass.length < 6) return (msg.textContent = "Password must be at least 6 characters.");
      if (confirm !== undefined && pass !== confirm) return (msg.textContent = "Passwords do not match.");

      // ✅ Save user
      localStorage.setItem("foodigoUser", JSON.stringify({ name, email, pass }));
      msg.textContent = "Account created successfully! 🎉 Redirecting...";

      signupForm.reset();
      setTimeout(() => (window.location.href = "login.html"), 1000);
    });
  }

  /* ---------------- LOGIN ---------------- */
  if (loginForm) {
    const msg = document.getElementById("loginMsg");

    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      msg.textContent = "";

      const email = loginForm.email.value.trim();
      const pass = loginForm.password.value.trim();
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailPattern.test(email)) return (msg.textContent = "Invalid email.");
      if (pass.length < 6) return (msg.textContent = "Incorrect password format.");

      // ✅ Retrieve saved user
      const savedUser = JSON.parse(localStorage.getItem("foodigoUser"));

      if (!savedUser) return (msg.textContent = "No account found. Please sign up first.");
      if (savedUser.email !== email || savedUser.pass !== pass)
        return (msg.textContent = "Invalid email or password.");

      // ✅ Save session
      localStorage.setItem("loggedInUser", savedUser.name);
      msg.textContent = "Login successful! Redirecting…";

      setTimeout(() => (window.location.href = "index.html"), 1000);
    });
  }

  /* ---------------- LOGOUT ---------------- */
 document.addEventListener("DOMContentLoaded", () => {
  const logoutBtn = document.getElementById("logoutBtn");

  // If button doesn't exist, do nothing
  if (!logoutBtn) return;

  // ✅ Check if user is logged in
  const user = localStorage.getItem("loggedInUser");

  if (!user) {
    // Not logged in → redirect to login page
    window.location.href = "login.html";
    return;
  }

  // ✅ Handle Logout click
  logoutBtn.addEventListener("click", () => {
    // Remove session data
    localStorage.removeItem("loggedInUser");

    // Small delay for smoother UX
    setTimeout(() => {
      window.location.href = "login.html";
    }, 300);
  });
});
});
