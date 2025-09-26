// DocSearch v4 Integration for Mintlify
// Add DocSearch CSS
const docSearchCSS = document.createElement('link');
docSearchCSS.rel = 'stylesheet';
docSearchCSS.href = 'https://cdn.jsdelivr.net/npm/@docsearch/css@alpha';
document.head.appendChild(docSearchCSS);

// Add DocSearch JS
const docSearchJS = document.createElement('script');
docSearchJS.src = 'https://cdn.jsdelivr.net/npm/@docsearch/js@alpha';
docSearchJS.onload = function() {
  initializeDocSearch();
};
document.head.appendChild(docSearchJS);

function initializeDocSearch() {
  // DocSearch v4 configuration
  const searchConfig = {
    appId: '6400BF8JR1', // Replace with your Algolia app ID
    apiKey: '2b641fc441384a7caf125dbc206a2b5a', // Replace with your search-only API key
    indexName: 'new_index', // Your index name from the crawler config
    
    // v4 specific options
    insights: true, // Enable search insights
    container: '#docsearch', // Container selector
    placeholder: 'Search docs...',
    
    // Optional: Configure search parameters
    searchParameters: {
      // Add any specific search parameters here
    },
    
    // Optional: Transform items before display
    transformItems: function(items) {
      return items.map(item => ({
        ...item,
        // You can modify items here if needed
      }));
    }
  };

  // Create a hidden container for DocSearch
  const docSearchContainer = document.createElement('div');
  docSearchContainer.id = 'docsearch';
  docSearchContainer.style.position = 'fixed';
  docSearchContainer.style.top = '-9999px';
  docSearchContainer.style.left = '-9999px';
  document.body.appendChild(docSearchContainer);

  // Initialize DocSearch
  const search = docsearch(searchConfig);

  // Function to programmatically open the search modal
  function openSearchModal() {
    // In v4, you can programmatically open the modal
    const searchButton = document.querySelector('.DocSearch-Button');
    if (searchButton) {
      searchButton.click();
    } else {
      // If button doesn't exist, trigger search directly
      // v4 may expose different methods - check the docs
      console.log('Triggering search modal');
    }
  }

  // Replace Mintlify's search functionality
  const searchButtonContainerIds = [
    "search-bar-entry",
    "search-bar-entry-mobile",
  ];

  const DATA_CUSTOM_LISTENER_ATTACHED = "data-custom-listener-attached";

  // Function to attach DocSearch to an element
  function attachDocSearchToElement(element) {
    if (!element || element.hasAttribute(DATA_CUSTOM_LISTENER_ATTACHED)) {
      return;
    }

    // Clone to remove existing listeners
    const clonedElement = element.cloneNode(true);
    element.parentNode.replaceChild(clonedElement, element);

    // Attach new listener
    clonedElement.addEventListener("click", function(event) {
      event.preventDefault();
      event.stopPropagation();
      openSearchModal();
    });

    clonedElement.setAttribute(DATA_CUSTOM_LISTENER_ATTACHED, 'true');
  }

  // Initial setup for existing elements
  searchButtonContainerIds.forEach(id => {
    const element = document.getElementById(id);
    if (element) {
      attachDocSearchToElement(element);
    }
  });

  // Global keyboard shortcut
  document.addEventListener("keydown", function(event) {
    if ((event.metaKey || event.ctrlKey) && event.key === "k") {
      event.preventDefault();
      event.stopPropagation();
      openSearchModal();
    }
  });

  // Watch for dynamically added elements
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
