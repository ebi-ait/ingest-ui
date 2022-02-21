import {Component, Input, OnInit} from '@angular/core';
import {ListResult} from '@shared/models/hateoas';
import {MetadataDocument} from '@shared/models/metadata-document';
import {IngestService} from '@shared/services/ingest.service';
import Utils from "@shared/utils";
import {forkJoin, Observable, Subject} from 'rxjs';
import {tap} from 'rxjs/operators';
import {NgxLink} from './ngxLink';
import {NgxNode} from './ngxNode';

@Component({
  selector: 'app-process-details',
  templateUrl: './process-details.component.html',
  styleUrls: ['./process-details.component.css']
})
export class ProcessDetailsComponent implements OnInit {

  @Input()
  processUrl: string;

  @Input()
  schemaUrl: string;

  @Input()
  projectId: string;

  processId: string;

  inputBiomaterials: MetadataDocument[];
  inputFiles: MetadataDocument[];
  protocols: MetadataDocument[];
  outputBiomaterials: MetadataDocument[];
  outputFiles: MetadataDocument[];

  protocolsToAdd: MetadataDocument[] = [];
  inputBiomaterialsToAdd: MetadataDocument[] = [];
  inputFilesToAdd: MetadataDocument[] = [];
  outputBiomaterialsToAdd: MetadataDocument[] = [];
  outputFilesToAdd: MetadataDocument[] = [];

  links: NgxLink[] = [];
  nodes: NgxNode[] = [];
  done: boolean;

  zoomToFit$: Subject<boolean> = new Subject();
  update$: Subject<any> = new Subject();

  constructor(private ingestService: IngestService) {
  }

  ngOnInit(): void {
    this.processId = Utils.getIdFromSelfHref(this.processUrl);
    this.refreshGraph();
  }

  updateGraph() {
    this.update$.next(true);
  }

  getConcreteType(metadata: MetadataDocument): string {
    return metadata.content['describedBy'].split('/').pop();
  }

  onProtocolPicked($event: MetadataDocument) {
    this.protocolsToAdd.push($event);
  }

  onDerivedBiomaterialPicked($event: MetadataDocument) {
    this.outputBiomaterialsToAdd.push($event);
  }

  onDerivedFilePicked($event: MetadataDocument) {
    this.outputFilesToAdd.push($event);
  }

  onInputBiomaterialPicked($event: MetadataDocument) {
    this.inputBiomaterialsToAdd.push($event);
  }

  onInputFilePicked($event: MetadataDocument) {
    this.inputFilesToAdd.push($event);
  }

  // TODO Add success or error status for add and remove operations

  removeInputBiomaterial(biomaterial: MetadataDocument) {
    const biomaterialId = Utils.getIdFromHalDoc(biomaterial)
    this.ingestService.deleteInputBiomaterialFromProcess(this.processId, biomaterialId).subscribe(data => {
      console.log('deleteInputBiomaterialFromProcess', data);
      this.refreshGraph();
    });
  }

  removeInputFile(file: MetadataDocument) {
    const fileId = Utils.getIdFromHalDoc(file);
    this.ingestService.deleteInputFileFromProcess(this.processId, fileId).subscribe(data => {
      console.log('deleteInputFileFromProcess', data);
      this.refreshGraph();
    });
  }

  removeProtocol(protocol: MetadataDocument) {
    const protocolId = Utils.getIdFromHalDoc(protocol);
    this.ingestService.deleteProtocolFromProcess(this.processId, protocolId).subscribe(data => {
      this.refreshGraph();
    });
  }

  removeOutputBiomaterial(biomaterial: MetadataDocument) {
    const biomaterialId = Utils.getIdFromHalDoc(biomaterial);
    this.ingestService.deleteOutputBiomaterialFromProcess(this.processId, biomaterialId).subscribe(data => {
      console.log('deleteOutputBiomaterialFromProcess', data);
      this.refreshGraph();
    });
  }

  removeOutputFile(file: MetadataDocument) {
    const fileId = Utils.getIdFromHalDoc(file);
    this.ingestService.deleteOutputFileFromProcess(this.processId, fileId).subscribe(data => {
      this.refreshGraph();
    });
  }

  // TODO Check if POST with comma-delimited resource uri's payload will do linking to all resources in the uri list
  addProtocols() {
    const tasks = this.protocolsToAdd.map(protocol => this.ingestService.addProtocolToProcess(this.processId, Utils.getIdFromHalDoc(protocol)));
    forkJoin(tasks).subscribe(
      data => {
        this.protocolsToAdd = [];
        this.refreshGraph();
      }
    );
  }

  addOutputFiles() {
    const tasks = this.outputFilesToAdd.map(file => this.ingestService.addOutputFileToProcess(this.processId, Utils.getIdFromHalDoc(file)));
    forkJoin(tasks).subscribe(
      data => {
        this.outputFilesToAdd = [];
        this.refreshGraph();
      }
    );
  }

  addInputBiomaterials() {
    const tasks = this.inputBiomaterialsToAdd.map(biomaterial => {
      const biomaterialId = Utils.getIdFromHalDoc(biomaterial);
      return this.ingestService.addInputBiomaterialToProcess(this.processId, biomaterialId);
    });

    forkJoin(tasks).subscribe(
      data => {
        this.inputBiomaterialsToAdd = [];
        this.refreshGraph();
      }
    );
  }

  addInputFiles() {
    const tasks = this.inputFilesToAdd.map(file => {
      const fileId = Utils.getIdFromHalDoc(file);
      return this.ingestService.addInputFileToProcess(this.processId, fileId);
    });

    forkJoin(tasks).subscribe(
      data => {
        this.inputFilesToAdd = [];
        this.refreshGraph();
      }
    );
  }

  addOutputBiomaterials() {
    const tasks = this.outputBiomaterialsToAdd.map(biomaterial => {
      const biomaterialId = Utils.getIdFromHalDoc(biomaterial);
      return this.ingestService.addOutputBiomaterialToProcess(this.processId, biomaterialId);
    });

    forkJoin(tasks).subscribe(
      data => {
        this.outputBiomaterialsToAdd = [];
        this.refreshGraph();
      }
    );
  }

  // TODO Create endpoint in Core to return all protocols, inputBiomaterials, derivedBiomaterials,derivedFiles for a process
  private refreshGraph() {
    this.done = false;
    this.initGraphModel();
    forkJoin(
      {
        protocols: this.getProtocols(this.processUrl),
        inputBiomaterials: this.getInputBiomaterials(this.processUrl),
        inputFiles: this.getInputFiles(this.processUrl),
        derivedBiomaterials: this.getDerivedBiomaterials(this.processUrl),
        derivedFiles: this.getDerivedFiles(this.processUrl)
      }
    ).subscribe(
      data => {
        this.done = true;
        this.updateGraph();
      }
    );
  }

  private getInputBiomaterials(processUrl: string): Observable<ListResult<MetadataDocument>> {
    return this.ingestService.get<ListResult<MetadataDocument>>(`${processUrl}/inputBiomaterials`).pipe(
      tap(data => {
        const inputs = data._embedded ? data._embedded.biomaterials : [];
        inputs.forEach(input => {
          this.nodes.push(this.ngxNode(input, 'content.biomaterial_core.biomaterial_id'));
          this.links.push(this.ngxLink(input, 'input', true));
        });
        this.inputBiomaterials = inputs;
      }));
  }

  private getInputFiles(processUrl: string): Observable<ListResult<MetadataDocument>> {
    return this.ingestService.get<ListResult<MetadataDocument>>(`${processUrl}/inputFiles`).pipe(
      tap(data => {
        const inputs = data._embedded ? data._embedded.files : [];
        inputs.forEach(input => {
          this.nodes.push(this.ngxNode(input, 'content.file_core.file_name'));
          this.links.push(this.ngxLink(input, 'input', true));
        });
        this.inputFiles = inputs;
      }));
  }

  private getProtocols(processUrl: string): Observable<ListResult<MetadataDocument>> {
    return this.ingestService.get<ListResult<MetadataDocument>>(`${processUrl}/protocols`).pipe(
      tap(data => {
        const protocols = data._embedded ? data._embedded.protocols : [];
        this.protocols = protocols;
        protocols.forEach(p => {
          this.nodes.push(this.ngxNode(p, 'content.protocol_core.protocol_id'));
          this.links.push(this.ngxLink(p, 'protocol', undefined));
        });
      }));
  }

  private getDerivedBiomaterials(processUrl: string) {
    return this.ingestService.get<ListResult<MetadataDocument>>(`${processUrl}/derivedBiomaterials`).pipe(
      tap(data => {
        const biomaterials = data._embedded ? data._embedded.biomaterials : [];
        this.outputBiomaterials = biomaterials;

        biomaterials.forEach(b => {
          this.nodes.push(this.ngxNode(b, 'content.biomaterial_core.biomaterial_id'));
          this.links.push(this.ngxLink(b, 'output', false));
        });

      }));
  }

  private getDerivedFiles(processUrl) {
    return this.ingestService.get<ListResult<MetadataDocument>>(`${processUrl}/derivedFiles`).pipe(
      tap(data => {
        const outputFiles = data._embedded ? data._embedded.files : [];
        this.outputFiles = outputFiles;
        outputFiles.forEach(d => {
          this.nodes.push(this.ngxNode(d, 'content.file_core.file_name'));
          this.links.push(this.ngxLink(d, 'output', false));
        });

      }));
  }

  private initGraphModel() {
    this.nodes = [{
      id: 'process',
      label: 'process'
    }];
    this.links = [];
  }

  private ngxNode(metadata: MetadataDocument, idPath:string): NgxNode {
    return {
      id: metadata.uuid.uuid,
      label: Utils.getValueOfPath(metadata, idPath),
    } as NgxNode;
  }

  private ngxLink(metadata: MetadataDocument, link_type:string, source:boolean): NgxLink {
    const metadataType = metadata.type.toLowerCase();
    return {
      id: `${link_type}-${metadataType}-${metadata.uuid.uuid}`,
      source: source? metadata.uuid.uuid : 'process',
      target: source? 'process': metadata.uuid.uuid,
      label: link_type
    } as NgxLink;
  }

}


