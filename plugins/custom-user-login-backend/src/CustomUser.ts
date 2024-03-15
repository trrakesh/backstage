

export type CustomUser = {
    username: string;
    email: string;
    uid: string;
}

export type UserIdentityId = Pick<CustomUser, 'uid'>;