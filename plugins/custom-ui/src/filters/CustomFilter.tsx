import React from 'react';
import { EntityCustomPicker } from "./EntityCustomPicker";
import { CustomUiColumns } from '../types';

export const CustomFilter = (props: {customColumns: CustomUiColumns[] }) => {
    const {customColumns} = props;
    return (
        <>
            {
                customColumns
                .filter(x => x.visible)
                .filter(x => x.filter)
                .map(y => <EntityCustomPicker label={y.title} path={y.field} />)
            }
        </>
    )
}