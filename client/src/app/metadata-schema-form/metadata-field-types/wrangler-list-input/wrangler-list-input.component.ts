import {Component, Input, OnInit} from '@angular/core';
import {BaseInputComponent} from '../base-input/base-input.component';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {IngestService} from '../../../shared/services/ingest.service';
import {AaiService} from '../../../aai/aai.service';
import {Metadata} from '../../models/metadata';
import {FormControl} from '@angular/forms';

@Component({
  selector: 'app-wrangler-list-input',
  templateUrl: './wrangler-list-input.component.html',
  styleUrls: ['./wrangler-list-input.component.css']
})
export class WranglerListInputComponent extends BaseInputComponent implements OnInit {
  @Input() metadata: Metadata;
  @Input() control: FormControl;
  @Input() id: string;

  options: string[];
  defaultOption: string;

  constructor(private ingestService: IngestService, private aaiService: AaiService) {
    super();
    super.metadata = this.metadata;
    super.control = this.control;
    super.id = this.id;
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
      subscribe(name => {
        this.defaultOption = name;
        if (!this.control.value) {
          this.control.setValue(name);
        }
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


