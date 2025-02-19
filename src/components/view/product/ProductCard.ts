import { AbstractView } from '../../base/AbstractView';
import { IProductCardData } from '../../../types';
import { ensureElement } from '../../../utils/utils';
import { categories } from '../../../utils/constants';

export class ProductCard extends AbstractView<IProductCardData> {
    private readonly _title: HTMLElement;
    private readonly _category?: HTMLElement;
    private readonly _image: HTMLImageElement;
    private readonly _price: HTMLElement;
    private onClickCallback: () => void = () => {};

    constructor(container: HTMLElement, onClick?: () => void) {
        super(container);
        this._title = ensureElement<HTMLElement>('.card__title', container);
        this._category = ensureElement<HTMLElement>('.card__category', container);
        this._image = ensureElement<HTMLImageElement>('.card__image', container);
        this._price = ensureElement<HTMLElement>('.card__price', container);

        if (onClick) {
            this.onClickCallback = onClick;
            container.addEventListener('click', this.onClickCallback);
        }
    }

    set title(value: string) {
        this.setText(this._title, value);
    }

    set category(value: string) {
        this.setText(this._category, value);
        if (this._category) {
            const categoryClass = categories[value] ?? 'other';
            this._category.className = `card__category card__category_${categoryClass}`;
        }
    }

    set image(value: string) {
        this.setImage(this._image, value, this._title.textContent || '');
    }

    set price(value: number | null) {
        this.setText(this._price, value === null ? 'Бесценно' : `${value} синапсов`);
    }
}