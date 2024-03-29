import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {ActivatedRoute} from '@angular/router';

import {ErrorComponent} from './error.component';

describe('ErrorComponent', () => {
  let component: ErrorComponent;
  let fixture: ComponentFixture<ErrorComponent>;

  beforeEach(async(() => {
    const queryParamMap = jasmine.createSpyObj(['get']);
    TestBed.configureTestingModule({
      declarations: [ ErrorComponent ],
      providers: [{
        provide: ActivatedRoute,
        useValue: {
          snapshot: {
            queryParamMap: queryParamMap
          }
        }
      }]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ErrorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
