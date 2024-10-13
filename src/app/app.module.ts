import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import {HttpClientModule} from "@angular/common/http";
import {FormsModule} from "@angular/forms";
import {AuthService} from "./auth/service/auth.service";
import {MessageService} from "./messenger/service/message.service";
import {ConversationRequest} from "./messenger/domain/conversation.request";
import { ChatFrameComponent } from './messenger/chat-frame/chat-frame.component';
import { ListConversationComponent } from './messenger/conversation/list-conversation/list-conversation.component';
import { FormConversationComponent } from './messenger/conversation/form-conversation/form-conversation.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RegisterComponent,
    ChatFrameComponent,
    ListConversationComponent,
    FormConversationComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule
  ],
  providers: [
    AuthService,
    MessageService,
    ConversationRequest
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
