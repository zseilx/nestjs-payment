export class PayletterPartialCancelRequest {
  pgcode: string;
  client_id: string;
  user_id: string;
  tid: string;
  ip_addr: string;
  amount: number;
  taxfree_amount?: number;
  tax_amount?: number;
}
