export class Account {
  id: string;
  name: string;
  providerReference: string;
  roles: string[];

  constructor(account: {
    id: string,
    providerReference: string,
    roles?: string[]
    name: string
  }) {
    this.id = account.id;
    this.providerReference = account.providerReference;
    this.roles = account.roles;
    this.name = account.name;
  }

  isWrangler(): boolean {
    return this.roles.includes('WRANGLER');
  }
}
