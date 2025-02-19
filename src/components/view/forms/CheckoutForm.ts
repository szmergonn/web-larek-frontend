import { FormBaseView } from './FormBaseView';
import { PaymentMethod, ICheckoutFormData } from '../../../types';
import { ensureElement } from '../../../utils/utils';

export class CheckoutForm extends FormBaseView<ICheckoutFormData> {
    private readonly _paymentCard: HTMLButtonElement;
    private readonly _paymentCash: HTMLButtonElement;
    private readonly _address: HTMLInputElement;

    constructor(container: HTMLFormElement, onSubmit: (state: ICheckoutFormData) => void) {
        super(container, onSubmit);
        this._paymentCard = ensureElement<HTMLButtonElement>('.button_alt[name=card]', this.container);
        this._paymentCash = ensureElement<HTMLButtonElement>('.button_alt[name=cash]', this.container);
        this._address = ensureElement<HTMLInputElement>('.form__input[name=address]', this.container);

        this._paymentCard.addEventListener('click', () => {
            this.payment = 'card';
            this.onInputChange('payment', 'card');
        });

        this._paymentCash.addEventListener('click', () => {
            this.payment = 'cash';
            this.onInputChange('payment', 'cash');
        });

        this._address.addEventListener('input', () => {
            this.validateForm();
            this.onInputChange('address', this._address.value);
        });
    }

    private validateForm(): void {
        const isValid = this._address.value.trim().length > 0;
        this.valid = isValid;
        this.errors = isValid ? [] : ['Необходимо указать адрес'];
    }

    get data(): ICheckoutFormData {
        return {
            payment: this._paymentCard.classList.contains('button_alt-active') ? 'card' : 'cash',
            address: this._address.value,
        };
    }

    set payment(value: PaymentMethod) {
        this.toggleClass(this._paymentCard, 'button_alt-active', value === 'card');
        this.toggleClass(this._paymentCash, 'button_alt-active', value === 'cash');
    }

    set address(value: string) {
        this._address.value = value;
        this.validateForm();
    }
}