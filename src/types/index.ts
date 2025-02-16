export type EventName = string | RegExp;
export type Subscriber<T = unknown> = (data: T) => void;
export type EmitterEvent = {
   eventName: string,
   data: unknown
};

export type ApiListResponse<T> = {
   total: number,
   items: T[]
};

export type ApiPostMethods = 'POST' | 'PUT' | 'DELETE';

export interface IAppEvents {
   on<T extends object>(event: EventName, callback: (data: T) => void): void;
   emit<T extends object>(event: string, data?: T): void;
   trigger<T extends object>(event: string, context?: Partial<T>): (data: T) => void;
}

export interface IBaseFormView<T> {
   onInputChange(field: keyof T, value: string): void;
   render(state: Partial<T> & IFormState): HTMLFormElement;
}

export interface IFormState {
   valid: boolean;
   errors: string[];
}

export interface IModal {
   content: HTMLElement;
   open(): void;
   close(): void;
   render(data: IModalContent): HTMLElement;
}

export interface IModalContent {
   content: HTMLElement;
}

export interface IProductModel {
   id: string;
   description: string;
   image: string;
   title: string;
   category: string;
   price: number | null;
}

export interface IOrderModel {
   id?: string;
   items?: string[];
   email: string;
   phone: string;
   address: string;
   payment: PaymentMethod;
   total?: number;
}

export type PaymentMethod = 'card' | 'cash';
export type IBasketModel = Pick<IOrderModel, 'items' | 'total'>;
export type ICheckoutFormData = Pick<IOrderModel, 'payment' | 'address'>;
export type IContactFormData = Pick<IOrderModel, 'email' | 'phone'>;
export type TOrderResult = Pick<IOrderModel, 'id' | 'total'>;
export type IFormErrors = Partial<Record<keyof IOrderModel, string>>;

export interface IMainPageView {
   catalog: HTMLElement;
   cartCounter: HTMLElement;
   cart: HTMLElement;
}

export interface IBasketView {
   items: HTMLElement[];
   total: number;
   selected: string[];
}

export interface IBasketItem {
   index: number;
   title: string;
   price: number;
}

export type IProductCardData = Omit<IProductModel, 'id'>

export interface IProductCardDetailData {
   description: string;
   button: string;
}

export interface IProductCardActions {
   onClick: (event: MouseEvent) => void;
}

export type ICheckoutFormViewData = ICheckoutFormData;
export type IContactFormViewData = IContactFormData;

export interface IOrderConfirmationViewData {
   total: number;
}

export interface IOrderConfirmationViewActions {
   onClick: () => void;
}

export interface IExtendedApi {
   readonly cdn: string;
   getProduct(id: string): Promise<IProductModel>;
   getProductList(): Promise<IProductModel[]>;
   postOrder(order: IOrderModel): Promise<TOrderResult>;
}

export interface IApplicationStore {
   catalog: IProductModel[];
   preview: string;
   basket: IBasketModel;
   order: IOrderModel;
   formErrors: IFormErrors;

   setCatalog(items: IProductModel[]): void;
   setPreview(item: IProductModel): void;
   setProductToBasket(item: IProductModel): void;
   setContactsField(field: keyof IContactFormViewData, value: string): void;
   setOrderField(field: keyof ICheckoutFormViewData, value: string): void;
   setPaymentMethod(method: PaymentMethod): void;
   setTotal(value: number): void;
   removeProductFromBasket(item: IProductModel): void;
   clearBasket(): void;
   clearOrder(): void;
   validateOrder(): boolean;
   validateContacts(): boolean;
   isInBasket(item: IProductModel): boolean;
   getBasketList(): string[];
   getTotal(): number;
}