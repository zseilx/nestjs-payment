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

/**
 * 결제 수단에 따른 환불 가능 기간을 계산합니다.
 * @param pgCode PayletterPGCode
 * @param paidAt 결제 완료 시간
 * @returns 환불 가능 기간 (null: 환불 불가, Date: 환불 가능 마지막 날짜)
 */
export function calculateRefundableDate(
  pgCode: PayletterPGCode,
  paidAt: Date,
): Date | null {
  const cancelableDays = PayletterCancelablePeriod[pgCode];

  // 취소 불가능한 결제 수단
  if (cancelableDays === -1) {
    return null;
  }

  // 당월 취소 가능한 결제 수단
  if (cancelableDays === -2) {
    const lastDayOfMonth = new Date(
      paidAt.getFullYear(),
      paidAt.getMonth() + 1,
      0,
    );
    return lastDayOfMonth;
  }

  // PG사 정책과 서비스 정책 중 더 짧은 기간 적용
  const maxRefundableDays = 14; // 서비스 정책: 최대 14일
  const actualRefundableDays = Math.min(cancelableDays, maxRefundableDays);

  return new Date(
    paidAt.getTime() + actualRefundableDays * 24 * 60 * 60 * 1000,
  );
}

// 결제 수단별 취소 가능 기간 (일 단위)
export const PayletterCancelablePeriod = {
  [PayletterPGCode.creditcard]: 180, // 신용카드: 최대 180일
  [PayletterPGCode.banktransfer]: -1, // 계좌이체: Payletter는 당일, 우리 서비스는 취소 불가
  [PayletterPGCode.virtualaccount]: -1, // 가상계좌: 취소 불가
  [PayletterPGCode.toss]: 180, // 토스: 최대 180일
  [PayletterPGCode.kakaopay]: 180, // 카카오페이: 최대 180일
  [PayletterPGCode.payco]: 180, // 페이코: 최대 180일
  [PayletterPGCode.ssgpay]: 180, // SSG페이: 최대 180일
  [PayletterPGCode.naverpay]: 180, // 네이버페이: 최대 180일
  [PayletterPGCode.samsungpay]: 180, // 삼성페이: 최대 180일
  [PayletterPGCode.applepay]: 180, // 애플페이: 최대 180일
  [PayletterPGCode.checkpay]: 180, // 체크페이: 최대 180일
  [PayletterPGCode.mobile]: -2, // 휴대폰: 당월
  [PayletterPGCode.phonebill]: -2, // KT 집전화결제: 당월
  [PayletterPGCode.voucher]: 24, // 문화상품권: 취소 불가
  [PayletterPGCode.culture]: 24, // 컬처랜드상품권: 취소 불가
  [PayletterPGCode.smartculture]: 24, // 스마트문화상품권: 취소 불가
  [PayletterPGCode.book]: 24, // 도서문화상품권: 취소 불가
  [PayletterPGCode.happymoney]: 24, // 해피머니: 취소 불가
  [PayletterPGCode.mobilepop]: 24, // 모바일팝: 취소 불가
  [PayletterPGCode.teencash]: 24, // 틴캐시: 취소 불가
  [PayletterPGCode.cvs]: 24, // 편의점: 취소 불가
  [PayletterPGCode.eggmoney]: 24, // 이그머니: 취소 불가
  [PayletterPGCode.tmoney]: 24, // 티머니: 취소 불가
  [PayletterPGCode.cashbee]: 24, // 캐시비: 당월 취소 가능
  [PayletterPGCode.oncash]: 24, // 온캐시: 취소 불가
} as const;
