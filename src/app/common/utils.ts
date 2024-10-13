import {AuthResponse} from "../auth/domain/auth.response";

export class Utils {


  public static getPayload() {
    //@ts-ignore
    return this.tokenIsExpired() && JSON.parse(localStorage.getItem("tk"))
  }

  public static tokenIsExpired() {
    const tk = localStorage.getItem("tk")
    if (tk === null) return true
    const authResponse: AuthResponse = JSON.parse(tk);
    if(authResponse.expiredTime < Date.now()) {
      return true
    }
    return false
  }

}
