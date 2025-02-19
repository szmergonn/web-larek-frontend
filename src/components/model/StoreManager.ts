import { AbstractDataModel } from '../base/AbstractDataModel';
import { IApplicationStore, 
         IProductModel, 
         IBasketModel, 
         IOrderModel, 
         IFormErrors, 
         IContactFormData, 
         ICheckoutFormData, 
         PaymentMethod } from '../../types';
import { EMAIL_REGEXP, PHONE_REGEXP } from '../../utils/constants';

export class StoreManager extends AbstractDataModel<IApplicationStore> {
    private _catalog: IProductModel[] = [];
    private _preview: string | null = null;
    private _basket: IBasketModel = {
        items: [],
        total: 0,
    };
    private _order: IOrderModel = {
        email: '',
        phone: '',
        address: '',
        payment: 'card',
    };
    private _formErrors: IFormErrors = {};

    get catalog(): IProductModel[] {
        return this._catalog;
    }

    get basket(): IBasketModel {
        return this._basket;
    }

    get order(): IOrderModel {
        return this._order;
    }

    get formErrors(): IFormErrors {
        return this._formErrors;
    }

    updateCatalog(items: IProductModel[]): void {
        this._catalog = items;
        this.notifyUpdate('catalog:change', items);
    }

    setPreview(item: IProductModel): void {
        this._preview = item.id;
        this.notifyUpdate('preview:change', item);
    }

    addProductToCart(item: IProductModel): void {
        this._basket.items.push(item.id);
        this._basket.total += item.price || 0;
        this.notifyUpdate('basket:change', this._basket);
    }

    removeProductFromCart(item: IProductModel): void {
        this._basket.items = this._basket.items.filter(id => id !== item.id);
        this._basket.total -= item.price || 0;
        this.notifyUpdate('basket:change', this._basket);
    }

    updateContactField(field: keyof IContactFormData, value: string): void {
        this._order[field] = value;
        this.validateContacts();
    }

    updateOrderField(field: keyof ICheckoutFormData, value: string): void {
        if (field === 'payment') {
            this.setPaymentMethod(value as PaymentMethod);
        } else {
            this._order[field] = value;
            this.validateOrder();
        }
    }

    setPaymentMethod(method: PaymentMethod): void {
        this._order.payment = method;
    }

    updateTotal(value: number): void {
        this._order.total = value;
    }

    clearCart(): void {
        this._basket.items = [];
        this._basket.total = 0;
        this.notifyUpdate('basket:change', this._basket);
    }

    clearOrder(): void {
        this._order = {
            email: '',
            phone: '',
            address: '',
            payment: 'card',
        };
        this._formErrors = {};
    }

    validateOrder(): boolean {
        const errors: IFormErrors = {};
        if (!this._order.address) {
            errors.address = 'Необходимо указать адрес';
        }
        this._formErrors = {...this._formErrors, ...errors};
        this.notifyUpdate('orderFormErrors:change', this._formErrors);
        return Object.keys(errors).length === 0;
    }

    validateContacts(): boolean {
        const errors: IFormErrors = {};
        if (!this._order.email) {
            errors.email = 'Необходимо указать email';
        } else if (!EMAIL_REGEXP.test(this._order.email)) {
            errors.email = 'Неверный формат email';
        }
        if (!this._order.phone) {
            errors.phone = 'Необходимо указать телефон';
        } else if (!PHONE_REGEXP.test(this._order.phone)) {
            errors.phone = 'Неверный формат телефона';
        }
        this._formErrors = {...this._formErrors, ...errors};
        this.notifyUpdate('contactsFormErrors:change', this._formErrors);
        return Object.keys(errors).length === 0;
    }

    isProductInCart(item: IProductModel): boolean {
        return this._basket.items.includes(item.id);
    }

    getCartItems(): string[] {
        return this._basket.items;
    }

    getCartTotal(): number {
        return this._basket.total;
    }
}