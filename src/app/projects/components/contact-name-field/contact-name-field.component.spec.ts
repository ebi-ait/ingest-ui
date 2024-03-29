import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {FormControl} from '@angular/forms';

import {ContactNameFieldComponent} from './contact-name-field.component';

describe('ContactNameFieldComponent', () => {
  let component: ContactNameFieldComponent;
  let fixture: ComponentFixture<ContactNameFieldComponent>;
  let control: FormControl;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ContactNameFieldComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    control = new FormControl();
    control.setValue('first,,last');
    fixture = TestBed.createComponent(ContactNameFieldComponent);
    component = fixture.componentInstance;
    component.control = control;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
