import React, { ReactNode } from 'react';
import { TableColumn, Table } from '@backstage/core-components';

export type Data = { [key: string]: string | ReactNode };

type DenseTableProps = {
  data: Data[];
  itemType: string;
  columns: TableColumn[];
};

export const DenseTable = (props: DenseTableProps) => {
  const { data, itemType, columns } = props;

  return (
    <Table
      title={`${itemType} List`}
      options={{ search: true, paging: false }}
      columns={columns}
      data={data}
    />
  );
};
