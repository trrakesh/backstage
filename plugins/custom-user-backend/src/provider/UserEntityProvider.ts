

import { EntityProvider, EntityProviderConnection } from '@backstage/plugin-catalog-node';
import { Logger } from 'winston';
import { readDBOrg } from '../reader/read';
import * as uuid from 'uuid';
import { merge } from 'lodash';
import {
    ANNOTATION_LOCATION,
    ANNOTATION_ORIGIN_LOCATION,
    Entity,
} from '@backstage/catalog-model';


export const DB_ANNOTATION = 'backstage.io/db-user';


export class UserEntityProvider implements EntityProvider {
    private connection?: EntityProviderConnection;
    private scheduleFn?: () => Promise<void>;

    static fromConfig(logger: Logger, schedule: any): UserEntityProvider {

        const result = new UserEntityProvider({
            id: "custom-user-entity",
            logger,
        });

        result.schedule(schedule);

        return result;

    }

    constructor(
        private options: {
            id: string;
            logger: Logger;
        },
    ) { }

    getProviderName(): string {
        return `custom-user-entity-provider${this.options.id}`;
    }

    async connect(connection: EntityProviderConnection): Promise<void> {
        this.connection = connection;
        await this.scheduleFn?.();
    }

    async read(options?: { logger?: Logger }) {
        if (!this.connection) {
            throw new Error('Not initialized');
        }

        const logger = options?.logger ?? this.options.logger;
        const { markReadComplete } = trackProgress(logger);

        const { users, groups } = await readDBOrg(
            {
                logger,
            },
        );

        const { markCommitComplete } = markReadComplete({ users, groups });

        await this.connection.applyMutation({
            type: 'full',
            entities: [...users, ...groups].map(entity => ({
                locationKey: `ldap-org-provider:${this.options.id}`,
                entity: withLocations(this.options.id, entity),
            })),
        });

        markCommitComplete();
    }

    private schedule(schedule: any) {

        if (schedule === 'manual') {
            return;
        }

        this.scheduleFn = async () => {
            const id = `${this.getProviderName()}:refresh`;
            await schedule.run({
                id,
                fn: async () => {
                    const logger = this.options.logger.child({
                        class: UserEntityProvider.prototype.constructor.name,
                        taskId: id,
                        taskInstanceId: uuid.v4(),
                    });

                    try {
                        await this.read({ logger });
                    } catch (error) {
                        logger.error(
                            `${this.getProviderName()} refresh failed, ${error}`,
                            error,
                        );
                    }
                },
            });
        };
    }
}


function trackProgress(logger: Logger) {
    let timestamp = Date.now();
    let summary: string;

    logger.info('Reading LDAP users and groups');

    function markReadComplete(read: { users: unknown[]; groups: unknown[] }) {
        summary = `${read.users.length} DB users and ${read.groups.length} DB groups`;
        const readDuration = ((Date.now() - timestamp) / 1000).toFixed(1);
        timestamp = Date.now();
        logger.info(`Read ${summary} in ${readDuration} seconds. Committing...`);
        return { markCommitComplete };
    }

    function markCommitComplete() {
        const commitDuration = ((Date.now() - timestamp) / 1000).toFixed(1);
        logger.info(`Committed ${summary} in ${commitDuration} seconds.`);
    }

    return { markReadComplete };
}


// Makes sure that emitted entities have a proper location based on their DN
function withLocations(providerId: string, entity: Entity): Entity {
    const dn =
        entity.metadata.annotations?.[DB_ANNOTATION] || entity.metadata.name;
    const location = `db://${providerId}/${encodeURIComponent(dn)}`;
    return merge(
        {
            metadata: {
                annotations: {
                    [ANNOTATION_LOCATION]: location,
                    [ANNOTATION_ORIGIN_LOCATION]: location,
                },
            },
        },
        entity,
    ) as Entity;
}
