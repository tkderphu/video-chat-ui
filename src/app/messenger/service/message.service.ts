import {HttpClient} from "@angular/common/http";
import {MessageRequest} from "../domain/message.request";
import {ApiResponse} from "../../common/api.response";
import {environment} from "../../../environments/environment";
import {Injectable} from "@angular/core";

@Injectable({
  providedIn: "root"
})
export class MessageService {
  private URL: string = `${environment.REST_API}/messenger/messages`
  constructor(private client: HttpClient) {
  }

  createMessage(messageRequest?: MessageRequest) {
    return this.client.post<ApiResponse<any>>(
      this.URL,
      messageRequest
    )
  }
  getMessageGalleries() {
    return this.client.get<ApiResponse<any>>(
      this.URL + '/galleries'
    )
  }

  getAllMessageOfConversation(conversationId?: number) {
    return this.client.get<ApiResponse<any>>(
      this.URL + '/conversations/' + conversationId
    )
  }
}
