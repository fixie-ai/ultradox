'use client';
import { UltravoxSession, UltravoxSessionStatus, Transcript, UltravoxSessionStateChangeEvent, UltravoxSessionState } from 'ultravox-client';
let UVSession: UltravoxSession | null = null;

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
  } catch (error) {
    console.error('Error creating call:', error);
    throw error;
  }
}

export async function startCall(callbacks: CallCallbacks): Promise<() => void> {
  const joinUrl = await createCall();

  if (!joinUrl) {
    console.error('Join URL is required');
    return () => {};
  } else {
    console.log('Joining call:', joinUrl);

    await initUVSession();

    let state: UltravoxSessionState;
    if (UVSession) {
      state = UVSession.joinCall(joinUrl);
      console.log('Session status:', state.getStatus());
    } else {
      return () => {};
    }

    const statusChangeListener = (event: any) => {
      callbacks.onStatusChange(event.state);
    };

    const transcriptChangeListener = (event: any) => {
      let te: UltravoxSessionStateChangeEvent = event;
      console.log(te.transcripts);
      callbacks.onTranscriptChange(te.transcripts);
    };

    state.addEventListener('ultravoxSessionStatusChanged', statusChangeListener);
    state.addEventListener('ultravoxTranscriptsChanged', transcriptChangeListener);

    console.log('Call started!');

    // For cleaning up when calls end
    return () => {
      state.removeEventListener('ultravoxSessionStatusChanged', statusChangeListener);
      state.removeEventListener('ultravoxTranscriptsChanged', transcriptChangeListener);
    };
  }
}

export async function endCall(): Promise<void> {
  console.log('Call ended.');

  if (UVSession) {
    UVSession.leaveCall();
    UVSession = null;
  }
}