document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector(".booking-form");
  const status = document.querySelector(".form-status");
  const dateInput = document.querySelector("#visit-date");

  if (!form || !status || !dateInput) return;

  dateInput.min = new Date().toISOString().split("T")[0];

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!form.checkValidity()) {
      form.reportValidity();
      status.textContent = "Please complete your name, contact, and preferred date.";
      return;
    }

    const name = form.elements.name.value.trim();
    const date = new Date(`${form.elements.date.value}T12:00:00`);
    const formattedDate = date.toLocaleDateString(undefined, {
      month: "long",
      day: "numeric",
      year: "numeric",
    });

    status.textContent = `Thanks, ${name}. Your visit request for ${formattedDate} is ready for confirmation.`;
    form.reset();
    dateInput.min = new Date().toISOString().split("T")[0];
  });
});
