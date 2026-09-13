const supabase = window.supabase_client || window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
window.supabase_client = supabase;

const wrap = document.getElementById("wrap");

function showMessage(text) {
  wrap.innerHTML = `<div class="center-note">${text}</div>`;
}

function renderPasswordPrompt(couple) {
  wrap.innerHTML = `
    <div class="wrap" style="padding-top:120px;">
      <h1>This page is private</h1>
      <p class="sub">Enter the password to view it.</p>
      <input type="password" id="pw-input" placeholder="Password" />
      <button id="pw-submit">View page</button>
      <div class="status error" id="pw-status"></div>
    </div>
  `;
  document.getElementById("pw-submit").addEventListener("click", () => {
    const entered = document.getElementById("pw-input").value;
    // Note: Password comparison is case-sensitive (as stored)
    if (entered === couple.page_password) {
      renderCouplePage(couple);
    } else {
      document.getElementById("pw-status").textContent = "Incorrect password.";
    }
  });
}

function renderCouplePage(couple) {
  const photosHtml = (couple.photo_urls || [])
    .map((url) => `<img src="${url}" alt="A memory" />`)
    .join("");

  wrap.innerHTML = `
    <h1>${couple.names}</h1>
    <p class="sub">Our favorite memories together</p>
    <div class="gallery">${photosHtml}</div>
  `;
}

async function loadPage() {
  const params = new URLSearchParams(window.location.search);
  const slug = params.get("slug");

  if (!slug || typeof slug !== "string") {
    showMessage("No page specified.");
    return;
  }

  // Sanitize slug (should already be safe from database, but be defensive)
  const cleanSlug = slug.toLowerCase().replace(/[^a-z0-9-]/g, "");
  if (!cleanSlug) {
    showMessage("Invalid page link.");
    return;
  }

  const { data: couple, error } = await supabase
    .from("couples")
    .select("*")
    .eq("slug", cleanSlug)
    .maybeSingle();

  if (error) {
    showMessage("Something went wrong loading this page.");
    console.error(error);
    return;
  }

  if (!couple) {
    showMessage("This page doesn't exist yet.");
    return;
  }

  if (couple.payment_status !== "verified") {
    showMessage("This page isn't live yet &mdash; payment is still being verified.");
    return;
  }

  if (couple.page_password) {
    renderPasswordPrompt(couple);
  } else {
    renderCouplePage(couple);
  }
}

loadPage();
