// /app/ws/web-socket.service.ts
import { Injectable } from '@angular/core';
import { io } from 'socket.io-client';

@Injectable({
  providedIn: 'root',
})
export class SocketService {
  private socket: any = undefined;

  constructor() {
    if (!this.socket) {
      this.socket = io('http://localhost:8080/');
    }
  }

  public getSocket() {
    return this.socket;
  }
}
