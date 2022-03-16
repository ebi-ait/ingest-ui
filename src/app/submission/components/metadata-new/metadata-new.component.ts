import {Component, Input, OnInit} from '@angular/core';
import {BrokerService} from '@shared/services/broker.service';
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
  concreteTypes$: Observable<string[]>;

  ngOnInit(): void {
    this.concreteTypes$ = this.brokerService.getConcreteTypes(this.domainEntity)
  }

  constructor(private brokerService: BrokerService) {

  }

  //ToDo: Click new link to get drop down of concrete types (Skip if list only has one entry)
  //ToDo: Choose Concrete type
  //ToDo: Get latest schema for specified concrete type
  //ToDo: Pass schema to metadata-details-dialog component for creating new metadata
  //ToDo: onSave Post to SubmissionEnvelope
  //ToDo: onSave link new metadata to project
  //ToDo: Unit Tests
}
