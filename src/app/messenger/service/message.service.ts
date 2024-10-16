import {HttpClient} from "@angular/common/http";
import {MessageRequest} from "../domain/message.request";
import {ApiResponse} from "../../common/api.response";
import {Injectable} from "@angular/core";
import {environment} from "../../../environments/environment.development";

@Injectable({
  providedIn: "root"
})
export class MessageService {
  private URL: string =  environment.REST_API + "/messenger/messages"
  constructor(private client: HttpClient) {
  }

  createMessage(formData: FormData) {
    return this.client.post<ApiResponse<any>>(
      this.URL,
      formData
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
  callVideo(payload: string) {
    return this.client.post<ApiResponse<any>>(
      environment.REST_API + "/messenger/signal",
      payload
    )
  }
}
