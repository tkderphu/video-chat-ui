// /app/ws/web-socket.service.ts
import { Injectable } from '@angular/core';
import { io } from 'socket.io-client';
import {environment} from "../../../environments/environment.development";

@Injectable({
  providedIn: 'root',
})
export class SocketService {
  private socket: any = undefined;

  constructor() {
    if (!this.socket) {
      this.socket = io(environment.WEB_SOCKET);
    }
  }

  public getSocket() {
    return this.socket;
  }
}
