import {Component, EventEmitter, Input, Output} from '@angular/core';
import {ConversationService} from "../../service/conversation.service";
import {ConversationRequest} from "../../domain/conversation.request";
import {ConversationModelView} from "../../domain/conversation.model.view";

@Component({
  selector: 'app-form-conversation',
  templateUrl: './form-conversation.component.html',
  styleUrls: ['./form-conversation.component.css']
})
export class FormConversationComponent {

  @Input()
  conversationService?: ConversationService;
  @Input()
  conversationRequest: ConversationRequest = new ConversationRequest();
  @Output()
  emitter: EventEmitter<ConversationModelView> = new EventEmitter<ConversationModelView>()

  createConversation() {
    this.conversationService?.createConversation(this.conversationRequest)
      .subscribe({
        next: response => {
          if(response.status === 200) this.emitter.emit(response.data)
        }
      })
  }
}
