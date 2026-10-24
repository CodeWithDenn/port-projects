const storageKey = "rc-toy-rental-tracker:v1";
const unitCards = [...document.querySelectorAll(".unit-card")];
const rentalForm = document.querySelector("#rental-form");
const renterInput = document.querySelector("#renter-name");
const durationInput = document.querySelector("#rental-duration");
const selectedUnitIdInput = document.querySelector("#selected-unit-id");
const selectedUnitLabel = document.querySelector("#selected-unit-label");
const selectedNotification = document.querySelector("#rental-notification");
const notificationList = document.querySelector("#notification-list");
const rentalRows = document.querySelector("#rental-rows");
const formMessage = document.querySelector("#form-message");
const startRentalButton = document.querySelector("#start-rental-button");
const activeRentalCount = document.querySelector("#active-rental-count");
const unitCount = document.querySelector("#unit-count");
const categoryCount = document.querySelector("#category-count");

let selectedUnitId = "";
let storageReady = true;
let rentals = loadRentals();

categoryCount.textContent = new Set(unitCards.map((card) => card.dataset.category)).size;
unitCount.textContent = unitCards.length;

unitCards.forEach((card) => {
  card.addEventListener("click", () => selectUnit(card));
});

rentalForm.addEventListener("submit", (event) => {
  event.preventDefault();
  formMessage.textContent = "";

  const selectedCard = getSelectedCard();
  const renterName = renterInput.value.trim();
  const duration = Number(durationInput.value);

  if (!selectedCard) {
    formMessage.textContent = "Choose an available unit before starting a rental.";
    return;
  }

  if (!renterName) {
    renterInput.focus();
    formMessage.textContent = "Enter the renter's name.";
    return;
  }

  if (![15, 30].includes(duration)) {
    durationInput.focus();
    formMessage.textContent = "Choose either 15 or 30 minutes.";
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
    durationMinutes: duration,
    endsAt: startedAt + duration * 60 * 1000 + 30 * 1000,
    notified: false,
  };

  if (!saveRentals()) {
    delete rentals[selectedUnitId];
    return;
  }

  addNotification(
    `${selectedCard.dataset.unitName} rented to ${renterName} for ${duration} minute${duration === 1 ? "" : "s"}.`,
  );
  selectUnit(selectedCard);
  formMessage.textContent = `Rental started for ${selectedCard.dataset.unitName}.`;
});

rentalRows.addEventListener("click", (event) => {
  const returnButton = event.target.closest("[data-return-unit]");
  if (!returnButton) return;

  const unitId = returnButton.dataset.returnUnit;
  const rental = rentals[unitId];
  if (!rental) return;

  delete rentals[unitId];
  if (!saveRentals()) {
    rentals[unitId] = rental;
    return;
  }

  addNotification(`${rental.unitName} has been marked as returned.`);
  if (selectedUnitId === unitId) {
    const card = unitCards.find((unitCard) => unitCard.dataset.unitId === unitId);
    if (card) selectUnit(card);
  }
  render();
});

function loadRentals() {
  try {
    const storedRentals = localStorage.getItem(storageKey);
    if (!storedRentals) return {};

    const parsedRentals = JSON.parse(storedRentals);
    if (!parsedRentals || Array.isArray(parsedRentals) || typeof parsedRentals !== "object") {
      throw new Error("Saved rental data has an unexpected format.");
    }

    for (const rental of Object.values(parsedRentals)) {
      if (
        typeof rental.unitName !== "string" ||
        typeof rental.category !== "string" ||
        typeof rental.renterName !== "string" ||
        !Number.isInteger(rental.durationMinutes) ||
        !Number.isFinite(rental.endsAt) ||
        typeof rental.notified !== "boolean"
      ) {
        throw new Error("Saved rental data is incomplete.");
      }
    }

    return parsedRentals;
  } catch (error) {
    console.error("Could not load saved rentals:", error);
    storageReady = false;
    selectedNotification.textContent =
      "Saved rentals could not be loaded. Check browser storage before starting new rentals.";
    selectedNotification.setAttribute("role", "alert");
    startRentalButton.disabled = true;
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
    selectedNotification.textContent =
      "Storage is unavailable. Rental timers may not survive a page refresh.";
    selectedNotification.setAttribute("role", "alert");
    return false;
  }
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
    const isOverdue = rental.endsAt <= Date.now();
    selectedUnitLabel.innerHTML = `Selected: <strong>${rental.unitName}</strong>`;
    selectedNotification.textContent = isOverdue
      ? `Time is up for ${rental.unitName}. It was rented by ${rental.renterName}.`
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

function render() {
  const now = Date.now();

  for (const [unitId, rental] of Object.entries(rentals)) {
    if (rental.endsAt <= now && !rental.notified) {
      rental.notified = true;
      if (saveRentals()) {
        addNotification(`Time is up! ${rental.unitName}, rented by ${rental.renterName}, is due back.`);
        if (selectedUnitId === unitId) {
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
    card.classList.toggle("is-renting", Boolean(rental));
    status.textContent = rental
      ? (rental.endsAt <= now ? "Time up" : "Rented")
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
    const isOverdue = rental.endsAt <= now;
    const values = [
      rental.category,
      rental.unitName,
      rental.renterName,
      `${rental.durationMinutes} min`,
      isOverdue ? "00:00" : formatTime(rental.endsAt - now),
    ];

    values.forEach((value) => {
      const cell = document.createElement("td");
      cell.textContent = value;
      row.append(cell);
    });

    const statusCell = document.createElement("td");
    const statusBadge = document.createElement("span");
    statusBadge.className = `status-badge${isOverdue ? " is-renting" : ""}`;
    statusBadge.textContent = isOverdue ? "Time up" : "Rented";
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
