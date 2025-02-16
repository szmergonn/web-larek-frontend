import { AbstractView } from '../base/AbstractView';
import { IMainPageView } from '../../types';
import { ensureElement } from '../../utils/utils';

export class MainPage extends AbstractView<IMainPageView> {
    private readonly _catalog: HTMLElement;
    private readonly _counter: HTMLElement;
    private readonly _cart: HTMLElement;
    private readonly _wrapper: HTMLElement;
    private onCartClickCallback: () => void;

    constructor(container: HTMLElement, onCartClick?: () => void) {
        super(container);
        this._catalog = ensureElement<HTMLElement>('.gallery', container);
        this._counter = ensureElement<HTMLElement>('.header__basket-counter', container);
        this._cart = ensureElement<HTMLElement>('.header__basket', container);
        this._wrapper = ensureElement<HTMLElement>('.page__wrapper', container);

        this.onCartClickCallback = onCartClick ?? (() => {});
        this._cart.addEventListener('click', this.onCartClickCallback);
    }

    setCatalog(items: HTMLElement[]): void {
        this._catalog.replaceChildren(...items);
    }

    setCartCounter(value: number): void {
        this.setText(this._counter, String(value));
    }

    setLocked(value: boolean): void {
        this.toggleClass(this._wrapper, 'page__wrapper_locked', value);
    }
}
