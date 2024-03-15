import { BackstageUserIdentity, IdentityApi, ProfileInfo } from "@backstage/core-plugin-api";


export class LocalUserIdentity implements IdentityApi {

    

    getProfileInfo(): Promise<ProfileInfo> {
        throw new Error("Method not implemented.");
    }
    getBackstageIdentity(): Promise<BackstageUserIdentity> {
        throw new Error("Method not implemented.");
    }
    getCredentials(): Promise<{ token?: string | undefined; }> {
        throw new Error("Method not implemented.");
    }
    signOut(): Promise<void> {
        throw new Error("Method not implemented.");
    }
}