import { TestBed } from '@angular/core/testing';

import { ImageCompressionServiceService } from './image-compression-service.service';

describe('ImageCompressionServiceService', () => {
  let service: ImageCompressionServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ImageCompressionServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
