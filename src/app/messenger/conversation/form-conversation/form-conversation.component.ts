import {Component, Input} from '@angular/core';
import {ConversationService} from "../../service/conversation.service";
import {ConversationRequest} from "../../domain/conversation.request";

@Component({
  selector: 'app-form-conversation',
  templateUrl: './form-conversation.component.html',
  styleUrls: ['./form-conversation.component.css']
})
export class FormConversationComponent {

    @Input()
    conversationService?: ConversationService;
    conversationRequest: ConversationRequest = new ConversationRequest();


}
