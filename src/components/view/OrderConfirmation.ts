import { AbstractView } from '../base/AbstractView';
import { IOrderConfirmationViewData } from '../../types';
import { ensureElement } from '../../utils/utils';

export class OrderConfirmation extends AbstractView<IOrderConfirmationViewData> {
    protected _total: HTMLElement;
    protected _button: HTMLButtonElement;
    protected _title: HTMLElement;

    constructor(container: HTMLElement, actions?: { onClick: () => void }) {
        super(container);
        this._button = ensureElement<HTMLButtonElement>('.order-success__close', this.container);
        this._total = ensureElement<HTMLElement>('.order-success__description', this.container);
        this._title = ensureElement<HTMLElement>('.order-success__title', this.container);

        if (actions?.onClick) {
            this._button.addEventListener('click', actions.onClick);
        }
    }

    set total(value: string) {
        this.setText(this._total, `Списано ${value} синапсов`);
    }

    render(data: IOrderConfirmationViewData): HTMLElement {
        this.total = data.total.toString();
        return this.container;
    }
}
