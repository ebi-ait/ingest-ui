import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {MetadataDocument} from '@shared/models/metadata-document';
import {AlertService} from '@shared/services/alert.service';
import {BrokerService} from '@shared/services/broker.service';
import {IngestService} from '@shared/services/ingest.service';
import {LoaderService} from '@shared/services/loader.service';
import {SchemaService} from '@shared/services/schema.service';
import {MetadataDetailsDialogComponent} from '@submission/components/metadata-details-dialog/metadata-details-dialog.component';
import {map, tap} from 'rxjs/operators';

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
  @Input() domainEntity: string;
  @Input() projectId: string;
  @Input() postUrl: string;
  @Output() metadataAdded = new EventEmitter<MetadataDocument>();

  concreteTypes: ConcreteType[] = [];
  selected: string;
  label: string;

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
    private alertService: AlertService,
    public dialog: MatDialog
  ) {

  }

  chooseType(schemaUrl: string) {
    this.loaderService.display(true);
    this.schemaService.getDereferencedSchema(schemaUrl)
      .subscribe(schema => {
        this.selected = undefined;
        this.loaderService.display(false);
        this.dialog.open(MetadataDetailsDialogComponent, {
          data: {schema: schema},
          width: '60%',
          disableClose: true
        }).componentInstance.metadataSaved.subscribe(newMetadata => this.saveNewMetadata(newMetadata));
      });
  }

  private saveNewMetadata(newMetadata: any) {
    const post = {'content': newMetadata};
    this.ingestService.post<MetadataDocument>(this.postUrl, post).pipe(
      tap(newDocument => this.ingestService.linkProjectToMetadata<Object>(newDocument._links.self.href, this.projectId))
    ).subscribe(newDocument => {
      this.alertService.clear();
      this.alertService.success('Success', `New ${this.domainEntity} has been created.`);
      this.metadataAdded.emit(newDocument);
    }, err => {
      console.error(err);
      this.alertService.clear();
      this.alertService.error('Error', `New ${this.domainEntity} has not been created due to ${err.toString()}`);
    });
  }
}
