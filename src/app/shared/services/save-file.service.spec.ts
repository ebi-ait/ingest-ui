import { TestBed } from '@angular/core/testing';

import { SaveFileService } from './save-file.service';

describe('SaveFileService', () => {
  let service: SaveFileService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SaveFileService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
