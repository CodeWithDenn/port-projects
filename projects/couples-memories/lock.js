const lockForm = document.getElementById("lock-form");
const pinDigits = Array.from(document.querySelectorAll(".pin-digit"));
const lockError = document.getElementById("lock-error");

pinDigits.forEach((input, index) => {
  input.addEventListener("input", (event) => {
    event.target.value = event.target.value.replace(/\D/g, "").slice(0, 1);
    if (event.target.value && index < pinDigits.length - 1) pinDigits[index + 1].focus();
  });

  input.addEventListener("keydown", (event) => {
    if (event.key === "Backspace" && !input.value && index > 0) pinDigits[index - 1].focus();
  });

  input.addEventListener("paste", (event) => {
    event.preventDefault();
    const pastedCode = (event.clipboardData || window.clipboardData).getData("text").replace(/\D/g, "").slice(0, pinDigits.length);
    pastedCode.split("").forEach((digit, digitIndex) => { pinDigits[digitIndex].value = digit; });
    if (pastedCode) pinDigits[Math.min(pastedCode.length, pinDigits.length) - 1].focus();
  });
});

async function hashValue(value) {
  const data = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

lockForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const enteredCode = pinDigits.map((input) => input.value.trim()).join("");
    const enteredDate = enteredCode.replace(/^(\d{2})(\d{2})(\d{2})$/, "$1/$2/$3");
    const enteredHash = await hashValue(enteredDate);

  if (enteredHash === window.LOCK_CONFIG.codeHash) {
    localStorage.setItem(window.LOCK_CONFIG.storageKey, "true");
    window.location.replace(window.LOCK_CONFIG.destination);
    return;
  }

  lockError.textContent = "That date does not match. Try again.";
  lockError.hidden = false;
  pinDigits.forEach((input) => {
    input.value = "";
    input.style.borderColor = "var(--color-accent)";
  });
  pinDigits[0].focus();
  setTimeout(() => pinDigits.forEach((input) => { input.style.borderColor = ""; }), 1000);
});
