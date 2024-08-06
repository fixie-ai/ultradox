require('dotenv').config();
const axios = require('axios');

const BASE_URL = 'https://api.ultravox.ai';
const API_KEY = process.env.ULTRAVOX_API_KEY;

if (!API_KEY) {
  console.error('ULTRAVOX_API_KEY is not set in the environment variables.');
  process.exit(1);
}

const headers = {
  'X-API-Key': API_KEY,
  'Content-Type': 'application/json'
};

async function listCalls(cursor = null) {
  let url = `${BASE_URL}/api/calls`;
  if (cursor) {
    url += `?cursor=${cursor}`;
  }
  const response = await axios.get(url, { headers });
  return response.data;
}

async function deleteCall(callUuid) {
  const url = `${BASE_URL}/api/calls/${callUuid}`;
  try {
    const response = await axios.delete(url, { headers });
    return response.status;
  } catch (error) {
    console.error(`Error deleting call ${callUuid}:`, error.message);
    return error.response ? error.response.status : 500;
  }
}

async function listAndDeleteAllCalls() {
  let totalDeleted = 0;
  let cursor = null;

  while (true) {
    try {
      const callsPage = await listCalls(cursor);
      
      for (const call of callsPage.results) {
        const callUuid = call.uuid;
        const deleteStatus = await deleteCall(callUuid);
        
        if (deleteStatus === 204) {
          console.log(`Successfully deleted call: ${callUuid}`);
          totalDeleted++;
        } else {
          console.log(`Failed to delete call: ${callUuid}. Status code: ${deleteStatus}`);
        }
        
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      if (callsPage.next) {
        cursor = new URL(callsPage.next).searchParams.get('cursor');
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
  try {
    const calls = await listCalls();
    console.log(calls);
    await listAndDeleteAllCalls();
  } catch (error) {
    console.error('Error:', error);
  }
}

main();
