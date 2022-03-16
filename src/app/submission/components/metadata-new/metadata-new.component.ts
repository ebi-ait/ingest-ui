import {Component, Input, OnInit} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {MetadataDetailsDialogComponent} from '../metadata-details-dialog/metadata-details-dialog.component';
import {BrokerService} from '@shared/services/broker.service';
import {LoaderService} from '@shared/services/loader.service';
import {SchemaService} from '@shared/services/schema.service';
import {Observable} from 'rxjs';

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
  @Input() submissionId: string;
  concreteTypes: ConcreteType[] = [];
  selected: string;
  label: string

  ngOnInit(): void {
    this.domainEntity = this.domainEntity.toLowerCase();
    this.label = `Add new ${this.domainEntity.charAt(0).toUpperCase()}${this.domainEntity.slice(1)}`;
    this.brokerService.getConcreteTypes(this.domainEntity).subscribe(concreteTypes => {
      Object.entries(concreteTypes).forEach(([key, value]) => {
        this.concreteTypes.push({
          name: key,
          schemaUrl: value as string
        });
      });
    });

  }

  constructor(
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
        //ToDo: Change MetadataDetailsDialogComponent to allow blank input (config.data that does not contain metadata)
        //ToDo: Specify POST action and post URL to onSave MetadataDetailsDialogComponent (Allowing us to post to SubmissionEnvelope)
        //ToDo: After successful POST link new metadata to project
        this.dialog.open(MetadataDetailsDialogComponent, {
          data: {schema: schema},
          width: '60%',
          disableClose: true
        });
      });
  }

  //ToDo: Unit Tests
}
