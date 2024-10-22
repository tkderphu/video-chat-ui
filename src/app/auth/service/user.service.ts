import {HttpClient, HttpHeaders} from "@angular/common/http";
import {Injectable} from "@angular/core";
import {LoginRequest} from "../domain/login.request";
import {ApiResponse} from "../../common/api.response";
import {RegisterRequest} from "../domain/register.request";
import {ApiListResponse} from "../../common/api.list.response";
import {environment} from "../../../environments/environment.development";
import { Header } from "src/app/common/header";
import { Utils } from "src/app/common/utils";

@Injectable({
  providedIn: "root"
})
export class UserService {

  private  URL: string =environment.REST_API + "/users";

  constructor(private client: HttpClient) {
  }

  loginAccount(loginRequest?: LoginRequest) {
    return this.client.post<ApiResponse<any>>(
      `${this.URL}/auth/login`,
      loginRequest
    )
  }

  registerAccount(registerRequest?: RegisterRequest) {
    return this.client.post<ApiResponse<any>>(
      `${this.URL}/auth/register`,
      registerRequest
    )
  }

  getAllUser() {
    console.log("header: ", Header.header())
    return this.client.get<ApiListResponse<any>>(
      this.URL,
      {headers: Header.header()}
    )
  }

  uploadAvatar(formData: FormData) {
    return this.client.post<ApiResponse<any>>(
      this.URL + "/uploads/avatar",
      formData,
      {headers: new HttpHeaders().set("Authorization", "UUID " + Utils.getPayload().uuid)}
    )
  }

}
