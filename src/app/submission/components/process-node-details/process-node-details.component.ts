import {Component, Input, OnInit} from '@angular/core';
import {MetadataDocument} from "@shared/models/metadata-document";
import Utils from "@shared/utils";

@Component({
  selector: 'app-process-node-details',
  templateUrl: './process-node-details.component.html',
  styleUrls: ['./process-node-details.component.css']
})
export class ProcessNodeDetailsComponent implements OnInit {
  @Input()
  metadata: MetadataDocument;

  @Input()
  idPath: string;

  @Input()
  namePath: string;

  @Input()
  descriptionPath: string;

  id: string;
  concreteType: string;
  type: string;
  uuid: string;
  name: string;
  description: string;

  constructor() {
  }

  ngOnInit(): void {
    this.id = this.idPath ? Utils.getValueOfPath(this.metadata, this.idPath) : undefined;
    const describedBy = this.metadata?.content?.['describedBy'];
    this.concreteType = describedBy ? describedBy.split('/').pop() : '';
    this.uuid = this.metadata?.uuid?.uuid;
    this.type = this.metadata?.content?.['schema_type'];
    this.name = this.namePath ? Utils.getValueOfPath(this.metadata, this.namePath) : undefined;
    this.description = this.descriptionPath ? Utils.getValueOfPath(this.metadata, this.descriptionPath) : undefined;
  }
}
