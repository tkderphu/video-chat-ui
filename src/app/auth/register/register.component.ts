import { Component } from '@angular/core';
import {UserService} from "../service/user.service";
import {RegisterRequest} from "../domain/register.request";

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {

  registerRequest: RegisterRequest = new RegisterRequest()
  messageNotification?: string = ''
  constructor(private authService: UserService) {
  }

  registerAccount() {
    this.authService.registerAccount(this.registerRequest)
      .subscribe({
        next: response => {
          if(response.status === 200) {
            window.location.href = '/login'
          } else {
            this.messageNotification = response.message;
          }
        },
        error: response => {
          alert(response.message)
          console.log(response)
        }
      })
  }
}
