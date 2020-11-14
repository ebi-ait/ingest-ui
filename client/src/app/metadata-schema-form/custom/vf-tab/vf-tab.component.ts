import {Component, Input} from '@angular/core';

@Component({
  selector: 'app-vf-tab',
  templateUrl: './vf-tab.component.html',
  styleUrls: ['./vf-tab.component.css']
})
export class VfTabComponent {
  @Input() title: string;
  @Input() active = false;
}
