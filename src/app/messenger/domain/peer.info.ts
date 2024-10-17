export interface PeerInfo {
  displayName?: string
  isRender: boolean
  pc: RTCPeerConnection
}

export interface Pair {
  displayName?: string
  mediaStream?: MediaStream,
  yourself: boolean
}