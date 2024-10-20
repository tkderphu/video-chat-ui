import {Component, EventEmitter, Input, Output} from '@angular/core';
import {ConversationService} from "../../service/conversation.service";
import {ConversationRequest} from "../../domain/conversation.request";
import {ConversationModelView} from "../../domain/conversation.model.view";
import { UserModelView } from 'src/app/auth/domain/user.model.view';
declare var $ : any
@Component({
  selector: 'app-form-conversation',
  templateUrl: './form-conversation.component.html',
  styleUrls: ['./form-conversation.component.css']
})
export class FormConversationComponent {

  @Input()
  conversationService?: ConversationService;
  conversationRequest: ConversationRequest = new ConversationRequest();
  @Input()
  listUser?: Array<UserModelView> = new Array<UserModelView>()
  @Output()
  emitter: EventEmitter<ConversationModelView> = new EventEmitter<ConversationModelView>()

  createConversation() {
    //@ts-ignore
    var options = document.getElementById('select').selectedOptions;
    //@ts-ignore
    var values = Array.from(options).map(( value ) => value.value);
    //@ts-ignore
    console.log(values);

    this.conversationRequest.userIds.push(...values)
    this.conversationService?.createConversation(this.conversationRequest)
      .subscribe({
        next: response => {
          if(response.status === 200) {
            $('#exampleModal1').modal('hide')
          } else {
            alert(response.message)
          }
        },
        error: (err) => {
          alert("Có lỗi, hãy xem console")
          console.log(err)
        }
      })
  }
}
