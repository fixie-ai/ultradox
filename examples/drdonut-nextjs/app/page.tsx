'use client';

import React, { useState, useCallback, useRef } from 'react'
import { startCall, endCall } from '@/utils/callFunctions'
import config from '@/config.json';
import { Transcript } from 'ultravox-client';
import Image from 'next/image';
import logo from '@/public/dr-donut.webp';

type StringArraySetter = React.Dispatch<React.SetStateAction<string[]>>;

export default function Home() {
  const [isCallActive, setIsCallActive] = useState(false);
  const [agentStatus, setAgentStatus] = useState<string>('');
  const [callStatus, setCallStatus] = useState<string[]>([]);
  const [callTranscript, setCallTranscript] = useState<Transcript[]>([]);
  const callStatusRef = useRef<HTMLDivElement>(null);
  const callTranscriptRef = useRef<HTMLDivElement>(null);

  const appendUpdate = useCallback((target: 'callStatus' | 'callTranscript', message: string) => {
    const setFunction = (target === 'callStatus' ? setCallStatus : setCallTranscript) as StringArraySetter;
    const ref = target === 'callStatus' ? callStatusRef : callTranscriptRef;

    if(target === 'callStatus') {
      setAgentStatus(message);
    }

    setFunction((prev: string[]) => [...prev, message]);
    setTimeout(() => {
      if (ref.current) {
        ref.current.scrollTop = ref.current.scrollHeight;
      }
    }, 0);
  }, []);

  const handleStartCallButtonClick = async () => {
    try {
      appendUpdate('callStatus', 'Starting call...');
      await startCall({
        onStatusChange: (status: string) => {
          appendUpdate('callStatus', `${status}`);
        },
        onTranscriptChange: (transcripts: Transcript[]) => {
          setCallTranscript(transcripts);
        }
      });
      setIsCallActive(true);
      appendUpdate('callStatus', 'Call started successfully');
    } catch (error) {
      appendUpdate('callStatus', `Error starting call: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const handleEndCallButtonClick = async () => {
    try {
      appendUpdate('callStatus', 'Ending call...');
      await endCall();
      setIsCallActive(false);
      appendUpdate('callStatus', 'Call ended successfully');
    } catch (error) {
      appendUpdate('callStatus', `Error ending call: ${error instanceof Error ? error.message : String(error)}`);
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
                ref={callTranscriptRef}
                className="h-[300px] border border-gray-300 rounded-md p-2.5 overflow-y-auto bg-gray-50" 
                id="callTranscript"
              >
                {callTranscript.map((transcript, index) => (
                  <p key={index}><span className="font-bold">{transcript.speaker}</span>: {transcript.text}</p>
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