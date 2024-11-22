import {MessageModeView} from "./message.mode.view";
import {UserModelView} from "../../auth/domain/user.model.view";

export interface ConversationModelView {
  recentMessage?: MessageModeView
  id: number
  displayName: string
  imageRepresent: string
  status: boolean,
  scope: string
  members?: Array<UserModelView>
  owner?: boolean
}
