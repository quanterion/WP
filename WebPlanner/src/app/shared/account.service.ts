import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";

export interface UserInfo {
  id: number;
  name: string;
  fullName: string;
  email: string;
  emailConfirmed: boolean;
  disabled?: boolean;
  firm?: { id: string; name: string };

  admin: boolean;
  roles: string[];

  externalId: string;
  parentUserId?: number;
  employees: UserInfo[];
  createdAt?: string;
  projects?: number;
}

export interface UserUpdateData extends Partial<UserInfo> {
  username?: string;
  password?: string;
  remove?: boolean;
  // use to update parentUserId if it is not known yet
  parentUserName?: string;
}

@Injectable({
  providedIn: 'root',
})
export class AccountService {
  constructor(private http: HttpClient) {
  }

  getUser(idOrUsername) {
    return this.http.get<UserInfo>(`/api/account/user/${idOrUsername}`);
  }

  getAllUsers(column?: string) {
    let params = column ? { column } : undefined;
    return this.http.get<UserInfo[]>('/api/account/users', { params });
  }

  getRoles() {
    return this.http.get<{name: string, description: string}[]>('/api/account/roles');
  }

  createRole(name: string) {
    let data = new FormData();
    data.append('name', name);
    return this.http.post<boolean>('/api/account/roles', data);
  }

  removeRole(name: string) {
    return this.http.delete<boolean>('/api/account/roles/' + name);
  }

  updateUsers(changes: UserUpdateData[]) {
    return this.http.post('/api/account/updateusers', changes);
  }

  updateUser(change: UserUpdateData) {
    return this.http.post('/api/account/updateuser', change);
  }

  unlock(user: UserInfo) {
    return this.http.post<any>(`/api/account/user/${user.id}/unlock`, {});
  }

  verifyEmail(userId: number, code?: string) {
    return this.http.post<any>('/api/account/verify', { id: userId, code });
  }

  removeUser(user: UserInfo) {
    return this.http.delete(`/api/account/user/${user.id}`);
  }
}
