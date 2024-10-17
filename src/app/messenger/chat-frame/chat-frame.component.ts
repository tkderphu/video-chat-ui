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
  stompService: StompService = new StompService()

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
    this.conversationService?.getAllConversationOfCurrentUser().subscribe({
      next: (response) => {
        if (response.status === 200) {
          this.listConversationOfUser = response.data
          this.listConversationOfUser?.forEach(conversation => {
            this.stompService?.subscribe(
              "/topic/private/messages/conversation/" + conversation.id,
              ((payload: any) => {
                const message: MessageModeView = JSON.parse(payload).body;
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
      }
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

    const formData = new FormData();
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
        }
      })

  }

  getAllMessageOfConversation(conversation: ConversationModelView) {
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
}
