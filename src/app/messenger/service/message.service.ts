import {HttpClient, HttpHeaders} from "@angular/common/http";
import {MessageRequest} from "../domain/message.request";
import {ApiResponse} from "../../common/api.response";
import {Injectable} from "@angular/core";
import {environment} from "../../../environments/environment.development";
import { ApiListResponse } from "src/app/common/api.list.response";
import { Header } from "src/app/common/header";
import { Utils } from "src/app/common/utils";

@Injectable({
  providedIn: "root"
})
export class MessageService {
  private URL: string =  environment.REST_API + "/messenger/messages"
  constructor(private client: HttpClient) {
  }

  createMessage(request: MessageRequest) {
    return this.client.post<ApiResponse<any>>(
      this.URL,
      request,
      {headers: Header.header()}
    )
  }

  getAllMessageOfConversation(conversationId?: number) {
    return this.client.get<ApiListResponse<any>>(
      this.URL + '/conversations/' + conversationId,
      {headers: Header.header()}
    )
  }
  callVideo(payload: string) {
    return this.client.post<ApiResponse<any>>(
      environment.REST_API + "/messenger/signal",
      payload
    )
  }
}
