const storageKey = "help-desk-tickets";

const starterTickets = [
  {
    id: "HD-104",
    subject: "Cannot connect to office Wi-Fi",
    requester: "Mika Santos",
    category: "Network",
    priority: "High",
    status: "Open",
  },
  {
    id: "HD-103",
    subject: "Install design software update",
    requester: "Liam Cruz",
    category: "Software",
    priority: "Medium",
    status: "In Progress",
  },
  {
    id: "HD-102",
    subject: "Keyboard replacement request",
    requester: "Ana Reyes",
    category: "Hardware",
    priority: "Low",
    status: "Resolved",
  },
];

let tickets = JSON.parse(localStorage.getItem(storageKey)) || starterTickets;

const ticketList = document.querySelector("#ticket-list");
const emptyState = document.querySelector("#empty-state");
const searchInput = document.querySelector("#search-input");
const statusFilter = document.querySelector("#status-filter");
const priorityFilter = document.querySelector("#priority-filter");
const ticketForm = document.querySelector("#ticket-form");
const formMessage = document.querySelector("#form-message");

function saveTickets() {
  localStorage.setItem(storageKey, JSON.stringify(tickets));
}

function statusClass(status) {
  return status.replace(" ", "-");
}

function renderStats() {
  const count = (status) => tickets.filter((ticket) => ticket.status === status).length;
  document.querySelector("#open-count").textContent = count("Open");
  document.querySelector("#progress-count").textContent = count("In Progress");
  document.querySelector("#resolved-count").textContent = count("Resolved");
  document.querySelector("#total-count").textContent = tickets.length;
}

function filteredTickets() {
  const search = searchInput.value.toLowerCase().trim();
  return tickets.filter((ticket) => {
    const matchesSearch = [ticket.subject, ticket.requester, ticket.category, ticket.id]
      .join(" ")
      .toLowerCase()
      .includes(search);
    const matchesStatus = statusFilter.value === "all" || ticket.status === statusFilter.value;
    const matchesPriority = priorityFilter.value === "all" || ticket.priority === priorityFilter.value;
    return matchesSearch && matchesStatus && matchesPriority;
  });
}

function renderTickets() {
  const visibleTickets = filteredTickets();
  ticketList.innerHTML = visibleTickets
    .map(
      (ticket) => `
        <article class="ticket-row">
          <div>
            <span class="ticket-subject">${ticket.subject}</span>
            <span class="ticket-meta">${ticket.id} · ${ticket.requester}</span>
          </div>
          <span class="ticket-cell">${ticket.category}</span>
          <span class="priority ${ticket.priority}">${ticket.priority}</span>
          <span class="status ${statusClass(ticket.status)}">${ticket.status}</span>
          <label>
            <span class="sr-only">Update ${ticket.id} status</span>
            <select data-ticket-id="${ticket.id}" aria-label="Update ${ticket.id} status">
              <option ${ticket.status === "Open" ? "selected" : ""}>Open</option>
              <option ${ticket.status === "In Progress" ? "selected" : ""}>In Progress</option>
              <option ${ticket.status === "Resolved" ? "selected" : ""}>Resolved</option>
            </select>
          </label>
        </article>
      `,
    )
    .join("");
  emptyState.hidden = visibleTickets.length > 0;
  renderStats();
}

ticketList.addEventListener("change", (event) => {
  const ticketId = event.target.dataset.ticketId;
  if (!ticketId) return;
  const ticket = tickets.find((item) => item.id === ticketId);
  ticket.status = event.target.value;
  saveTickets();
  renderTickets();
});

[searchInput, statusFilter, priorityFilter].forEach((control) => {
  control.addEventListener("input", renderTickets);
  control.addEventListener("change", renderTickets);
});

ticketForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(ticketForm);
  const nextNumber = tickets.length + 105;
  tickets.unshift({
    id: `HD-${nextNumber}`,
    subject: formData.get("subject"),
    requester: formData.get("requester"),
    category: formData.get("category"),
    priority: formData.get("priority"),
    status: "Open",
  });
  saveTickets();
  ticketForm.reset();
  formMessage.textContent = "Ticket created.";
  renderTickets();
  window.setTimeout(() => {
    formMessage.textContent = "";
  }, 2500);
});

renderTickets();
