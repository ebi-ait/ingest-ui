import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-vf-asterisk',
  templateUrl: './vf-asterisk.component.html',
  styleUrls: ['./vf-asterisk.component.css']
})
export class VfAsteriskComponent {
  @Input()
  isRequired: boolean;

  constructor() { }

}
