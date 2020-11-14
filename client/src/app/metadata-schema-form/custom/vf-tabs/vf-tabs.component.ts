import {AfterContentInit, Component} from '@angular/core';
import { ContentChildren, QueryList } from '@angular/core';
import { VfTabComponent } from '../vf-tab/vf-tab.component';

@Component({
  selector: 'app-vf-tabs',
  templateUrl: './vf-tabs.component.html',
  styleUrls: ['./vf-tabs.component.css']
})
export class VfTabsComponent implements AfterContentInit {
  @ContentChildren(VfTabComponent) tabs: QueryList<VfTabComponent>;
  constructor() { }

  ngAfterContentInit(): void {
    this.selectTab(this.tabs.first);
  }

  selectTab(tab: VfTabComponent): void {
    this.tabs.toArray().forEach(toDeactivate => toDeactivate.active = false);
    tab.active = true;
  }

}
