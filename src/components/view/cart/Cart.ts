import { AbstractView } from '../../base/AbstractView';
import { IBasketView } from '../../../types';
import { ensureElement, createElement } from '../../../utils/utils';

export class Cart extends AbstractView<IBasketView> {
    private readonly _itemList: HTMLElement;
    private readonly _priceTotal: HTMLElement;
    private readonly _confirmButton: HTMLButtonElement;
    private onConfirmCallback: () => void;

    constructor(container: HTMLElement, _unused?: unknown, onConfirm?: () => void) {
        super(container);
        this._itemList = ensureElement<HTMLElement>('.basket__list', this.container);
        this._priceTotal = ensureElement<HTMLElement>('.basket__price', this.container);
        this._confirmButton = ensureElement<HTMLButtonElement>('.basket__button', this.container);

        this.onConfirmCallback = onConfirm ?? (() => {});
        this._confirmButton.addEventListener('click', () => {
            this.onConfirmCallback();
        });
    }

    setItems(items: HTMLElement[]): void {
        if (items.length) {
            this._itemList.replaceChildren(...items);
            this.setDisabled(this._confirmButton, false);
        } else {
            this._itemList.replaceChildren(
                createElement<HTMLParagraphElement>('p', {
                    textContent: 'Корзина пуста',
                })
            );
            this.setDisabled(this._confirmButton, true);
        }
    }

    setTotal(value: number): void {
        this.setText(this._priceTotal, `${value} синапсов`);
    }

    render(): HTMLElement {
        return this.container;
    }
}
