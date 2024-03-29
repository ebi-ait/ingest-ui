import {ViewContainerRef} from '@angular/core';
import {MetadataFormItemDirective} from './metadata-form-item.directive';

describe('MetadataFieldDirective', () => {
  let containerSpy: jasmine.SpyObj<ViewContainerRef>;

  beforeEach(() => {
    containerSpy = jasmine.createSpyObj(['createComponent']) as jasmine.SpyObj<ViewContainerRef>;

    it('should create an instance', () => {
      const directive = new MetadataFormItemDirective(containerSpy);
      expect(directive).toBeTruthy();
    });
  });

});
