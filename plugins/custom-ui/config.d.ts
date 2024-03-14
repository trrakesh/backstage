export interface Config {
    customUI?: {
        columns: Array<{
            /**
             * Title
             * @visibility frontend
             */
            title: string;
            /**
             * Field name
             * @visibility frontend
             */
            field: string;
            /**
             * Field name
             * @visibility frontend
             */
            filter: boolean;
        }>;
    };
}