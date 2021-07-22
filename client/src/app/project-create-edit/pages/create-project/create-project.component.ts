import { Component, OnInit } from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {AutofillProjectService} from '../../services/autofill-project.service';
import {ProjectCacheService} from '../../services/project-cache.service';
import {Identifier} from '../../models/europe-pmc-search';
import {Observable, of} from 'rxjs';
import { map } from 'rxjs/operators';
import {AutofillProject} from '../../models/autofill-project';
import {IngestService} from "../../../shared/services/ingest.service";

const EMPTY_PROJECT = {
  content: {},
  isInCatalogue: true,
};


@Component({
  selector: 'app-create-project',
  templateUrl: './create-project.component.html',
  styleUrls: ['./create-project.component.css']
})
export class CreateProjectComponent implements OnInit {

  project$: Observable<any>;
  userIsWrangler: boolean;

  constructor(private route: ActivatedRoute,
              private autofillProjectService: AutofillProjectService,
              private projectCacheService: ProjectCacheService,
              private ingestService: IngestService,
  ) { }

  ngOnInit(): void {
    const queryParams = this.route.snapshot.queryParamMap;

    if (queryParams.has(Identifier.DOI)) {
      this.project$ = this.autofillProjectDetails(Identifier.DOI, queryParams.get(Identifier.DOI));
    } else if (queryParams.has('restore')) {
      this.project$ = this.projectCacheService.getProject();
    } else {
      this.project$ = of(EMPTY_PROJECT);
    }

    this.ingestService.getUserAccount()
      .subscribe((account) => {
        this.userIsWrangler = account.isWrangler();
      });
  }

  private autofillProjectDetails(id, search): Observable<object> {
    return this.autofillProjectService.getProjectDetails(id, search)
      .pipe(
        map(
          (data: AutofillProject) => {
            const project_core = {};
            const publication = {};

            const projectFormData = {
              ...EMPTY_PROJECT
            };

            project_core['project_title'] = data.title;
            project_core['project_description'] = data.description;

            projectFormData['content']['project_core'] = project_core;

            publication['doi'] = data.doi;
            publication['pmid'] = data.pmid;
            publication['title'] = data.title;
            publication['authors'] = data.authors;
            publication['url'] = data.url;

            projectFormData['content']['publications'] = [publication];
            projectFormData['content']['funders'] = data.funders;
            projectFormData['content']['contributors'] = data.contributors.map(contributor => ({
              name: contributor.first_name + ',,' + contributor.last_name,
              institution: contributor.institution,
              orcid_id: contributor.orcid_id
            }));
            return projectFormData;
          }
        ));
  }

}
