import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {LoginComponent} from './auth/login/login.component';
import {RegisterComponent} from './auth/register/register.component';
import {HttpClientModule} from "@angular/common/http";
import {FormsModule} from "@angular/forms";
import {UserService} from "./auth/service/user.service";
import {MessageService} from "./messenger/service/message.service";
import {ChatFrameComponent} from './messenger/chat-frame/chat-frame.component';
import {FormConversationComponent} from './messenger/conversation/form-conversation/form-conversation.component';
import {ConversationService} from "./messenger/service/conversation.service";
import {StompService} from "./messenger/service/stomp.service";
import { FrameVideoComponent } from './messenger/frame-video/frame-video.component';
import { VideoComponent } from './messenger/frame-video/video/video.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RegisterComponent,
    ChatFrameComponent,
    FormConversationComponent,
    FrameVideoComponent,
    VideoComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule
  ],
  providers: [
    UserService,
    MessageService,
    ConversationService
    ],
  bootstrap: [AppComponent]
})
export class AppModule { }
