import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {VfTabsComponent} from './vf-tabs.component';

describe('VfTabsComponent', () => {
  let component: VfTabsComponent;
  let fixture: ComponentFixture<VfTabsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VfTabsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VfTabsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
