document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector(".booking-form");
  const status = document.querySelector(".form-status");
  const dateInput = document.querySelector("#visit-date");

  if (!form || !status || !dateInput) return;

  dateInput.min = new Date().toISOString().split("T")[0];

  const preview = form.querySelector(".request-preview");
  const previewField = form.querySelector("#request-preview");
  const fbLink = form.querySelector(".fb-link");

  const contactInput = form.elements.contact;

  // Number-like input must be a PH mobile (09XXXXXXXXX, +639XXXXXXXXX, 639XXXXXXXXX); anything else is a social handle.
  const validateContact = () => {
    const value = contactInput.value.trim();
    let message = "";

    if (/^[+\d\s()-]+$/.test(value)) {
      const digits = value.replace(/[\s()-]/g, "");
      if (!/^(09|\+?639)\d{9}$/.test(digits)) {
        message = "Enter a valid PH mobile number, e.g. 09322110102.";
      }
    }

    contactInput.setCustomValidity(message);
  };

  contactInput.addEventListener("input", validateContact);

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    validateContact();

    if (!form.checkValidity()) {
      form.reportValidity();
      status.textContent = contactInput.validationMessage || "Please complete your name, contact, and preferred date.";
      return;
    }

    const name = form.elements.name.value.trim();
    const date = new Date(`${form.elements.date.value}T12:00:00`);
    const formattedDate = date.toLocaleDateString(undefined, {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
    const notes = form.elements.notes.value.trim() || "None";

    const message = [
      "RC Tambayan - Visit Request",
      `Name: ${name}`,
      `Contact: ${form.elements.contact.value.trim()}`,
      `Date: ${formattedDate}`,
      `Group size: ${form.elements.group.value}`,
      `Plans: ${notes}`,
    ].join("\n");

    fbLink.hidden = false;

    try {
      await navigator.clipboard.writeText(message);
      preview.hidden = true;
      status.textContent = "Copied! Now paste it in a message to our Facebook page.";
    } catch {
      previewField.value = message;
      preview.hidden = false;
      previewField.select();
      status.textContent = "Couldn't copy automatically. Copy the message below and paste it to our Facebook page.";
    }
  });
});
