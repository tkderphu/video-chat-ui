import {MessageModeView} from "./message.mode.view";

export interface ConversationModelView {
  recentMessage?: MessageModeView
  id: number
  displayName: string
  imageRepresent: string
  status: boolean
}
