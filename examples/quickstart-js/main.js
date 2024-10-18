import { UltravoxSession } from 'ultravox-client';
const apiUrl = 'http://localhost:3000/startCall';
const expMessages = new Set(["debug"]);
let UVSession = new UltravoxSession({ experimentalMessages: expMessages });

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

    UVSession.joinCall(joinUrl);
    appendToConversation(`Joining call: ${UVSession.status}`);
    console.log('Session status:', UVSession.status);

    UVSession.addEventListener('status', (event) => {
      console.log('Session status changed:', UVSession.status);
      appendToConversation(`Session status changed: ${UVSession.status}`);
    });

    UVSession.addEventListener('transcripts', (event) => {
      console.log('Transcripts changed:', UVSession.transcripts);
      appendToConversation(`Transcripts changed: ${JSON.stringify(UVSession.transcripts)}`);
    });

    UVSession.addEventListener('experimental_message', (event) => {
      console.log('Exp Message:', event);
    });
  }

}

function appendToConversation(message) {
  const conversation = document.getElementById('conversation');
  conversation.innerHTML += `<p>${message}</p>`;
  conversation.scrollTop = conversation.scrollHeight;
}

export function endCall() {
  appendToConversation('Leaving call...');
  UVSession.leaveCall();
}