// behavior for the main memories page (e.g. days-together counter)

// anniversary start date — update this to the real date/time
const ANNIVERSARY = new Date("2026-04-23T00:00:00");

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

document.getElementById("lock-page-button").addEventListener("click", () => {
  localStorage.removeItem("couples-memories-denn-bebelyn-unlocked");
  window.location.replace("index.html");
});

const revealItems = document.querySelectorAll(
  "main section, .timeline-item, .gallery-item, .message-card"
);

revealItems.forEach((item, index) => {
  item.classList.add("reveal-on-scroll");
  item.style.setProperty("--reveal-delay", `${(index % 3) * 0.08}s`);
});

const revealObserver = new IntersectionObserver(
  (entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  },
  { threshold: 0.12 }
);

revealItems.forEach((item) => revealObserver.observe(item));
