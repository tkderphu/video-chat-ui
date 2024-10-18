import {Component, OnInit} from '@angular/core';
import {Utils} from "../../common/utils";
import {UserModelView} from "../../auth/domain/user.model.view";
import {ConversationModelView} from "../domain/conversation.model.view";
import {MessageModeView} from "../domain/message.mode.view";
import {MessageRequest} from "../domain/message.request";
import {UserService} from "../../auth/service/user.service";
import {MessageService} from "../service/message.service";
import {ConversationService} from "../service/conversation.service";
import {StompService} from '../service/stomp.service';

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
  messages?: Array<MessageModeView> = new Array<MessageModeView>();
  messageContent: string = ''
  stompClient: any = new StompService().getStompClient();

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
          this.listConversationOfUser?.forEach(conversation => {
            console.log(this.stompClient)
            this.stompClient.subscribe(
              "/topic/private/messages/conversation/" + conversation.id,
              ((payload: any) => {
                const message: MessageModeView = JSON.parse(payload.body);
                console.log("receive message: ", message)
                if (message.conversation.id === this.currentConversation?.id) {
                  this.messages?.push(message);
                }
                //@ts-ignore
                const listConversation: ConversationModelView[] = this.listConversationOfUser?.filter((value) => {
                  return value.id !== message.conversation.id;
                });
                this.listConversationOfUser = new Array<ConversationModelView>();
                if(!listConversation) {
                    this.listConversationOfUser.push(listConversation);
                }
                this.listConversationOfUser.unshift(message.conversation)
              })
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
    window.location.href=`/video-call?id=${message.id}`
  }

  sendMessage(video: boolean = false) {
    const file = document.getElementById("file")
    const request: MessageRequest = {
      destId: this.currentConversation?.id,
      video: video,
      content: this.messageContent
    }

    const formData = new FormData()
    formData.set("messageRequest", JSON.stringify(request))

    this.messageService.createMessage(formData)
      .subscribe({
        next: res => {
          if(res.status === 200) {
            const message: MessageModeView = res.data;
            this.messageContent = ''
            if(video) {
              this.joinVideoCall(message)
            }
          }
        },
        error: (err) => console.log(err)
      })

  }

  getAllMessageOfConversation(conversation: ConversationModelView) {
    this.currentConversation = conversation;
    this.messageService?.getAllMessageOfConversation(conversation.id)
      .subscribe({
        next: response => {
          if (response.status === 200) {
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
        if(response.status === 200) {
          this.currentConversation = response.data;
          this.messageService.getAllMessageOfConversation(this.currentConversation?.id)
          .subscribe({
            next: response => {
              if(response.status === 200) {
                this.messages = response.data;
              } else {
                alert("Xảy ra lỗi khi lấy message của conversation")
                alert(response.message)
              }
            },
            error: (err) => console.error(err) 
          })
        } else {
          alert("Xảy ra lỗi khi tìm conversation giữa 2 user")
          alert(response.message)
        }
      },
      error: (err) => console.error(err)
    })
  }


}
