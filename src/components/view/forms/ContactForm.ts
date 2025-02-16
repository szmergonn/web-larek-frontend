import { FormBaseView } from './FormBaseView';
import { IContactFormData } from '../../../types';
import { EMAIL_REGEXP, PHONE_REGEXP } from '../../../utils/constants';
import { ensureElement } from '../../../utils/utils';

export class ContactForm extends FormBaseView<IContactFormData> {
    private readonly _email: HTMLInputElement;
    private readonly _phone: HTMLInputElement;
    private readonly _submitButton: HTMLButtonElement;

    constructor(container: HTMLFormElement, onSubmit: (state: IContactFormData) => void) {
        super(container, onSubmit);
        this._email = ensureElement<HTMLInputElement>('input[name=email]', this.container);
        this._phone = ensureElement<HTMLInputElement>('input[name=phone]', this.container);
        this._submitButton = ensureElement<HTMLButtonElement>('button[type=submit]', this.container);

        this._email.addEventListener('input', () => {
            this.validateForm();
            this.onInputChange('email', this._email.value);
        });

        this._phone.addEventListener('input', () => {
            this.validateForm();
            this.onInputChange('phone', this._phone.value);
        });

        this.container.addEventListener('submit', (e: Event) => {
            e.preventDefault();
            if (this.validateForm()) {
                onSubmit({
                    email: this._email.value,
                    phone: this._phone.value
                });
            }
        });
    }

    private validateForm(): boolean {
        const emailValid = EMAIL_REGEXP.test(this._email.value);
        const phoneValid = PHONE_REGEXP.test(this._phone.value);
        const errors: string[] = [];
        
        if (!this._email.value) {
            errors.push('Необходимо указать email');
        } else if (!emailValid) {
            errors.push('Неверный формат email');
        }
        
        if (!this._phone.value) {
            errors.push('Необходимо указать телефон');
        } else if (!phoneValid) {
            errors.push('Неверный формат телефона');
        }

        const isValid = emailValid && phoneValid;
        this.valid = isValid;
        this.errors = errors;
        return isValid;
    }

    set email(value: string) {
        this._email.value = value;
        this.validateForm();
    }

    set phone(value: string) {
        this._phone.value = value;
        this.validateForm();
    }
}
