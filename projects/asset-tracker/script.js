const searchInput = document.querySelector("#search");
const emptyState = document.querySelector("#empty-state");
const assetList = document.querySelector("#asset-list");
const assetForm = document.querySelector("#asset-form");
const deviceTypeFilter = document.querySelector("#deviceType");
const conditionFilter = document.querySelector("#condition");
const assets = JSON.parse(localStorage.getItem("assets")) || [];
const clearFiltersButton = document.querySelector("#clear-filters");

// clear filters button functionality
clearFiltersButton.addEventListener("click", () => {
  searchInput.value = "";
  deviceTypeFilter.value = "all";
  conditionFilter.value = "all";
  renderAssets();
});

// render stats
function renderStats() {
  const countByCondition = (condition) =>
    assets.filter((asset) => asset.condition === condition).length;

  document.querySelector("#total-assets").textContent = assets.length;
  document.querySelector("#good-assets").textContent = countByCondition("good");
  document.querySelector("#repair-assets").textContent =
    countByCondition("needs repair");
  document.querySelector("#damaged-assets").textContent =
    countByCondition("damaged");
}

// search filtering
function renderAssets() {
  const selectedDeviceType = deviceTypeFilter.value;
  const selectedCondition = conditionFilter.value;
  const searchTerm = searchInput.value.toLowerCase().trim();

  const visibleAssets = assets.filter((asset) => {
    const matchesSearch = Object.values(asset).some((value) =>
      value.toLowerCase().includes(searchTerm),
    );

    // filtering by device type and condition
    const matchesDeviceType =
      selectedDeviceType === "all" ||
      asset.deviceType.toLowerCase() === selectedDeviceType;
    const matchesCondition =
      selectedCondition === "all" ||
      asset.condition.toLowerCase() === selectedCondition;

    // return true if the asset matches all filters
    return matchesSearch && matchesDeviceType && matchesCondition;
  });

  // display the assets in the asset list
  assetList.innerHTML = visibleAssets
    .map(
      (asset) => `
    <article class="asset-card">
    <h3>Asset ID: ${asset.assetId}</h3>
    <p><strong>Device type:</strong> ${asset.deviceType}</p>
    <p><strong>Brand and model:</strong> ${asset.brandModel}</p>
    <p><strong>Assigned user:</strong> ${asset.assignedUser}</p>
    <p><strong>Location:</strong> ${asset.location}</p>
    <p><strong>Condition:</strong> ${asset.condition}</p>
    <button type="button" class="delete-asset" data-asset-id="${asset.assetId}">
    Delete
    </button>
    </article>
    `,
    )
    .join("");
  if (assets.length === 0) {
    emptyState.textContent = "No assets have been added yet.";
  } else if (visibleAssets.length === 0) {
    emptyState.textContent = "No assets match your current filters.";
  }

  emptyState.hidden = visibleAssets.length > 0;
}

// event listeners for filtering and searching
deviceTypeFilter.addEventListener("change", renderAssets);
conditionFilter.addEventListener("change", renderAssets);
searchInput.addEventListener("input", renderAssets);

// delete asset functionality
assetList.addEventListener("click", (event) => {
  if (!event.target.classList.contains("delete-asset")) return;

  const assetId = event.target.dataset.assetId;
  const assetIndex = assets.findIndex((asset) => asset.assetId === assetId);

  assets.splice(assetIndex, 1);
  localStorage.setItem("assets", JSON.stringify(assets));
  renderAssets();
  renderStats();
});

// form submission
assetForm.addEventListener("submit", (event) => {
  event.preventDefault();

  // create a new asset object from the form data and add it to the assets array
  const formData = new FormData(assetForm);
  const asset = Object.fromEntries(formData);
  assets.push(asset);
  localStorage.setItem("assets", JSON.stringify(assets));
  renderAssets();
  renderStats();

  console.log(assets);
  assetForm.reset();
});
renderAssets();
renderStats();
