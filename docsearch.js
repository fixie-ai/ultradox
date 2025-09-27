// DocSearch v4 Integration for Mintlify with Custom Styling

const algoliaAppId = '6400BF8JR1';
const algoliaSearchApiKey = '2b641fc441384a7caf125dbc206a2b5a';
const algoliaIndexName = 'new_index';

// Add custom styles BEFORE DocSearch CSS
const customStyles = document.createElement('style');
customStyles.innerHTML = `
  :root {
    /* Primary brand colors */
    --docsearch-primary-color: #5E92FF;
    --docsearch-text-color: #1c1e21;
    --docsearch-spacing: 8px;
    --docsearch-icon-stroke-width: 1.4;
    
    /* Search button */
    --docsearch-searchbox-background: #f5f6f7;
    --docsearch-searchbox-focus-background: #fff;
    --docsearch-searchbox-shadow: inset 0 0 0 2px #5E92FF;
    
    /* Modal colors */
    --docsearch-modal-background: #f5f6f7;
    --docsearch-modal-width: 560px;
    --docsearch-modal-height: 600px;
    --docsearch-modal-shadow: 0 3px 8px 0 rgba(0, 0, 0, 0.2);
    
    /* Search input */
    --docsearch-searchbox-height: 56px;
    --docsearch-hit-height: 56px;
    --docsearch-hit-color: #444950;
    --docsearch-hit-active-color: #fff;
    --docsearch-hit-background: #fff;
    --docsearch-hit-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
    
    /* Highlighted search results */
    --docsearch-highlight-color: #5E92FF;
    --docsearch-hit-active-background: #5E92FF;
    
    /* Footer */
    --docsearch-footer-background: #fff;
    --docsearch-footer-height: 44px;
    --docsearch-footer-shadow: 0 -1px 0 0 #e0e3e8;
    
    /* Keys */
    --docsearch-key-gradient: linear-gradient(-225deg, #d5dbe4, #f8f8f8);
    --docsearch-key-shadow: inset 0 -2px 0 0 #cdcde6, 0 1px 2px 1px rgba(0, 0, 0, 0.1);
    
    /* Dark mode specific */
    --docsearch-container-background: rgba(101, 108, 133, 0.8);
    --docsearch-logo-color: #5E92FF;
    --docsearch-muted-color: #7f8c9a;
  }
  
  /* Dark mode overrides */
  html.dark {
    --docsearch-text-color: #f5f6f7;
    --docsearch-container-background: rgba(9, 10, 17, 0.8);
    --docsearch-modal-background: #15172a;
    --docsearch-searchbox-background: #0e0e10;
    --docsearch-searchbox-focus-background: #0e0e10;
    --docsearch-hit-color: #bec3c9;
    --docsearch-hit-background: #090a11;
    --docsearch-hit-active-color: #fff;
    --docsearch-hit-active-background: #5E92FF;
    --docsearch-footer-background: #090a11;
    --docsearch-logo-color: #fff;
    --docsearch-muted-color: #7f8c9a;
    --docsearch-key-gradient: linear-gradient(-26.5deg, #565872, #31355b);
    --docsearch-key-shadow: inset 0 -2px 0 0 #282d55, 0 1px 2px 1px rgba(0, 0, 0, 0.3);
  }
  
  /* Additional custom styling */
  .DocSearch-Button {
    border-radius: 8px !important;
    font-family: 'Inter', system-ui, sans-serif !important;
  }
  
  .DocSearch-Modal {
    border-radius: 16px !important;
  }
  
  .DocSearch-Hit a {
    border-radius: 8px !important;
  }
  
  /* Custom scrollbar for search results */
  .DocSearch-Dropdown::-webkit-scrollbar {
    width: 8px;
  }
  
  .DocSearch-Dropdown::-webkit-scrollbar-track {
    background: transparent;
  }
  
  .DocSearch-Dropdown::-webkit-scrollbar-thumb {
    background: #5E92FF;
    border-radius: 4px;
  }
  
  /* Match Ultravox brand colors */
  .DocSearch-Hit-Container mark {
    background: rgba(94, 146, 255, 0.2) !important;
    color: inherit !important;
  }
`;
document.head.appendChild(customStyles);

// Add DocSearch CSS (after custom styles so it doesn't override them)
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