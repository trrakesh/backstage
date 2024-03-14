import { Entity} from '@backstage/catalog-model';

// import { ajvCompiledJsonSchemaValidator } from './util';

/**
 * Backstage catalog Component kind Entity. Represents a single, individual piece of software.
 *
 * @remarks
 *
 * See {@link https://backstage.io/docs/features/software-catalog/system-model}
 *
 * @public
 */
export interface ProductEntityV1alpha1 extends Entity {
  apiVersion: 'backstage.io/v1alpha1' | 'backstage.io/v1beta1';
  kind: 'Component';
  spec: {
    type: string;
    lifecycle: string;
    owner: string;
    subcomponentOf?: string;
    providesApis?: string[];
    consumesApis?: string[];
    dependsOn?: string[];
    system?: string;
  };
}

// /**
//  * {@link KindValidator} for {@link ComponentEntityV1alpha1}.
//  *
//  * @public
//  */
// export const componentEntityV1alpha1Validator =
//   ajvCompiledJsonSchemaValidator(schema);
