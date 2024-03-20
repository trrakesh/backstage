
import React, { useState } from 'react';

import { InfoCard, InfoCardVariants } from '@backstage/core-components';
import { useEntity } from '@backstage/plugin-catalog-react';
import { Checkbox, FormControlLabel, FormGroup } from '@material-ui/core';

import useAsync from 'react-use/lib/useAsync';
import { RoleManagementData, UserRole } from '@internal/backstage-plugin-role-management-common';
import { useApi } from '@backstage/core-plugin-api';
import { roleMappingApiRef } from '../../apis';
import MaterialButton from '@material-ui/core/Button';
import { RoleSelectionCheckItem } from '../types';

export const RoleSelectionCard = (props: {
    variant?: InfoCardVariants;
}) => {
    const {
        variant,
    } = props;

   // const default = [];

    const { entity } = useEntity();
    const roleApi = useApi(roleMappingApiRef);
    const [selectedRoles, setSelectedRoles] = useState([] as RoleSelectionCheckItem[]);

    const { value } = useAsync(async (): Promise<{userRole: UserRole, rolechecks : RoleSelectionCheckItem[]}> => {
        
        const userRole: UserRole = await roleApi.getUserRole(entity.metadata.name);
        const temp : RoleManagementData[] = await roleApi.getRoles();

        const rolechecks : RoleSelectionCheckItem[] = temp.map(x => {
            return {
                key: x.info.roleName,
                checked: userRole.roles.includes(x.info.roleName)
            }
        })

        setSelectedRoles(rolechecks);
        return {userRole, rolechecks};

    }, undefined);

    const handleUpdateButtonClick = async () => {

        if (value) {
            const roles = value.rolechecks.filter(x => x.checked).map(y => y.key);
            value.userRole.roles = roles;
            await roleApi.createUserRole(value.userRole);
        }
    };

    const handleCheckboxClick = (item: string) => {

        if (value) {
            const role = value.rolechecks.find(y => y.key == item);
            if (role) {
                role.checked = !role.checked;
            }

            setSelectedRoles([...value.rolechecks]);
        }
    };

    return (
        <InfoCard title="Roles" variant={variant} >
            <FormGroup>
                {
                    selectedRoles.map(x => <FormControlLabel 
                        control={
                            <Checkbox
                                onClick={() => { handleCheckboxClick(x.key); }}
                                checked={x.checked}
                            />
                        } 
                        label={x.key} 
                    />)
                }
            </FormGroup>
            <MaterialButton 
                onClick={handleUpdateButtonClick} 
                variant="contained" color="primary" 
                style={{ marginTop: 8 }}>Update</MaterialButton>
        </InfoCard>
    );
    

}