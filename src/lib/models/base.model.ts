export class BaseModel<T> {
    protected collection: string;
    protected schema: any;

    constructor(collection: string, schema: any) {
        this.collection = collection;
        this.schema = schema;
    }
}