import {NgModule} from '@angular/core';
import {UserManager, WebStorageStateStore} from 'oidc-client';
import {environment} from '@environments/environment';
import {CoreSecurity} from '../core/security.module';

const userManager = new UserManager({
  authority: environment.AAI_AUTHORITY,
  client_id: environment.AAI_CLIENT_ID,
  redirect_uri: window.location.origin + '/aai-callback',
  post_logout_redirect_uri: window.location.origin,
  response_type: 'token id_token',
  scope: 'email openid profile',
  filterProtocolClaims: true,
  loadUserInfo: true,
  userStore: new WebStorageStateStore({store: window.localStorage})
});

@NgModule({
  imports: [CoreSecurity],
  providers: [
    {
      provide: UserManager, useValue: userManager,
    }
  ]
})
export class AaiSecurity {}
