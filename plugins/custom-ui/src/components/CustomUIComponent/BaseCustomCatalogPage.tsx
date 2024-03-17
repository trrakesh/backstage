import {
    CatalogFilterLayout,
    EntityListProvider,
    UserListFilterKind,
    EntityOwnerPickerProps,
} from '@backstage/plugin-catalog-react';

import {
    Content,
    ContentHeader,
    PageWithHeader,
    SupportButton,
    TableColumn,
    TableProps,
} from '@backstage/core-components';
import React, { ReactNode } from 'react';

import { CatalogTable, CatalogTableColumnsFunc, CatalogTableRow } from '@backstage/plugin-catalog';
import { CustomUiColumns } from '../../types';
import { configApiRef, useApi } from '@backstage/core-plugin-api';

export interface CustomCatalogPageProps {
    initiallySelectedFilter?: UserListFilterKind;
    columns?: TableColumn<CatalogTableRow>[] | CatalogTableColumnsFunc;
    actions?: TableProps<CatalogTableRow>['actions'];
    initialKind?: string;
    tableOptions?: TableProps<CatalogTableRow>['options'];
    emptyContent?: ReactNode;
    ownerPickerMode?: EntityOwnerPickerProps['mode'];
    pagination?: boolean | { limit?: number };
    customColumns?: CustomUiColumns[];
}

export type BaseCatalogPageProps = {
    filters: ReactNode;
    content?: ReactNode;
    pagination?: boolean | { limit?: number };
};

/** @internal */
export function BaseCustomCatalogPage(props: BaseCatalogPageProps) {
    const { filters, content = <CatalogTable />, pagination } = props;

    const orgName =
        useApi(configApiRef).getOptionalString('organization.name') ?? 'Backstage';

    return (
        // <PageWithHeader title={t('indexPage.title', { orgName })} themeId="home">
        <PageWithHeader title={orgName} themeId="home">
            <Content>
                <ContentHeader title="">
                    {/* {allowed && (
                        <CreateButton
                            title={t('indexPage.createButtonTitle')}
                            to={createComponentLink && createComponentLink()}
                        />
                    )} */}
                    <SupportButton>All your software catalog entities</SupportButton>
                </ContentHeader>
                <EntityListProvider pagination={pagination}>
                    <CatalogFilterLayout>
                        <CatalogFilterLayout.Filters>{filters}</CatalogFilterLayout.Filters>
                        <CatalogFilterLayout.Content>{content}</CatalogFilterLayout.Content>
                    </CatalogFilterLayout>
                </EntityListProvider>
            </Content>
        </PageWithHeader>
    );
}