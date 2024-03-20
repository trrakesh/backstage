import {
    alertApiRef,
    configApiRef,
    identityApiRef,
    ProfileInfo,
    useApi,
} from '@backstage/core-plugin-api';
import { useEffect } from 'react';
import useAsync from 'react-use/lib/useAsync';
import { CustomUiColumns } from '../../types';
import { roleMappingApiRef } from '@internal/backstage-plugin-user-management';

/** @public */
export const useCustomPermission = () => {

    const identityApi = useApi(identityApiRef);
    const alertApi = useApi(alertApiRef);
    const configApi = useApi(configApiRef);
    const roleApi = useApi(roleMappingApiRef);

    const { value, loading, error } = useAsync(async () => {

        const profile = await identityApi.getProfileInfo();
        const identity = await identityApi.getBackstageIdentity();
        const roleManagemetnData = await roleApi.getUserPermission(identity.userEntityRef);

        const cols = configApi.getConfigArray('customUI.columns');

        const customUiColumns: CustomUiColumns[] = [];
        cols.forEach((x: any) => {
            customUiColumns.push({
                title: x.data.title,
                field: x.data.field,
                filter: x.data.filter,
                visible: true
            })
        })

        const projectinformation = roleManagemetnData.info.data.find(x => x.category.key == "projectinformation");
        
        if (projectinformation) {
            customUiColumns.forEach(x => {
                const permission = projectinformation.permissions.find(y => y.info.key == x.field);
                x.visible = permission?.checked || false;
            });
        }
        console.log("-----------------------------------------------");
        console.log("-----------------------------------------------");
        console.log("-------------customUiColumns----------------------------------", customUiColumns);
        console.log("-----------------------------------------------");
        console.log("-----------------------------------------------");
        console.log("-----------------------------------------------"); 

        return {
            profile,
            identity,
            customUiColumns
        };
    }, []);

    useEffect(() => {
        if (error) {
            alertApi.post({
                message: `Failed to load user identity: ${error}`,
                severity: 'error',
            });
        }
    }, [error, alertApi]);

    if (loading || error) {
        return {
            profile: {} as ProfileInfo,
            displayName: '',
            loading,
        };
    }

    return {
        profile: value!.profile,
        backstageIdentity: value!.identity,
        displayName: value!.profile.displayName ?? value!.identity.userEntityRef,
        customUiColumns: value!.customUiColumns,
        loading,
    };
};
