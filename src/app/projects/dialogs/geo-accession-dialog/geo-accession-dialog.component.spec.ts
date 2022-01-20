import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GeoAccessionDialogComponent } from './geo-accession-dialog.component';

describe('GeoAccessionDialogComponent', () => {
  let component: GeoAccessionDialogComponent;
  let fixture: ComponentFixture<GeoAccessionDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GeoAccessionDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GeoAccessionDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
