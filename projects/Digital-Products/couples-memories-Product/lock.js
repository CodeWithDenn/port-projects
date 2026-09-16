const lockForm = document.getElementById("lock-form");
const lockCode = document.getElementById("lock-code");
const lockError = document.getElementById("lock-error");

lockForm.addEventListener("submit", (event) => {
  event.preventDefault();

  if (lockCode.value.trim() === window.LOCK_CONFIG.code) {
    localStorage.setItem(window.LOCK_CONFIG.storageKey, "true");
    window.location.replace(window.LOCK_CONFIG.destination);
    return;
  }

  lockError.textContent = "That date does not match. Try again.";
  lockError.hidden = false;
  lockCode.select();
});
