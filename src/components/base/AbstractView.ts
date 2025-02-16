export abstract class AbstractView<T> {
    constructor(protected readonly container: HTMLElement) {}

    protected setText(element: HTMLElement, value: string): void {
        element.textContent = value;
    }

    protected setImage(element: HTMLImageElement, src: string, alt: string): void {
        element.src = src;
        element.alt = alt;
    }

    protected toggleClass(element: HTMLElement, className: string, force?: boolean): void {
        element.classList.toggle(className, force);
    }

    protected setDisabled(element: HTMLElement, state?: boolean): void {
        if (state) {
            element.setAttribute('disabled', 'disabled');
        } else {
            element.removeAttribute('disabled');
        }
    }

    protected hideElement(element: HTMLElement): void {
        element.style.display = 'none';
    }

    protected showElement(element: HTMLElement): void {
        element.style.removeProperty('display');
    }

    render(data?: Partial<T>): HTMLElement {
        Object.assign(this as object, data ?? {});
        return this.container;
    }
}
