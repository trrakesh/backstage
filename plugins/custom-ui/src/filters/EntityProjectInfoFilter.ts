import { EntityFilter } from '@backstage/plugin-catalog-react';
import { Entity } from '@backstage/catalog-model';
import { JsonObject } from '@backstage/types';


export class EntityProjectInfoFilter implements EntityFilter {
    constructor(readonly values: string[], readonly key: string) { }
    filterEntity(entity: Entity): boolean {
        const projectInfo = entity.spec?.projectInfo as JsonObject;
        const val = projectInfo[this.key]?.toString();
        return val !== undefined && this.values.includes(val);
    }
}
