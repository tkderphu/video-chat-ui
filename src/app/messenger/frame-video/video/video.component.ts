import {Component, Input} from '@angular/core';
import { Pair } from '../../domain/peer.info';

@Component({
  selector: 'app-video',
  templateUrl: './video.component.html',
  styleUrls: ['./video.component.css']
})
export class VideoComponent  {
  
  @Input()
  pair?: Pair

}
