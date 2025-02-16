import { Api } from '../base/api';
import { ApiListResponse, IProductModel, IOrderModel, TOrderResult, IExtendedApi } from '../../types';

export class ExtendedApiClient extends Api implements IExtendedApi {
    readonly cdn: string;

    constructor(cdn: string, baseUrl: string, options?: RequestInit) {
        super(baseUrl, options);
        this.cdn = cdn;
    }

    getProduct(id: string): Promise<IProductModel> {
        return this.get(`/product/${id}`).then((item: IProductModel) => ({
            ...item,
            image: this.cdn + item.image,
        }));
    }

    getProductList(): Promise<IProductModel[]> {
        return this.get(`/product/`).then((data: ApiListResponse<IProductModel>) =>
            data.items.map((item: IProductModel) => ({
                ...item,
                image: this.cdn + item.image,
            }))
        );
    }

    postOrder(order: IOrderModel): Promise<TOrderResult> {
        return this.post('/order', order).then((data: TOrderResult) => data);
    }
}
