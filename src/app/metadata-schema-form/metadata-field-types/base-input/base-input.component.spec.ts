import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {JsonSchemaProperty} from '../../models/json-schema-property';
import {Metadata} from '../../models/metadata';

import {BaseInputComponent} from './base-input.component';
import {JsonSchema} from '../../models/json-schema';

describe('BaseInputComponent', () => {
  let component: BaseInputComponent;
  let fixture: ComponentFixture<BaseInputComponent>;
  let metadata: Metadata;
  let schema: JsonSchemaProperty;

  beforeEach(async(() => {
    schema = {
      $id: '',
      $schema: '',
      description: 'Name of individual who has contributed to the project.',
      type: 'string',
      example: 'John,D,Doe; Jane,,Smith',
      guidelines: 'Enter in the format: first name,middle name or initial,last name.',
      user_friendly: 'Contact name',
      name: '',
      properties: []
    };

    TestBed.configureTestingModule({
      declarations: [ BaseInputComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    metadata = new Metadata({
      schema: schema as JsonSchemaProperty,
      key: 'contact',
      isRequired: false
    });
    fixture = TestBed.createComponent(BaseInputComponent);
    component = fixture.componentInstance;
    component.metadata = metadata;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialise attributes based on its property', () => {
    expect(component.isRequired).toEqual(false);
    expect(component.disabled).toEqual(false);
    expect(component.placeholder).toEqual('John,D,Doe; Jane,,Smith');
    expect(component.label).toEqual('Contact name');

  });

  it('should initialise helper text from description and guidelines from schema by default', () => {
    expect(component.helperText).toEqual('Name of individual who has contributed to the project.<br/><br/>Enter in the format: first name,middle name or initial,last name.');
  });

  it('should initialise helper text from description if there are no guidelines', () => {
    delete schema['guidelines'];
    component.ngOnInit();
    expect(component.helperText).toEqual('Name of individual who has contributed to the project.');
  });

  it('should initialise helper text from guidelines if there is no description', () => {
    delete schema['description'];
    component.ngOnInit();
    expect(component.helperText).toEqual('Enter in the format: first name,middle name or initial,last name.');
  });

  it('should initialise helper text from custom metadata object guideline', () => {
    component.metadata = new Metadata({
      schema: schema as JsonSchemaProperty,
      key: 'contact',
      isRequired: false,
      guidelines: 'Custom helper text'
    });
    component.ngOnInit();
    expect(component.helperText).toEqual('Custom helper text');
  });
});
