import {MetadataFormLayout} from '../../metadata-schema-form/models/metadata-form-layout';
import {AccessionFieldGroupComponent} from '../accession-field-group/accession-field-group.component';
import {PublicationFieldGroupComponent} from '../publication-field-group/publication-field-group.component';
import {ContactFieldGroupComponent} from '../contact-field-group/contact-field-group.component';
import {ProjectRegistrationSaveComponent} from '../project-registration-summary/project-registration-save.component';
import {ProjectIdComponent} from '../project-id/project-id.component';
import {FunderFieldGroupComponent} from '../funder-field-group/funder-field-group.component';

export const projectRegLayout: MetadataFormLayout = {
  tabs: [
    {
      title: 'Publications',
      key: 'project.content.publications',
      items: [
        'project.content.publications'
      ]
    },
    {
      title: 'Project information',
      key: 'project',
      items: [
        'project.content.project_core.project_title',
        'project.content.project_core.project_description',
        'project.dataAccess',
        {
          keys: [
            'project.identifyingOrganisms',
            'project.technology',
            'project.organ',
            'project.content.project_core.project_short_name'
          ],
          component: ProjectIdComponent
        },
        {
          keys: [
            'project.content.array_express_accessions',
            'project.content.biostudies_accessions',
            'project.content.geo_series_accessions',
            'project.content.insdc_project_accessions',
            'project.content.insdc_study_accessions',
            'project.accessionDate',
            'project.releaseDate'
          ],
          component: AccessionFieldGroupComponent
        },
        'project.content.supplementary_links',
      ]
    },
    {
      title: 'Contributors',
      key: 'contributors',
      items: [
        {
          keys: [
            'project.content.contributors'
          ],
          component: ContactFieldGroupComponent
        }
      ]
    },
    {
      title: 'Funders',
      key: 'project.content.funders',
      items: [
        {
          keys: [
            'project.content.funders'
          ],
          component: FunderFieldGroupComponent
        }
      ]
    },
    {
      title: 'Save',
      key: 'save',
      items: [
        {
          keys: [],
          component: ProjectRegistrationSaveComponent
        }
      ]
    }
  ]
};
