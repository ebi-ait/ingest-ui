import {
  DataUseRestrictionGroupComponent
} from "@projects/components/data-use-restriction-group/data-use-restriction-group.component";
import {AccessionFieldGroupComponent} from '../accession-field-group/accession-field-group.component';
import {AdminAreaComponent} from '../admin-area/admin-area.component';
import {ContactFieldGroupComponent} from '../contact-field-group/contact-field-group.component';
import {FunderFieldGroupComponent} from '../funder-field-group/funder-field-group.component';
import {ProjectIdComponent} from '../project-id/project-id.component';
import {ProjectRegistrationSaveComponent} from '../project-registration-summary/project-registration-save.component';
import {PublicationFieldGroupComponent} from '../publication-field-group/publication-field-group.component';


export const accessionFields = [
  'project.content.array_express_accessions',
  'project.content.biostudies_accessions',
  'project.content.geo_series_accessions',
  'project.content.insdc_project_accessions',
  'project.content.insdc_study_accessions',
  'project.content.ega_accessions',
  'project.content.dbgap_accessions',
];

export const defaultAccessionField = accessionFields[0];

// Factory function to get the full layout stops any side effects from editing the layout
const getFullLayout = () => ({
  tabs: [
    {
      title: 'Project Information',
      key: 'project',
      items: [
        'project.content.project_core.project_title',
        'project.content.project_core.project_description',
        {
          keys: [
            'project.content.data_use_restriction',
            'project.content.duos_id',
          ],
          component: DataUseRestrictionGroupComponent
        },
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
            ...accessionFields,
            'project.accessionDate',
            'project.releaseDate'
          ],
          component: AccessionFieldGroupComponent
        },
        'project.content.estimated_cell_count',
        'project.isInCatalogue',
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
      title: 'Publications',
      key: 'publications',
      items: [
        {
          keys: [
            'project.content.publications'
          ],
          component: PublicationFieldGroupComponent
        }
      ]
    },
    {
      title: 'Funders',
      key: 'funders',
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
});

export default (createMode = false, showWranglerTools = false) => {
  const layout = getFullLayout();
  if (!createMode) {
    layout.tabs = layout.tabs.filter(tab => tab.key !== 'save');

    [ProjectIdComponent, AccessionFieldGroupComponent].forEach(component => {
      // Place in the route and not within the group component
      const index = layout.tabs[0].items.findIndex(item => item?.component === component);
      // @ts-ignore
      const keys: [string] = layout.tabs[0].items[index].keys;
      layout.tabs[0].items.splice(index, 1, ...keys);
    });
  }
  if (!showWranglerTools) {
    layout.tabs = layout.tabs.filter(tab => tab.key !== 'project_admin');
  }
  return layout;
};
