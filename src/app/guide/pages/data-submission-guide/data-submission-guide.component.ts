import {Component, OnInit} from '@angular/core';
import {DomSanitizer} from "@angular/platform-browser";
import {AlertService} from "@shared/services/alert.service";
import {forkJoin, Observable, of, merge} from "rxjs";
import {map, switchMap} from "rxjs/operators";
import { Converter } from 'showdown';
import {ActivatedRoute, Router} from '@angular/router';

const BASE_MARKDOWN_DIR = '/assets/guide-markdown/'

enum ROUTES {
  DataRequirements = 'data-requirements',
  StepByStep = 'step-by-step',
  AfterSubmission = 'after-submission'
}

const MARKDOWN_FILES_AND_ROUTES = {
  [ROUTES.DataRequirements]: { markdownFile: BASE_MARKDOWN_DIR + 'data-requirements.md', title: 'Data requirements' },
  [ROUTES.StepByStep]: { markdownFile: BASE_MARKDOWN_DIR + 'step-by-step.md', title: 'Step by step' },
  [ROUTES.AfterSubmission]: { markdownFile: BASE_MARKDOWN_DIR + 'after-submission.md', title: 'After submission' }
}

@Component({
  selector: 'app-data-submission-guide',
  templateUrl: './data-submission-guide.component.html',
  styleUrls: ['./data-submission-guide.component.scss']
})
export class DataSubmissionGuideComponent implements OnInit {
  activeMarkdown: { markdownFile: string, title: string };
  activeHtmlContent: any;
  activeHeading: string;
  activeDynamicToc: {title: string, id: string}[];
  routes = Object.values(ROUTES);

  constructor( private route: ActivatedRoute, private router: Router, private alertsService: AlertService, private sanitized: DomSanitizer) { }

  ngOnInit(): void {
    this.route.params.pipe(
      switchMap(params =>
        this.route.fragment.pipe(map( fragment  => ({ params, fragment }))))
    )
      .subscribe(({params, fragment}) => {
        const route = params['page'];
        const default_markdown = MARKDOWN_FILES_AND_ROUTES[ROUTES.DataRequirements]

        this.activeMarkdown = route ?
          MARKDOWN_FILES_AND_ROUTES[route] || default_markdown : default_markdown;

        this.activeHeading = this.activeMarkdown.title;

        this.loadMarkdown()
          .then(() => this.generateToc())
          .catch(err => {
            console.error(err);
            this.alertsService.error('Something went wrong loading the content', 'Please try refreshing the page.');
          })
          .then(() => {
            if(fragment) {
              requestAnimationFrame(() => {
                // Use set requestAnimationFrame to execute this after the next paint
                document.getElementById(fragment).scrollIntoView();
              })
            }
          })
    });
  }

  private async loadMarkdown(): Promise<void> {
    const md = new Converter({
      'headerLevelStart': 2,
      'noHeaderId': false,
    });
    const markdownFile = await fetch(this.activeMarkdown.markdownFile).then(file => file.text());
    this.activeHtmlContent = this.sanitized.bypassSecurityTrustHtml(md.makeHtml(markdownFile));
  }

  getRouteTitle(route: string): string {
    return MARKDOWN_FILES_AND_ROUTES[route].title;
  }

  isActiveRoute(route: string): boolean {
    return this.activeMarkdown.title === MARKDOWN_FILES_AND_ROUTES[route].title;
  }

  generateToc(): void {
    const doc = document.createElement('html');
    doc.innerHTML = `<html><body>${this.activeHtmlContent}</body></html>`

    const headings = []

    doc.querySelectorAll('h2').forEach(heading => {
      headings.push({
        title: heading.innerText,
        id: heading.getAttribute('id')
      })
    });

    this.activeDynamicToc = headings;
  }

}
