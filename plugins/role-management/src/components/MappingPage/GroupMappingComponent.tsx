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

import { DenseTable } from './DenseTable';
import { roleMappingApiRef } from '../../apis';
import { importRouteRef } from '../../routes';
import { ImportEntityData } from '@internal/backstage-plugin-role-management-common';

export const GroupMappingComponent = () => {
  
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  const roleApi = useApi(roleMappingApiRef);
  const importRoute = useRouteRef(importRouteRef);

  type RoleSelectItem = { label: string; value: string };
  const [entities, setEntities] = React.useState<ImportEntityData[]>([]);
  const [roles, setRoles] = React.useState<RoleSelectItem[]>([]);

  React.useEffect(() => {
    const fetchData = async () => {

      const createdRoles = await roleApi.getRoles();
      const importedEntities = await roleApi.getImportEntity({kind: 'group' });

      setEntities(importedEntities);
      setRoles(
        createdRoles.map(r => {
          return { label: r.info.roleName, value: r.info.roleName };
        }) as RoleSelectItem[],
      );
    };
    fetchData();
  }, [roleApi]);

  const handleRoleMapping = async (entityObjectId: Number | undefined) => {
    const entityToUpdate = entities.find(e => e.id === entityObjectId);
    if (entityToUpdate) {
      if (
        !entityToUpdate.entity?.spec?.roles ||
        (entityToUpdate.entity.spec.roles as []).length === 0
      ) {
        setInfoMessage('Select atleast one Role');
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
          setEntities(updatedEntities);
        }
      }
    }
  };

  const getEntityData = () => {
    return (
      entities.map(e => {
        const profile = e.entity?.spec?.profile as JsonObject;
        const selectedRoles = e.entity?.spec?.roles as SelectedItems;
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
    { title: 'Actions', field: 'action' },
  ];

  return (
    <Page themeId="tool">
      <Header title="Map groups with roles!" subtitle="Optional subtitle">
        <HeaderLabel label="Owner" value="Team X" />
        <HeaderLabel label="Lifecycle" value="Alpha" />
      </Header>
      <Content>
        <ContentHeader title="">
          <CreateButton
            title="Import Groups"
            to={importRoute({ kind: 'group' })}
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
