import { UltravoxSession } from 'ultravox-client';
const apiUrl = 'http://localhost:3000/startCall';
const expMessages = new Set(["debug"]);
let uvSession = new UltravoxSession({ experimentalMessages: expMessages });

async function getJoinUrl(systemPrompt) {
  console.log('getJoinUrl called');
  const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json'
      },
      body: JSON.stringify({
          systemPrompt: systemPrompt
      })
  });

  if (response.ok) {
      const data = await response.json();
      console.log(`Call created: ${JSON.stringify(data)}`);
      return data.joinUrl;

  } else {
      console.error('Error creating call:', await response.text());
  }
}

export async function startCall() {
  console.log('createCall called');
  const systemPrompt = document.getElementById('systemPrompt').value;
  const joinUrl = await getJoinUrl(systemPrompt);
  const callStatus = document.getElementById('conversation');

  if (!joinUrl) {
      console.error('Join URL is required');
      return;
  } else {
    console.log('Joining call:', joinUrl);

    uvSession.addEventListener('status', (event) => {
      console.log('Session status changed:', uvSession.status);
      appendToConversation(`Session status changed: ${uvSession.status}`);
    });

    uvSession.addEventListener('transcripts', (event) => {
      console.log('Transcripts changed:', uvSession.transcripts);
      appendToConversation(`Transcripts changed: ${JSON.stringify(uvSession.transcripts)}`);
    });

    uvSession.addEventListener('experimental_message', (event) => {
      console.log('Exp Message:', event);
    });

    uvSession.joinCall(joinUrl);
    appendToConversation(`Joining call: ${uvSession.status}`);
    console.log('Session status:', uvSession.status);

    
  }

}

function appendToConversation(message) {
  const conversation = document.getElementById('conversation');
  conversation.innerHTML += `<p>${message}</p>`;
  conversation.scrollTop = conversation.scrollHeight;
}

export function endCall() {
  appendToConversation('Leaving call...');
  uvSession.leaveCall();
}