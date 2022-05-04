import {formatDate} from "@angular/common";
import {Component, Input} from '@angular/core';
import {AuditLog} from "@projects/models/audit-log";
import { lowerCase, startCase } from "lodash";

@Component({
  selector: 'app-audit-log',
  templateUrl: './audit-log.component.html',
  styleUrls: ['./audit-log.component.css']
})

export class AuditLogComponent {
  @Input()
  auditLogs: AuditLog[];

  getAuditEvent(auditLog: AuditLog) {
    return `${auditLog['auditType']} from ${this.formatAuditEvent(auditLog['before'])} to ${
      this.formatAuditEvent(auditLog['after'])}`;
  }

  formatAuditDate(date: string): string {
    return formatDate(date, 'medium', 'en-GB');
  }

  formatAuditEvent(event: string): string {
    return (event ? startCase(lowerCase(event)) : 'None');
  }
}
