import {MetadataFormLayout} from '../metadata-schema-form/models/metadata-form-layout';
import {AdminAreaComponent} from '../project-registration/admin-area/admin-area.component';

export const layout: MetadataFormLayout = {
  tabs: [
    {
      title: 'Project',
      key: 'project.content.project_core',
      items: [
        'project.content.project_core.project_title',
        'project.content.project_core.project_description',
        'project.content.project_core.project_short_name',
        'project.dataAccess',
        'project.identifyingOrganisms',
        'project.technology',
        'project.organ',
        'project.cellCount',
        'project.releaseDate',
        'project.accessionDate',
        'project.content.array_express_accessions',
        'project.content.biostudies_accessions',
        'project.content.geo_series_accessions',
        'project.content.insdc_project_accessions',
        'project.content.insdc_study_accessions',
        'project.isInCatalogue',
        'project.content.supplementary_links'
      ]
    },
    {
      title: 'Contributors',
      key: 'project.content.contributors',
      items: [
        'project.content.contributors'
      ]
    },
    {
      title: 'Publications',
      key: 'project.content.publications',
      items: [
        'project.content.publications'
      ]
    },
    {
      title: 'Funders',
      key: 'project.content.funders',
      items: [
        'project.content.funders'
      ]
    },
    {
      title: 'Admin Area',
      key: 'project_admin',
      items: [
        {
          keys: [
            'project.primaryWrangler'
          ],
          component: AdminAreaComponent
        }
      ]
    }
  ]
};
