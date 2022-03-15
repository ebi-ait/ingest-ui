import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-metadata-new',
  templateUrl: './metadata-new.component.html',
  styleUrls: ['./metadata-new.component.scss']
})

export class MetadataCreationComponent implements OnInit {
  @Input() resourceType: string; //biomaterials/protocols/processes
  @Input() projectId: string;
  @Input() submissionId: string;
  concreteTypes: string[];

  ngOnInit(): void {
    if (this.resourceType === 'processes') {
      this.concreteTypes = ['process'];
    } else {
      //ToDo: generate list of applicable concrete types
    }
  }

  //ToDo: Click new link to get drop down of concrete types (Skip if list only has one entry)
  //ToDo: Choose Concrete type
  //ToDo: Get latest schema for specified concrete type
  //ToDo: Pass schema to metadata-details-dialog component for creating new metadata
  //ToDo: onSave Post to SubmissionEnvelope
  //ToDo: onSave link new metadata to project
  //ToDo: Unit Tests
}
