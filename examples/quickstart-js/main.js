import { UltravoxSession, UltravoxSessionStatus } from 'ultravox-client';
const apiUrl = 'http://localhost:3000/startCall';
let UVSession = new UltravoxSession;

export async function getJoinUrl() {
  console.log('getJoinUrl called');
  const systemPrompt = document.getElementById('systemPrompt').value;

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

      const joinUrlBox = document.getElementById('joinUrl');
      joinUrlBox.value = data.joinUrl;

  } else {
      console.error('Error creating call:', await response.text());
  }
}

export async function createCall() {
  console.log('createCall called');
  const joinUrl = document.getElementById('joinUrl').value;
  const callStatus = document.getElementById('conversation');

  if (!joinUrl) {
      console.error('Join URL is required');
      return;
  } else {
    console.log('Joining call:', joinUrl);

    const state = UVSession.joinCall(joinUrl);
    appendToConversation(`Joining call: ${state.getStatus()}`);
    console.log('Session status:', state.getStatus());

    state.addEventListener('ultravoxSessionStatusChanged', (event) => {
      console.log('Session status changed:', event.state);
      appendToConversation(`Session status changed: ${event.state}`);
    });

    state.addEventListener('ultravoxTranscriptsChanged', (event) => {
      console.log('Transcripts changed:', event.transcripts);
      appendToConversation(`Transcripts changed: ${event.transcripts}`);
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