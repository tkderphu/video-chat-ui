import {Component, OnInit} from '@angular/core';
import {StompService} from "../service/stomp.service";
import {ConversationService} from "../service/conversation.service";
import {ActivatedRoute} from "@angular/router";
import {SignalPayload} from "../domain/signal.payload";
import {PeerInfo} from "../domain/peer.info";
import { MessageService } from '../service/message.service';
import * as Stomp from 'stompjs';
import * as SockJS from 'sockjs-client';

const ICE_SERVERS = {
  iceServers: [
    {
      urls: "stun:stun.l.google.com:19302"
    }
  ]
}

const constraints = {
  video: {
    width: {max: 500},
    height: {max: 300},
    frameRate: {max: 100},
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
  mapStream: Map<string, MediaStream> = new Map<string, MediaStream>();
  localStream?: MediaStream
  stompClient: any;
  constructor(private stompService: StompService,
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
    this.localId = createUUID()
    this.localDisplay = "quangphu - " + this.localId
    navigator.mediaDevices.getUserMedia(constraints)
      .then((stream) => {
        this.mapStream.set(this.localId, stream)
      })
      .catch(errorHandler)
      .then(() => {
        var socket = new SockJS(`http://localhost:8080/ws`);
          this.stompClient = Stomp.over(socket);
         this.stompClient.connect({}, () => {
            this.stompClient.subscribe(
              "/topic/room",
              // "/topic/video-call/conversation/" + this.conversationId,
              (payload: any) => {
                console.log(payload)
                const signalPayload: SignalPayload = JSON.parse(payload.body)
    
                if (signalPayload.localUuid === this.localId
                  || (signalPayload.dest !== this.localId
                    && signalPayload.dest != this.conversationId)) {
                  return;
                }
    
                if (signalPayload.dest === this.conversationId) {
                  //@ts-ignore
                  this.setUpPeer(signalPayload.localUuid, signalPayload.displayName);
                  this.stompService.send(
                    "/app/signal",
                    // "/app/video-call/conversation/" + this.conversationId,
                    new SignalPayload(
                      this.localId,
                      this.localDisplay,
                      signalPayload.localUuid
                    )
                  )
                } else if (signalPayload.dest === this.localId) {
                  //@ts-ignore
                  this.setUpPeer(signalPayload.localUuid, signalPayload.displayName, true);
                } else if (signalPayload.sdp) {
                  this.peerConnections[signalPayload.localUuid].pc
                    .setRemoteDescription(signalPayload.sdp)
                    .then(() => {
                      if (signalPayload.sdp.type === 'offer') {
                        this.peerConnections[signalPayload.localUuid].pc
                          .createAnswer()
                          .then((description) => {
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
                  undefined,undefined
                ))
              )
         })
        // this.stompService.send(
        //   "/app/signal",
        //   // "/app/video-call/conversation/" + this.conversationId,
        //   new SignalPayload(
        //     this.localId,
        //     this.localDisplay,
        //     this.conversationId,
        //     undefined,undefined
        //   )
        // )
        // this.messageService.callVideo(JSON.stringify(
        //   new SignalPayload(
        //     this.localId,
        //     this.localDisplay,
        //     this.conversationId,
        //     undefined,undefined
        //   )
        // )).subscribe({
        //   next: () => {
        //     console.log("send message")
        //   }
        // })
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
      this.mapStream.set(peerId, event.streams[0])
    }

    this.localStream?.getVideoTracks().forEach(track => {
      this.peerConnections[peerId].pc.addTrack(track)
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
        this.stompService.send(
          "/app/signal",
          // "/app/video-call/room/" + this.conversationId,
          new SignalPayload(
            this.localId,
            undefined,
            peerId,
            undefined,
            event.candidate
          )
        )
      }
    }
    if (initCall) {
      this.peerConnections[peerId].pc.createOffer()
        .then((description) => {
          this.createdDescription(description, peerId)
        })
    }
  }

  private createdDescription(description: any, peerUuid: string) {
    console.log(`got description, peer ${peerUuid}`);
    this.peerConnections[peerUuid].pc.setLocalDescription(description).then(() => {
      this.stompService.send(
        "/app/signal",
        // "/app/video-call/conversation/" + this.conversationId,
        new SignalPayload(
          this.localId,
          undefined,
          peerUuid,
          this.peerConnections[peerUuid].pc.localDescription,
          undefined
        ))
    }).catch(errorHandler);
  }

  protected readonly Array = Array;
}

