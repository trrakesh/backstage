import {
    // processingResult,
    CatalogProcessor,
    CatalogProcessorEmit,
    CatalogProcessorCache,
  } from '@backstage/plugin-catalog-node';
  
  import { LocationSpec } from '@backstage/plugin-catalog-common';
  import { Entity } from '@backstage/catalog-model';
  import { Config } from '@backstage/config';
  import { updateConfluencePage } from './helper';


// This is the custom process class, this class will be called for each entity regularily
export class ConfluenceUpdateProcess implements CatalogProcessor {
    constructor(private readonly config: Config) {}
  
    getProcessorName(): string {
      return 'ConfluenceUpdateProcess';
    }
  
    // This is the process function, from this function updateConfluencePage will be called with necessary arguments of the entity
    async postProcessEntity(
      entity: Entity,
      _location: LocationSpec,
      _emit: CatalogProcessorEmit,
      _cache: CatalogProcessorCache,
    ): Promise<Entity> {
      const confluenceApiBaseUrl = this.config.getOptionalString(
        'integrations.confluence.host',
      );
      const confluenceAuthToken = this.config.getOptionalString(
        'integrations.confluence.token',
      );
      const confluenceDirectory = this.config.getOptionalString(
        'integrations.confluence.localDir',
      );
  
      if (
        confluenceApiBaseUrl &&
        confluenceAuthToken &&
        confluenceDirectory &&
        entity.kind === 'Component'
      ) {
        console.log('Inside post custom processor', entity);
        updateConfluencePage(
          entity,
          confluenceApiBaseUrl,
          confluenceAuthToken,
          confluenceDirectory,
        );
      }
      return new Promise(resolve => {
        resolve(entity);
      });
    }
  }
  
  