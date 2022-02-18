export class Alert {
  type: AlertType;
  title: string;
  message: string;
  dismissible: boolean;
  groupName? : string;
  id: number;
}

export enum AlertType {
  Success,
  Error,
  Info,
  Warning
}
