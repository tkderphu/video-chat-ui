import { UserModelView } from "./user.model.view"

export interface AuthResponse {
  uuid: string
  expiredTime: number,
  info: UserModelView  
}
