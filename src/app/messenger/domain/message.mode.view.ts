import {UserModelView} from "../../auth/domain/user.model.view";

export interface MessageModeView {
  id: number
  createdDate: string
  fromUser: UserModelView
  content: string
  detachImages: Array<string>
}
