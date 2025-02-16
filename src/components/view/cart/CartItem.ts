import { AbstractView } from '../../base/AbstractView';
import { IBasketItem } from '../../../types';
import { ensureElement } from '../../../utils/utils';

export class CartItem extends AbstractView<IBasketItem> {
    private readonly _index: HTMLElement;
    private readonly _title: HTMLElement;
    private readonly _price: HTMLElement;
    private readonly _deleteButton: HTMLButtonElement;
    private onDeleteCallback: () => void;

    constructor(container: HTMLElement, onDelete?: () => void) {
        super(container);
        this._title = ensureElement<HTMLElement>('.card__title', container);
        this._price = ensureElement<HTMLElement>('.card__price', container);
        this._index = ensureElement<HTMLElement>('.basket__item-index', container);
        this._deleteButton = ensureElement<HTMLButtonElement>('.card__button', container);

        this.onDeleteCallback = onDelete ?? (() => {});
        this._deleteButton.addEventListener('click', this.onDeleteCallback);
    }

    set index(value: number) {
        this.setText(this._index, String(value));
    }

    set title(value: string) {
        this.setText(this._title, value);
    }

    set price(value: number | null) {
        this.setText(this._price, value === null ? 'Нет цены' : `${value} синапсов.`);
    }
}
