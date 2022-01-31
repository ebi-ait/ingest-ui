import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpreadsheetTabDetailsComponent } from './spreadsheet-tab-details.component';

describe('SpreadsheetTabDetailsComponent', () => {
  let component: SpreadsheetTabDetailsComponent;
  let fixture: ComponentFixture<SpreadsheetTabDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SpreadsheetTabDetailsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SpreadsheetTabDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
