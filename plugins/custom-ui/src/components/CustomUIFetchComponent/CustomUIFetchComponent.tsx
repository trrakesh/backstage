import React from 'react';

import { CatalogTable } from '@backstage/plugin-catalog';
import { EntityKindPicker } from '@backstage/plugin-catalog-react';

import { CustomFilter } from '../../filters/CustomFilter';
import { 
  BaseCustomCatalogPage, 
  CustomCatalogPageProps 
} from '../CustomUIComponent/BaseCustomCatalogPage';


export const CustomUIFetchComponent = (props: CustomCatalogPageProps) => {
  const {
    actions,
    initialKind = 'product',
    tableOptions = {},
    emptyContent,
    pagination,
    customColumns,
  } = props;

  const columns = [CatalogTable.columns.createNameColumn({ defaultKind: 'Product' })];
  customColumns?.forEach(x => {
    if (x.visible) {
      columns.push({
        title: x.title,
        field: `entity.spec.projectInfo.${x.field}`,
        width: 'auto',
      });
    }
  });


  return (
    <BaseCustomCatalogPage
      filters={
        <>
          <EntityKindPicker initialFilter={initialKind} hidden />
          <CustomFilter customColumns={customColumns || []} />
        </>
      }
      content={
        <CatalogTable
          columns={columns}
          actions={actions}
          tableOptions={tableOptions}
          emptyContent={emptyContent}
        />
      }
      pagination={pagination}
    />
  )
};
