import { StoreManager } from '../model/StoreManager';
import { ExtendedApiClient } from '../model/ExtendedApiClient';

import { MainPage } from '../view/MainPage';
import { ModalWindow } from '../view/ModalWindow';
import { OrderConfirmation } from '../view/OrderConfirmation';

import { Cart } from '../view/cart/Cart';
import { CartItem } from '../view/cart/CartItem';

import { ProductCard } from '../view/product/ProductCard';
import { ProductDetail } from '../view/product/ProductDetail';

import { CheckoutForm } from '../view/forms/CheckoutForm';
import { ContactForm } from '../view/forms/ContactForm';

import { API_URL, CDN_URL } from '../../utils/constants';
import { cloneTemplate, ensureElement } from '../../utils/utils';
import { IProductModel, ICheckoutFormData, IContactFormData, IOrderModel } from '../../types';

export class AppController {
    private store: StoreManager;
    private api: ExtendedApiClient;
    private mainPage: MainPage;
    private modal: ModalWindow;
    private cart: Cart;
    private checkoutForm: CheckoutForm;
    private contactForm: ContactForm;
    private orderConfirmation: OrderConfirmation;

    private templates: {
        success: HTMLTemplateElement;
        cardCatalog: HTMLTemplateElement;
        cardPreview: HTMLTemplateElement;
        cardBasket: HTMLTemplateElement;
        basket: HTMLTemplateElement;
        order: HTMLTemplateElement;
        contacts: HTMLTemplateElement;
    };

    constructor() {
        this.templates = {
            success: ensureElement<HTMLTemplateElement>('#success'),
            cardCatalog: ensureElement<HTMLTemplateElement>('#card-catalog'),
            cardPreview: ensureElement<HTMLTemplateElement>('#card-preview'),
            cardBasket: ensureElement<HTMLTemplateElement>('#card-basket'),
            basket: ensureElement<HTMLTemplateElement>('#basket'),
            order: ensureElement<HTMLTemplateElement>('#order'),
            contacts: ensureElement<HTMLTemplateElement>('#contacts')
        };

        this.store = new StoreManager({});
        this.store.onUpdate = this.handleStoreUpdate.bind(this);
        this.api = new ExtendedApiClient(CDN_URL, API_URL);

        this.mainPage = new MainPage(document.body, this.onCartClick.bind(this));

        this.modal = new ModalWindow(
            ensureElement<HTMLDivElement>('#modal-container'),
            () => this.mainPage.setLocked(false),
            () => this.mainPage.setLocked(true)
        );
        
        this.cart = new Cart(
            cloneTemplate(this.templates.basket),
            undefined,
            this.onOrderOpen.bind(this)
        );
        
        this.checkoutForm = new CheckoutForm(
            cloneTemplate(this.templates.order),
            this.onCheckoutFormSubmit.bind(this)
        );
        this.contactForm = new ContactForm(
            cloneTemplate(this.templates.contacts),
            this.onContactFormSubmit.bind(this)
        );

        this.orderConfirmation = new OrderConfirmation(
            cloneTemplate(this.templates.success),
            this.onOrderConfirmationClose.bind(this)
        );
    }

    public initialize(): void {
        this.api.getProductList()
            .then((products) => {
                this.store.updateCatalog(products);
            })
            .catch((err: Error) => console.error(err));
    }

    private handleStoreUpdate(event: string, eventData?: unknown): void {
        const modelData = eventData as IProductModel | IOrderModel | Record<string, string>;
        
        switch (event) {
            case 'catalog:change': {
                this.renderCatalog();
                break;
            }
            case 'preview:change': {
                this.openProductDetail(modelData as IProductModel);
                break;
            }
            case 'basket:change': {
                this.renderCart();
                break;
            }
            case 'orderFormErrors:change': {
                const errorData = modelData as Record<string, string>;
                const addressError = errorData.address;
                this.checkoutForm.errors = addressError ? [addressError] : [];
                this.checkoutForm.valid = !addressError;
                break;
            }
            case 'contactsFormErrors:change': {
                const errorData = modelData as Record<string, string>;
                const errors = [];
                if (errorData.email) errors.push(errorData.email);
                if (errorData.phone) errors.push(errorData.phone);
                this.contactForm.errors = errors;
                this.contactForm.valid = errors.length === 0;
                break;
            }
        }
    }

    private renderCatalog(): void {
        const cards = this.store.catalog.map((item) => {
            const card = new ProductCard(cloneTemplate(this.templates.cardCatalog), () => {
                this.store.setPreview(item);
            });
            return card.render(item);
        });
        this.mainPage.setCatalog(cards);
    }

    private openProductDetail(item: IProductModel): void {
        const productDetail = new ProductDetail(
            cloneTemplate(this.templates.cardPreview),
            () => {
                if (this.store.isProductInCart(item)) {
                    this.store.removeProductFromCart(item);
                    productDetail.setButtonText('Купить');
                } else {
                    this.store.addProductToCart(item);
                    productDetail.setButtonText('Удалить');
                }
                setTimeout(() => this.modal.close(), 300);
            }
        );

        if (this.store.isProductInCart(item)) {
            productDetail.setButtonText('Удалить');
        } else {
            productDetail.setButtonText('Купить');
        }
        
        productDetail.setNotForSale(item);
        this.modal.render({ content: productDetail.render(item) });
    }

    private onCartClick(): void {
        this.renderCart();
        this.modal.render({ content: this.cart.render() });
    }

    private renderCart(): void {
        this.mainPage.setCartCounter(this.store.basket.items.length);
        let position = 1;
        const cartItems = this.store.basket.items.map((id) => {
            const product = this.store.catalog.find((p) => p.id === id);
            const cartItem = new CartItem(
                cloneTemplate(this.templates.cardBasket),
                () => {
                    if (product) {
                        this.store.removeProductFromCart(product);
                    }
                }
            );
            return cartItem.render({
                title: product ? product.title : '',
                price: product ? product.price : 0,
                index: position++
            });
        });
        this.cart.setItems(cartItems);
        this.cart.setTotal(this.store.getCartTotal());
    }

    private onOrderOpen(): void {
        this.store.clearOrder();
        this.modal.render({
            content: this.checkoutForm.render({
                payment: 'card',
                address: '',
                valid: false,
                errors: []
            })
        });
    }

    private onCheckoutFormSubmit(state: ICheckoutFormData): void {
        if (!state?.address?.trim()) {
            return;
        }
        
        this.store.updateOrderField('address', state.address);
        this.store.updateOrderField('payment', state.payment);
        
        if (this.store.validateOrder()) {
            this.modal.render({
                content: this.contactForm.render({
                    email: '',
                    phone: '',
                    valid: false,
                    errors: []
                })
            });
        }
    }

    private onContactFormSubmit(state: IContactFormData): void {
        if (!state?.email || !state?.phone) {
            return;
        }

        this.store.updateContactField('email', state.email);
        this.store.updateContactField('phone', state.phone);

        if (this.store.validateContacts()) {
            this.api.postOrder({
                ...this.store.order,
                items: this.store.basket.items,
                total: this.store.basket.total
            })
            .then(() => {
                this.modal.render({
                    content: this.orderConfirmation.render({
                        total: this.store.getCartTotal()
                    })
                });
                this.store.clearCart();
                this.store.clearOrder();
            })
            .catch((err: Error) => console.error(err));
        }
    }

    private onOrderConfirmationClose(): void {
        this.modal.close();
    }
}