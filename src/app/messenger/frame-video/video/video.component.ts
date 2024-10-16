import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-video',
  templateUrl: './video.component.html',
  styleUrls: ['./video.component.css']
})
export class VideoComponent  {
  @Input()
  mediaStream?: MediaStream
  isCameraOn: boolean = true
  isMicOn: boolean = true;
  @Input()
  displayName?: string

  changeCamera() {
    this.isCameraOn = !this.isCameraOn;
    if(this.isCameraOn) {

    } else {
      // this.mediaStream?.getVideoTracks().forEach((s) => {
      //   s.stop()
      // })
      this.mediaStream = undefined;
    }
  }
}
