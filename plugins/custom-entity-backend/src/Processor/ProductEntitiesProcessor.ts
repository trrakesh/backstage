import { CatalogProcessor, CatalogProcessorEmit, processingResult } from '@backstage/plugin-catalog-node';
import { LocationSpec } from '@backstage/plugin-catalog-common'
// import { Entity, entityKindSchemaValidator } from '@backstage/catalog-model';

import {
    Entity,
    getCompoundEntityRef,
    entityKindSchemaValidator,
    parseEntityRef,
    RELATION_API_CONSUMED_BY,
    RELATION_API_PROVIDED_BY,
    RELATION_CONSUMES_API,
    RELATION_DEPENDENCY_OF,
    RELATION_DEPENDS_ON,
    RELATION_HAS_PART,
    RELATION_OWNED_BY,
    RELATION_OWNER_OF,
    RELATION_PART_OF,
    RELATION_PROVIDES_API,
} from '@backstage/catalog-model';

import productEntityV1alpha1Schema from '../schema/Product.v1alpha1.schema.json'
import { ProductEntityV1alpha1 } from '../kinds/ProductEntityV1alpha1';

export class ProductEntitiesProcessor implements CatalogProcessor {
    // You often end up wanting to support multiple versions of your kind as you
    // iterate on the definition, so we keep each version inside this array as a
    // convenient pattern.
    private readonly validators = [
        // This is where we use the JSONSchema that we export from our isomorphic
        // package
        entityKindSchemaValidator(productEntityV1alpha1Schema),
    ];

    // Return processor name
    getProcessorName(): string {
        return 'ProductEntitiesProcessor'
    }

    // validateEntityKind is responsible for signaling to the catalog processing
    // engine that this entity is valid and should therefore be submitted for
    // further processing.
    async validateEntityKind(entity: Entity): Promise<boolean> {
        for (const validator of this.validators) {
            // If the validator throws an exception, the entity will be marked as
            // invalid.
            if (validator(entity)) {
                return true;
            }
        }

        // Returning false signals that we don't know what this is, passing the
        // responsibility to other processors to try to validate it instead.
        return false;
    }

    async postProcessEntity(
        entity: Entity,
        _location: LocationSpec,
        emit: CatalogProcessorEmit,
    ): Promise<Entity> {

        console.log(entity);

        if (
            entity.apiVersion === 'backstage.io/v1alpha1' &&
            entity.kind === 'Product'
        ) {
            const selfRef = getCompoundEntityRef(entity);

            function doEmit(
                targets: string | string[] | undefined,
                context: { defaultKind?: string; defaultNamespace: string },
                outgoingRelation: string,
                incomingRelation: string,
            ): void {
                if (!targets) {
                    return;
                }
                for (const target of [targets].flat()) {
                    const targetRef = parseEntityRef(target, context);
                    emit(
                        processingResult.relation({
                            source: selfRef,
                            type: outgoingRelation,
                            target: {
                                kind: targetRef.kind,
                                namespace: targetRef.namespace,
                                name: targetRef.name,
                            },
                        }),
                    );
                    emit(
                        processingResult.relation({
                            source: {
                                kind: targetRef.kind,
                                namespace: targetRef.namespace,
                                name: targetRef.name,
                            },
                            type: incomingRelation,
                            target: selfRef,
                        }),
                    );
                }
            }

            /*
             * Emit relations for the Component kind
             */

            const component = entity as ProductEntityV1alpha1;
            doEmit(
                component.spec.owner,
                { defaultKind: 'Group', defaultNamespace: selfRef.namespace },
                RELATION_OWNED_BY,
                RELATION_OWNER_OF,
            );
            doEmit(
                component.spec.subcomponentOf,
                { defaultKind: 'Component', defaultNamespace: selfRef.namespace },
                RELATION_PART_OF,
                RELATION_HAS_PART,
            );
            doEmit(
                component.spec.providesApis,
                { defaultKind: 'API', defaultNamespace: selfRef.namespace },
                RELATION_PROVIDES_API,
                RELATION_API_PROVIDED_BY,
            );
            doEmit(
                component.spec.consumesApis,
                { defaultKind: 'API', defaultNamespace: selfRef.namespace },
                RELATION_CONSUMES_API,
                RELATION_API_CONSUMED_BY,
            );
            doEmit(
                component.spec.dependsOn,
                { defaultNamespace: selfRef.namespace },
                RELATION_DEPENDS_ON,
                RELATION_DEPENDENCY_OF,
            );
            doEmit(
                component.spec.system,
                { defaultKind: 'System', defaultNamespace: selfRef.namespace },
                RELATION_PART_OF,
                RELATION_HAS_PART,
            );

        }

        return entity;
    }
}