// behavior for the main memories page (e.g. days-together counter)
// all buyer-editable content/values live in config.js — do not hardcode data here

document.body.dataset.theme = CONFIG.theme;

document.getElementById("hero-names").textContent = CONFIG.names;
document.getElementById("hero-subtitle").textContent = `Together since ${CONFIG.anniversaryDisplay}`;
document.getElementById("footer-note").textContent = CONFIG.footerNote;

const timelineList = document.querySelector(".timeline-list");
CONFIG.timeline.forEach((entry) => {
  const li = document.createElement("li");
  li.className = "timeline-item";
  li.innerHTML = `
    ${entry.photo ? `<img src="${entry.photo}" alt="${entry.title}" class="timeline-photo" />` : ""}
    <div class="timeline-content">
      <span class="timeline-date">${entry.date}</span>
      <h3 class="timeline-title">${entry.title}</h3>
      <p>${entry.description}</p>
    </div>
  `;
  timelineList.appendChild(li);
});

const galleryGrid = document.querySelector(".gallery-grid");
CONFIG.gallery.forEach((photo) => {
  const figure = document.createElement("figure");
  figure.className = photo.wide ? "gallery-item gallery-item--wide" : "gallery-item";
  figure.innerHTML = `
    <img src="${photo.src}" alt="${photo.alt}" />
    <figcaption>${photo.caption}</figcaption>
  `;
  galleryGrid.appendChild(figure);
});

const messageList = document.querySelector(".message-list");
CONFIG.messages.forEach((message) => {
  const li = document.createElement("li");
  li.className = "message-card";
  li.innerHTML = `
    <p>"${message.text}"</p>
    <span class="message-author">— ${message.author}</span>
  `;
  messageList.appendChild(li);
});

// anniversary start date comes from config.js
const ANNIVERSARY = new Date(CONFIG.anniversaryDate);

function getElapsed(start, now) {
  let years = now.getFullYear() - start.getFullYear();
  let months = now.getMonth() - start.getMonth();
  let days = now.getDate() - start.getDate();
  let hours = now.getHours() - start.getHours();
  let minutes = now.getMinutes() - start.getMinutes();
  let seconds = now.getSeconds() - start.getSeconds();

  if (seconds < 0) {
    seconds += 60;
    minutes--;
  }
  if (minutes < 0) {
    minutes += 60;
    hours--;
  }
  if (hours < 0) {
    hours += 24;
    days--;
  }
  if (days < 0) {
    // borrow days from the month before "now" since the current month may not have started yet
    const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    days += prevMonth.getDate();
    months--;
  }
  if (months < 0) {
    months += 12;
    years--;
  }

  return { years, months, days, hours, minutes, seconds };
}

function updateCounter() {
  const counterEl = document.getElementById("days-counter");
  if (!counterEl) return;

  const elapsed = getElapsed(ANNIVERSARY, new Date());

  counterEl.querySelectorAll("[data-unit]").forEach((el) => {
    el.textContent = elapsed[el.dataset.unit];
  });
}

updateCounter();
setInterval(updateCounter, 1000);

// gallery photo modal
const modal = document.getElementById("photo-modal");
const modalImage = document.getElementById("modal-image");
const modalClose = document.getElementById("modal-close");

function openModal(src, alt) {
  modalImage.src = src;
  modalImage.alt = alt;
  modal.classList.remove("hidden");
}

function closeModal() {
  modal.classList.add("hidden");
  modalImage.src = "";
}

document.querySelectorAll(".gallery-item img").forEach((img) => {
  img.addEventListener("click", () => {
    if (img.src) openModal(img.src, img.alt);
  });
});

modalClose.addEventListener("click", closeModal);
modal.addEventListener("click", (event) => {
  if (event.target === modal) closeModal();
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeModal();
});
