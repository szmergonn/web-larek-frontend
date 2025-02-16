export abstract class AbstractDataModel<T> {
    public onUpdate?: (event: string, data?: object) => void;

    constructor(initialData: Partial<T>) {
        Object.assign(this, initialData);
    }

    protected notifyUpdate(event: string, data?: object): void {
        if (this.onUpdate) {
            this.onUpdate(event, data ?? {});
        }
    }
}
