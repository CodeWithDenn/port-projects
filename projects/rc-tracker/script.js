const storageKey = "rc-toy-rental-tracker:v1";
const unitCards = [...document.querySelectorAll(".unit-card")];
const rentalForm = document.querySelector("#rental-form");
const renterInput = document.querySelector("#renter-name");
const durationInput = document.querySelector("#rental-duration");
const durationHint = document.querySelector("#rental-duration-hint");
const durationUnit = document.querySelector("#rental-duration-unit");
const selectedUnitIdInput = document.querySelector("#selected-unit-id");
const selectedUnitLabel = document.querySelector("#selected-unit-label");
const selectedNotification = document.querySelector("#rental-notification");
const notificationList = document.querySelector("#notification-list");
const rentalRows = document.querySelector("#rental-rows");
const formMessage = document.querySelector("#form-message");
const byoForm = document.querySelector("#byo-form");
const byoRenterInput = document.querySelector("#byo-renter-name");
const byoCategoryInput = document.querySelector("#byo-category");
const byoFormMessage = document.querySelector("#byo-form-message");
const startRentalButton = document.querySelector("#start-rental-button");
const startByoButton = document.querySelector("#start-byo-button");
const activeRentalCount = document.querySelector("#active-rental-count");
const unitCount = document.querySelector("#unit-count");
const categoryCount = document.querySelector("#category-count");
const byoPricing = {
  "1/10": { amount: 50, intervalMinutes: 15 },
  "1/12": { amount: 50, intervalMinutes: 25 },
  mini: { amount: 50, intervalMinutes: 25 },
};

let selectedUnitId = "";
let storageReady = true;
let rentals = loadRentals();

categoryCount.textContent = new Set(unitCards.map((card) => card.dataset.category)).size;
unitCount.textContent = unitCards.length;

durationInput.addEventListener("change", () => {
  const isOpenTime = durationInput.value === "open";
  durationUnit.hidden = isOpenTime;
  durationHint.textContent = isOpenTime
    ? "The timer counts up until you mark the unit returned."
    : "Choose 15 or 30 minutes. A 30-second allowance is added before the timer expires.";
});

unitCards.forEach((card) => {
  card.addEventListener("click", () => selectUnit(card));
});

rentalForm.addEventListener("submit", (event) => {
  event.preventDefault();
  formMessage.textContent = "";

  const selectedCard = getSelectedCard();
  const renterName = renterInput.value.trim();
  const isOpenTime = durationInput.value === "open";
  const duration = isOpenTime ? null : Number(durationInput.value);

  if (!selectedCard) {
    formMessage.textContent = "Choose an available unit before starting a rental.";
    return;
  }

  if (!renterName) {
    renterInput.focus();
    formMessage.textContent = "Enter the renter's name.";
    return;
  }

  if (!isOpenTime && ![15, 30].includes(duration)) {
    durationInput.focus();
    formMessage.textContent = "Choose 15 or 30 minutes, or select open time.";
    return;
  }

  if (rentals[selectedUnitId]) {
    formMessage.textContent = "This unit already has an active rental.";
    render();
    return;
  }

  const startedAt = Date.now();
  rentals[selectedUnitId] = {
    category: selectedCard.dataset.category,
    unitName: selectedCard.dataset.unitName,
    renterName,
    rentalType: "fleet",
    startedAt,
    durationMinutes: duration,
    endsAt: isOpenTime ? null : startedAt + duration * 60 * 1000 + 30 * 1000,
    notified: false,
  };

  if (!saveRentals()) {
    delete rentals[selectedUnitId];
    return;
  }

  addNotification(isOpenTime
    ? `${selectedCard.dataset.unitName} rented to ${renterName} with an open timer.`
    : `${selectedCard.dataset.unitName} rented to ${renterName} for ${duration} minute${duration === 1 ? "" : "s"}.`);
  selectUnit(selectedCard);
  formMessage.textContent = `Rental started for ${selectedCard.dataset.unitName}.`;
});

byoForm.addEventListener("submit", (event) => {
  event.preventDefault();
  byoFormMessage.textContent = "";

  const renterName = byoRenterInput.value.trim();
  if (!renterName) {
    byoRenterInput.focus();
    byoFormMessage.textContent = "Enter the renter's name.";
    return;
  }

  const category = byoCategoryInput.value;
  if (!Object.prototype.hasOwnProperty.call(byoPricing, category)) {
    byoCategoryInput.focus();
    byoFormMessage.textContent = "Choose an RC category.";
    return;
  }

  const rentalId = createByoRentalId();
  const startedAt = Date.now();
  rentals[rentalId] = {
    category,
    unitName: "Customer-owned RC",
    renterName,
    rentalType: "byo",
    startedAt,
    durationMinutes: null,
    endsAt: null,
    notified: false,
  };

  if (!saveRentals()) {
    delete rentals[rentalId];
    return;
  }

  addNotification(`BYO RC rental (${category}) started for ${renterName}.`);
  byoRenterInput.value = "";
  byoCategoryInput.value = "";
  byoFormMessage.textContent = `BYO RC timer (${category}) started for ${renterName}.`;
  render();
});

rentalRows.addEventListener("click", (event) => {
  const returnButton = event.target.closest("[data-return-unit]");
  if (!returnButton) return;

  const rentalId = returnButton.dataset.returnUnit;
  const rental = rentals[rentalId];
  if (!rental) return;

  const returnedAt = Date.now();
  delete rentals[rentalId];
  if (!saveRentals()) {
    rentals[rentalId] = rental;
    return;
  }

  const elapsed = Math.max(0, returnedAt - rental.startedAt);
  const isByo = rental.rentalType === "byo";
  const byoLabel = rental.category === "BYO RC" ? "BYO RC" : `BYO RC (${rental.category})`;
  const returnMessage = isByo
    ? `${rental.renterName}'s ${byoLabel} was returned at ${formatClockTime(returnedAt)} after ${formatElapsed(elapsed)}. Charge: ${formatPrice(calculateRentalCharge(rental, elapsed))}.`
    : rental.endsAt === null
      ? `${rental.renterName}'s open-time rental of ${rental.unitName} ended at ${formatClockTime(returnedAt)} after ${formatElapsed(elapsed)}.`
      : `${rental.unitName}, rented by ${rental.renterName}, has been marked as returned.`;
  addNotification(returnMessage);
  if (selectedUnitId === rentalId) {
    const card = unitCards.find((unitCard) => unitCard.dataset.unitId === rentalId);
    if (card) selectUnit(card);
  }
  render();
});

function createByoRentalId() {
  let rentalId;
  do {
    rentalId = `byo-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  } while (rentals[rentalId]);
  return rentalId;
}

function loadRentals() {
  try {
    const storedRentals = localStorage.getItem(storageKey);
    if (!storedRentals) return {};

    const parsedRentals = JSON.parse(storedRentals);
    if (!parsedRentals || Array.isArray(parsedRentals) || typeof parsedRentals !== "object") {
      throw new Error("Saved rental data has an unexpected format.");
    }

    for (const [rentalId, rental] of Object.entries(parsedRentals)) {
      if (
        typeof rental.unitName !== "string" ||
        typeof rental.category !== "string" ||
        typeof rental.renterName !== "string"
      ) {
        throw new Error("Saved rental data is incomplete.");
      }

      rental.rentalType = rental.rentalType ?? "fleet";
      if (!["fleet", "byo"].includes(rental.rentalType)) {
        throw new Error("Saved rental has an unsupported rental type.");
      }

      if (rental.rentalType === "byo" && !rentalId.startsWith("byo-")) {
        throw new Error("Saved BYO rental has an invalid ID.");
      }

      if (
        rental.rentalType === "byo" &&
        rental.category !== "BYO RC" &&
        !Object.prototype.hasOwnProperty.call(byoPricing, rental.category)
      ) {
        throw new Error("Saved BYO rental has an unsupported pricing category.");
      }

      if (rental.rentalType === "fleet" && !unitCards.some((card) => card.dataset.unitId === rentalId)) {
        throw new Error("Saved fleet rental refers to an unknown unit.");
      }

      if (rental.startedAt === undefined && Number.isInteger(rental.durationMinutes) && Number.isFinite(rental.endsAt)) {
        rental.startedAt = rental.endsAt - rental.durationMinutes * 60 * 1000 - 30 * 1000;
      }

      const isOpenTime = rental.durationMinutes === null && rental.endsAt === null;
      if (
        !Number.isFinite(rental.startedAt) ||
        (!isOpenTime && (!Number.isInteger(rental.durationMinutes) || !Number.isFinite(rental.endsAt))) ||
        (rental.rentalType === "byo" && !isOpenTime) ||
        (rental.notified !== undefined && typeof rental.notified !== "boolean")
      ) {
        throw new Error("Saved rental data is incomplete.");
      }

      rental.notified = rental.notified ?? false;
    }

    return parsedRentals;
  } catch (error) {
    console.error("Could not load saved rentals:", error);
    storageReady = false;
    selectedNotification.textContent =
      "Saved rentals could not be loaded. Check browser storage before starting new rentals.";
    selectedNotification.setAttribute("role", "alert");
    startRentalButton.disabled = true;
    startByoButton.disabled = true;
    return {};
  }
}

function saveRentals() {
  try {
    localStorage.setItem(storageKey, JSON.stringify(rentals));
    return true;
  } catch (error) {
    console.error("Could not save rentals:", error);
    storageReady = false;
    formMessage.textContent = "Rental changes could not be saved in this browser.";
    byoFormMessage.textContent = "Rental changes could not be saved in this browser.";
    selectedNotification.textContent =
      "Storage is unavailable. Rental timers may not survive a page refresh.";
    selectedNotification.setAttribute("role", "alert");
    startRentalButton.disabled = true;
    startByoButton.disabled = true;
    return false;
  }
}

function calculateByoCharge(elapsedMilliseconds, category) {
  const pricing = byoPricing[category];
  if (!pricing) {
    throw new Error(`Unsupported BYO pricing category: ${category}`);
  }

  const elapsedMinutes = Math.ceil(Math.max(0, elapsedMilliseconds) / (60 * 1000));
  return elapsedMinutes * pricing.amount / pricing.intervalMinutes;
}

function calculateRentalCharge(rental, elapsedMilliseconds) {
  if (rental.category === "BYO RC") {
    // Keep active pre-category BYO rentals on their original pricing.
    const startedBlocks = Math.max(1, Math.ceil(elapsedMilliseconds / (45 * 60 * 1000)));
    return startedBlocks * 50;
  }

  return calculateByoCharge(elapsedMilliseconds, rental.category);
}

function formatPrice(amount) {
  return `₱${amount.toFixed(2)}`;
}

function getSelectedCard() {
  return unitCards.find((card) => card.dataset.unitId === selectedUnitId);
}

function selectUnit(card) {
  selectedUnitId = card.dataset.unitId;
  selectedUnitIdInput.value = selectedUnitId;
  unitCards.forEach((unitCard) => {
    unitCard.setAttribute("aria-pressed", String(unitCard === card));
  });
  formMessage.textContent = "";

  const rental = rentals[selectedUnitId];
  if (rental) {
    const isOverdue = rental.endsAt !== null && rental.endsAt <= Date.now();
    selectedUnitLabel.innerHTML = `Selected: <strong>${rental.unitName}</strong>`;
    selectedNotification.textContent = isOverdue
      ? `Time is up for ${rental.unitName}. It was rented by ${rental.renterName}.`
      : rental.endsAt === null
        ? `${rental.unitName} (${rental.category}) is rented by ${rental.renterName} with an open timer.`
        : `${rental.unitName} (${rental.category}) is rented by ${rental.renterName}.`;
    selectedNotification.classList.toggle("is-expired", isOverdue);
    startRentalButton.disabled = true;
  } else {
    selectedUnitLabel.innerHTML = `Selected: <strong>${card.dataset.unitName}</strong>`;
    selectedNotification.textContent =
      `${card.dataset.unitName} (${card.dataset.category}) is available to rent.`;
    selectedNotification.classList.remove("is-expired");
    startRentalButton.disabled = !storageReady;
  }

  startByoButton.disabled = !storageReady;
  render();
}

function addNotification(message) {
  const item = document.createElement("li");
  item.textContent = message;
  notificationList.prepend(item);

  while (notificationList.children.length > 9) {
    notificationList.lastElementChild.remove();
  }
}

function formatTime(milliseconds) {
  const totalSeconds = Math.max(0, Math.ceil(milliseconds / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function formatElapsed(milliseconds) {
  const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function formatClockTime(timestamp) {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

function render() {
  const now = Date.now();

  for (const [rentalId, rental] of Object.entries(rentals)) {
    if (rental.endsAt !== null && rental.endsAt <= now && !rental.notified) {
      rental.notified = true;
      if (saveRentals()) {
        addNotification(`Time is up! ${rental.unitName}, rented by ${rental.renterName}, is due back.`);
        if (selectedUnitId === rentalId) {
          selectedNotification.textContent =
            `Time is up for ${rental.unitName}. It was rented by ${rental.renterName}.`;
          selectedNotification.classList.add("is-expired");
        }
      }
    }
  }

  unitCards.forEach((card) => {
    const rental = rentals[card.dataset.unitId];
    const status = card.querySelector("[data-unit-status]");
    const isOverdue = rental && rental.endsAt !== null && rental.endsAt <= now;
    card.classList.toggle("is-renting", Boolean(rental));
    status.textContent = rental
      ? (isOverdue ? "Time up" : rental.endsAt === null ? "Open timer" : "Rented")
      : "Available";
  });

  const activeRentals = Object.values(rentals);
  activeRentalCount.textContent = activeRentals.length;

  rentalRows.replaceChildren();
  if (activeRentals.length === 0) {
    const emptyRow = document.createElement("tr");
    emptyRow.className = "empty-row";
    const emptyCell = document.createElement("td");
    emptyCell.colSpan = 7;
    emptyCell.textContent = "No rentals running. Choose a unit to start one.";
    emptyRow.append(emptyCell);
    rentalRows.append(emptyRow);
    return;
  }

  for (const [unitId, rental] of Object.entries(rentals)) {
    const row = document.createElement("tr");
    const isOverdue = rental.endsAt !== null && rental.endsAt <= now;
    const elapsed = now - rental.startedAt;
    const isByo = rental.rentalType === "byo";
    const timerAndCharge = isByo
      ? `${formatElapsed(elapsed)} · ${formatPrice(calculateRentalCharge(rental, elapsed))}`
      : rental.endsAt === null
        ? formatElapsed(elapsed)
        : isOverdue ? "00:00" : formatTime(rental.endsAt - now);
    const values = [
      rental.category,
      rental.unitName,
      rental.renterName,
      rental.endsAt === null ? "Open time" : `${rental.durationMinutes} min`,
      timerAndCharge,
    ];

    values.forEach((value) => {
      const cell = document.createElement("td");
      cell.textContent = value;
      row.append(cell);
    });

    const statusCell = document.createElement("td");
    const statusBadge = document.createElement("span");
    statusBadge.className = `status-badge${isOverdue ? " is-renting" : ""}`;
    statusBadge.textContent = isOverdue ? "Time up" : isByo ? "BYO RC" : rental.endsAt === null ? "Open timer" : "Rented";
    statusCell.append(statusBadge);
    row.append(statusCell);

    const actionCell = document.createElement("td");
    const returnButton = document.createElement("button");
    returnButton.className = "return-button";
    returnButton.type = "button";
    returnButton.dataset.returnUnit = unitId;
    returnButton.textContent = "Mark returned";
    actionCell.append(returnButton);
    row.append(actionCell);
    rentalRows.append(row);
  }
}

render();
window.setInterval(render, 1000);
