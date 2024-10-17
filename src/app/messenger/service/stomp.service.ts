import {Injectable, OnInit} from '@angular/core';
import * as Stomp from 'stompjs';
import * as SockJS from 'sockjs-client';
import {Utils} from "../../common/utils";
import {environment} from "../../../environments/environment.development";

export class StompService {

  private topicQueue: Map<string, number> = new Map<string, number>
  private stompClient = Stomp.over(new SockJS(environment.WEB_SOCKET));


  constructor() {
    this.stompClient.connect({}, (frame: any) => {
      console.log("todo something: ", frame)
    })
  }


  send(url: string, data: any) : void {
    this.stompClient.send(
      url,
      {},
      JSON.stringify(data)
    )
  }

  
  public getStompClient() : any {
    return this.stompClient
  }
  

  subscribe(topic: string, callback: any): void {
    if(this.topicQueue.has(topic)) {
      return;
    } else {
      this.topicQueue.set(topic, 1);
    }
    this.stompClient.subscribe(topic, (response: any) => {
      console.log("message: ", response)
      callback(response);
    });
  }


  private getAuthHeader = () => {
    const token = Utils.getPayload().uuid;
    return (token && token.length)
      ? {'Authorization': `UUID ${token}`}
      : {}
  }
}
