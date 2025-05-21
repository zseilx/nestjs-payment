import { PaymentMethod } from 'generated/prisma';

export const PayletterPGCode = {
  creditcard: 'creditcard',
  banktransfer: 'banktransfer',
  virtualaccount: 'virtualaccount',
  mobile: 'mobile',
  voucher: 'voucher',
  book: 'book',
  culture: 'culture',
  smartculture: 'smartculture',
  happymoney: 'happymoney',
  mobilepop: 'mobilepop',
  teencash: 'teencash',
  tmoney: 'tmoney',
  cvs: 'cvs',
  eggmoney: 'eggmoney',
  oncash: 'oncash',
  phonebill: 'phonebill',
  cashbee: 'cashbee',
  kakaopay: 'kakaopay',
  payco: 'payco',
  checkpay: 'checkpay',
  toss: 'toss',
  ssgpay: 'ssgpay',
  naverpay: 'naverpay',
  samsungpay: 'samsungpay',
  applepay: 'applepay',
} as const;

export type PayletterPGCode =
  (typeof PayletterPGCode)[keyof typeof PayletterPGCode];

const paymentMethodToPayletterMap: Record<PaymentMethod, PayletterPGCode> = {
  [PaymentMethod.CARD]: PayletterPGCode.creditcard,
  [PaymentMethod.BANK_TRANSFER]: PayletterPGCode.banktransfer,
  [PaymentMethod.VIRTUAL_ACCOUNT]: PayletterPGCode.virtualaccount,
  [PaymentMethod.MOBILE]: PayletterPGCode.mobile,
  [PaymentMethod.VOUCHER]: PayletterPGCode.voucher,
  [PaymentMethod.BOOK]: PayletterPGCode.book,
  [PaymentMethod.CULTURE]: PayletterPGCode.culture,
  [PaymentMethod.SMART_CULTURE]: PayletterPGCode.smartculture,
  [PaymentMethod.HAPPY_MONEY]: PayletterPGCode.happymoney,
  [PaymentMethod.MOBILE_POP]: PayletterPGCode.mobilepop,
  [PaymentMethod.TEEN_CASH]: PayletterPGCode.teencash,
  [PaymentMethod.T_MONEY]: PayletterPGCode.tmoney,
  [PaymentMethod.CVS]: PayletterPGCode.cvs,
  [PaymentMethod.EGG_MONEY]: PayletterPGCode.eggmoney,
  [PaymentMethod.ON_CASH]: PayletterPGCode.oncash,
  [PaymentMethod.PHONE_BILL]: PayletterPGCode.phonebill,
  [PaymentMethod.CASH_BEE]: PayletterPGCode.cashbee,
  [PaymentMethod.KAKAO_PAY]: PayletterPGCode.kakaopay,
  [PaymentMethod.PAYCO]: PayletterPGCode.payco,
  [PaymentMethod.CHECK_PAY]: PayletterPGCode.checkpay,
  [PaymentMethod.TOSS]: PayletterPGCode.toss,
  [PaymentMethod.SSG_PAY]: PayletterPGCode.ssgpay,
  [PaymentMethod.NAVER_PAY]: PayletterPGCode.naverpay,
  [PaymentMethod.SAMSUNG_PAY]: PayletterPGCode.samsungpay,
  [PaymentMethod.APPLE_PAY]: PayletterPGCode.applepay,
  [PaymentMethod.POINT]: PayletterPGCode.creditcard, // 포인트는 신용카드로 처리
  [PaymentMethod.OTHER]: PayletterPGCode.creditcard, // 기타는 신용카드로 처리
};

export function convertPaymentMethodToPayletter(
  method: PaymentMethod,
): PayletterPGCode {
  return paymentMethodToPayletterMap[method];
}

// 기존 함수는 내부용으로 사용될 수 있으므로 이름만 변경
export function convertPayletterToPaymentMethod(
  pgCode: PayletterPGCode,
): PaymentMethod {
  const reverseMap = Object.entries(paymentMethodToPayletterMap).reduce<
    Record<PayletterPGCode, PaymentMethod>
  >(
    (acc, [method, pgCode]) => {
      acc[pgCode] = method as PaymentMethod;
      return acc;
    },
    {} as Record<PayletterPGCode, PaymentMethod>,
  );
  return reverseMap[pgCode] ?? PaymentMethod.OTHER;
}
