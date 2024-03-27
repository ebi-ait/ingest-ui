import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataUseRestrictionGroupComponent } from './data-use-restriction-group.component';

describe('DataUseRestrictionGroupComponent', () => {
  let component: DataUseRestrictionGroupComponent;
  let fixture: ComponentFixture<DataUseRestrictionGroupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DataUseRestrictionGroupComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DataUseRestrictionGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
