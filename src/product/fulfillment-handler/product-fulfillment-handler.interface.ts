export interface ProductFulfillmentHandler {
  fulfill(productId: string, quantity: number): Promise<void>;
  refund(productId: string, quantity: number): Promise<void>;
}
