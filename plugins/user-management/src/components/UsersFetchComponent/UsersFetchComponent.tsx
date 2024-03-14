import React from 'react';
import {
  Table,
  TableColumn,
  Progress,
  ResponseErrorPanel,
} from '@backstage/core-components';
import useAsync from 'react-use/lib/useAsync';
import { useApi } from '@backstage/core-plugin-api';
import { UserEntity } from "@backstage/catalog-model";

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
      title="User List"
      options={{ search: true, paging: false }}
      columns={columns}
      data={data}
    />
  );
};

export const UsersFetchComponent = () => {

  const catalogApi = useApi(catalogApiRef);
  
  const { value, loading, error } = useAsync(async (): Promise<User[]> => {
    const temp = await catalogApi.getEntities({ filter: { kind: 'User' }});
    return (temp.items as UserEntity[]).map(x => {
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
