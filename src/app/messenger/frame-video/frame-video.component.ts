import { Component, OnInit } from '@angular/core';
import { StompService } from "../service/stomp.service";
import { ConversationService } from "../service/conversation.service";
import { ActivatedRoute } from "@angular/router";
import { SignalPayload } from "../domain/signal.payload";
import { Pair, PeerInfo } from "../domain/peer.info";
import { MessageService } from '../service/message.service';
const ICE_SERVERS = {
  iceServers: [
    {
      urls: "stun:stun.l.google.com:19302"
    }
  ]
}

const constraints = {
  video: {
    width: { max: 500 },
    height: { max: 300 },
    frameRate: { max: 100 },
  },
  audio: true,
};

function createUUID() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
  }

  return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}

function errorHandler(error: any) {
  console.log("stream error")
  console.log(error);
}

@Component({
  selector: 'app-frame-video',
  templateUrl: './frame-video.component.html',
  styleUrls: ['./frame-video.component.css']
})
export class FrameVideoComponent implements OnInit {
  peerConnections: { [key: string]: PeerInfo } = {}
  conversationId?: string
  localId: string = ''
  localDisplay?: string
  localPeer?: Pair
  mapStream: Map<string, Pair> = new Map<string, Pair>();
  localStream?: MediaStream
  stompClient: any = new StompService().getStompClient()
  constructor(
    private conversationService: ConversationService,
    private activatedRoute: ActivatedRoute,
    private messageService: MessageService) {
  }

  ngOnInit(): void {
    this.start_video_call();
    this.conversationId = this.activatedRoute.snapshot.queryParams['room']
    // if(!this.conversationId) {
    //   alert("Can't find room")
    //   window.history.back()
    // } else {
    //   this.conversationService.checkWhetherConversationIsValidAndHaveContainCurrentUser()
    //     .subscribe({
    //       next: response => {
    //         if(response.status !== 200) {
    //           alert("You can't access into this room!")
    //           window.history.back()
    //         } else {
    //           this.start_video_call();
    //         }
    //       }
    //     })
    // }
  }


  private start_video_call() {
    if(!localStorage.getItem("peerId")) {
      localStorage.setItem("peerId", createUUID())
    }
    //@ts-ignore
    this.localId = localStorage.getItem("peerId")
    this.localDisplay = "quangphu - " + this.localId
    navigator.mediaDevices.getUserMedia(constraints)
      .then((stream) => {
        this.localPeer = {
          displayName: this.localDisplay,
          mediaStream: stream,
          yourself: true
        }
        this.mapStream.set(this.localId, this.localPeer)
      })
      .catch(() => {
        alert("Your devices was being used")
        window.location.href='/messenger'
      })
      .then(() => {
        this.stompClient.subscribe(
          "/topic/room",
          (payload: any) => {
            console.log(payload)
            const signalPayload: SignalPayload = JSON.parse(payload.body)
            const peerId = signalPayload.localUuid
            if (peerId === this.localId
              || (signalPayload.dest !== this.localId
                && signalPayload.dest != this.conversationId)) {
              console.log("break")
              return;
            }

            if (signalPayload.displayName && signalPayload.dest === this.conversationId) {
              //@ts-ignore
              this.setUpPeer(signalPayload.localUuid, signalPayload.displayName);
              this.stompClient.send(
                "/app/signal",
                // "/app/video-call/conversation/" + this.conversationId,
                {},
                JSON.stringify(new SignalPayload(
                  this.localId,
                  this.localDisplay,
                  signalPayload.localUuid,
                  undefined,
                  undefined
                ))
              )
            } else if (signalPayload.displayName && signalPayload.dest === this.localId) {
              //@ts-ignore
              this.setUpPeer(signalPayload.localUuid, signalPayload.displayName, true);
            } else if (signalPayload.sdp) {
              this.peerConnections[signalPayload.localUuid].pc
                .setRemoteDescription(new RTCSessionDescription(signalPayload.sdp))
                .then(() => {
                  if (signalPayload.sdp.type === 'offer') {
                    this.peerConnections[signalPayload.localUuid].pc
                      .createAnswer()
                      .then((description: any) => {
                        this.createdDescription(
                          description,
                          signalPayload.localUuid
                        )
                      })
                      .catch(errorHandler)
                  }
                })
            } else if (signalPayload.ice) {
              this.peerConnections[signalPayload.localUuid].pc.addIceCandidate(
                new RTCIceCandidate(signalPayload.ice)
              )
                .catch(errorHandler)
            }
          }
        )
        this.stompClient.send(
          "/app/signal",
          {},
          JSON.stringify(new SignalPayload(
            this.localId,
            this.localDisplay,
            this.conversationId,
            undefined,
            undefined
          ))
        )
      })
      .catch(errorHandler)
  }

  private setUpPeer(peerId: string, displayName: string, initCall: boolean = false) {
    this.peerConnections[peerId] = {
      displayName: displayName,
      isRender: false,
      pc: new RTCPeerConnection(ICE_SERVERS)
    }

    this.peerConnections[peerId].pc.ontrack = (event) => {

      this.mapStream.set(peerId, {
        displayName: displayName,
        mediaStream: event.streams[0],
        yourself: false
      })
      console.log("-------------------stream: ", event.streams[0], "-------------------------")
    }

    this.mapStream.get(this.localId)?.mediaStream?.getTracks().forEach(track => {
      console.log("push stream-----------------", this.mapStream.get(this.localId)?.mediaStream, '-----------')
      //@ts-ignore
      this.peerConnections[peerId].pc.addTrack(track, this.mapStream.get(this.localId)?.mediaStream)
    })


    this.peerConnections[peerId].pc.onconnectionstatechange = (event) => {
      const state = this.peerConnections[peerId].pc.iceConnectionState;
      if (state === 'failed' || state === 'closed' || state === 'disconnected') {
        delete this.peerConnections[peerId]
        this.mapStream.delete(peerId);
      }
    }

    this.peerConnections[peerId].pc.onicecandidate = (event) => {
      if (event.candidate) {
        this.stompClient.send(
          "/app/signal",
          {},
          JSON.stringify(new SignalPayload(
            this.localId,
            undefined,
            peerId,
            undefined,
            event.candidate
          ))
        )
      }
    }
    if (initCall) {
      this.peerConnections[peerId].pc.createOffer()
        .then((description: any) => {
          this.createdDescription(description, peerId)
        })
    }
  }

  private createdDescription(description: any, peerUuid: string) {
    console.log(`got description, peer ${peerUuid}`);
    this.peerConnections[peerUuid].pc.setLocalDescription(description).then(() => {
      this.stompClient.send(
        "/app/signal",
        {},
        JSON.stringify(new SignalPayload(
          this.localId,
          undefined,
          peerUuid,
          description,
          undefined,
        )))
    }).catch(errorHandler);
  }

  protected readonly Array = Array;
}

