import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GeoAccessionComponent } from './geo-accession.component';

describe('GeoAccessionComponent', () => {
  let component: GeoAccessionComponent;
  let fixture: ComponentFixture<GeoAccessionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GeoAccessionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GeoAccessionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
