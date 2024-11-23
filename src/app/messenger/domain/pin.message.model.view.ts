import {MessageModeView} from "./message.mode.view";

export interface PinMessageModelView {
  id?: number,
  conversationId?: number
  createdDate?: any
  message?:MessageModeView
  owner?: string
}
