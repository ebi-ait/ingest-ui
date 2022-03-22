import {Component, Input, OnInit} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {IngestService} from '@shared/services/ingest.service';
import {BrokerService} from '@shared/services/broker.service';
import {LoaderService} from '@shared/services/loader.service';
import {SchemaService} from '@shared/services/schema.service';
import {MetadataDetailsDialogComponent} from '@submission/components/metadata-details-dialog/metadata-details-dialog.component';
import {map, switchMap} from 'rxjs/operators';

interface ConcreteType {
  name: string;
  schemaUrl: string;
}

@Component({
  selector: 'app-metadata-new',
  templateUrl: './metadata-new.component.html',
  styleUrls: ['./metadata-new.component.scss']
})

export class MetadataCreationComponent implements OnInit {
  @Input() domainEntity: string; //biomaterial/protocol/process
  @Input() projectId: string;
  @Input() postUrl: string;
  concreteTypes: ConcreteType[] = [];
  selected: string;
  label: string

  ngOnInit(): void {
    this.domainEntity = this.domainEntity.toLowerCase();
    this.label = `Add new ${this.domainEntity.charAt(0).toUpperCase()}${this.domainEntity.slice(1)}`;
    this.brokerService.getConcreteTypes(this.domainEntity).pipe(
      map(concreteTypes => Object.entries(concreteTypes)),
      map(concreteTypes => concreteTypes.map(([key, value]) => ({
        name: key,
        schemaUrl: value as string
      })))
    ).subscribe(concreteTypes => {
      this.concreteTypes = concreteTypes
    });
  }

  constructor(
    private ingestService: IngestService,
    private brokerService: BrokerService,
    private schemaService: SchemaService,
    private loaderService: LoaderService,
    public dialog: MatDialog
  ) {

  }

  clickNew() {
    if (this.concreteTypes.length === 1) {
      this.chooseType(this.concreteTypes[0].schemaUrl)
    }
  }

  chooseType(schemaUrl: string) {
    this.loaderService.display(true);
    this.schemaService.getDereferencedSchema(schemaUrl)
      .subscribe(schema => {
        this.selected = undefined;
        this.loaderService.display(false);
        this.dialog.open(MetadataDetailsDialogComponent, {
          data: {schema: schema, postUrl: this.postUrl, projectId: this.projectId},
          width: '60%',
          disableClose: true
        });
      });
  }
}
