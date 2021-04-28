import {Component, OnInit} from '@angular/core';
import {BaseInputComponent} from '../base-input/base-input.component';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {IngestService} from '../../../shared/services/ingest.service';
import {AaiService} from '../../../aai/aai.service';

@Component({
  selector: 'app-wrangler-list-input',
  templateUrl: './wrangler-list-input.component.html',
  styleUrls: ['./wrangler-list-input.component.css']
})
export class WranglerListInputComponent extends BaseInputComponent implements OnInit {
  options: string[];
  defaultOption: string;

  constructor(private ingestService: IngestService, private aaiService: AaiService) {
    super();
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.populateWranglerList();
    this.setDefaultWrangler();
  }

  private populateWranglerList() {
    this.getWranglerNames().subscribe((wranglerList) => this.options = wranglerList);
  }

  private getWranglerNames(): Observable<string[]> {
    return this.ingestService.getWranglers().pipe(
      map(wranglers => wranglers?.map(wrangler => wrangler.name)));
  }

  private setDefaultWrangler() {
    this.aaiService.getUser().pipe(map(user => user?.profile?.name)).
    // subscribe(name => this.control.setValue(name));
      subscribe(name => {
        this.defaultOption = name;
        this.control.setValue(name);
      });

  }

  onValueChange(value: string) {
    this.control.markAllAsTouched();
    if (!value) {
      this.control.reset();
    } else {
      this.control.setValue(value);
    }
  }
}


