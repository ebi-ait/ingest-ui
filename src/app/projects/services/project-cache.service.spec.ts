import {TestBed} from '@angular/core/testing';
import {AaiService} from '@app/aai/aai.service';
import {Project} from '@shared/models/project';
import {of} from 'rxjs';
import {ProjectCacheService} from './project-cache.service';
import SpyObj = jasmine.SpyObj;

describe('ProjectCacheService', () => {
  let service: ProjectCacheService, aaiSvc: SpyObj<AaiService>;
  beforeEach(() => {
    aaiSvc = jasmine.createSpyObj('AaiService', ['getUser']);
    // Ignore TS complaints as we don't need to create a whole AAI user
    // @ts-ignore
    aaiSvc.getUser.and.returnValue(of({profile: {email: 'test@test.com'}}));

    TestBed.configureTestingModule({
      providers: [
        {provide: AaiService, useValue: aaiSvc},
        ProjectCacheService,
      ]
    });
    service = TestBed.inject(ProjectCacheService);
  });

  it('should save, get, and remove a project', async () => {
    const project: Project = {
      hasOpenSubmission: false,
      technology: ['test'],
      _links: {},
      content: {},
      submissionDate: '25-09-1995',
      updateDate: '28-07-2021',
      lastModifiedUser: 'Zaphod',
      type: 'project',
      uuid: {uuid: 'test123'},
      events: [],
      dcpVersion: '123',
      validationState: 'VALID',
      validationErrors: [],
      isUpdate: false
    };

    const key = await service.saveProject(project);
    expect(key).toEqual('test@test.com-project');
    const retrievedProject = await service.getProject();
    expect(retrievedProject).toEqual(project);
    await service.removeProject();
    expect(await service.getProject()).toBeNull();
  });

  it('should not fail if calling removeProject when no project exists', async () => {
    expect(await service.getProject()).toBeNull();
    expect(await service.removeProject()).toEqual('test@test.com-project');
    expect(await service.getProject()).toBeNull();
  });
});
