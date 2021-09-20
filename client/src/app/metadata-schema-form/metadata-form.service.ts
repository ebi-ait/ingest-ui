import {Injectable} from '@angular/core';
import {JsonSchema} from './models/json-schema';
import {MetadataForm} from './models/metadata-form';
import {MetadataFormConfig} from './models/metadata-form-config';
import {MetadataFormHelper} from './models/metadata-form-helper';


@Injectable({providedIn: 'root'})
export class MetadataFormService {
  helper: MetadataFormHelper;

  constructor() {
  }

  createForm(entity: string, schema: JsonSchema, data: object, config: MetadataFormConfig) {
    const form = new MetadataForm(entity, schema, data, config);
    return form;
  }

  cleanFormData(formData: any): any {
    if (!formData) {
      return formData;
    }
    const dataCopy = this.copyValues(formData);
    if (!dataCopy) {
      return dataCopy;
    }
    console.log(dataCopy);
    return this.cleanPublications(dataCopy);
  }

  cleanPublications(formData: any) {
    // Needed for dcp-458. Removes publications that only have `official_hca_publication` in their content
    const isEmptyPublication = publication =>
      Object.keys(publication).length === 1 && Object.keys(publication)[0] === 'official_hca_publication';

    const removeEmptyPublications = key => {
      if (typeof formData[key] === 'object' && isEmptyPublication(formData[key])) {
        delete formData[key];
      }
      if (Array.isArray(formData[key])) {
        formData[key] = formData[key].filter(publication => !isEmptyPublication(publication));
        if (formData[key].length === 0) {
          delete formData[key];
        }
      }
    };

    Object.keys(formData).forEach(key => {
      if (key === 'publication' || key === 'publications') {
        removeEmptyPublications(key);
      } else if (typeof formData[key] === 'object') {
        this.cleanPublications(formData[key]);
      }
    });
    return formData;
  }

  copyValues(obj: any): object {
    let copy = null;
    let subCopy = null;

    if (this.isEmpty(obj)) {
      copy = null;
    } else if (Array.isArray(obj)) {
      copy = [];
      for (const elem of obj) {
        subCopy = this.copyValues(elem);
        if (!this.isEmpty(subCopy)) {
          copy.push(subCopy);
        }
      }
    } else if (typeof obj === 'object') {
      copy = {};
      for (const key of Object.keys(obj)) {
        const prop = obj[key];
        subCopy = this.copyValues(prop);
        if (!this.isEmpty(subCopy)) {
          copy[key] = subCopy;
        }
      }
    } else {
      subCopy = obj;
      if (!this.isEmpty(subCopy)) {
        copy = subCopy;
      }
    }
    return copy;
  }

  isEmpty(obj: any): boolean {
    if (obj === undefined || obj === null) {
      return true;
    }

    if (Array.isArray(obj) && obj.length === 0) {
      return true;
    }

    if (typeof obj === 'number' && obj !== null) {
      return false;
    }

    if (typeof obj === 'object' && Object.keys(obj).length === 0) {
      return true;
    }
    return false;
  }


}
