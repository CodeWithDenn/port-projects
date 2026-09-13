// ============================================
// COUPLE DATA & CONFIGURATION
// ============================================
const coupleData = {
  names: "Denn & Bebelyn",
  correctPassword: "042326", // Change this per couple
  
  // Gallery content: photos, messages, timeline
  content: [
    {
      type: "message",
      text: "Our love story starts here",
      subtext: "October 15, 2024"
    },
    {
      type: "photo",
      src: "assets/images/photo1.jpg",
      caption: "Our first trip together"
    },
    {
      type: "quote",
      text: "You are my today and all of my tomorrows",
      author: "Leo Christopher"
    },
    {
      type: "photo",
      src: "assets/images/photo2.jpg",
      caption: "A beautiful moment"
    },
    {
      type: "milestone",
      title: "1 Year Together",
      date: "October 15, 2025",
      emoji: "💕"
    },
    {
      type: "video",
      src: "assets/images/video1.mp4",
      caption: "Our favorite memories"
    },
    {
      type: "message",
      text: "Forever starts today",
      subtext: "With you by my side"
    }
  ]
};

// ============================================
// PASSWORD VERIFICATION (INDEX PAGE)
// ============================================
if (document.getElementById("password-form")) {
  const form = document.getElementById("password-form");
  const input = document.getElementById("password-input");
  const errorMsg = document.getElementById("error-message");

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    
    const enteredPassword = input.value;
    
    // Simple verification (can be enhanced with hashing)
    if (enteredPassword === coupleData.correctPassword) {
      // Store verification in sessionStorage (not localStorage for security)
      sessionStorage.setItem("galleryVerified", "true");
      sessionStorage.setItem("accessTime", Date.now());
      
      // Redirect to gallery
      window.location.href = "gallery.html";
    } else {
      errorMsg.textContent = "Incorrect password. Try again.";
      errorMsg.classList.remove("error-hidden");
      input.value = "";
    }
  });
}

// ============================================
// GALLERY PAGE PROTECTION & RENDERING
// ============================================
if (document.getElementById("gallery-content")) {
  // Check if password was verified
  const isVerified = sessionStorage.getItem("galleryVerified");
  
  if (!isVerified) {
    // Redirect back to password page if not verified
    window.location.href = "index.html";
  } else {
    // Render the gallery
    renderGallery();
  }

  // Logout button
  const logoutBtn = document.getElementById("logout-btn");
  logoutBtn.addEventListener("click", () => {
    sessionStorage.clear();
    window.location.href = "index.html";
  });
}

function renderGallery() {
  const container = document.getElementById("gallery-content");
  const coupleNames = document.getElementById("couple-names");
  
  // Set couple names
  coupleNames.textContent = coupleData.names;
  
  // Clear loading message
  container.innerHTML = "";
  
  // Render each content item
  coupleData.content.forEach((item) => {
    const element = createContentElement(item);
    container.appendChild(element);
  });
}

function createContentElement(item) {
  const div = document.createElement("div");
  div.className = `gallery-item ${item.type}`;
  
  switch (item.type) {
    case "photo":
      div.innerHTML = `
        <img src="${item.src}" alt="${item.caption}" />
        <p>${item.caption}</p>
      `;
      break;
      
    case "video":
      div.innerHTML = `
        <video controls>
          <source src="${item.src}" type="video/mp4">
          Your browser doesn't support video.
        </video>
        <p>${item.caption}</p>
      `;
      break;
      
    case "message":
      div.innerHTML = `
        <div class="message-card">
          <p class="message-text">${item.text}</p>
          <p class="message-subtext">${item.subtext}</p>
        </div>
      `;
      break;
      
    case "quote":
      div.innerHTML = `
        <div class="quote-card">
          <p class="quote-text">"${item.text}"</p>
          <p class="quote-author">— ${item.author}</p>
        </div>
      `;
      break;
      
    case "milestone":
      div.innerHTML = `
        <div class="milestone-card">
          <span class="milestone-emoji">${item.emoji}</span>
          <h3>${item.title}</h3>
          <p>${item.date}</p>
        </div>
      `;
      break;
  }
  
  return div;
}
