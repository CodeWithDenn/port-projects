const supabase = window.supabase_client || window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
window.supabase_client = supabase;

const form = document.getElementById("order-form");
const slugInput = document.getElementById("slug");
const slugPreview = document.getElementById("slug-preview");
const statusEl = document.getElementById("status");
const submitBtn = document.getElementById("submit-btn");

// live-update the link preview as they type
slugInput.addEventListener("input", () => {
  // Keep only letters, numbers, and hyphens; collapse multiple hyphens
  const cleaned = slugInput.value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, ""); // Remove leading/trailing hyphens
  slugPreview.textContent = cleaned || "your-slug";
});

function setStatus(message, type) {
  statusEl.textContent = message;
  statusEl.className = "status " + (type || "");
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  submitBtn.disabled = true;
  setStatus("Submitting your order...", "");

  const names = document.getElementById("names").value.trim();
  const slug = slugInput.value.trim().toLowerCase().replace(/\s+/g, "-");
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const paymentRef = document.getElementById("ref").value.trim();
  const files = document.getElementById("photos").files;

  if (files.length === 0) {
    setStatus("Please choose at least one photo.", "error");
    submitBtn.disabled = false;
    return;
  }
  if (files.length > 10) {
    setStatus("Base package allows up to 10 photos. Please choose fewer.", "error");
    submitBtn.disabled = false;
    return;
  }

  try {
    // 1. Validate slug format
    if (!/^[a-z0-9-]+$/.test(slug) || slug.length === 0) {
      setStatus("Page link must contain only letters, numbers, and hyphens.", "error");
      submitBtn.disabled = false;
      return;
    }

    // 2. check the slug isn't already taken
    const { data: existing, error: checkError } = await supabase
      .from("couples")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();

    if (checkError) throw checkError;
    if (existing) {
      setStatus("That page link is already taken. Please choose another.", "error");
      submitBtn.disabled = false;
      return;
    }

    // 3. upload each photo to Supabase Storage
    const photoUrls = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const path = `${slug}/${Date.now()}-${file.name}`;

      const { error: uploadError } = await supabase.storage
        .from("photos")
        .upload(path, file);

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from("photos")
        .getPublicUrl(path);

      photoUrls.push(publicUrlData.publicUrl);
    }

    // 4. insert the couple's row
    const { error: insertError } = await supabase.from("couples").insert({
      slug,
      names,
      email,
      page_password: password || null,
      photo_urls: photoUrls,
      payment_reference: paymentRef,
      payment_status: "pending",
    });

    if (insertError) throw insertError;

    setStatus(
      "Order received! We'll verify your payment and your page will be live within 24 hours.",
      "ok"
    );
    form.reset();
    slugPreview.textContent = "your-slug";
  } catch (err) {
    console.error(err);
    setStatus("Something went wrong: " + err.message, "error");
  } finally {
    submitBtn.disabled = false;
  }
});
