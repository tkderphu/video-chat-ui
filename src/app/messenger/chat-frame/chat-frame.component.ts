import { Component, OnInit } from '@angular/core';
import { Utils } from "../../common/utils";
import { UserModelView } from "../../auth/domain/user.model.view";
import { ConversationModelView } from "../domain/conversation.model.view";
import { MessageModeView } from "../domain/message.mode.view";
import { MessageRequest } from "../domain/message.request";
import { UserService } from "../../auth/service/user.service";
import { MessageService } from "../service/message.service";
import { ConversationService } from "../service/conversation.service";
import * as Stomp from 'stompjs';
import * as SockJS from 'sockjs-client';
import { environment } from 'src/environments/environment.development';
@Component({
  selector: 'app-chat-frame',
  templateUrl: './chat-frame.component.html',
  styleUrls: ['./chat-frame.component.css']
})
export class ChatFrameComponent implements OnInit {

  protected readonly Utils = Utils;
  listConversationOfUser?: Array<ConversationModelView>;
  users?: Array<UserModelView>;
  currentConversation?: ConversationModelView
  messages: Array<MessageModeView> = new Array<MessageModeView>();
  messageContent: string = ''
  stompClient: any;

  constructor(private userService: UserService,
    protected messageService: MessageService,
    protected conversationService: ConversationService) {
  }

  ngOnInit(): void {
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
            this.stompClient = Stomp.over(new SockJS(environment.WEB_SOCKET));
            this.stompClient.connect({}, (frame: any) => {
              console.log("todo something: ", frame)
              //subscribe received when have a public conversation is created
              this.stompClient.subscribe(
                "/topic/private/conversation/user/" + Utils.getPayload().id,
                (payload: any) => {
                  const conversation : ConversationModelView = JSON.parse(payload.body)
                  this.listConversationOfUser?.unshift(conversation)
                }
              )
              //subscribe received message
              this.stompClient.subscribe(
                "/topic/private/messages/conversation/user/" + Utils.getPayload().id,
                (payload: any) => {
                  const message: MessageModeView = JSON.parse(payload.body);
                  console.log("received message: ", message)
                  if (message.fromUser.id === Utils.getPayload().id) {
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

                  if(conversationInList) {
                    conversationInList.recentMessage = message;
                    if(this.currentConversation && this.currentConversation.id === conversationInList.id) {
                      this.currentConversation = conversationInList;
                    }
                    this.listConversationOfUser.unshift(conversationInList)
                  } else {
                    if(message.toConversation.scope === 'PRIVATE') {
                      if(message.fromUser.id === Utils.getPayload().id) {
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
            })
          } else {
            alert(response.message)
          }
        },
        error: (err) => console.error(err)
      })
  }

  chatSpecificUser(user: UserModelView) {

  }

  navigateVideo() {

  }

  joinVideoCall(message: MessageModeView) {
    window.open(`/video-call?id=${message.id}`)
  }

  sendMessage(video: boolean = false) {
    const file = document.getElementById("file")
    const request: MessageRequest = {
      destId: this.currentConversation?.id,
      video: video,
      content: video ? "--->Vừa gọi video-call<---" : this.messageContent
    }

    const formData = new FormData()
    formData.set("messageRequest", JSON.stringify(request))

    this.messageService.createMessage(formData)
      .subscribe({
        next: res => {
          if (res.status === 200) {
            const message: MessageModeView = res.data;
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
    this.messageService?.getAllMessageOfConversation(conversation.id)
      .subscribe({
        next: response => {
          if (response.status === 200) {
            //@ts-ignore
            this.messages = response.data
          }
        }
      })
  }

  addConversation(response: ConversationModelView) {
    this.listConversationOfUser?.unshift(response)
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



}
