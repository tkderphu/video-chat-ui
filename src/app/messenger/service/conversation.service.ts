import {HttpClient} from "@angular/common/http";
import {ConversationRequest} from "../domain/conversation.request";
import {ApiResponse} from "../../common/api.response";
import {Injectable} from "@angular/core";
import {ApiListResponse} from "../../common/api.list.response";
import {environment} from "../../../environments/environment.development";
import { Header } from "src/app/common/header";

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
      conversationRequest,
      {headers: Header.header()}
    )
  }

  getAllConversationOfCurrentUser() {
    return this.client.get<ApiListResponse<any>>(
      this.URL,
      {headers: Header.header()}
    )
  }

  checkWhetherConversationIsValidAndHaveContainCurrentUser() {
    return this.client.get<ApiResponse<any>>(
      this.URL,
      {headers: Header.header()}
    )
  }

  findPrivateConversationWithUser(withUserId: number) {
    return this.client.get<ApiResponse<any>>(
      this.URL + "/users/" + withUserId,
      {headers: Header.header()}
    )
  }
}
