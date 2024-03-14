import React from 'react';
import {
  Table,
  TableColumn,
  Progress,
  ResponseErrorPanel,
} from '@backstage/core-components';
import useAsync from 'react-use/lib/useAsync';
import { useApi } from '@backstage/core-plugin-api';
import { GroupEntity } from "@backstage/catalog-model";

import {
  EntityRefLink,
} from '@backstage/plugin-catalog-react';

import {
  catalogApiRef
} from '@backstage/plugin-catalog-react';
import { User } from '../types';

type DenseTableProps = {
  users: User[];
};

export const DenseTable = ({ users }: DenseTableProps) => {
  // const classes = useStyles();

  const columns: TableColumn[] = [
    { title: 'Name', field: 'name' },
    { title: 'Email', field: 'email' },
  ];

  const data = users.map(user => {
    return {
      name: (
        <EntityRefLink
          entityRef={user.entity}
          defaultKind={'User'}
        />
      ),
      email: user.email? user.email : '',
    };
  });

  return (
    <Table
      title="Group List"
      options={{ search: false, paging: false }}
      columns={columns}
      data={data}
    />
  );
};

export const GroupsFetchComponent = () => {

  const catalogApi = useApi(catalogApiRef);
  
  const { value, loading, error } = useAsync(async (): Promise<User[]> => {
    const temp = await catalogApi.getEntities({ filter: { kind: 'Group' }});
    return (temp.items as GroupEntity[]).map(x => {
      return {name: x.metadata.name, entity: x} 
    })

  }, []);

  if (loading) {
    return <Progress />;
  } else if (error) {
    return <ResponseErrorPanel error={error} />;
  }

  return <DenseTable users={value || []} />;
};
