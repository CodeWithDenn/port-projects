const quoteForm = document.querySelector(".quote-form");

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
  const submitButton = quoteForm.querySelector("button");
  submitButton.textContent = "Request received";
  submitButton.disabled = true;
});