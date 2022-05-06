import {Component, OnInit} from '@angular/core';
import {AlertService} from "@shared/services/alert.service";
import { Converter } from 'showdown';
import {ActivatedRoute, Router} from '@angular/router';

const BASE_MARKDOWN_DIR = '/assets/guide-markdown/'

enum ROUTES {
  DataRequirements = 'data-requirements',
  StepByStep = 'step-by-step',
  AfterSubmission = 'after-submission'
}

const MARKDOWN_FILES_AND_ROUTES = {
  [ROUTES.DataRequirements]: [BASE_MARKDOWN_DIR + 'data-requirements.md', 'Data requirements'],
  [ROUTES.StepByStep]: [BASE_MARKDOWN_DIR + 'step-by-step.md', 'Step by step'],
  [ROUTES.AfterSubmission]: [BASE_MARKDOWN_DIR + 'after-submission.md', 'After submission']
}

@Component({
  selector: 'app-data-submission-guide',
  templateUrl: './data-submission-guide.component.html',
  styleUrls: ['./data-submission-guide.component.scss']
})
export class DataSubmissionGuideComponent implements OnInit {
  activeMarkdown: string[];
  activeHtmlContent: any;
  activeHeading: string;
  routes = Object.values(ROUTES);

  constructor( private route: ActivatedRoute, private router: Router, private alertsService: AlertService) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const route = params['page'];
      const default_markdown = MARKDOWN_FILES_AND_ROUTES[ROUTES.DataRequirements]

      this.activeMarkdown = route ?
        MARKDOWN_FILES_AND_ROUTES[route] || default_markdown : default_markdown;

      this.activeHeading = this.activeMarkdown[1];

      this.loadMarkdown().catch(err => {
        console.error(err);
        this.alertsService.error('Something went wrong loading the content', 'Please try refreshing the page.');
      })
    });
  }

  private async loadMarkdown() {
    const md = new Converter({
      'headerLevelStart': 2
    });
    const markdownFile = await fetch(this.activeMarkdown[0]).then(file => file.text());
    this.activeHtmlContent = md.makeHtml(markdownFile);
  }

  getRouteTitle(route: string) {
    return MARKDOWN_FILES_AND_ROUTES[route][1];
  }

}
