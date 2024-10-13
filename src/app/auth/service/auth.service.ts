import {HttpClient} from "@angular/common/http";
import {Injectable} from "@angular/core";
import {environment} from "../../../environments/environment";
import {LoginRequest} from "../domain/login.request";
import {ApiResponse} from "../../common/api.response";
import {RegisterRequest} from "../domain/register.request";

@Injectable({
  providedIn: "root"
})
export class AuthService {

  private  URL: string = `${environment.REST_API}/auth`;

  constructor(private client: HttpClient) {
  }

  loginAccount(loginRequest?: LoginRequest) {
    return this.client.post<ApiResponse<any>>(
      `${this.URL}/login`,
      loginRequest
    )
  }

  registerAccount(registerRequest?: RegisterRequest) {
    return this.client.post<ApiResponse<any>>(
      `${this.URL}/register`,
      registerRequest
    )
  }
}
