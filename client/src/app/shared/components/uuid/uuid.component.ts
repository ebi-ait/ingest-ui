import {Component, Input } from '@angular/core';
import { ClipboardService } from '../../services/clipboard.service';

@Component({
    selector: 'app-uuid',
    templateUrl: './uuid.component.html',
    styleUrls: ['./uuid.component.css']
})
export class UuidComponent {
    @Input() uuid: string;

    constructor(private clipboardService: ClipboardService) {
    }

    copyUuid() {
        this.clipboardService.copy(this.uuid);
    }
}
