import {
  AfterContentInit,
  Component,
  ContentChildren,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  QueryList,
  SimpleChanges
} from '@angular/core';
import {VfTabComponent} from '../vf-tab/vf-tab.component';

@Component({
  selector: 'app-vf-tabs',
  templateUrl: './vf-tabs.component.html',
  styleUrls: ['./vf-tabs.component.css']
})
export class VfTabsComponent implements AfterContentInit, OnChanges {
  @ContentChildren(VfTabComponent) tabs: QueryList<VfTabComponent>;
  @Output() selectedIndexChange = new EventEmitter();
  @Input() selectedIndex = 0;

  constructor() {}

  ngAfterContentInit(): void {
    setTimeout(() => {
      // Slight hack to get change detection working.
      // Since the contents of <app-vf-tabs> may (and is) created dynamically with an ngFor, the content changes after it has been checked
      // This will put the selectTab into the macrotask queue and cause it to be executed after main thread (Angular) complete
      this.selectTab(this.tabs.find((item, index) => index === this.selectedIndex));
    }, 0);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (!changes.selectedIndex || !this.tabs) {
      return;
    }
    this.selectTab(this.tabs.find((item, index) => index === changes.selectedIndex.currentValue));
  }

  selectTab(tab: VfTabComponent): void {
    this.tabs.toArray().forEach(toDeactivate => toDeactivate.active = false);
    if (tab) {
      tab.active = true;
    }
    this.selectedIndexChange.emit(this.tabs.toArray().indexOf(tab));
  }
}
