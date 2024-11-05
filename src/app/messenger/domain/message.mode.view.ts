import {UserModelView} from "../../auth/domain/user.model.view";
import {ConversationModelView} from "./conversation.model.view";

export interface MessageModeView{
  id: number
  createdDate: string
  fromUser: UserModelView
  content: string
  detachImages: Array<string>
  messageType: string
  toConversation: ConversationModelView

}
