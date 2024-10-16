import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {LoginComponent} from "./auth/login/login.component";
import {RegisterComponent} from "./auth/register/register.component";
import {ChatFrameComponent} from "./messenger/chat-frame/chat-frame.component";
import {FrameVideoComponent} from "./messenger/frame-video/frame-video.component";

const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'register',
    component: RegisterComponent
  },
  {
    path: 'messenger',
    component: ChatFrameComponent
  },
  {
    path: 'video-call',
    component: FrameVideoComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
