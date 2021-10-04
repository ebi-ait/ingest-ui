import {Component} from '@angular/core';
import {Ontology} from '../../../shared/models/ontology';
import {OntologyService} from '../../../shared/services/ontology.service';
import {MetadataFormService} from '../../metadata-form.service';
import {OntologyBaseComponent} from '../ontology-base/ontology-base.component';


@Component({
  selector: 'app-ontology-input',
  templateUrl: './ontology-input.component.html',
  styleUrls: ['./ontology-input.component.css']
})
export class OntologyInputComponent extends OntologyBaseComponent {

  constructor(protected ols: OntologyService, protected metadataFormService: MetadataFormService) {
    super(ols, metadataFormService);
  }


  updateControl(value: Ontology | string) {
    this.control.markAllAsTouched();
    if (typeof value === 'string') {
      value = value.trim();

      if (!value) {
        this.control.reset();
      } else {
        const originalValue = this.control.value.ontology ? this.control.value : '';
        this.searchControl.setValue(originalValue);
      }

    } else {
      this.control.patchValue(value ? value : {});
    }
  }


}
