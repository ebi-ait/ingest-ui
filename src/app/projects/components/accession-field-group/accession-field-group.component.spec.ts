import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {FormArray} from '@angular/forms';
import {JsonSchema} from '@metadata-schema-form/models/json-schema';
import {MetadataForm} from '@metadata-schema-form/models/metadata-form';
import * as testSchema from './test-schema.json';
import {AccessionFieldGroupComponent} from './accession-field-group.component';


describe('AccessionFieldGroupComponent', () => {
  let component: AccessionFieldGroupComponent;
  let fixture: ComponentFixture<AccessionFieldGroupComponent>;

  let arrayExpressCtrl: FormArray;
  let geoSeriesCtrl: FormArray;
  let insdcProjCtrl: FormArray;
  let insdcStudyCtrl: FormArray;
  let bioStudiesCtrl: FormArray;
  let egaCtrl: FormArray;
  let dbgapCtrl: FormArray;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AccessionFieldGroupComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    const schema = testSchema as JsonSchema;
    const metadataForm = new MetadataForm('project', schema);
    fixture = TestBed.createComponent(AccessionFieldGroupComponent);
    component = fixture.componentInstance;
    component.metadataForm = metadataForm;
    component.accessionFields = [
      'project.array_express_accessions',
      'project.biostudies_accessions',
      'project.geo_series_accessions',
      'project.insdc_project_accessions',
      'project.insdc_study_accessions',
      'project.ega_accessions',
      'project.dbgap_accessions',
    ];
    component.defaultAccessionField = 'project.array_express_accessions';

    fixture.detectChanges();

    arrayExpressCtrl = component.metadataForm.getControl('project.array_express_accessions') as FormArray;
    geoSeriesCtrl = component.metadataForm.getControl('project.geo_series_accessions') as FormArray;
    insdcProjCtrl = component.metadataForm.getControl('project.insdc_project_accessions') as FormArray;
    insdcStudyCtrl = component.metadataForm.getControl('project.insdc_study_accessions') as FormArray;
    bioStudiesCtrl = component.metadataForm.getControl('project.biostudies_accessions') as FormArray;
    egaCtrl = component.metadataForm.getControl('project.ega_accessions') as FormArray;
    dbgapCtrl = component.metadataForm.getControl('project.dbgap_accessions') as FormArray;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('onProjectAccessionIdChange', () => {
    it('should set the BioStudies accession field', () => {
      component.onProjectAccessionIdChange('S-EXMP1');
      expect(bioStudiesCtrl.value).toEqual(['S-EXMP1']);

      expect(insdcProjCtrl.value).toEqual([]);
      expect(insdcStudyCtrl.value).toEqual([]);
      expect(arrayExpressCtrl.value).toEqual([]);
      expect(geoSeriesCtrl.value).toEqual([]);
      expect(egaCtrl.value).toEqual([]);
      expect(dbgapCtrl.value).toEqual([]);
    });

    it('should set the ArrayExpress accession field', () => {
      component.onProjectAccessionIdChange('E-AAAA-00');
      expect(arrayExpressCtrl.value).toEqual(['E-AAAA-00']);

      expect(insdcProjCtrl.value).toEqual([]);
      expect(insdcStudyCtrl.value).toEqual([]);
      expect(geoSeriesCtrl.value).toEqual([]);
      expect(bioStudiesCtrl.value).toEqual([]);
      expect(egaCtrl.value).toEqual([]);
      expect(dbgapCtrl.value).toEqual([]);
    });

    it('should set the GEO series accession field', () => {
      component.onProjectAccessionIdChange('GSE00000');
      expect(geoSeriesCtrl.value).toEqual(['GSE00000']);

      expect(insdcProjCtrl.value).toEqual([]);
      expect(insdcStudyCtrl.value).toEqual([]);
      expect(arrayExpressCtrl.value).toEqual([]);
      expect(bioStudiesCtrl.value).toEqual([]);
      expect(egaCtrl.value).toEqual([]);
      expect(dbgapCtrl.value).toEqual([]);
    });

    it('should set the INSDC study accession field', () => {
      component.onProjectAccessionIdChange('SRP000000');
      expect(insdcStudyCtrl.value).toEqual(['SRP000000']);

      expect(insdcProjCtrl.value).toEqual([]);
      expect(arrayExpressCtrl.value).toEqual([]);
      expect(geoSeriesCtrl.value).toEqual([]);
      expect(bioStudiesCtrl.value).toEqual([]);
      expect(egaCtrl.value).toEqual([]);
      expect(dbgapCtrl.value).toEqual([]);
    });

    it('should set the INSDC project accession field', () => {
      component.onProjectAccessionIdChange('PRJNS000000');
      expect(insdcProjCtrl.value).toEqual(['PRJNS000000']);

      expect(arrayExpressCtrl.value).toEqual([]);
      expect(insdcStudyCtrl.value).toEqual([]);
      expect(geoSeriesCtrl.value).toEqual([]);
      expect(bioStudiesCtrl.value).toEqual([]);
      expect(egaCtrl.value).toEqual([]);
      expect(dbgapCtrl.value).toEqual([]);
    });

    it('should set the EGA accession field', () => {
      component.onProjectAccessionIdChange('EGAS00000000001');
      expect(egaCtrl.value).toEqual(['EGAS00000000001']);

      expect(arrayExpressCtrl.value).toEqual([]);
      expect(insdcStudyCtrl.value).toEqual([]);
      expect(geoSeriesCtrl.value).toEqual([]);
      expect(bioStudiesCtrl.value).toEqual([]);
      expect(insdcProjCtrl.value).toEqual([]);
      expect(dbgapCtrl.value).toEqual([]);
    });
    it('should set the dbGaP accession field', () => {
      component.onProjectAccessionIdChange('phs001836');
      expect(dbgapCtrl.value).toEqual(['phs001836']);

      expect(arrayExpressCtrl.value).toEqual([]);
      expect(insdcStudyCtrl.value).toEqual([]);
      expect(geoSeriesCtrl.value).toEqual([]);
      expect(bioStudiesCtrl.value).toEqual([]);
      expect(insdcProjCtrl.value).toEqual([]);
      expect(egaCtrl.value).toEqual([]);
    });


    it('should set unrecognised accession to a default accession field', () => {
      component.onProjectAccessionIdChange('XXX');
      expect(arrayExpressCtrl.value).toEqual(['XXX']);

      expect(insdcProjCtrl.value).toEqual([]);
      expect(insdcStudyCtrl.value).toEqual([]);
      expect(geoSeriesCtrl.value).toEqual([]);
      expect(bioStudiesCtrl.value).toEqual([]);
      expect(egaCtrl.value).toEqual([]);
    });
  });
});
