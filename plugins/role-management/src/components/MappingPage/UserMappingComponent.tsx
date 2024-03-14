import React, { useState } from 'react';
import {
  Header,
  Page,
  Content,
  ContentHeader,
  CreateButton,
  HeaderLabel,
  SupportButton,
  TableColumn,
  Select,
  SelectedItems,
} from '@backstage/core-components';
import MaterialButton from '@material-ui/core/Button';
import { useApi } from '@backstage/core-plugin-api';
import { JsonObject } from '@backstage/types';
import { useRouteRef } from '@backstage/core-plugin-api';
import Alert from '@mui/material/Alert';
// import CheckIcon from '@mui/icons-material/Check';

import { DenseTable } from './DenseTable';
import { roleMappingApiRef } from '../../apis';
import { importRouteRef } from '../../routes';
import { ImportEntityData, RoleSelectItem } from '@internal/backstage-plugin-role-management-common';

export const UserMappingComponent = () => {
  
  const roleApi = useApi(roleMappingApiRef);
  const importRoute = useRouteRef(importRouteRef);

  const [entities, setEntities] = useState<ImportEntityData[]>([]);
  const [roles, setRoles] = useState<RoleSelectItem[]>([]);
  const [groups, setGroups] = useState<RoleSelectItem[]>([]);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  React.useEffect(() => {
    const fetchData = async () => {
      
      const importedEntities = await roleApi.getImportEntity({kind: 'user' });
      const importedGroups = await roleApi.getImportEntity({kind: 'group' });
      const createdRoles = await roleApi.getRoles();

      setEntities(importedEntities);

      setRoles(
        createdRoles.map(r => {
          return { label: r.info.roleName, value: r.info.roleName };
        }) as RoleSelectItem[],
      );
      setGroups(
        importedGroups.map(g => {
          return { label: g.entity.metadata.name, value: g.entity.metadata.name };
        }) as RoleSelectItem[],
      );

    };
    fetchData();
  }, [roleApi]);

  const handleRoleMapping = async (entityObjectId: Number | undefined) => {
    const entityToUpdate = entities.find(e => e.id === entityObjectId);
    if (entityToUpdate) {
      if ( entityToUpdate.roles.length === 0) {
        setInfoMessage('Select atleast one Role or Group');
        return;
      }
      try {
        await roleApi.updateImportEntity(entityToUpdate);
        setSuccessMessage('Data Updated Successfully');
      } catch (error) {
        setErrorMessage('Failed to Update Data');
      }
    }
  };

  const handleSelectChange = (
    selectedItems: SelectedItems,
    entityObjectId: Number | undefined,
    type: string,
  ) => {

    if (entityObjectId) {
      
      const selectedRoles = selectedItems as string[];
      const updatedEntities = [...entities];
      const matched = updatedEntities.find(e => e.id === entityObjectId);
      if (matched) {
        if (type === 'role') {
          matched.roles = selectedRoles;
        } else {
          matched.groups = selectedRoles;
        }
        setEntities(updatedEntities);
      }
    }
  }

  const getEntityData = () => {
    return (
      entities.map(e => {
        
        const profile = e.entity?.spec?.profile as JsonObject;

        const selectedRoles  = e.roles as SelectedItems;
        const selectedGroups = e.groups as SelectedItems;

        return {
          name: profile?.displayName as string,
          email: profile?.email as string,
          role: (
            <Select
              placeholder="Select roles"
              label=""
              items={roles}
              onChange={selectedItems => {
                handleSelectChange(selectedItems, e.id, 'role');
              }}
              multiple
              selected={selectedRoles}
            />
          ),
          group: (
            <Select
              placeholder="Select groups"
              label=""
              items={groups}
              onChange={selectedItems => {
                handleSelectChange(selectedItems, e.id, 'group');
              }}
              multiple
              selected={selectedGroups}
            />
          ),
          action: (
            <MaterialButton
              variant="contained"
              color="primary"
              onClick={() => handleRoleMapping(e.id)}
            >
              Update
            </MaterialButton>
          ),
        };
      }) || []
    );
  };

  const columns: TableColumn[] = [
    { title: 'Name', field: 'name' },
    { title: 'Email', field: 'email' },
    { title: 'Roles', field: 'role' },
    { title: 'Groups', field: 'group' },
    { title: 'Actions', field: 'action' },
  ];

  return (
    <Page themeId="tool">
      <Header
        title="Map users with roles and groups!"
        subtitle="Optional subtitle"
      >
        <HeaderLabel label="Owner" value="Team X" />
        <HeaderLabel label="Lifecycle" value="Alpha" />
      </Header>
      <Content>
        <ContentHeader title="">
          <CreateButton
            title="Import Users"
            to={importRoute({ kind: 'user' })}
          />
          <SupportButton>A description of your plugin goes here.</SupportButton>
        </ContentHeader>
        {successMessage && (
          <div>
            <Alert
            //   icon={<CheckIcon fontSize="inherit" />}
              severity="success"
              onClose={() => {
                setSuccessMessage(null);
              }}
            >
              {successMessage}
            </Alert>
          </div>
        )}
        {infoMessage && (
          <div>
            <Alert
              variant="outlined"
              severity="info"
              onClose={() => {
                setInfoMessage(null);
              }}
            >
              {infoMessage}
            </Alert>
          </div>
        )}
        {errorMessage && (
          <div>
            <Alert
              variant="outlined"
              severity="error"
              onClose={() => {
                setErrorMessage(null);
              }}
            >
              {errorMessage}
            </Alert>
          </div>
        )}
        <DenseTable data={getEntityData()} itemType="User" columns={columns} />
      </Content>
    </Page>
  );
};
