import React from 'react';
import { EntityCustomPicker } from "./EntityCustomPicker";
import {  getcustomUIcolumns } from "./util";

export const CustomFilter = () => {
    const customUiColumns = getcustomUIcolumns();
    return (
        <>
            {
                customUiColumns?.filter(x => x.filter).map(y => <EntityCustomPicker label={y.title} path={y.field} />)
            }
        </>
    )
}