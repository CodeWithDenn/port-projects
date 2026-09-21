const quoteForm = document.querySelector(".quote-form");
const formStatus = quoteForm.querySelector(".form-status");
const submitButton = quoteForm.querySelector("button");
const supabaseClient = window.supabase.createClient(
  window.SUPABASE_URL,
  window.SUPABASE_KEY
);

const revealItems = document.querySelectorAll(".reveal-on-scroll");

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

quoteForm.addEventListener("submit", (event) => {
  event.preventDefault();

  submitQuote();
});

async function submitQuote() {
  submitButton.disabled = true;
  submitButton.textContent = "Sending...";
  formStatus.textContent = "";

  try {
    const formData = new FormData(quoteForm);
    const { error } = await supabaseClient.from("quote_requests").insert({
      customer_name: formData.get("name"),
      contact: formData.get("contact"),
      service: formData.get("service"),
      preferred_date: formData.get("preferred_date") || null,
      message: formData.get("message") || null,
    });

    if (error) throw error;
  } catch (error) {
    console.error("Quote submission error:", error);
    formStatus.textContent = "We could not send your request. Please try again.";
    submitButton.disabled = false;
    submitButton.textContent = "Send quote request";
    return;
  }

  formStatus.textContent = "Thanks. Your quote request has been sent.";
  quoteForm.reset();
  submitButton.disabled = false;
  submitButton.textContent = "Send another request";
}