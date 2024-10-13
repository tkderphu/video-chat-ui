import { Component } from '@angular/core';
import {Utils} from "../../common/utils";

@Component({
  selector: 'app-chat-frame',
  templateUrl: './chat-frame.component.html',
  styleUrls: ['./chat-frame.component.css']
})
export class ChatFrameComponent {

    protected readonly Utils = Utils;
}
