import {Component, Input} from "@angular/core";

@Component({
  selector: 'app-template-question',
  templateUrl: './template-question.component.html',
  styleUrls: ['../template-generator.css']
})
export class TemplateQuestionComponent {

  private inputType: string;

  @Input()
  public name: string;

  @Input()
  public options: string[];

  @Input()
  public set multiSelect(multiSelect: boolean) {
    this.inputType = multiSelect ? 'checkbox' : 'radio';
  }

  public get multiSelect() : boolean {
    return this.multiSelect;
  }

}
