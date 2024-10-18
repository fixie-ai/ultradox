'use client';
import { UltravoxSession, UltravoxSessionStatus, Transcript } from 'ultravox-client';
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
  onStatusChange: (status: UltravoxSessionStatus | undefined) => void;
  onTranscriptChange: (transcripts: Transcript[] | undefined) => void;
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

    if (UVSession) {
      UVSession.joinCall(joinUrl);
      console.log('Session status:', UVSession.status);
    } else {
      return () => {};
    }

    const statusChangeListener = (event: any) => {
      callbacks.onStatusChange(UVSession?.status);
    };

    const transcriptChangeListener = (event: any) => {
      console.log(UVSession?.transcripts);
      callbacks.onTranscriptChange(UVSession?.transcripts);
    };

    UVSession.addEventListener('status', statusChangeListener);
    UVSession.addEventListener('transcripts', transcriptChangeListener);

    console.log('Call started!');

    // For cleaning up when calls end
    return () => {
      UVSession?.removeEventListener('status', statusChangeListener);
      UVSession?.removeEventListener('transcripts', transcriptChangeListener);
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