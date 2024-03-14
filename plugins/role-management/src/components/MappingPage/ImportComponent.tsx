import React, { useState } from 'react';
import {
  Header,
  Page,
  Content,
  HeaderLabel,
  TableColumn,
} from '@backstage/core-components';

import MaterialButton from '@material-ui/core/Button';
import { useApi } from '@backstage/core-plugin-api';
import { Entity } from '@backstage/catalog-model';
import { JsonObject } from '@backstage/types';
import { useParams } from 'react-router-dom';
import Alert from '@mui/material/Alert';

import { DenseTable } from './DenseTable';
import { roleMappingApiRef } from '../../apis';

import {
  catalogApiRef
} from '@backstage/plugin-catalog-react';

export const ImportComponent = () => {
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const catalogApi = useApi(catalogApiRef);
  const roleApi = useApi(roleMappingApiRef);

  const { kind } = useParams();

  const typeLabel = kind === 'user' ? 'Users' : 'Groups';

  const [entities, setEntities] = React.useState<Entity[]>([]);

  const columns: TableColumn[] = [
    { title: 'Name', field: 'name' },
    { title: 'Email', field: 'email' },
    { title: 'Actions', field: 'action' },
  ];

  const fetchData = React.useCallback(async () => {
    if (kind) {
      
      const entitiesFetchResult = await catalogApi.queryEntities({ filter: [{ kind: kind }] });
      const importedEntitiesFetchResult = await roleApi.getImportEntity({kind: kind });

      const validEntities = entitiesFetchResult.items.filter(e => {
        const found = importedEntitiesFetchResult.some(i => i.entity && i.entity.metadata.uid === e.metadata.uid);
        return !found;
      });
      setEntities(validEntities);
    }
  }, [catalogApi, roleApi, kind]);

  const handleImport = async (entity: Entity) => {
    await roleApi.createImportEntity({ kind: entity.kind, entity: entity, groups: [], roles: [] });
    setSuccessMessage('Imported the data  Successfully');
    fetchData();
  };

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  const getData = (k: string | undefined) => {
    if (k) {
      return (
        entities?.map(item => {
          const profile = item.spec?.profile as JsonObject;
          return {
            name: profile?.displayName as string,
            email: profile?.email as string,
            action: (
              <MaterialButton
                variant="contained"
                color="primary"
                onClick={() => handleImport(item)}
              >
                Add
              </MaterialButton>
            ),
          };
        }) || []
      );
    }
    return [];
  };

  return (
    <Page themeId="tool">
      <Header title={`Import ${typeLabel}!`} subtitle="Optional subtitle">
        <HeaderLabel label="Owner" value="Team X" />
        <HeaderLabel label="Lifecycle" value="Alpha" />
      </Header>
      <Content>
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
        <DenseTable
          data={getData(kind)}
          itemType={`${typeLabel}`}
          columns={columns}
        />
      </Content>
    </Page>
  );
};
