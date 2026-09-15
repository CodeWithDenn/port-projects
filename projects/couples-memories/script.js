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

  const { years, months, days, hours, minutes, seconds } = getElapsed(ANNIVERSARY, new Date());

  counterEl.textContent =
    `${years}y ${months}m ${days}d ${hours}h ${minutes}m ${seconds}s together`;
}

updateCounter();
setInterval(updateCounter, 1000);
