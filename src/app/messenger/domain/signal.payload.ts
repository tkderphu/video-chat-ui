

export class SignalPayload {
  localUuid: string
  displayName?: string
  dest?: string
  sdp?: any
  ice?: any

  constructor(localUuid: string,
              displayName?: string,
              dest?: string,
              sdp: any = undefined,
              ice: any = undefined) {
    this.localUuid = localUuid;
    this.displayName = displayName;
    this.dest = dest;
    this.sdp = sdp;
    this.ice = ice;
  }
}
