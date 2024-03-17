import { DefaultEntityFilters } from '@backstage/plugin-catalog-react';
import { EntityProjectInfoFilter } from './filters/EntityProjectInfoFilter';

export type CustomFilters = DefaultEntityFilters & {
    projectInfoFilters?: EntityProjectInfoFilter;
};

export type CustomUiColumns = {
    title: string;
    field: string;
    filter: boolean;
    visible: boolean;
}