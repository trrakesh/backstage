import React from 'react';
import {
  Table,
  TableColumn,
  Progress,
  ResponseErrorPanel,
} from '@backstage/core-components';
import useAsync from 'react-use/lib/useAsync';
import { RoleManagementData } from '@internal/backstage-plugin-role-management-common';
import { useApi } from '@backstage/core-plugin-api';
import { roleMappingApiRef } from '../../apis';

type DenseTableProps = {
  roles: RoleManagementData[];
};

export const DenseTable = ({ roles }: DenseTableProps) => {

  const columns: TableColumn[] = [
    { title: 'Name', field: 'name' },
  ];

  const data = roles.map(role => {
    return {
      name: role.info.roleName,
    };
  });

  return (
    <Table
      title="Role List"
      options={{ search: true, paging: false }}
      columns={columns}
      data={data}
    />
  );
};

export const RolesFetchComponent = () => {

  const roleApi = useApi(roleMappingApiRef);

  const { value, loading, error } = useAsync(async (): Promise<RoleManagementData[]> => {
    // Would use fetch in a real world example
    return await roleApi.getRoles();
  }, []);

  if (loading) {
    return <Progress />;
  } else if (error) {
    return <ResponseErrorPanel error={error} />;
  }

  return <DenseTable roles={value || []} />;
};
