const lockForm = document.getElementById("lock-form");
const lockCode = document.getElementById("lock-code");
const lockError = document.getElementById("lock-error");

async function hashValue(value) {
  const data = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

lockForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const enteredHash = await hashValue(lockCode.value.trim());

  if (enteredHash === window.LOCK_CONFIG.codeHash) {
    localStorage.setItem(window.LOCK_CONFIG.storageKey, "true");
    window.location.replace(window.LOCK_CONFIG.destination);
    return;
  }

  lockError.textContent = "That date does not match. Try again.";
  lockError.hidden = false;
  lockCode.select();
});
