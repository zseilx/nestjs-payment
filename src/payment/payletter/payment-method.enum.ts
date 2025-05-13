// import { PayletterServiceName } from 'generated/prisma';

// enum PayletterServiceName {
//     CREDIT_CARD
//     BANK_TRANSFER
//     VIRTUAL_ACCOUNT
//     MOBILE
//     VOUCHER
//     BOOK
//     CULTURE
//     SMART_CULTURE
//     HAPPY_MONEY
//     MOBILE_POP
//     TEEN_CASH
//     T_MONEY
//     CVS
//     EGG_MONEY
//     ON_CASH
//     PHONE_BILL
//     CASHBEE
//     KAKAOPAY
//     PAYCO
//     CHECKPAY
//     TOSS
//     SSGPAY
//     NAVERPAY
//     SAMSUNGPAY
//     APPLEPAY
//   }

// export const PayletterCode: Record<PayletterServiceName, string> = {
//   [PayletterServiceName.CREDIT_CARD]: 'creditcard',
//   [PayletterServiceName.BANK_TRANSFER]: 'banktransfer',
//   [PayletterServiceName.VIRTUAL_ACCOUNT]: 'virtualaccount',
//   [PayletterServiceName.MOBILE]: 'mobile',
//   [PayletterServiceName.VOUCHER]: 'voucher',
//   [PayletterServiceName.BOOK]: 'book',
//   [PayletterServiceName.CULTURE]: 'culture',
//   [PayletterServiceName.SMART_CULTURE]: 'smartculture',
//   [PayletterServiceName.HAPPY_MONEY]: 'happymoney',
//   [PayletterServiceName.MOBILE_POP]: 'mobilepop',
//   [PayletterServiceName.TEEN_CASH]: 'teencash',
//   [PayletterServiceName.T_MONEY]: 'tmoney',
//   [PayletterServiceName.CVS]: 'cvs',
//   [PayletterServiceName.EGG_MONEY]: 'eggmoney',
//   [PayletterServiceName.ON_CASH]: 'oncash',
//   [PayletterServiceName.PHONE_BILL]: 'phonebill',
//   [PayletterServiceName.CASHBEE]: 'cashbee',
//   [PayletterServiceName.KAKAOPAY]: 'kakaopay',
//   [PayletterServiceName.PAYCO]: 'payco',
//   [PayletterServiceName.CHECKPAY]: 'checkpay',
//   [PayletterServiceName.TOSS]: 'toss',
//   [PayletterServiceName.SSGPAY]: 'ssgpay',
//   [PayletterServiceName.NAVERPAY]: 'naverpay',
//   [PayletterServiceName.SAMSUNGPAY]: 'samsungpay',
//   [PayletterServiceName.APPLEPAY]: 'applepay',
// };

// const PayletterCodeToPaymentMethod: Record<string, PaymentMethod> =
//   Object.entries(PaymentMethodToPayletterCode).reduce(
//     (acc, [enumKey, code]) => {
//       acc[code] = enumKey as PaymentMethod;
//       return acc;
//     },
//     {} as Record<string, PaymentMethod>,
//   );
