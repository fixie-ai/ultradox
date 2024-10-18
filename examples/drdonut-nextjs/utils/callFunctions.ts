'use client';
import { UltravoxSession, UltravoxSessionStatus, Transcript } from 'ultravox-client';
let uvSession: UltravoxSession | null = null;

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
  onStatusChange: (status: UltravoxSessionStatus | undefined) => void;
  onTranscriptChange: (transcripts: Transcript[] | undefined) => void;
}

const initUVSession = async () => {
  if (!uvSession) {
    uvSession = new UltravoxSession();
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

    const statusChangeListener = (event: any) => {
      callbacks.onStatusChange(uvSession?.status);
    };

    const transcriptChangeListener = (event: any) => {
      console.log(uvSession?.transcripts);
      callbacks.onTranscriptChange(uvSession?.transcripts);
    };

    if (uvSession) {
      
  
      uvSession.addEventListener('status', statusChangeListener);
      uvSession.addEventListener('transcripts', transcriptChangeListener);

      uvSession.joinCall(joinUrl);
      console.log('Session status:', uvSession.status);
    } else {
      return () => {};
    }

    console.log('Call started!');

    // For cleaning up when calls end
    return () => {
      uvSession?.removeEventListener('status', statusChangeListener);
      uvSession?.removeEventListener('transcripts', transcriptChangeListener);
    };
  }
}

export async function endCall(): Promise<void> {
  console.log('Call ended.');

  if (uvSession) {
    uvSession.leaveCall();
    uvSession = null;
  }
}