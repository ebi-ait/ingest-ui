import {Component, Input, OnInit} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {MetadataDetailsDialogComponent} from '../metadata-details-dialog/metadata-details-dialog.component';
import {BrokerService} from '@shared/services/broker.service';
import {LoaderService} from '@shared/services/loader.service';
import {SchemaService} from '@shared/services/schema.service';
import {Observable} from 'rxjs';

@Component({
  selector: 'app-metadata-new',
  templateUrl: './metadata-new.component.html',
  styleUrls: ['./metadata-new.component.scss']
})

export class MetadataCreationComponent implements OnInit {
  @Input() domainEntity: string; //biomaterial/protocol/process
  @Input() projectId: string;
  @Input() submissionId: string;
  concreteTypes$: Observable<{}>;
  concreteTypes: {};
  domainEntityTitle: string

  ngOnInit(): void {
    this.domainEntity = this.domainEntity.toLowerCase();
    this.domainEntityTitle = this.domainEntity.charAt(0).toUpperCase() + this.domainEntity.slice(1);
    this.concreteTypes$ = this.brokerService.getConcreteTypes(this.domainEntity)
  }

  constructor(
    private brokerService: BrokerService,
    private schemaService: SchemaService,
    private loaderService: LoaderService,
    public dialog: MatDialog
  ) {

  }

  clickNew() {
    this.concreteTypes$.subscribe(types => {
      this.concreteTypes = types;
    });
    if (Object.keys(this.concreteTypes).length === 1) {
      this.chooseType(Object.keys(this.concreteTypes)[0])
    } else {
      //ToDo: Click new link to get drop down of concrete types
    }
  }

  chooseType(concreteType: string) {
    this.loaderService.display(true);
    const schemaUrl = this.concreteTypes[concreteType]
    this.schemaService.getDereferencedSchema(schemaUrl)
      .subscribe(data => {
        this.loaderService.display(false);
        //ToDo: Change MetadataDetailsDialogComponent to allow blank input
        //ToDo: onSave Post to SubmissionEnvelope
        //ToDo: onSave link new metadata to project
        this.dialog.open(MetadataDetailsDialogComponent, {
          data: {metadata: {content: {}}, schema: data},
          width: '60%',
          disableClose: true
        });
      });
  }

  //ToDo: Unit Tests
}
