import { configApiRef, useApi } from "@backstage/core-plugin-api";
import { CustomUiColumns } from "../types";


export function getcustomUIcolumns() : CustomUiColumns[] {

    const cols = useApi(configApiRef).getConfigArray('customUI.columns');
    const customUiColumns : CustomUiColumns[] = [];
    cols.forEach((x: any) => {
      customUiColumns.push({
        title: x.data.title,
        field: x.data.field,
        filter: x.data.filter,
      })
    })
    return customUiColumns
}

