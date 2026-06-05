// DocSearch v4 Integration for Mintlify with Custom Styling

const algoliaAppId = '6400BF8JR1';
const algoliaSearchApiKey = '2b641fc441384a7caf125dbc206a2b5a';
const algoliaIndexName = 'new_index';

// Add DocSearch CSS first
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
    insights: true,
  });

  // Apply custom styles AFTER DocSearch initializes
  setTimeout(() => {
    const customStyles = document.createElement('style');
    customStyles.innerHTML = `
      /* Override DocSearch colors to match Mintlify theme */
      .DocSearch {
        --docsearch-primary-color: #5E92FF !important;
        --docsearch-text-color: rgb(65, 67, 70) !important;
        --docsearch-highlight-color: #5E92FF !important;
        --docsearch-muted-color: rgb(114, 116, 119) !important;
        --docsearch-container-background: rgba(15, 17, 23, 0.6) !important;
        --docsearch-modal-background: #ffffff !important;
        --docsearch-searchbox-background: #f5f6f7 !important;
        --docsearch-searchbox-focus-background: #ffffff !important;
        --docsearch-searchbox-shadow: inset 0 0 0 2px #5E92FF !important;
        --docsearch-hit-color: rgb(65, 67, 70) !important;
        --docsearch-hit-active-color: #ffffff !important;
        --docsearch-hit-background: #ffffff !important;
        --docsearch-hit-active-background: #5E92FF !important;
        --docsearch-hit-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1) !important;
        --docsearch-footer-background: #f5f6f7 !important;
      }
      
      /* Dark mode */
      .dark .DocSearch {
        --docsearch-text-color: rgb(225, 226, 230) !important;
        --docsearch-container-background: rgba(14, 14, 16, 0.8) !important;
        --docsearch-modal-background: rgb(14, 14, 16) !important;
        --docsearch-searchbox-background: rgb(40, 41, 45) !important;
        --docsearch-searchbox-focus-background: rgb(40, 41, 45) !important;
        --docsearch-hit-color: rgb(225, 226, 230) !important;
        --docsearch-hit-background: rgb(25, 27, 30) !important;
        --docsearch-hit-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.5) !important;
        --docsearch-footer-background: rgb(25, 27, 30) !important;
        --docsearch-muted-color: rgb(161, 162, 166) !important;
        --docsearch-key-gradient: linear-gradient(-225deg, #444, #222) !important;
        --docsearch-key-shadow: inset 0 -2px 0 0 #282d55, 0 1px 2px 1px rgba(0, 0, 0, 0.3) !important;
      }
      
      /* Force override specific elements */
      .DocSearch-Button {
        background: var(--docsearch-searchbox-background) !important;
        color: var(--docsearch-muted-color) !important;
      }
      
      .DocSearch-Button:hover {
        box-shadow: var(--docsearch-searchbox-shadow) !important;
      }
      
      .DocSearch-Search-Icon {
        color: var(--docsearch-primary-color) !important;
      }
      
      .DocSearch-Hit a {
        background: var(--docsearch-hit-background) !important;
        border: 1px solid rgba(94, 146, 255, 0.1) !important;
      }
      
      .DocSearch-Hit[aria-selected="true"] a {
        background: var(--docsearch-hit-active-background) !important;
      }
      
      .DocSearch-Hit-Container mark {
        background: rgba(94, 146, 255, 0.2) !important;
        color: #5E92FF !important;
        font-weight: 600 !important;
      }
      
      .DocSearch-Modal {
        background: var(--docsearch-modal-background) !important;
      }
      
      .DocSearch-Footer {
        background: var(--docsearch-footer-background) !important;
        border-top: 1px solid rgba(94, 146, 255, 0.1) !important;
      }
    `;
    document.head.appendChild(customStyles);
  }, 100);

  // Function to programmatically open the search modal
  function openSearchModal() {
    const searchButton = document.querySelector('.DocSearch-Button');
    if (searchButton) {
      searchButton.click();
    }
  }

  // Rest of your existing code...
  const searchButtonContainerIds = [
    "search-bar-entry",
    "search-bar-entry-mobile",
  ];

  const DATA_CUSTOM_LISTENER_ATTACHED = "data-custom-listener-attached";

  function attachDocSearchToElement(element) {
    if (!element || element.hasAttribute(DATA_CUSTOM_LISTENER_ATTACHED)) {
      return;
    }

    const clonedElement = element.cloneNode(true);
    element.parentNode.replaceChild(clonedElement, element);

    clonedElement.addEventListener("click", function(event) {
      event.preventDefault();
      event.stopPropagation();
      openSearchModal();
    });

    clonedElement.setAttribute(DATA_CUSTOM_LISTENER_ATTACHED, 'true');
  }

  searchButtonContainerIds.forEach(id => {
    const element = document.getElementById(id);
    if (element) {
      attachDocSearchToElement(element);
    }
  });

  document.addEventListener("keydown", function(event) {
    if ((event.metaKey || event.ctrlKey) && event.key === "k") {
      event.preventDefault();
      event.stopPropagation();
      openSearchModal();
    }
  });

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
  initializeDocSearch();
}