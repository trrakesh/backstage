import {
    ReadTreeOptions,
    ReadTreeResponse,
    ReadTreeResponseFactory,
    ReadUrlOptions,
    ReadUrlResponse,
    ReadUrlResponseFactory,
    ReaderFactory,
    SearchResponse,
    UrlReader
} from "@backstage/backend-common";

import {
    ForwardedError,
    NotFoundError,
    NotModifiedError,
} from '@backstage/errors';

import fetch, { Response } from 'node-fetch';
import getRawBody from 'raw-body';
import { Readable } from 'stream';
import { ArtifactoryIntegrationConfig } from "./ArtifactoryIntegrationConfig";
import { ArtifactoryIntegration } from "./ArtifactoryIntegration";
import { parseLastModified } from "./util";


export function parseUrl(
    url: string,
    config: ArtifactoryIntegrationConfig,
): { path: string; host: string } {
    return {
        path: url,
        host: config.host,
    };
}

interface ArtifactoryPath {
    path: string;
    dir: string;
}

/**
 * Implements a {@link @backstage/backend-plugin-api#UrlReaderService} for Artifactory buckets.
 *
 * @public
 */
export class ArtifactoryUrlReader implements UrlReader {
    static factory: ReaderFactory = ({ config, treeResponseFactory }) => {
        const integrations = ArtifactoryIntegration.factory({config});

        return integrations.list().map((integration: any) => {
            const reader = new ArtifactoryUrlReader(integration, {
                treeResponseFactory,
            });
            const predicate = (url: URL) => {
                return url.host.endsWith(integration.config.host);
            };
            return { reader, predicate };
        });
    };

    constructor(
        private readonly integration: ArtifactoryIntegration,
        private readonly deps: {
            treeResponseFactory: ReadTreeResponseFactory;
        },
    ) { }

    async read(url: string): Promise<Buffer> {
        const response = await this.readUrl(url);
        return response.buffer();
    }

    async fetchUrl(
        url: string,
        options?: ReadUrlOptions | ReadTreeOptions,
    ): Promise<Response> {
        const headers = this.integration.config.secretAccessKey
            ? { Authorization: this.integration.config.secretAccessKey }
            : undefined;

        try {
            return fetch(url, {
                headers: headers,
                signal: options?.signal as any,
            });
        } catch (e) {
            throw new Error(`Unable to read ${url}, ${e}`);
        }
    }

    async readUrl(
        url: string,
        options?: ReadUrlOptions,
    ): Promise<ReadUrlResponse> {
        const response = await this.fetchUrl(url, options);
        if (response.status === 304) {
            throw new NotModifiedError();
        }

        if (response.ok) {
            return ReadUrlResponseFactory.fromNodeJSReadable(response.body, {
                etag: response.headers.get('ETag') ?? undefined,
                lastModifiedAt: parseLastModified(
                    response.headers.get('Last-Modified'),
                ),
            });
        }

        const message = `could not read ${url}, ${response.status} ${response.statusText}`;
        if (response.status === 404) {
            throw new NotFoundError(message);
        }
        throw new Error(message);
    }

    async readTree(
        url: string,
        options?: ReadTreeOptions,
    ): Promise<ReadTreeResponse> {
        try {
            const allObjects: ArtifactoryPath[] = [];
            const responses = [];

            await this.getDirData(url, allObjects, options);

            for (let i = 0; i < allObjects.length; i++) {
                const fullPath = allObjects[i].dir + allObjects[i].path;
                const subPath = allObjects[i].dir.replace(url, '');
                const data = await this.readData(fullPath, options);

                responses.push({
                    data: data,
                    path: fullPath,
                    subPath: subPath,
                    lastModifiedAt: undefined,
                });
            }
            return await this.deps.treeResponseFactory.fromReadableArray(responses);
        } catch (e) {
            throw new ForwardedError('Could not retrieve file tree from Artifactory', e);
        }
    }

    async getDirData(
        url: string,
        allObjects: ArtifactoryPath[],
        options?: ReadTreeOptions,
    ) {
        const readable = await this.readData(url, options);
        const buffer = await getRawBody(readable);
        const list = await this.getData(buffer.toString('utf8'));

        list
            .filter(x => !x.endsWith('/'))
            .forEach(y => {
                allObjects.push({ path: y, dir: url });
            });

        list
            .filter(x => x.endsWith('/'))
            .forEach(y => {
                this.getDirData(url + y, allObjects, options);
            });
    }

    async readData(url: string, options?: ReadTreeOptions): Promise<Readable> {
        const response = await this.fetchUrl(url, options);
        if (response.ok) {
            return Readable.from(response.body);
        }
        throw new Error('Unknonw error');
    }

    async getData(data: string): Promise<string[]> {
        const regex = /<li><a.href="(.+)">/gm;
        const allObjects: string[] = [];

        const m = regex.exec(data);

        while (m !== null) {
            if (m.index === regex.lastIndex) {
                regex.lastIndex++;
            }
            if (m[1] !== '../') {
                allObjects.push(m[1]);
            }
        }

        return allObjects;
    }

    async search(): Promise<SearchResponse> {
        throw new Error('SVN Reader does not implement search');
    }

    toString() {
        const secretAccessKey = this.integration.config.secretAccessKey;
        return `artifactory{host=${this.integration.config.host},authed=${Boolean(
            secretAccessKey,
        )}}`;
    }
}
