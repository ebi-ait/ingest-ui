import { Component, OnInit } from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {query} from "@angular/animations";
import {Identifier} from "../../models/europe-pmc-search";
import {AutofillProjectService} from "../../services/autofill-project.service";
import {ProjectCacheService} from "../../services/project-cache.service";

@Component({
  selector: 'app-edit-project',
  templateUrl: './edit-project.component.html',
  styleUrls: ['./edit-project.component.css']
})
export class EditProjectComponent implements OnInit {


}
