
import React from 'react';

import { CustomUIFetchComponent } from '../CustomUIFetchComponent';
import { useCustomPermission } from './useCustomPermission';
import { CustomCatalogPageProps } from './BaseCustomCatalogPage';

export function CustomUIComponent(props: CustomCatalogPageProps) {

  const { customUiColumns } = useCustomPermission();

  return (
    <CustomUIFetchComponent {...props} customColumns={customUiColumns}  />
  );
}
