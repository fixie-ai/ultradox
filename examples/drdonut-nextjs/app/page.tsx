'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react'
import { startCall, endCall } from '@/utils/callFunctions'
import config from '@/config.json';
import { Transcript } from 'ultravox-client';
import Image from 'next/image';
import logo from '@/public/dr-donut.webp';

export default function Home() {
  const [isCallActive, setIsCallActive] = useState(false);
  const [agentStatus, setAgentStatus] = useState<string>('');
  const [callTranscript, setCallTranscript] = useState<Transcript[]>([]);
  const transcriptContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (transcriptContainerRef.current) {
      transcriptContainerRef.current.scrollTop = transcriptContainerRef.current.scrollHeight;
    }
  }, [callTranscript]);

  const handleStatusChange = useCallback((status: string) => {
    setAgentStatus(status);
  }, []);

  const handleTranscriptChange = useCallback((transcripts: Transcript[]) => {
    setCallTranscript(prevTranscripts => {  
      return [...transcripts];
    });
  }, []);

  let cleanupCall: (() => void) | undefined;

  const handleStartCallButtonClick = async () => {
    try {
      handleStatusChange('Starting call...');
      cleanupCall = await startCall({
        onStatusChange: handleStatusChange,
        onTranscriptChange: handleTranscriptChange
      });
      setIsCallActive(true);
      handleStatusChange('Call started successfully');
    } catch (error) {
      handleStatusChange(`Error starting call: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const handleEndCallButtonClick = async () => {
    try {
      handleStatusChange('Ending call...');
      // Cleanup the event handlers for the call
      if (cleanupCall) {
        cleanupCall();
      }
      await endCall();
      setIsCallActive(false);
      handleStatusChange('Call ended successfully');
    } catch (error) {
      handleStatusChange(`Error ending call: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row  gap-4 p-4">
      <div className="min-w-[600px] max-w-[800px] w-full bg-gray-100 p-4 rounded-lg">
        <div className="text-black">
          <h1 className="font-bold text-2xl my-6">Ultravox Demo: {config.customer}</h1>
          <form className="bg-white p-5 rounded-lg shadow-md">
            <div className="flex gap-2.5 mb-5">
              <button 
                type="button" 
                className="w-28 p-2.5 rounded-md cursor-pointer font-bold bg-green-500 text-white disabled:bg-gray-400" 
                id="startCall" 
                onClick={handleStartCallButtonClick}
                disabled={isCallActive}
              >
                Start Call
              </button>
              <button 
                type="button" 
                className="w-28 p-2.5 rounded-md cursor-pointer font-bold bg-red-500 text-white disabled:bg-gray-400" 
                id="endCall" 
                onClick={handleEndCallButtonClick}
                disabled={!isCallActive}
              >
                End Call
              </button>
            </div>
            
            <div className="mb-5">
              <div id="agentStatusLabel">Call Status: {agentStatus}</div>
            </div>
            
            <div className="mb-5">
              <h2 className="mb-2.5">Call Transcript</h2>
              <div 
                ref={transcriptContainerRef}
                className="h-[300px] border border-gray-300 rounded-md p-2.5 overflow-y-auto bg-gray-50" 
              >
                {callTranscript && callTranscript.map((transcript, index) => (
                  <div key={index}>
                    <p><span className="font-bold">{transcript.speaker}</span>: {transcript.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </form>
        </div>
      </div>
      <div className="min-w-[600px]">
        <Image src={logo} alt="Dr Donut logo." />
      </div>
    </div>
  )
}