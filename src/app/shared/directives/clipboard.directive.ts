// Import the core angular services.
import {Directive, EventEmitter, HostListener, Input, Output} from "@angular/core";

// Import the application components and services.
import {ClipboardService} from "../services/clipboard.service";

// This directive acts as a simple glue layer between the given [clipboard] property
// and the underlying ClipboardService. Upon the (click) event, the [clipboard] value
// will be copied to the ClipboardService and a (clipboardCopy) event will be emitted.
@Directive({
  selector: "[appClipboard]",
})
export class ClipboardDirective {
  private clipboardService: ClipboardService;

  @Input() appClipboard: string;
  @Output() clipboardCopy = new EventEmitter();
  @Output() clipboardError = new EventEmitter();


  constructor( clipboardService: ClipboardService ) {
    this.clipboardService = clipboardService;
  }


  // ---
  // PUBLIC METHODS.
  // ---

  // I copy the value-input to the Clipboard. Emits success or error event.
  @HostListener('click') copyToClipboard() : void {

    this.clipboardService
      .copy( this.appClipboard )
      .then(
        ( value: string ) : void => {

          this.clipboardCopy.emit( value );

        }
      )
      .catch(
        ( error: Error ) : void => {

          this.clipboardError.emit( error );

        }
      )
    ;

  }

}
