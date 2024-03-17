import React from 'react';
import { Navigate, Route } from 'react-router-dom';
import { apiDocsPlugin, ApiExplorerPage } from '@backstage/plugin-api-docs';
import {
  CatalogEntityPage,
  CatalogIndexPage,
  CatalogTable,
  CatalogTableColumnsFunc,
  catalogPlugin,
} from '@backstage/plugin-catalog';
import {
  CatalogImportPage,
  catalogImportPlugin,
} from '@backstage/plugin-catalog-import';
import { ScaffolderPage, scaffolderPlugin } from '@backstage/plugin-scaffolder';
import { orgPlugin } from '@backstage/plugin-org';
import { SearchPage } from '@backstage/plugin-search';
import { TechRadarPage } from '@backstage/plugin-tech-radar';
import {
  TechDocsIndexPage,
  techdocsPlugin,
  TechDocsReaderPage,
} from '@backstage/plugin-techdocs';
import { TechDocsAddons } from '@backstage/plugin-techdocs-react';
import { ReportIssue } from '@backstage/plugin-techdocs-module-addons-contrib';
import { UserSettingsPage, useUserProfile } from '@backstage/plugin-user-settings';
import { apis } from './apis';
import { entityPage } from './components/catalog/EntityPage';
import { searchPage } from './components/search/SearchPage';
import { Root } from './components/Root';

import { AlertDisplay, OAuthRequestDialog } from '@backstage/core-components';
import { createApp } from '@backstage/app-defaults';
import { AppRouter, FlatRoutes } from '@backstage/core-app-api';
import { CatalogGraphPage } from '@backstage/plugin-catalog-graph';
import { RequirePermission } from '@backstage/plugin-permission-react';
import { catalogEntityCreatePermission } from '@backstage/plugin-catalog-common/alpha';

import { CustomFilter, getcustomUIcolumns } from "@internal/backstage-plugin-custom-ui";
import { EntityKindPicker } from '@backstage/plugin-catalog-react';
import { CreateRolePage, GroupManagementPage, RoleManagementPage, UserManagementPage, getUserPermission,  } from '@internal/backstage-plugin-user-management';
import { SignInPage } from '@internal/backstage-plugin-custom-user-login';

// import { LdapAuthFrontendPage } from '@immobiliarelabs/backstage-plugin-ldap-auth';

const app = createApp({
  apis,
  // components: {
  //   SignInPage: props => {
  //     return (
  //       <SignInPage {...props} />
  //     );
  //   },
  // },
  bindRoutes({ bind }) {
    bind(catalogPlugin.externalRoutes, {
      createComponent: scaffolderPlugin.routes.root,
      viewTechDoc: techdocsPlugin.routes.docRoot,
      createFromTemplate: scaffolderPlugin.routes.selectedTemplate,
    });
    bind(apiDocsPlugin.externalRoutes, {
      registerApi: catalogImportPlugin.routes.importPage,
    });
    bind(scaffolderPlugin.externalRoutes, {
      registerComponent: catalogImportPlugin.routes.importPage,
      viewTechDoc: techdocsPlugin.routes.docRoot,
    });
    bind(orgPlugin.externalRoutes, {
      catalogIndex: catalogPlugin.routes.catalogIndex,
    });
  },
});

// const cols = useApi(configApiRef).getConfig('customUI') as any;
// const customUiColumns = cols?.data?.columns as CustomUiColumns[];

// const columns = [CatalogTable.columns.createNameColumn()];
// customUiColumns ? customUiColumns?.forEach((x: any) => {
//     columns.push({
//         title: x.title,
//         field: `entity.spec.projectInfo.${x.field}`,
//         width: 'auto',
//     });
// }) : [];

const customColumnsFunc: CatalogTableColumnsFunc =  entityListContext => {

  if (entityListContext.filters.kind?.value === 'product') {

    const customUiColumns = getcustomUIcolumns();
    //const { backstageIdentity } = useUserProfile();
    // const roleData = getUserPermission();

    // console.log(roleData);

    const columns = [CatalogTable.columns.createNameColumn({ defaultKind: 'Product' })]

    customUiColumns ? customUiColumns?.forEach((x: any) => {
      columns.push({
        title: x.title,
        field: `entity.spec.projectInfo.${x.field}`,
      });

    }) : [];

    return columns;


  }
  return CatalogTable.defaultColumnsFunc(entityListContext);
};


const routes = (
  <FlatRoutes>
    <Route path="/" element={<Navigate to="catalog" />} />
    <Route path="/catalog" element={
      <CatalogIndexPage
        columns={customColumnsFunc}
        filters={
          <>
            <EntityKindPicker initialFilter='product' />
            <CustomFilter />
          </>
        }
      />}
    />
    <Route
      path="/catalog/:namespace/:kind/:name"
      element={<CatalogEntityPage />}
    >
      {entityPage}
    </Route>
    <Route path="/docs" element={<TechDocsIndexPage />} />
    <Route
      path="/docs/:namespace/:kind/:name/*"
      element={<TechDocsReaderPage />}
    >
      <TechDocsAddons>
        <ReportIssue />
      </TechDocsAddons>
    </Route>
    <Route path="/create" element={<ScaffolderPage />} />
    <Route path="/api-docs" element={<ApiExplorerPage />} />
    <Route
      path="/tech-radar"
      element={<TechRadarPage width={1500} height={800} />}
    />
    <Route
      path="/catalog-import"
      element={
        <RequirePermission permission={catalogEntityCreatePermission}>
          <CatalogImportPage />
        </RequirePermission>
      }
    />
    <Route path="/search" element={<SearchPage />}>
      {searchPage}
    </Route>
    <Route path="/settings" element={<UserSettingsPage />} />
    <Route path="/catalog-graph" element={<CatalogGraphPage />} />
    <Route path="/user-management" element={<UserManagementPage />} />
    <Route path="/group-management" element={<GroupManagementPage />} />
    <Route path="/role-management" element={<RoleManagementPage />} />
    <Route path="/create-role" element={<CreateRolePage />} />
  </FlatRoutes>
);

export default app.createRoot(
  <>
    <AlertDisplay />
    <OAuthRequestDialog />
    <AppRouter>
      <Root>{routes}</Root>
    </AppRouter>
  </>,
);
