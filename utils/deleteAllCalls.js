const BASE_URL = 'https://api.ultravox.ai';

async function fetchWithTimeout(url, options, timeout = 10000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

async function listCalls(apiKey, cursor = null) {
  let url = `${BASE_URL}/api/calls`;
  if (cursor) {
    url += `?cursor=${cursor}`;
  }
  const response = await fetchWithTimeout(url, {
    headers: {
      'X-API-Key': apiKey,
      'Content-Type': 'application/json'
    }
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return response.json();
}

async function deleteCall(apiKey, callUuid) {
  const url = `${BASE_URL}/api/calls/${callUuid}`;
  try {
    const response = await fetchWithTimeout(url, {
      method: 'DELETE',
      headers: {
        'X-API-Key': apiKey,
        'Content-Type': 'application/json'
      }
    });
    return response.status;
  } catch (error) {
    console.error(`Error deleting call ${callUuid}:`, error.message);
    return error instanceof Response ? error.status : 500;
  }
}

async function listAndDeleteAllCalls(apiKey) {
  let totalDeleted = 0;
  let cursor = null;

  while (true) {
    try {
      const callsPage = await listCalls(apiKey, cursor);
      
      for (const call of callsPage.results) {
        const callUuid = call.uuid;
        const deleteStatus = await deleteCall(apiKey, callUuid);
        
        if (deleteStatus === 204) {
          console.log(`Successfully deleted call: ${callUuid}`);
          totalDeleted++;
        } else {
          console.log(`Failed to delete call: ${callUuid}. Status code: ${deleteStatus}`);
        }
        
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      if (callsPage.next) {
        const nextUrl = new URL(callsPage.next);
        cursor = nextUrl.searchParams.get('cursor');
      } else {
        break;
      }
    } catch (error) {
      console.error('Error fetching calls:', error.message);
      break;
    }
  }

  console.log(`Total calls deleted: ${totalDeleted}`);
}

async function main() {
  const apiKey = process.argv[2];

  if (!apiKey) {
    console.error('Please provide an Ultravox API key as a command-line argument.');
    console.error('Usage: node script.js <API_KEY>');
    process.exit(1);
  }

  try {
    const calls = await listCalls(apiKey);
    console.log(calls);
    await listAndDeleteAllCalls(apiKey);
  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the main function
main();