import { ProductCard } from './ProductCard';
import { IProductModel } from '../../../types';
import { ensureElement } from '../../../utils/utils';

export class ProductDetail extends ProductCard {
    private readonly _description: HTMLElement;
    private readonly _button: HTMLButtonElement;
    private onButtonClickCallback: () => void;

    constructor(container: HTMLElement, onButtonClick?: () => void) {
        super(container);
        this._description = ensureElement<HTMLElement>('.card__text', container);
        this._button = ensureElement<HTMLButtonElement>('.card__button', container);

        this.onButtonClickCallback = onButtonClick ?? (() => {});
        container.removeEventListener('click', this.onButtonClickCallback);
        this._button.addEventListener('click', () => {
            this.onButtonClickCallback();
        });
    }

    set description(value: string) {
        this.setText(this._description, value);
    }

    setNotForSale(item: IProductModel): void {
        if (!item.price) {
            this.setButtonText('Недоступно');
            this._button.setAttribute('disabled', 'true');
        }
    }

    setButtonText(value: string): void {
        this.setText(this._button, value);
    }

    render(data: IProductModel): HTMLElement {
        super.render(data);
        if (data.description) {
            this.description = data.description;
        }
        return this.container;
    }
}