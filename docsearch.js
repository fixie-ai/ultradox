// DocSearch v4 Integration for Mintlify

const algoliaAppId = '6400BF8JR1';
const algoliaSearchApiKey = '2b641fc441384a7caf125dbc206a2b5a';
const algoliaIndexName = 'new_index';

// Add DocSearch CSS
const docSearchCSS = document.createElement('link');
docSearchCSS.rel = 'stylesheet';
docSearchCSS.href = 'https://cdn.jsdelivr.net/npm/@docsearch/css@4';
document.head.appendChild(docSearchCSS);

// Add preconnect for performance
const preconnect = document.createElement('link');
preconnect.rel = 'preconnect';
preconnect.href = `https://${algoliaAppId}-dsn.algolia.net`;
preconnect.crossOrigin = '';
document.head.appendChild(preconnect);

// Add DocSearch JS
const docSearchJS = document.createElement('script');
docSearchJS.src = 'https://cdn.jsdelivr.net/npm/@docsearch/js@4';
docSearchJS.onload = function() {
  initializeDocSearch();
};
document.head.appendChild(docSearchJS);

function initializeDocSearch() {
  // Create a container for DocSearch
  const docSearchContainer = document.createElement('div');
  docSearchContainer.id = 'docsearch';
  // Hide it initially since we'll trigger it programmatically
  docSearchContainer.style.position = 'absolute';
  docSearchContainer.style.opacity = '0';
  docSearchContainer.style.pointerEvents = 'none';
  document.body.appendChild(docSearchContainer);

  // Initialize DocSearch v4
  const searchInstance = docsearch({
    container: '#docsearch',
    appId: algoliaAppId,
    apiKey: algoliaSearchApiKey,
    indexName: algoliaIndexName,
    
    // Enable insights for analytics
    insights: true,
    
    // Optional: Add search parameters if you need filtering
    searchParameters: {
      // Example: facetFilters: ['type:content'],
    },
  });

  // Function to programmatically open the search modal
  function openSearchModal() {
    // Find the DocSearch button that was auto-generated and click it
    const searchButton = document.querySelector('.DocSearch-Button');
    if (searchButton) {
      searchButton.click();
    }
  }

  // Replace Mintlify's search functionality
  const searchButtonContainerIds = [
    "search-bar-entry",
    "search-bar-entry-mobile",
  ];

  const DATA_CUSTOM_LISTENER_ATTACHED = "data-custom-listener-attached";

  // Function to hijack Mintlify search elements
  function attachDocSearchToElement(element) {
    if (!element || element.hasAttribute(DATA_CUSTOM_LISTENER_ATTACHED)) {
      return;
    }

    // Clone element to remove existing event listeners
    const clonedElement = element.cloneNode(true);
    element.parentNode.replaceChild(clonedElement, element);

    // Attach DocSearch trigger
    clonedElement.addEventListener("click", function(event) {
      event.preventDefault();
      event.stopPropagation();
      openSearchModal();
    });

    clonedElement.setAttribute(DATA_CUSTOM_LISTENER_ATTACHED, 'true');
  }

  // Initial setup for existing search buttons
  searchButtonContainerIds.forEach(id => {
    const element = document.getElementById(id);
    if (element) {
      attachDocSearchToElement(element);
    }
  });

  // Global keyboard shortcut (Cmd+K / Ctrl+K)
  document.addEventListener("keydown", function(event) {
    if ((event.metaKey || event.ctrlKey) && event.key === "k") {
      event.preventDefault();
      event.stopPropagation();
      openSearchModal();
    }
  });

  // Watch for dynamically added elements (Mintlify may re-render components)
  const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      if (mutation.type === "childList") {
        searchButtonContainerIds.forEach(id => {
          const element = document.getElementById(id);
          if (element && !element.hasAttribute(DATA_CUSTOM_LISTENER_ATTACHED)) {
            attachDocSearchToElement(element);
          }
        });
      }
    });
  });

  observer.observe(document.body, { childList: true, subtree: true });
}

// Wait for DOM to be ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeDocSearch);
} else {
  // DOM is already ready, initialize immediately
  initializeDocSearch();
}