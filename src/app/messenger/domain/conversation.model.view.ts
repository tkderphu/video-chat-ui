import {MessageModeView} from "./message.mode.view";

export interface ConversationModelView {
  id: number
  displayName: string
  imageRepresent: string
  status: boolean
  recentMessage: MessageModeView
}
