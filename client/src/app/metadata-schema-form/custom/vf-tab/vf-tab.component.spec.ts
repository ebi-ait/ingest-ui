import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VfTabComponent } from './vf-tab.component';

describe('VfTabComponent', () => {
  let component: VfTabComponent;
  let fixture: ComponentFixture<VfTabComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VfTabComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VfTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
