import {Component, OnInit} from '@angular/core';
import {Utils} from "../../common/utils";
import {UserModelView} from "../../auth/domain/user.model.view";
import {ConversationModelView} from "../domain/conversation.model.view";
import {MessageModeView} from "../domain/message.mode.view";
import {MessageRequest} from "../domain/message.request";
import {UserService} from "../../auth/service/user.service";
import {MessageService} from "../service/message.service";
import {ConversationService} from "../service/conversation.service";
import {AuthResponse} from 'src/app/auth/domain/auth.response';
import {SocketService} from "../service/socket.service";

@Component({
  selector: 'app-chat-frame',
  templateUrl: './chat-frame.component.html',
  styleUrls: ['./chat-frame.component.css']
})
export class ChatFrameComponent implements OnInit {
  socket: any;
  protected readonly Utils = Utils;
  listConversationOfUser?: Array<ConversationModelView>;
  users?: Array<UserModelView>;
  currentConversation?: ConversationModelView
  messages: Array<MessageModeView> = new Array<MessageModeView>();
  messageContent: string = ''
  stompClient: any;

  constructor(private userService: UserService,
    protected messageService: MessageService,
    protected conversationService: ConversationService,
              private socketService: SocketService) {
      this.socket = this.socketService.getSocket();


      if(Utils.tokenIsExpired()) {
        window.location.href = '/login'
      }
  }

  ngOnInit(): void {
    // this.socketService.connect();
    // this.socketService.getMessages().subscribe((data : any) => {
    //   console.log("message: ", data)
    // })
    // this.socketService.subscribe("response", (payload: any) => {
    //   console.log("data: ", payload.data);
    // })
    this.userService.getAllUser().subscribe({
      next: response => {
        if (response.status === 200) this.users = response.data;

      }
    })
    this.conversationService.getAllConversationOfCurrentUser()
      .subscribe({
        next: (response) => {
          if (response.status === 200) {
            this.listConversationOfUser = response.data
            console.log(this.listConversationOfUser)
            // this.stompClient = Stomp.over(new SockJS(environment.WEB_SOCKET));
            // this.stompClient.connect({}, (frame: any) => {
            //   console.log("todo something: ", frame)
              //subscribe received when have a public conversation is created
            console.log("log1")
              this.socket.on(
                "/topic/private/conversation/user/" + Utils.getPayload().info.id,
                (payload: any) => {
                  console.log("")
                  const conversation: ConversationModelView = payload;
                  this.listConversationOfUser?.unshift(conversation)
                }
              )
        console.log("log2")
              //subscribe received message
              this.socket.on(
                "/topic/private/messages/conversation/user/" + Utils.getPayload().info.id,
                (payload: any) => {
                  console.log("payload: ", payload)
                  const message: MessageModeView = payload;
                  // console.log("message received: ", message)
                  // console.log("received message: ", message)
                  if (message.fromUser.id === Utils.getPayload().info.id) {
                    //@ts-ignore
                    this.currentConversation.id = message.toConversation.id
                  }

                  if (message.toConversation.id === this.currentConversation?.id) {
                    this.messages?.push(message)
                  }

                  const conversationInList = this.listConversationOfUser?.find((conversation) => {
                    return conversation.id === message.toConversation.id
                  })

                  //@ts-ignore
                  const listConversation: ConversationModelView[] = this.listConversationOfUser?.filter((value) => {
                    return value.id !== message.toConversation.id;
                  });
                  this.listConversationOfUser = new Array<ConversationModelView>();

                  if (listConversation) {

                    //@ts-ignore
                    this.listConversationOfUser.push(...listConversation);

                  }

                  if (conversationInList) {
                    conversationInList.recentMessage = message;
                    if (this.currentConversation && this.currentConversation.id === conversationInList.id) {
                      this.currentConversation = conversationInList;
                    }
                    this.listConversationOfUser.unshift(conversationInList)
                  } else {
                    if (message.toConversation.scope === 'PRIVATE') {
                      if (message.fromUser.id === Utils.getPayload().info.id) {
                        //@ts-ignore
                        this.currentConversation.recentMessage = message;
                        //@ts-ignore
                        this.listConversationOfUser.unshift(this.currentConversation);
                      } else {
                        const conversation: ConversationModelView = message.toConversation;
                        conversation.displayName = message.fromUser.fullName;
                        conversation.recentMessage = message;
                        //@ts-ignore
                        conversation.imageRepresent = message.fromUser.avatar;
                        this.listConversationOfUser.unshift(conversation)
                      }
                    } else {
                      message.toConversation.recentMessage = message;
                      this.listConversationOfUser.unshift(message.toConversation)
                    }
                  }

                }
              )
            // })
          } else {
            alert(response.message)
          }
        },
        error: (err) => console.error(err)
      })

  }


  joinVideoCall(message: MessageModeView) {
    window.open(`/video-call?id=${message.id}&room=${message.toConversation.id}`)
  }

  sendMessage(video: boolean = false) {
    //@ts-ignore
    const file = document.getElementById("file").files
    const request: MessageRequest = {
      destId: this.currentConversation?.id,
      video: video,
      content: video ? "--->Vừa gọi video-call<---" : this.messageContent
    }

    // const formData = new FormData()
    // formData.set("messageRequest", JSON.stringify(request))
    // for(let i = 0; i < file.length; i++) {
    //   formData.append("files", file[i])
    // }

    //@ts-ignore
    document.getElementById("file").value=''

    this.messageService.createMessage(request)
      .subscribe({
        next: res => {
          if (res.status === 200) {
            const message: MessageModeView = res.data;
            console.log("data created: ", message)
            this.messageContent = ''
            if (video) {
              this.joinVideoCall(message)
            }
          }
        },
        error: (err) => console.log(err)
      })

  }

  getAllMessageOfConversation(conversation: ConversationModelView) {
    this.messages = new Array<MessageModeView>()
    this.currentConversation = conversation;
    console.log(this.currentConversation)
    this.messageService?.getAllMessageOfConversation(conversation.id)
      .subscribe({
        next: response => {
          if (response.status === 200) {
            //@ts-ignore
            this.messages = response.data
            console.log("list:",response.data)
          }
        }
      })
  }

  addConversation(response: ConversationModelView) {
    this.listConversationOfUser?.unshift(response)
  }


  getTime(createdDate?: string) {
    //@ts-ignore
    let date: Date = new Date(createdDate)
    let now: Date = new Date()

    let subtract = now.getTime() - date.getTime();
    let second:number = Number.parseInt((subtract / 1000) + "") ;
    let minute: number = Number.parseInt((second / 60) + "")
    let hour : number= Number.parseInt((minute / 60) + "")
    let day: number = Number.parseInt((hour / 24) +"");
    if (day == 1) {
      return `Hôm qua ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`
    } else if (day == 0) {
      let str = "";
      if (hour >= 1) {
        str += hour + "h"
      }
      if (minute - hour * 60 >= 1) {
        str += (minute - hour * 60) + "p"
      }
      str += (second - minute * 60) + 's';
      return str + ' trước';
    } else {
      return `${date.getDate()}/${date.getMonth() +1}/${date.getFullYear()}${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`
    }
  }



  /**
   * Find conversation between 2 users
   */
  findPrivateConversation(withUser: UserModelView) {
    this.conversationService.findPrivateConversationWithUser(withUser.id)
      .subscribe({
        next: response => {
          if (response.status === 200) {
            this.currentConversation = response.data;
            this.messageService.getAllMessageOfConversation(this.currentConversation?.id)
              .subscribe({
                next: response => {
                  if (response.status === 200) {
                    //@ts-ignore
                    this.messages = response.data;
                  } else {
                    alert("Xảy ra lỗi khi lấy message của conversation")
                    alert(response.message)
                  }
                },
                error: (err) => console.error(err)
              })
          } else {
            console.log("2 user chưa chat với nhau.....")
            this.messages = new Array<MessageModeView>()
            this.currentConversation = {
              displayName: withUser.fullName,
              id: withUser.id,
              status: false,
              recentMessage: undefined,
              imageRepresent: '',
              scope: 'PRIVATE'
            }
            // alert(response.message)
          }
        },
        error: (err) => console.error(err)
      })
  }

  uploadAvatar() {
    //@ts-ignore
    const files = document.getElementById("file-up-load-image").files;
    const formData = new FormData();
    formData.append("file", files[0])
    this.userService.uploadAvatar(formData).subscribe({
      next: (response) => {
        const payload: AuthResponse = Utils.getPayload();
        payload.info = response.data;
        window.localStorage.setItem("tk", JSON.stringify(payload))
        window.location.reload()
      }
    })
  }

  redirect_image(image: string) {
    window.open(image, "_blank");
  }

  testSocket() {
    this.socket.on("response", (data:any) => {
      console.log("emmiter: ", data)
    })
    this.socket.on("test", (data:any) => {
      console.log("data: ", data)
    })
    this.socket.on("/topic/private", (data:any) => {
      console.log("private: ", data)
    })
    this.socket.emit("/topic/private", {data: "dcm"})
    this.socket.emit("message", {data: "gg"})
    alert("ok")
  }
}
