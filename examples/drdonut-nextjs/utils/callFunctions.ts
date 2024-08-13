'use client';
import { UltravoxSession, UltravoxSessionStatus, Transcript, UltravoxSessionStateChangeEvent, UltravoxSessionState } from 'ultravox-client';
let UVSession: UltravoxSession;

interface JoinUrlResponse {
  uuid: string;
  created: Date;
  ended: Date | null;
  model: string;
  systemPrompt: string;
  temperature: number;
  joinUrl: string;
}

interface CallCallbacks {
  onStatusChange: (status: UltravoxSessionStatus) => void;
  onTranscriptChange: (transcripts: Transcript[]) => void;
}

const initUVSession = async () => {
  if (!UVSession) {
    UVSession = new UltravoxSession();
  }
};

async function createCall(): Promise<string> {
  try {
    const response = await fetch('/api/ultravox', {
      method: 'POST',
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }
    const data: JoinUrlResponse = await response.json();
    console.log(`Call created. Join URL: ${data.joinUrl}`);
    return data.joinUrl;
    // Handle the response data as needed
  } catch (error) {
    console.error('Error creating call:', error);
    throw error;
  }
}

export async function startCall(callbacks: CallCallbacks): Promise<void> {
  const joinUrl = await createCall();

  if (!joinUrl) {
    console.error('Join URL is required');
    return;
  } else {
    console.log('Joining call:', joinUrl);

    await initUVSession();

    const state: UltravoxSessionState = UVSession.joinCall(joinUrl);
    console.log('Session status:', state.getStatus());

    state.addEventListener('ultravoxSessionStatusChanged', (event: any) => {
      callbacks.onStatusChange(event.state);
    });

    state.addEventListener('ultravoxTranscriptsChanged', (event: any) => {
      let te: UltravoxSessionStateChangeEvent = event;
      console.log(te.transcripts)
      callbacks.onTranscriptChange(te.transcripts);
    });
  }

  console.log('Call started!'); 
}

export async function endCall(): Promise<void> {
  console.log('Call ended.');
  UVSession.leaveCall();
}