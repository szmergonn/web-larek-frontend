import { AbstractView } from '../../base/AbstractView';
import { IBaseFormView, IFormState } from '../../../types';
import { ensureElement } from '../../../utils/utils';

export class FormBaseView<T> extends AbstractView<IFormState> implements IBaseFormView<T> {
    protected _submit: HTMLButtonElement;
    protected _errors: HTMLElement;

    constructor(protected container: HTMLFormElement, protected onSubmit: (state: T) => void) {
        super(container);
        this._submit = ensureElement<HTMLButtonElement>('button[type=submit]', this.container);
        this._errors = ensureElement<HTMLElement>('.form__errors', this.container);

        this.container.addEventListener('submit', (e: Event) => {
            e.preventDefault();
            if (!this._submit.disabled) {
                this.onSubmit(this.data);
            }
        });
    }

    public onInputChange(field: keyof T, value: string): void {}

    get data(): T {
        return {} as T;
    }

    set valid(value: boolean) {
        this._submit.disabled = !value;
    }

    set errors(value: string[]) {
        this.setText(this._errors, value.join(', '));
    }

    render(state: Partial<T> & IFormState): HTMLFormElement {
        Object.assign(this, state);
        return this.container;
    }
}
