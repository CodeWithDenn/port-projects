document.addEventListener("DOMContentLoaded", () => {
  const yearElement = document.getElementById("year");

  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }

  // Modal functionality
  const connectBtn = document.getElementById("connect-btn");
  const connectModal = document.getElementById("connect-modal");
  const closeModalBtn = document.getElementById("close-modal");

  if (connectBtn && connectModal && closeModalBtn) {
    // Open modal
    connectBtn.addEventListener("click", () => {
      connectModal.classList.add("active");
    });

    // Close modal
    closeModalBtn.addEventListener("click", () => {
      connectModal.classList.remove("active");
    });

    // Close modal when clicking outside
    connectModal.addEventListener("click", (e) => {
      if (e.target === connectModal) {
        connectModal.classList.remove("active");
      }
    });

    // Close modal on Escape key
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && connectModal.classList.contains("active")) {
        connectModal.classList.remove("active");
      }
    });
  }
});
