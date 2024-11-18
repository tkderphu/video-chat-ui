import { Component, OnInit } from '@angular/core';
import { StompService } from "../service/stomp.service";
import { ConversationService } from "../service/conversation.service";
import { ActivatedRoute } from "@angular/router";
import { SignalPayload } from "../domain/signal.payload";
import { Pair, PeerInfo } from "../domain/peer.info";
import { MessageService } from '../service/message.service';
import {Utils} from "../../common/utils";
import { SocketService } from '../service/socket.service';
const ICE_SERVERS = {
  iceServers: [
    {
      urls: 'turn:viosmash.site:3478',
      username: 'test',
      credential: 'test'
    },
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
  // stompClient: any = new StompService().getStompClient()
  socket: any
  constructor(
    private conversationService: ConversationService,
    private activatedRoute: ActivatedRoute,
    private messageService: MessageService,
    private socketService: SocketService) {
      this.socket = this.socketService.getSocket()

    }

  ngOnInit(): void {
    this.conversationId = this.activatedRoute.snapshot.queryParams['room']
    if(!this.conversationId) {
      // alert("Can't find room")
      //@ts-ignore
      window.open('','_self').close()
    } else {
      this.conversationService.checkWetherCurrentUserInConversationOrNot(
        this.conversationId
      )
        .subscribe({
          next: response => {
            console.log("find: ", response)
            if(response.status !== 200) {
              alert(response.message)
              window.close()
            } else {
              if(response.data) {
                this.start_video_call();
              } else {
                alert("You can't access into room")
                window.history.back()
              }
            }
          },
          error: (error) => {
            window.history.back();
            console.log(error);
          }
        })
    }
  }


  private start_video_call() {
    if(!localStorage.getItem("peerId")) {
      localStorage.setItem("peerId", createUUID())
    }
    // @ts-ignore
    this.localId = localStorage.getItem("peerId")
    // this.localId = createUUID()
    this.localDisplay = Utils.getPayload().info.fullName
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
        this.socket.on(
          "/topic/room",
          (payload: any) => {
            /**
             * Tin hieu duoc gui tu server
             */
            const signalPayload: SignalPayload = JSON.parse(payload)

            /**
             * signalPayload.dest: phong room | user
             * Giai thich:
             * phong room: muon noi la co user da vo nhom va muon trao doi voi cac user khac
             * user: muon noi la cai user hien tai muon trao doi video voi cai user o tren
             *
             * peerId: xac dinh thang gui la thang nao
             * signalPayload.displayName: Xac dinh name cua thang gui
             */

            const peerId = signalPayload.localUuid
            /**
             * peerId == this.localId: chinh ban than user thi khong can phai trao doi thong tin
             * signalPayload.dest !== this.localId && signalPayload.dest != this.conversationId -> why?
             *  Vi du: p1 <-> p2 dang trao doi voi nhau, p3 vao phong thi luc nay
             *  p3 send server (3, 0) -> p1, p2 nhan tin tu server roi send (1, 3), (2, 3). (**)
             *  Ro rang tin hieu (1, 3) khong lien quan gi den p2(2) va tuong tu (2, 3) khong lien quan p1(1) -> khong can trao doi.
             *
             *  Va neu ban thac mac tai sao (**) p1, p2 nhan duoc p3 tai vi p3 send (3, 0). (0) la cuoc tro chuyen va
             *  p1(1), p2(2) deu nam trong cuoc tro chuyen thi duong nhien phai nhan duoc
             */

            if (peerId === this.localId || (signalPayload.dest !== this.localId && signalPayload.dest != this.conversationId)) {
              return;
            }
            /**
             * Xac dinh diem den la gi, neu la cuoc tro chuyen(khong phai user)
             * thi send signal toi server voi thong tin nhu sau: {
             *   'localPeer': this.localId -> user_hien_tai
             *   'dest': signalPayload.localUuid -> la cai thang ma muon trao doi video voi user hien tai
             * }
             */
            if (signalPayload.displayName && signalPayload.dest === this.conversationId) {
              //@ts-ignore
              this.setUpPeer(signalPayload.localUuid, signalPayload.displayName);
              this.socket.emit("/signal", JSON.stringify(new SignalPayload(this.localId, this.localDisplay, signalPayload.localUuid, undefined, undefined)))
            }
            /**
             * signalPayload.dest == this.localId -> gui dung den user
             */
            else if (signalPayload.displayName && signalPayload.dest === this.localId) {
              //@ts-ignore
              this.setUpPeer(signalPayload.localUuid, signalPayload.displayName, true);
            }
            /**
             * sdp(chua media type, ip, ..vv)
             * Co 2 loai sdp: offer, answer;
             * offer: duoc gui tu 1 user nao do -> sau khi tao gui den user
             * answer: chap nhan offer -> xac nhan offer va tao answer cho user do la ok, toi chap nhan
             *
             * Sau khi user do nhan duoc answer -> xac nhan answer -> ok
             */
            else if (signalPayload.sdp) {
              this.peerConnections[signalPayload.localUuid].pc.setRemoteDescription(new RTCSessionDescription(signalPayload.sdp)).then(() => {
                  if (signalPayload.sdp.type === 'offer') {
                    this.peerConnections[signalPayload.localUuid].pc.createAnswer().then((description: any) => {
                        this.createdDescription(description, signalPayload.localUuid)
                      }).catch(errorHandler)
                  }
                })
            }
            /**
             * ice: Tim duong di cho viec trao doi thong tin giua cac peer(user)
             * trong network
             * Trong qua trinh trao doi sdp thi ice cung o trong do luon.
             */
            else if (signalPayload.ice) {
              this.peerConnections[signalPayload.localUuid].pc.addIceCandidate(new RTCIceCandidate(signalPayload.ice)).catch(errorHandler)
            }
          }
        )
        /**
         * Gui tin nhan bao voi server la toi muon tham gia vao cai phong nay @conversationId
         */
        this.socket.emit("/signal", JSON.stringify(new SignalPayload(this.localId, this.localDisplay, this.conversationId, undefined, undefined)))
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
        this.socket.emit(
          "/signal",
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
      this.socket.emit(
        "/signal",
        JSON.stringify(new SignalPayload(
          this.localId,
          undefined,
          peerUuid,
          description,
          undefined,
        )))
    }).catch(errorHandler);
  }

  close() {
    window.close()
  }

  protected readonly Array = Array;
}

