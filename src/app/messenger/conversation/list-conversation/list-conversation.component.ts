import {Component, OnInit} from '@angular/core';
import {Utils} from "../../../common/utils";
import {ConversationModelView} from "../../domain/conversation.model.view";
import {ConversationService} from "../../service/conversation.service";

@Component({
  selector: 'app-list-conversation',
  templateUrl: './list-conversation.component.html',
  styleUrls: ['./list-conversation.component.css']
})
export class ListConversationComponent implements OnInit {

  protected readonly Utils = Utils;

  conversations?: Array<ConversationModelView> = new Array<ConversationModelView>();

  constructor(private conversationService: ConversationService) {
  }

  ngOnInit(): void {
    this.conversationService.getAllConversationOfCurrentUser()
      .subscribe({
        next: (response) => {
          if (response.status === 200) {
            this.conversations = response.data
          } else {
            alert(response.message)
          }
        }
      })
  }


  getAllMessageOfConversation(conversation: ConversationModelView) {

  }
}
