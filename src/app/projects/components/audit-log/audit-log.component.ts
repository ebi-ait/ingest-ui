import {formatDate} from "@angular/common";
import {Component, Input} from '@angular/core';
import {AuditLog} from "@projects/models/audit-log";

@Component({
  selector: 'app-audit-log',
  templateUrl: './audit-log.component.html',
  styleUrls: ['./audit-log.component.css']
})

export class AuditLogComponent {
  @Input()
  auditLogs: AuditLog[];

  formatAuditDate(date: string): string {
    return formatDate(date, 'medium', 'en-GB');
  }

}
