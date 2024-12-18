import { Component } from '@angular/core';
import {LoginRequest} from "../domain/login.request";
import {UserService} from "../service/user.service";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {

  loginRequest: LoginRequest = new LoginRequest()
  messageNotification ?: string = ''
  constructor(private authService: UserService) {
  }

  loginAccount() {
    this.authService.loginAccount(this.loginRequest)
      .subscribe({
        next: response => {
            if(response.status === 200) {
              console.log(response.data)
              window.localStorage.setItem('tk', JSON.stringify(response.data))
              window.location.href = '/messenger'
            } else {
              alert(response.message  )
            }
        },
        error: response => {
          alert(response.message)
          console.log(response)
        }
      })
  }
}
