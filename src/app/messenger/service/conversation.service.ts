import {HttpClient} from "@angular/common/http";
import {ConversationRequest} from "../domain/conversation.request";
import {ApiResponse} from "../../common/api.response";
import {Injectable} from "@angular/core";
import {ApiListResponse} from "../../common/api.list.response";
import {environment} from "../../../environments/environment.development";

@Injectable({
  providedIn: "root"
})
export class ConversationService {

  private URL: string = environment.REST_API + "/messenger/conversations"

  constructor(private client: HttpClient) {
  }

  createConversation(conversationRequest?: ConversationRequest) {
    return this.client.post<ApiResponse<any>>(
      this.URL,
      conversationRequest
    )
  }

  getAllConversationOfCurrentUser() {
    return this.client.get<ApiListResponse<any>>(
      this.URL
    )
  }

  checkWhetherConversationIsValidAndHaveContainCurrentUser() {
    return this.client.get<ApiResponse<any>>(
      this.URL
    )
  }
}
