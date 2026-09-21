const supabaseClient = window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_KEY);
const requests = [];

const authPanel = document.querySelector("#auth-panel");
const appShell = document.querySelector("#app-shell");
const loginForm = document.querySelector("#login-form");
const loginStatus = document.querySelector("#login-status");
const logoutButton = document.querySelector("#logout-button");
const requestList = document.querySelector("#request-list");
const emptyState = document.querySelector("#empty-state");
const requestStatus = document.querySelector("#request-status");
const refreshButton = document.querySelector("#refresh-button");
const scheduleList = document.querySelector("#schedule-list");
const scheduleEmpty = document.querySelector("#schedule-empty");
const requestModal = document.querySelector("#request-modal");
const modalTitle = document.querySelector("#modal-title");
const modalContact = document.querySelector("#modal-contact");
const modalService = document.querySelector("#modal-service");
const modalDate = document.querySelector("#modal-date");
const modalStatus = document.querySelector("#modal-status");
const modalMessage = document.querySelector("#modal-message");
const searchInput = document.querySelector("#search-input");
const filterButtons = document.querySelectorAll(".filter-button");
let activeFilter = "all";

function setLoginStatus(message, isError = false) {
  loginStatus.textContent = message;
  loginStatus.classList.toggle("error", isError);
}

function escapeHtml(value = "") {
  return String(value).replace(/[&<>'"]/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;",
  })[character]);
}

function formatDate(value) {
  if (!value) return "Not selected";
  return new Date(`${value}T00:00:00`).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
}

function updateStats() {
  ["new", "pending", "scheduled", "completed"].forEach((status) => {
    document.querySelector(`#${status}-count`).textContent = requests.filter((request) => request.status === status).length;
  });
}

function renderSchedule() {
  const scheduledRequests = requests
    .filter((request) => request.status === "scheduled" && request.date)
    .sort((first, second) => first.date.localeCompare(second.date));

  scheduleList.innerHTML = scheduledRequests.map((request) => {
    const date = new Date(`${request.date}T00:00:00`);
    const weekday = date.toLocaleDateString("en-US", { weekday: "short" });
    const day = date.toLocaleDateString("en-US", { day: "numeric" });

    return `
      <article>
        <time datetime="${request.date}">${weekday}<br /><strong>${day}</strong></time>
        <div><strong>${escapeHtml(request.service)} · ${escapeHtml(request.name)}</strong><p>Preferred date from quote request</p></div>
        <span class="status scheduled">Scheduled</span>
      </article>
    `;
  }).join("");

  scheduleEmpty.hidden = scheduledRequests.length > 0;
}

function renderRequests() {
  const searchTerm = searchInput.value.toLowerCase();
  const visibleRequests = requests.filter((request) => {
    const matchesFilter = activeFilter === "all" || request.status === activeFilter;
    const matchesSearch = `${request.name} ${request.service} ${request.contact}`.toLowerCase().includes(searchTerm);
    return matchesFilter && matchesSearch;
  });

  requestList.innerHTML = visibleRequests.map((request) => `
    <tr>
      <td><strong>${escapeHtml(request.name)}</strong><small>${escapeHtml(request.contact)}</small></td>
      <td>${escapeHtml(request.service)}</td>
      <td>${formatDate(request.date)}</td>
      <td>
        <select class="status-select" data-status-id="${request.id}" aria-label="Change status for ${escapeHtml(request.name)}">
          ${["new", "pending", "scheduled", "completed", "cancelled"].map((status) => `
            <option value="${status}" ${status === request.status ? "selected" : ""}>${status}</option>
          `).join("")}
        </select>
      </td>
      <td><button class="row-action" type="button" data-request-id="${request.id}">View</button></td>
    </tr>
  `).join("");

  emptyState.hidden = visibleRequests.length > 0;
}

async function loadRequests() {
  requestStatus.textContent = "Loading requests...";
  requestStatus.classList.remove("error");

  const { data, error } = await supabaseClient
    .from("quote_requests")
    .select("id, customer_name, contact, service, preferred_date, message, status, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    requestStatus.textContent = `Could not load requests: ${error.message}`;
    requestStatus.classList.add("error");
    return;
  }

  requests.splice(0, requests.length, ...data.map((request) => ({
    ...request,
    name: request.customer_name,
    date: request.preferred_date,
  })));
  updateStats();
  renderRequests();
  renderSchedule();
  requestStatus.textContent = `${requests.length} request${requests.length === 1 ? "" : "s"} loaded from Supabase.`;
}

async function showDashboard() {
  authPanel.hidden = true;
  appShell.hidden = false;
  await loadRequests();
}

async function updateRequestStatus(requestId, newStatus) {
  requestStatus.textContent = "Saving status...";
  requestStatus.classList.remove("error");

  const { error } = await supabaseClient
    .from("quote_requests")
    .update({ status: newStatus })
    .eq("id", requestId);

  if (error) {
    requestStatus.textContent = `Could not save status: ${error.message}`;
    requestStatus.classList.add("error");
    renderRequests();
    return;
  }

  const request = requests.find((item) => item.id === requestId);
  if (request) request.status = newStatus;
  updateStats();
  renderRequests();
  renderSchedule();
  requestStatus.textContent = "Status saved.";
}

function openRequestDetails(requestId) {
  const request = requests.find((item) => item.id === requestId);
  if (!request) return;

  modalTitle.textContent = request.name;
  modalContact.textContent = request.contact || "Not provided";
  modalService.textContent = request.service || "Not provided";
  modalDate.textContent = formatDate(request.date);
  modalStatus.textContent = request.status;
  modalMessage.textContent = request.message || "No message provided.";
  requestModal.hidden = false;
}

function closeRequestDetails() {
  requestModal.hidden = true;
}

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    activeFilter = button.dataset.filter;
    filterButtons.forEach((item) => item.classList.toggle("active", item === button));
    renderRequests();
  });
});

searchInput.addEventListener("input", renderRequests);
refreshButton.addEventListener("click", loadRequests);
requestList.addEventListener("change", (event) => {
  const statusSelect = event.target.closest("[data-status-id]");
  if (!statusSelect) return;
  updateRequestStatus(Number(statusSelect.dataset.statusId), statusSelect.value);
});
requestList.addEventListener("click", (event) => {
  const viewButton = event.target.closest("[data-request-id]");
  if (viewButton) openRequestDetails(Number(viewButton.dataset.requestId));
});
requestModal.addEventListener("click", (event) => {
  if (event.target.matches("[data-close-modal]")) closeRequestDetails();
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeRequestDetails();
});

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(loginForm);
  setLoginStatus("Signing in...");

  const { error } = await supabaseClient.auth.signInWithPassword({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (error) {
    setLoginStatus(error.message, true);
    return;
  }

  setLoginStatus("");
  await showDashboard();
});

logoutButton.addEventListener("click", async () => {
  await supabaseClient.auth.signOut();
  appShell.hidden = true;
  authPanel.hidden = false;
  loginForm.reset();
  setLoginStatus("You have been signed out.");
});

supabaseClient.auth.getSession().then(({ data: { session } }) => {
  if (session) showDashboard();
});
