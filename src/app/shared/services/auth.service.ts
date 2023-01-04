import {Injectable} from '@angular/core';
import {combineLatest, Observable, of} from 'rxjs';
import {catchError, map} from 'rxjs/operators';
import {Account} from '../../core/account';
import {Project} from '../models/project';

@Injectable()
export class AuthService {
    isWrangler(account: Observable<Account>): Observable<boolean> {
      return account.pipe(
        map(acc => acc.isWrangler()),
        catchError(err => of(false))
      );
    }

    isOwner(account: Observable<Account>, project: Observable<Project>): Observable<boolean> {
        return combineLatest([
            account.pipe(map(userAccount => userAccount.id)),
            project.pipe(map(proj => proj.user as string))
        ]).pipe(
            map(([userId, projectUserId]) => userId === projectUserId)
        );
    }

    isWranglerOrOwner(account$: Observable<Account>, project$: Observable<Project>): Observable<boolean> {
        return combineLatest([
            this.isWrangler(account$),
            this.isOwner(account$, project$)
        ]).pipe(
            map(([isWrangler, isOwner]) => isWrangler || isOwner),
            catchError(err => of(false))
        );
    }
}
