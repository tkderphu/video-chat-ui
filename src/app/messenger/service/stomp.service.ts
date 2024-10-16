import {Injectable} from '@angular/core';
import * as Stomp from 'stompjs';
import * as SockJS from 'sockjs-client';
import {Utils} from "../../common/utils";
import {environment} from "../../../environments/environment.development";

@Injectable({
  providedIn: 'root',
})
export class StompService {
  private connecting: boolean = false;
  private topicQueue: any[] = [];
   socket = new SockJS(environment.WEB_SOCKET);
   stompClient = Stomp.over(this.socket);


  send(url: string, data: any) : void {
    this.stompClient.send(
      url,
      {},
      JSON.stringify(data)
    )
  }

  subscribe(topic: string, callback: any): void {
    // If stomp client is currently connecting add the topic to the queue
    // if (this.connecting) {
    //   this.topicQueue.push({
    //     topic,
    //     callback
    //   });
    //   return;
    // }

    // const connected: boolean = this.stompClient.connected;
    // if (connected) {
    //   // Once we are connected set connecting flag to false
    //   this.connecting = false;
    //   this.subscribeToTopic(topic, callback);
    //   return;
    // }

    // // If stomp client is not connected connect and subscribe to topic
    // this.connecting = true;
    this.stompClient.connect({}, () => {
      this.subscribeToTopic(topic, callback);
      // Once we are connected loop the queue and subscribe to remaining topics from it
      // this.topicQueue.forEach((item: any) => {
      //   this.subscribeToTopic(item.topic, item.callback);
      // })

      // Once done empty the queue
      // this.topicQueue = [];
      console.log("connect socket")
    });
  }




  private subscribeToTopic(topic: string, callback: any): void {
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
