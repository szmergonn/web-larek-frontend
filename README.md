# Проектная работа «Веб-ларёк»

Проект представляет собой интернет-магазин для веб-разработчиков, где можно просматривать каталог товаров, добавлять товары в корзину и оформлять заказы.

Стек технологий: HTML, SCSS, TypeScript, Webpack

---

## Структура проекта

- **src/** – исходные файлы проекта.
- **src/components/** – компоненты приложения, разделённые по функциональным блокам:
- **base/** – базовые абстрактные классы и утилиты для работы с данными и DOM.
  - **model/** – классы, отвечающие за бизнес-логику и управление состоянием.
  - **view/** – классы, отвечающие за отображение интерфейса (View).
  - **presenter/** – класс AppController, связывающий модель и представление.
- **src/types/** – файл с определениями интерфейсов и типов.
- **src/utils/** – вспомогательные утилиты и константы.
- **src/index.ts** – точка входа приложения.
- **src/scss/** – файлы стилей.

---

## Архитектура проекта

Проект построен по принципам архитектуры MVP (Model – View – Presenter). Схема взаимодействия выглядит следующим образом:

**View → Presenter → Model → Presenter → View**

1. **View (отображение)** – Пользователь взаимодействует с визуальными компонентами (например, кликает по карточке товара или нажимает кнопку оформления заказа).
2. **Presenter (AppController)** – Обрабатывает события из View, обновляет Model и инициирует перерисовку View.
3. **Model (StoreManager, ExtendedApiClient, Api)** – Управляет данными и бизнес-логикой; при изменении данных уведомляет Presenter через механизм обратных вызовов.
4. **Presenter** – При получении уведомления от Model обновляет соответствующие компоненты View.

Также в проекте присутствует класс **EventEmitter**, предназначенный для централизованной обработки событий, однако в текущей реализации он не используется напрямую – обмен событиями происходит через метод `onUpdate` в моделях.

### Генерируемые события и их значение

- **catalog:change** – обновление каталога товаров (например, после получения данных с сервера).
- **preview:change** – изменение выбранного для предпросмотра товара.
- **basket:change** – изменение содержимого корзины (добавление или удаление товара).
- **orderFormErrors:change** – обновление ошибок в форме оформления заказа.
- **contactsFormErrors:change** – обновление ошибок в форме ввода контактных данных.

---

## Подробное описание классов

Ниже приведён подробный обзор классов, разделённых по слоям, с описанием конструкторов (параметры и типы), ключевых полей и методов.

---

### 1. Модель (Model)

#### AbstractDataModel<T> (абстрактный класс)

- **Назначение:** Базовый класс для моделей данных, обеспечивает хранение данных и уведомление об изменениях.
- **Конструктор:** 
  - `constructor(initialData: Partial<T>)`
    - **initialData:** Объект, содержащий начальные значения модели (тип: Partial<T>).
- **Ключевые поля и методы:**
  - `public onUpdate?: (event: string, data?: object) => void`  
    Callback для уведомления об изменениях.
  - `protected notifyUpdate(event: string, data?: object): void`  
    Метод для вызова `onUpdate` с указанием типа события и данных.

---

#### StoreManager

- **Наследует от:** `AbstractDataModel<IApplicationStore>`
- **Назначение:** Управление данными приложения: каталог товаров, корзина, заказ, ошибки форм.
- **Конструктор:**
  - `constructor(initialData: Partial<IApplicationStore>)`
    - **initialData:** Начальные данные хранилища (тип: Partial<IApplicationStore>).
- **Ключевые поля:**
  - `private _catalog: IProductModel[]` – каталог товаров.
  - `private _preview: string | null` – идентификатор товара для предпросмотра.
  - `private _basket: IBasketModel` – данные корзины (список товаров и итоговая сумма).
  - `private _order: IOrderModel` – данные заказа (email, телефон, адрес, способ оплаты).
  - `private _formErrors: IFormErrors` – ошибки форм.
- **Ключевые методы:**
  - `updateCatalog(items: IProductModel[]): void` – обновление каталога и вызов уведомления `catalog:change`.
  - `setPreview(item: IProductModel): void` – установка предпросмотра товара и уведомление `preview:change`.
  - `addProductToCart(item: IProductModel): void` – добавление товара в корзину; обновление суммы и уведомление `basket:change`.
  - `removeProductFromCart(item: IProductModel): void` – удаление товара из корзины; обновление суммы и уведомление `basket:change`.
  - `updateContactField(field: keyof IContactFormData, value: string): void` – обновление поля контактов в заказе с последующей валидацией.
  - `updateOrderField(field: keyof ICheckoutFormData, value: string): void` – обновление поля заказа (например, адреса) с последующей валидацией.
  - `setPaymentMethod(method: PaymentMethod): void` – установка способа оплаты.
  - `updateTotal(value: number): void` – обновление итоговой суммы заказа.
  - `clearCart(): void` – очистка корзины с уведомлением `basket:change`.
  - `clearOrder(): void` – сброс данных заказа.
  - `validateOrder(): boolean` – валидация данных заказа; при наличии ошибок уведомление `orderFormErrors:change`.
  - `validateContacts(): boolean` – валидация контактных данных; при наличии ошибок уведомление `contactsFormErrors:change`.
  - `isProductInCart(item: IProductModel): boolean` – проверка наличия товара в корзине.
  - `getCartItems(): string[]` – получение списка идентификаторов товаров в корзине.
  - `getCartTotal(): number` – получение общей суммы корзины.

---

#### Api

- **Назначение:** Базовый класс для взаимодействия с сервером посредством HTTP-запросов.
- **Конструктор:**
  - `constructor(baseUrl: string, options?: RequestInit)`
    - **baseUrl:** Базовый URL для запросов (тип: string).
    - **options:** Дополнительные настройки запроса (тип: RequestInit).
- **Ключевые методы:**
  - `protected handleResponse(response: Response): Promise<object>` – обработка ответа от сервера, возвращает JSON или ошибку.
  - `get(uri: string): Promise<object>` – отправка GET-запроса.
  - `post(uri: string, data: object, method?: ApiPostMethods): Promise<object>` – отправка POST (или другого типа) запроса с телом в виде JSON.

---

#### ExtendedApiClient

- **Наследует от:** `Api` и реализует интерфейс `IExtendedApi`
- **Назначение:** Расширенный API-клиент для получения данных о товарах и отправки заказов.
- **Конструктор:**
  - `constructor(cdn: string, baseUrl: string, options?: RequestInit)`
    - **cdn:** URL CDN для изображений (тип: string).
    - **baseUrl:** Базовый URL для API (тип: string).
    - **options:** Дополнительные настройки (тип: RequestInit).
- **Ключевые поля:**
  - `readonly cdn: string` – CDN для формирования URL изображений.
- **Ключевые методы:**
  - `getProduct(id: string): Promise<IProductModel>` – получение данных одного товара; к пути изображения добавляется CDN.
  - `getProductList(): Promise<IProductModel[]>` – получение списка товаров; для каждого товара корректируется путь изображения.
  - `postOrder(order: IOrderModel): Promise<TOrderResult>` – отправка заказа на сервер.

---

### 2. Представление (View)

#### AbstractView<T> (абстрактный класс)

- **Назначение:** Базовый класс для всех компонентов представления, предоставляет удобные методы для работы с DOM.
- **Конструктор:**
  - `constructor(container: HTMLElement)`
    - **container:** HTML-элемент, в котором происходит рендеринг (тип: HTMLElement).
- **Ключевые методы:**
  - `protected setText(element: HTMLElement, value: string): void` – установка текстового содержимого.
  - `protected setImage(element: HTMLImageElement, src: string, alt: string): void` – установка изображения и альтернативного текста.
  - `protected toggleClass(element: HTMLElement, className: string, force?: boolean): void` – переключение CSS-класса.
  - `protected setDisabled(element: HTMLElement, state?: boolean): void` – установка/снятие атрибута disabled.
  - `protected hideElement(element: HTMLElement): void` – скрытие элемента.
  - `protected showElement(element: HTMLElement): void` – отображение элемента.
  - `render(data?: Partial<T>): HTMLElement` – рендеринг представления с передачей дополнительных данных.

---

#### FormBaseView<T> (абстрактный класс)

- **Наследует от:** `AbstractView<IFormState>`
- **Назначение:** Базовый класс для форм, содержащий базовую валидацию и обработку ошибок.
- **Конструктор:**
  - `constructor(container: HTMLFormElement, onSubmit: (state: T) => void)`
    - **container:** HTML-форма (тип: HTMLFormElement).
    - **onSubmit:** Callback для обработки отправки формы (тип: (state: T) => void).
- **Ключевые методы и свойства:**
  - `public onInputChange(field: keyof T, value: string): void` – метод, вызываемый при изменении значения поля.
  - `get data(): T` – геттер для получения данных формы.
  - `set valid(value: boolean)` – установка валидности формы (включает/выключает кнопку отправки).
  - `set errors(value: string[])` – вывод ошибок в элементе ошибок.
  - `render(state: Partial<T> & IFormState): HTMLFormElement` – рендеринг формы с передачей состояния.

---

#### MainPage

- **Наследует от:** `AbstractView<IMainPageView>`
- **Назначение:** Отображение главной страницы с каталогом товаров и элементами корзины.
- **Конструктор:**
  - `constructor(container: HTMLElement, onCartClick?: () => void)`
    - **container:** Корневой HTML-элемент страницы.
    - **onCartClick:** Callback для обработки клика по иконке корзины.
- **Ключевые поля:**
  - `_catalog: HTMLElement` – контейнер для карточек товаров.
  - `_counter: HTMLElement` – элемент счётчика товаров в корзине.
  - `_cart: HTMLElement` – кнопка/контейнер для корзины.
  - `_wrapper: HTMLElement` – основной контейнер страницы.
- **Ключевые методы:**
  - `setCatalog(items: HTMLElement[]): void` – установка карточек товаров в каталоге.
  - `setCartCounter(value: number): void` – обновление счётчика корзины.
  - `setLocked(value: boolean): void` – блокировка или разблокировка страницы (например, при открытии модального окна).

---

#### ModalWindow

- **Наследует от:** `AbstractView<IModalContent>` и реализует интерфейс `IModal`
- **Назначение:** Управление модальным окном для отображения детальной информации или форм.
- **Конструктор:**
  - `constructor(container: HTMLElement, onClose?: () => void, onOpen?: () => void)`
    - **container:** HTML-элемент модального окна.
    - **onClose:** Callback при закрытии модального окна.
    - **onOpen:** Callback при открытии модального окна.
- **Ключевые поля:**
  - `_content: HTMLElement` – контейнер для содержимого модального окна.
  - `_closeBtn: HTMLButtonElement` – кнопка закрытия.
- **Ключевые методы:**
  - `open(): void` – открытие модального окна (добавляет CSS-класс).
  - `close(): void` – закрытие модального окна (убирает CSS-класс, очищает содержимое).
  - `render(data: IModalContent): HTMLElement` – рендеринг модального окна с передачей содержимого.

---

#### Cart

- **Наследует от:** `AbstractView<IBasketView>`
- **Назначение:** Отображение содержимого корзины.
- **Конструктор:**
  - `constructor(container: HTMLElement, _unused?: unknown, onConfirm?: () => void)`
    - **container:** HTML-элемент корзины.
    - **onConfirm:** Callback для обработки подтверждения заказа.
- **Ключевые поля:**
  - `_itemList: HTMLElement` – контейнер для списка товаров в корзине.
  - `_priceTotal: HTMLElement` – элемент для отображения итоговой суммы.
  - `_confirmButton: HTMLButtonElement` – кнопка подтверждения заказа.
  - `onConfirmCallback: () => void` – callback для обработки клика по кнопке.
- **Ключевые методы:**
  - `setItems(items: HTMLElement[]): void` – установка списка товаров; если корзина пуста, выводится сообщение и кнопка блокируется.
  - `setTotal(value: number): void` – установка итоговой суммы (выводится с единицей измерения «синапсы»).
  - `setButtonState(disabled: boolean): void` – управление состоянием (enabled/disabled) кнопки подтверждения.
  - `render(): HTMLElement` – возвращает контейнер корзины.

---

#### CartItem

- **Наследует от:** `AbstractView<IBasketItem>`
- **Назначение:** Отображение отдельного элемента (товара) в корзине.
- **Конструктор:**
  - `constructor(container: HTMLElement, onDelete?: () => void)`
    - **container:** HTML-элемент элемента корзины.
    - **onDelete:** Callback для удаления товара из корзины.
- **Ключевые поля:**
  - `_index: HTMLElement` – элемент для отображения порядкового номера.
  - `_title: HTMLElement` – элемент для отображения названия товара.
  - `_price: HTMLElement` – элемент для отображения цены.
  - `_deleteButton: HTMLButtonElement` – кнопка для удаления товара.
  - `onDeleteCallback: () => void` – callback, вызываемый при клике на кнопку удаления.
- **Ключевые методы:**
  - Сеттеры:
    - `set index(value: number)` – установка порядкового номера.
    - `set title(value: string)` – установка названия.
    - `set price(value: number | null)` – установка цены (если цена отсутствует, выводится сообщение «Нет цены»).

---

#### CheckoutForm

- **Наследует от:** `FormBaseView<ICheckoutFormData>`
- **Назначение:** Форма оформления заказа (выбор способа оплаты и ввод адреса доставки).
- **Конструктор:**
  - `constructor(container: HTMLFormElement, onSubmit: (state: ICheckoutFormData) => void)`
    - **container:** HTML-форма для оформления заказа.
    - **onSubmit:** Callback для обработки отправки формы.
- **Ключевые поля:**
  - `_paymentCard: HTMLButtonElement` – кнопка выбора оплаты картой.
  - `_paymentCash: HTMLButtonElement` – кнопка выбора оплаты наличными.
  - `_address: HTMLInputElement` – поле ввода адреса доставки.
- **Ключевые методы:**
  - `private validateForm(): void` – валидация формы: проверка, что адрес введён.
  - Геттер `get data(): ICheckoutFormData` – возвращает объект с данными (способ оплаты и адрес).
  - Сеттеры:
    - `set payment(value: PaymentMethod)` – переключает активную кнопку оплаты.
    - `set address(value: string)` – устанавливает значение адреса и проводит валидацию.

---

#### ContactForm

- **Наследует от:** `FormBaseView<IContactFormData>`
- **Назначение:** Форма для ввода контактных данных покупателя (email и телефон).
- **Конструктор:**
  - `constructor(container: HTMLFormElement, onSubmit: (state: IContactFormData) => void)`
    - **container:** HTML-форма для ввода контактов.
    - **onSubmit:** Callback для обработки отправки формы.
- **Ключевые поля:**
  - `_email: HTMLInputElement` – поле ввода email.
  - `_phone: HTMLInputElement` – поле ввода телефона.
  - `_submitButton: HTMLButtonElement` – кнопка отправки формы.
- **Ключевые методы:**
  - `private validateForm(): boolean` – валидация email и телефона с использованием регулярных выражений.
  - Сеттеры:
    - `set email(value: string)` – установка email с последующей валидацией.
    - `set phone(value: string)` – установка телефона с последующей валидацией.

---

#### OrderConfirmation

- **Наследует от:** `AbstractView<IOrderConfirmationViewData>`
- **Назначение:** Отображение сообщения об успешном оформлении заказа.
- **Конструктор:**
  - `constructor(container: HTMLElement, actions?: { onClick: () => void })`
    - **container:** HTML-элемент для сообщения об успехе.
    - **actions:** Объект с callback для обработки клика (например, для закрытия модального окна).
- **Ключевые поля:**
  - `_total: HTMLElement` – элемент для отображения списанной суммы.
  - `_button: HTMLButtonElement` – кнопка закрытия сообщения.
  - `_title: HTMLElement` – элемент заголовка (может содержать текст благодарности или другой информации).
- **Ключевые методы:**
  - Сеттер `set total(value: string)` – установка текста с информацией о списанной сумме.
  - `render(data: IOrderConfirmationViewData): HTMLElement` – рендеринг компонента с данными заказа.

---

#### ProductCard

- **Назначение:** Отображает краткую информацию о товаре в каталоге.
- **Наследует от:** `AbstractView<IProductCardData>`
- **Интерфейс IProductCardData:**
  ```typescript
  interface IProductCardData {
      description: string;
      image: string;
      title: string;
      category: string;
      price: number | null;
  }

- **Конструктор:**
`constructor(container: HTMLElement, onClick?: () => void)`
**container:** HTML-элемент, в котором будет отрисована карточка.
**onClick:**  Callback, вызываемый при клике по карточке, для передачи события в AppController.
**Ключевые методы:** 
`render(data: IProductCardData): HTMLElement` – заполняет шаблон данными (описание, изображение, название, цена, категория) и возвращает HTML-элемент карточки.
`set category(value: string)` - устанавливает текст категории и присваивает соответствующий CSS-класс для правильного отображения цвета фона категории. Используется прямое присваивание className для обеспечения правильной иерархии классов.
**Особенности реализации:**
Категориям товаров назначаются разные цвета фона в зависимости от их типа (софт-скил, хард-скил и т.д.)
Для корректного отображения стилей используется механизм замены className вместо добавления классов через classList.add()

---

#### ProductDetail

**Назначение:** Отображает подробную информацию о товаре в модальном окне.
**Наследует от:** AbstractView<IProductCardDetailData>
**Интерфейс** IProductCardDetailData:
```typescript
interface IProductCardDetailData {
    description: string;
    button: string;
}
```
`constructor(container: HTMLElement, onButtonClick: () => void)`
**container:** HTML-элемент, в котором будет отрисована детальная информация.
**onButtonClick:** Callback, вызываемый при клике по кнопке (например, для добавления или удаления товара из корзины).
**Ключевые методы:**
`render(data: IProductCardData & IProductCardDetailData): HTMLElement` – объединяет данные из карточки и детальной информации, заполняет шаблон и возвращает HTML-элемент для модального окна.
`setButtonText(text: string): void` – изменяет текст кнопки (например, переключение между «Купить» и «Удалить»).
`setNotForSale(item: IProductModel): void` – устанавливает состояние товара, если он недоступен для продажи.
 **Особенности реализации:**
Каждый товар отображается с собственным уникальным описанием, полученным из модели данных
Компонент корректно обрабатывает различные состояния товара (доступен/недоступен для покупки)

---

### Presenter

### AppController
Назначение: Центральный контроллер, связывающий модель и вью, обрабатывающий действия пользователя.
**constructor()**
**Инициализирует:**
**StoreManager** – модель для управления данными.
**ExtendedApiClient** – клиент для работы с API.
- Различные компоненты View (MainPage, ModalWindow, Cart, CheckoutForm, ContactForm, OrderConfirmation).
- Загружает шаблоны из DOM (с использованием ensureElement и cloneTemplate).
**Ключевые поля:**
private store: StoreManager – модель приложения.
private api: ExtendedApiClient – API-клиент.
private mainPage: MainPage – главная страница.
private modal: ModalWindow – модальное окно.
private cart: Cart – корзина.
private checkoutForm: CheckoutForm – форма оформления заказа.
private contactForm: ContactForm – форма ввода контактов.
private orderConfirmation: OrderConfirmation – окно подтверждения заказа.
private templates: { ... } – набор шаблонов для различных компонентов.
**Ключевые методы:**
`initialize(): void` – инициализация приложения, загрузка данных каталога через API и обновление модели.
`private handleStoreUpdate(event: string, eventData?: unknown): void` – обработка обновлений модели (например, изменение каталога, корзины, ошибок форм) с дальнейшей перерисовкой соответствующих View.
`private renderCatalog(): void` – отрисовка каталога товаров на главной странице.
`private openProductDetail(item: IProductModel): void` – открытие детальной карточки товара в модальном окне.
`private onCartClick(): void` – обработка клика по иконке корзины, отображение содержимого корзины.
`private renderCart(): void` – обновление данных корзины в представлении.
`private onOrderOpen(): void` – открытие формы оформления заказа.
`private onCheckoutFormSubmit(state: ICheckoutFormData): void` – обработка отправки формы заказа с валидацией и переходом к форме контактов.
`private onContactFormSubmit(state: IContactFormData): void` – обработка отправки формы с контактными данными; отправка заказа через API, очистка корзины и отображение подтверждения.
`private onOrderConfirmationClose(): void` – закрытие окна подтверждения заказа.
**Примеры схем взаимодействия между классами**
**Пример 1: Просмотр карточки товара**
View (ProductCard):
Пользователь кликает по карточке товара в каталоге. В конструкторе ProductCard установлен обработчик клика, который вызывает callback (например, onClick), переданный из AppController.

Presenter (AppController):
Callback в AppController вызывает метод store.setPreview(item), передавая объект товара.

Model (StoreManager):
Метод setPreview обновляет внутреннее состояние (_preview) и вызывает notifyUpdate('preview:change', item).

Presenter (AppController):
Обработчик handleStoreUpdate, получив событие preview:change, вызывает метод openProductDetail(item), который создаёт экземпляр ProductDetail и отображает его в модальном окне.

View (ModalWindow с ProductDetail):
В модальном окне отображается детальная информация о товаре с возможностью добавить его в корзину или удалить, в зависимости от текущего состояния.

**Пример 2: Оформление заказа**
View (Cart → CheckoutForm → ContactForm):
Пользователь открывает корзину, затем нажимает кнопку оформления заказа. В корзине (Cart) при клике вызывается callback onOrderOpen, который открывает форму оформления заказа (CheckoutForm).

Presenter (AppController):
При отправке формы CheckoutForm вызывается метод onCheckoutFormSubmit, который обновляет заказ в модели через методы updateOrderField и проводит валидацию заказа (validateOrder()).

Model (StoreManager):
При успешной валидации заказа модель не отправляет уведомление об ошибках, и AppController переключает представление на форму ввода контактов (ContactForm).

Presenter (AppController):
При отправке данных из ContactForm вызывается метод onContactFormSubmit, который обновляет контактные данные в модели (updateContactField, validateContacts()). Если валидация проходит успешно, AppController вызывает API-клиент для отправки заказа (api.postOrder(...)).

Model и Presenter:
После успешного ответа от сервера AppController вызывает метод store.clearCart() для очистки корзины и отображает окно подтверждения заказа (OrderConfirmation) через ModalWindow.