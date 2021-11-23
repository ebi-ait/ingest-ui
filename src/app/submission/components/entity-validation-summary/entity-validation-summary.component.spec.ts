import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EntityValidationSummaryComponent } from './entity-validation-summary.component';

describe('EntityValidationSummaryComponent', () => {
  let component: EntityValidationSummaryComponent;
  let fixture: ComponentFixture<EntityValidationSummaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EntityValidationSummaryComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EntityValidationSummaryComponent);
    component = fixture.componentInstance;
    component.summaries = [];
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
