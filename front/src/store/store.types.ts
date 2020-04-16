import { ActionContext, Module } from 'vuex';
import { Device } from '@/api/device.class';
import { BakuEvent } from '@/api/baku.service';

export interface CaptureState {
  stream: MediaStream | null;
  activeDevice: Device | null,
  activeCapture: boolean;
  scaleX: number;
  scaleY: number;
  onionSkin: number;
}

export interface ProjectState {
  id: string;
  activeShotId: string | null;
  history: BakuEvent[];
  pendingActions: number;
}

export interface UserState {
  username: string;
}

export interface BakuRootState {
  webrtc: WebrtcState,
  project: ProjectState,
  capture: CaptureState,
  user: UserState,
}

export type SocketStatus = 'opened' | 'closed' | 'error';

export interface WebrtcState {
  peerConnection: undefined | RTCPeerConnection,
  dataChannel: null | RTCDataChannel,
  stream: undefined | MediaStream,
  isConnected: boolean,
  socketStatus: SocketStatus,
}


export type BakuActionContext<TState> = ActionContext<TState, BakuRootState>;
export type BakuModule<TState> = Module<TState, BakuRootState>;