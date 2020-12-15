import {AfterContentInit, Component, EventEmitter, Output} from '@angular/core';
import {ContentChildren, QueryList} from '@angular/core';
import {VfTabComponent} from '../vf-tab/vf-tab.component';

@Component({
  selector: 'app-vf-tabs',
  templateUrl: './vf-tabs.component.html',
  styleUrls: ['./vf-tabs.component.css']
})
export class VfTabsComponent implements AfterContentInit {
  @ContentChildren(VfTabComponent) tabs: QueryList<VfTabComponent>;
  @Output() selectedIndexChange = new EventEmitter();

  constructor() {
  }

  ngAfterContentInit(): void {
    setTimeout(() => {
      // Slight hack to get change detection working.
      // Since the contents of <app-vf-tabs> may (and is) created dynamically with an ngFor, the content changes after it has been checked
      // This will put the selectTab into the macrotask queue and cause it to be executed after main thread (Angular) complete
      this.selectTab(this.tabs.first);
    }, 0);
  }

  selectTab(tab: VfTabComponent): void {
    this.tabs.toArray().forEach(toDeactivate => toDeactivate.active = false);
    if (tab) {
      tab.active = true;
    }
    this.selectedIndexChange.emit(this.tabs.toArray().indexOf(tab));
  }

}
