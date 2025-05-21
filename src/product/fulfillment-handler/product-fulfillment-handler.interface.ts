export interface ProductFulfillmentHandler {
  fulfill(): Promise<void>;
}
