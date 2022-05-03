import {formatDate} from "@angular/common";
import {Component, Input, OnInit} from '@angular/core';
import {AuditLog} from "@projects/models/audit-log";
import {Project} from "@shared/models/project";

@Component({
  selector: 'app-audit-log',
  templateUrl: './audit-log.component.html',
  styleUrls: ['./audit-log.component.css']
})
export class AuditLogComponent implements OnInit {
  @Input()
  auditLogs: AuditLog[];

  constructor() { }

  ngOnInit(): void {}

  formatAsLongDate(project: Project): string {
    return formatDate(project.updateDate, 'longDate', 'en-GB');
  }

}
