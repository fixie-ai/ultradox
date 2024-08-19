const BASE_URL = 'https://api.ultravox.ai';

async function listVoices(apiKey) {
  fetch('https://api.ultravox.ai/api/voices', {
      method: 'GET',
      headers: {
        'X-API-Key': apiKey
      }
    })
    .then(response => response.json())
    .then(data => console.log(data))
    .catch(error => console.error('Error:', error));
  }

async function main() {
  const apiKey = process.argv[2];

  if (!apiKey) {
    console.error('Please provide an Ultravox API key as a command-line argument.');
    console.error('Usage: node script.js <API_KEY>');
    process.exit(1);
  }

  try {
    await listVoices(apiKey);

  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the main function
main();