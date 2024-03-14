import { Entity } from "@backstage/catalog-model";

export type User = {
    name: string,
    entity: Entity,
    email?: string;
};