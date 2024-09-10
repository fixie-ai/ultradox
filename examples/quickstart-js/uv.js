import { createLocalAudioTrack, Room, RoomEvent, Track, } from 'livekit-client';
export var UltravoxSessionStatus;
(function (UltravoxSessionStatus) {
    UltravoxSessionStatus["DISCONNECTED"] = "disconnected";
    UltravoxSessionStatus["DISCONNECTING"] = "disconnecting";
    UltravoxSessionStatus["CONNECTING"] = "connecting";
    UltravoxSessionStatus["IDLE"] = "idle";
    UltravoxSessionStatus["LISTENING"] = "listening";
    UltravoxSessionStatus["THINKING"] = "thinking";
    UltravoxSessionStatus["SPEAKING"] = "speaking";
})(UltravoxSessionStatus || (UltravoxSessionStatus = {}));
export var Role;
(function (Role) {
    Role["USER"] = "user";
    Role["AGENT"] = "agent";
})(Role || (Role = {}));
export var Medium;
(function (Medium) {
    Medium["VOICE"] = "voice";
    Medium["TEXT"] = "text";
})(Medium || (Medium = {}));
export class Transcript {
    text;
    isFinal;
    speaker;
    medium;
    constructor(text, isFinal, speaker, medium) {
        this.text = text;
        this.isFinal = isFinal;
        this.speaker = speaker;
        this.medium = medium;
    }
}
export class UltravoxSessionStateChangeEvent extends Event {
    state;
    transcripts;
    constructor(eventName, state, transcripts) {
        super(eventName);
        this.state = state;
        this.transcripts = transcripts;
    }
}
export class UltravoxSessionStatusChangedEvent extends UltravoxSessionStateChangeEvent {
    state;
    transcripts;
    constructor(state, transcripts) {
        super('ultravoxSessionStatusChanged', state, transcripts);
        this.state = state;
        this.transcripts = transcripts;
    }
}
export class UltravoxTranscriptsChangedEvent extends UltravoxSessionStateChangeEvent {
    state;
    transcripts;
    constructor(state, transcripts) {
        super('ultravoxTranscriptsChanged', state, transcripts);
        this.state = state;
        this.transcripts = transcripts;
    }
}
export class UltravoxExperimentalMessageEvent extends Event {
    message;
    constructor(message) {
        super('ultravoxExperimentalMessage');
        this.message = message;
    }
}
export class UltravoxSessionState extends EventTarget {
    transcripts = [];
    status = UltravoxSessionStatus.DISCONNECTED;
    constructor() {
        super();
    }
    getTranscripts() {
        return this.transcripts;
    }
    getStatus() {
        return this.status;
    }
    setStatus(status) {
        this.status = status;
        this.dispatchEvent(new UltravoxSessionStatusChangedEvent(status, this.transcripts));
    }
    addOrUpdateTranscript(transcript) {
        if (this.transcripts.length) {
            const lastTranscript = this.transcripts[this.transcripts.length - 1];
            if (lastTranscript && !lastTranscript.isFinal && transcript.speaker === lastTranscript.speaker) {
                this.transcripts[this.transcripts.length - 1] = transcript;
            }
            else {
                this.transcripts.push(transcript);
            }
        }
        else {
            this.transcripts.push(transcript);
        }
        this.dispatchEvent(new UltravoxTranscriptsChangedEvent(this.status, this.transcripts));
    }
}
export class UltravoxSession {
    audioContext;
    experimentalMessages;
    static CONNECTED_STATUSES = new Set([
        UltravoxSessionStatus.LISTENING,
        UltravoxSessionStatus.THINKING,
        UltravoxSessionStatus.SPEAKING,
    ]);
    state = new UltravoxSessionState();
    socket;
    room;
    audioElement = new Audio();
    localAudioTrack;
    micSourceNode;
    agentSourceNode;
    delayedSpeakingState = false;
    textDecoder = new TextDecoder();
    textEncoder = new TextEncoder();
    constructor(audioContext = new AudioContext(), experimentalMessages = new Set()) {
        this.audioContext = audioContext;
        this.experimentalMessages = experimentalMessages;
    }
    joinCall(joinUrl) {
        if (this.state.getStatus() !== UltravoxSessionStatus.DISCONNECTED) {
            throw new Error('Cannot join a new call while already in a call');
        }
        if (this.experimentalMessages) {
            const url = new URL(joinUrl);
            url.searchParams.set('experimentalMessages', Array.from(this.experimentalMessages.values()).join(','));
            joinUrl = url.toString();
        }
        this.state.setStatus(UltravoxSessionStatus.CONNECTING);
        this.socket = new WebSocket(joinUrl);
        this.socket.onmessage = (event) => this.handleSocketMessage(event);
        this.socket.onclose = (event) => this.handleSocketClose(event);
        return this.state;
    }
    async leaveCall() {
        await this.disconnect();
    }
    sendText(text) {
        const status = this.state.getStatus();
        if (!UltravoxSession.CONNECTED_STATUSES.has(status)) {
            throw new Error(`Cannot send text while not connected. Current status is ${status}.`);
        }
        this.sendData({ type: 'input_text_message', text });
    }
    async handleSocketMessage(event) {
        const msg = JSON.parse(event.data);
        // We attach the Livekit audio to an audio element so that we can mute the audio
        // when the agent is not speaking. For now, disable Livekit's WebAudio mixing
        // to avoid the audio playing twice:
        //
        // References:
        //  - https://docs.livekit.io/guides/migrate-from-v1/#Javascript-Typescript
        //  - https://github.com/livekit/components-js/pull/855
        //
        this.room = new Room({ webAudioMix: false });
        this.room.on(RoomEvent.TrackSubscribed, (track) => this.handleTrackSubscribed(track));
        this.room.on(RoomEvent.DataReceived, (payload, participant) => this.handleDataReceived(payload, participant));
        const [track, _] = await Promise.all([createLocalAudioTrack(), this.room.connect(msg.roomUrl, msg.token)]);
        this.localAudioTrack = track;
        this.localAudioTrack.setAudioContext(this.audioContext);
        if ([UltravoxSessionStatus.DISCONNECTED, UltravoxSessionStatus.DISCONNECTING].includes(this.state.getStatus())) {
            // We've been stopped while waiting for the mic permission (during createLocalTracks).
            await this.disconnect();
            return;
        }
        this.audioContext.resume();
        this.audioElement.play();
        if (this.localAudioTrack.mediaStream) {
            this.micSourceNode = this.audioContext.createMediaStreamSource(this.localAudioTrack.mediaStream);
        }
        const opts = { name: 'audio', simulcast: false, source: Track.Source.Microphone };
        this.room.localParticipant.publishTrack(this.localAudioTrack, opts);
        this.state.setStatus(UltravoxSessionStatus.IDLE);
    }
    async handleSocketClose(event) {
        await this.disconnect();
    }
    async disconnect() {
        if (this.state.getStatus() !== UltravoxSessionStatus.DISCONNECTING) {
            this.state.setStatus(UltravoxSessionStatus.DISCONNECTING);
        }
        this.localAudioTrack?.stop();
        this.localAudioTrack = undefined;
        await this.room?.disconnect();
        this.room = undefined;
        this.socket?.close();
        this.socket = undefined;
        this.micSourceNode?.disconnect();
        this.micSourceNode = undefined;
        this.agentSourceNode?.disconnect();
        this.agentSourceNode = undefined;
        this.audioElement.pause();
        this.audioElement.srcObject = null;
        this.state.setStatus(UltravoxSessionStatus.DISCONNECTED);
    }
    handleTrackSubscribed(track) {
        const audioTrack = track;
        audioTrack.attach(this.audioElement);
        if (track.mediaStream) {
            this.agentSourceNode = this.audioContext.createMediaStreamSource(track.mediaStream);
        }
        if (this.delayedSpeakingState) {
            this.delayedSpeakingState = false;
            this.state.setStatus(UltravoxSessionStatus.SPEAKING);
        }
    }
    sendData(obj) {
        this.room?.localParticipant.publishData(this.textEncoder.encode(JSON.stringify(obj)), { reliable: true });
    }
    handleDataReceived(payload, _participant) {
        const msg = JSON.parse(this.textDecoder.decode(payload));
        if (msg.type === 'state') {
            const newState = msg.state;
            if (newState === UltravoxSessionStatus.SPEAKING && this.agentSourceNode === undefined) {
                // Skip the first speaking state, before we've attached the audio element.
                // handleTrackSubscribed will be called soon and will change the state.
                this.delayedSpeakingState = true;
            }
            else {
                this.state.setStatus(newState);
            }
        }
        else if (msg.type === 'transcript') {
            const medium = msg.transcript.medium == 'voice' ? Medium.VOICE : Medium.TEXT;
            const transcript = new Transcript(msg.transcript.text, msg.transcript.final, Role.USER, medium);
            this.state.addOrUpdateTranscript(transcript);
        }
        else if (msg.type === 'voice_synced_transcript' || msg.type == 'agent_text_transcript') {
            const medium = msg.type == 'agent_text_transcript' ? Medium.TEXT : Medium.VOICE;
            if (msg.text != null) {
                const newTranscript = new Transcript(msg.text, msg.final, Role.AGENT, medium);
                this.state.addOrUpdateTranscript(newTranscript);
            }
            else if (msg.delta != null) {
                const transcripts = this.state.getTranscripts();
                const lastTranscript = transcripts.length ? transcripts[transcripts.length - 1] : undefined;
                if (lastTranscript && lastTranscript.speaker == Role.AGENT) {
                    const newTranscript = new Transcript(lastTranscript.text + msg.delta, msg.final, Role.AGENT, medium);
                    this.state.addOrUpdateTranscript(newTranscript);
                }
            }
        }
        else if (this.experimentalMessages) {
            this.state.dispatchEvent(new UltravoxExperimentalMessageEvent(msg));
            console.log(`exp`);
        }
    }
}
//# sourceMappingURL=index.js.map