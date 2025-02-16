import { AbstractView } from "../base/AbstractView";
import { IModal, IModalContent } from "../../types";
import { ensureElement } from '../../utils/utils';

export class ModalWindow extends AbstractView<IModalContent> implements IModal {
    private readonly _content: HTMLElement;
    private readonly _closeBtn: HTMLButtonElement;
    private onCloseCallback: () => void;
    private onOpenCallback: () => void;

    constructor(
        protected container: HTMLElement, 
        onClose?: () => void,
        onOpen?: () => void
    ) {
        super(container);
        this._closeBtn = ensureElement<HTMLButtonElement>('.modal__close', container);
        this._content = ensureElement<HTMLElement>('.modal__content', container);

        this.onCloseCallback = onClose ?? (() => {});
        this.onOpenCallback = onOpen ?? (() => {});

        this._closeBtn.addEventListener('click', this.close.bind(this));
        this.container.addEventListener('click', this.close.bind(this));
        this._content.addEventListener('click', (event) => event.stopPropagation());
    }

    set content(value: HTMLElement | null) {
        if (value) {
            this._content.replaceChildren(value);
        } else {
            this._content.innerHTML = '';
        }
    }

    open(): void {
        this.toggleClass(this.container, 'modal_active', true);
        this.onOpenCallback();
    }

    close(): void {
        this.toggleClass(this.container, 'modal_active', false);
        this.content = null;
        this.onCloseCallback();
    }

    render(data: IModalContent): HTMLElement {
        super.render(data);
        this.open();
        return this.container;
    }
}
