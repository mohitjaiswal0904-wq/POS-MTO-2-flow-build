export interface PopFaq {
  question: string
  answer: string
}

export interface PopFaqSection {
  id: 'general' | 'enrollment' | 'redemption' | 'policy'
  label: string
  items: PopFaq[]
}

export const POP_FAQ_SECTIONS: PopFaqSection[] = [
  {
    id: 'general',
    label: 'General',
    items: [
      {
        question: 'What is the minimum amount I need to pay every month?',
        answer:
          'You can start your Plan of Purchase with a minimum amount of ₹1,000 per month. Amount must be selected in multiples of ₹1,000.',
      },
      {
        question: 'Is there any maximum limit for P-POP?',
        answer:
          'There is no maximum limit. Customers can choose any monthly amount in multiples of ₹1,000.',
      },
      {
        question: 'Is P-POP applicable on all products?',
        answer:
          'P-POP can be redeemed only on 9kt jewellery available at Palmonas. It cannot be used for Purchase of Gift Cards, Coins, or any excluded category as defined by the company.',
      },
      {
        question: 'Can I open more than one P-POP plan?',
        answer:
          'Yes, customers can enroll in more than one plan. If the redemption window is the same and the account details are the same, plans from the same profile can be merged at the time of redemption.',
      },
      {
        question: 'Can I cancel my P-POP plan anytime?',
        answer:
          'The plan cannot be cancelled midway. If the customer stops payments, they can redeem the amount paid so far during the redemption window, but the company bonus shall not be applicable.',
      },
      {
        question: 'Can I change my monthly amount after starting the plan?',
        answer:
          'No. Once the plan has started, the monthly amount cannot be changed. You can start another plan with a different amount if required.',
      },
      {
        question: 'Can I pay the instalment in store every month?',
        answer: 'Yes, payments can be made in store or online using available payment modes.',
      },
      {
        question: 'Who is eligible to enroll?',
        answer:
          'Any Indian resident above 18 years of age having a valid PAN Card can enroll in P-POP',
      },
      {
        question: 'Can the plan be transferred to another person?',
        answer:
          'No, the plan cannot be transferred to another person, only in case of demise, an immediate family member can claim the amount by submitting the death certificate along with an affidavit of truth',
      },
    ],
  },
  {
    id: 'enrollment',
    label: 'Enrollment',
    items: [
      {
        question: 'How do I enroll in the Plan of Purchase?',
        answer:
          'The customer visits the website and chooses the plan with the monthly payment amount → fills details → enters personal and payment details, makes the first payment → plan starts.',
      },
      {
        question: 'When does my plan start?',
        answer: 'The plan starts after the first payment is made.',
      },
      {
        question: 'How many payments do I need to make?',
        answer: 'The customer pays for 5 months, and Palmonas pays for the 6th month.',
      },
      {
        question: 'Can I stop the plan after a few months?',
        answer:
          'Ideally, this is not recommended, and incase you do not pay for the whole term as agreed, the amount paid by the customer during the whole term shall only be processed for redemption. Company bonus will not be added.',
      },
      {
        question: 'Can I start multiple plans with different amounts?',
        answer: 'Yes, customers can start multiple plans with different monthly amounts.',
      },
      {
        question: 'When is my monthly payment due?',
        answer: 'Each payment is due every one month from the date of enrollment',
      },
    ],
  },
  {
    id: 'redemption',
    label: 'Redemption',
    items: [
      {
        question: 'When can I redeem my P-POP amount?',
        answer:
          'Redemption is allowed from Day 151 to Day 210 from the first date of payment start of the plan.',
      },
      {
        question: 'What is the redemption window?',
        answer:
          'Customers get a 60-day redemption window starting from the 150th day of payment',
      },
      {
        question: 'Can I redeem partially?',
        answer: 'No, the full amount must be redeemed at once.',
      },
      {
        question: 'What happens if I do not redeem within the redemption window?',
        answer:
          'A voucher of the total amount that you deposited within 5 months (without the bonus amount) will be available, which can be redeemed at once for only 9kt Palmonas jewellery purchase.',
      },
      {
        question: 'Can I redeem before completing all payments?',
        answer: 'No, early redemption is not allowed',
      },
      {
        question: 'Can I buy jewellery worth more than my P-POP amount?',
        answer: 'Yes, customers can pay the remaining balance using any payment mode.',
      },
      {
        question: 'Can I redeem online and in store?',
        answer:
          'Yes, redemption can be done both online and at Palmonas stores. (only on 9kt gold jewellery purchases)',
      },
      {
        question: 'Can I redeem multiple plans together?',
        answer:
          'Yes, if the plans has the same redemption window and same account details.',
      },
    ],
  },
  {
    id: 'policy',
    label: 'Policy',
    items: [
      {
        question: 'What happens if the product is returned after purchase?',
        answer:
          'If the product is returned within the 2-day return window as per our standard return policy, the full amount paid will be refunded in the form of a one-time-use credit voucher, which can be used at once within the next 1 month.',
      },
      {
        question: 'Is P-POP refundable to bank account?',
        answer: 'No bank refunds are allowed',
      },
    ],
  },
]

export const POP_TERMS: string[] = [
  'The scheme tenure is 5 months, with a minimum enrolment amount per month of ₹1,000.',
  'The enrolment amount must be in multiples of ₹1,000.',
  'The date on which the first monthly instalment is paid by the customer shall be considered as enrolment date. For the purpose of this Scheme, the due date shall be the same date as the Enrolment Date for the subsequent months.',
  'The scheme shall end at the completion of 5 months from the date of first instalment',
  'An amount equivalent to one month’s instalment shall be provided to the customer on behalf of the company as an additional benefit at the time of redemption.',
  'The additional one month’s instalment paid by the company is a non-cash promotional item and cannot be claimed as a cash component at any period.',
  'The redemption must be completed within 60 days of completion of 5 months term period.',
  'In case the customer fails to redeem the maturity amount within scope of 60 days, the company shall share a credit voucher/ gift card to the customer and the same shall be available for redemption.',
  'This scheme can be clubbed with any other ongoing offers, promotions, or discounts except for any special event discounts like birthdays, anniversary etc which are running in the redemption period.',
  'The item purchased in lieu of the scheme cannot be exchanged for cash.',
  'Two different POP (Plan of Purchase) accounts can be clubbed [subject to both accounts being in the same customer ID] but the benefit of one account can be extended at the time of redemption.',
  'NACH is not possible for this scheme.',
  'Additional benefit at the time of Redemption is subject to availability.',
  'Scheme benefits shall be applicable only up to the amount accumulated under the scheme. If the customer purchases 9kt jewellery exceeding the eligible scheme amount, the excess value shall be charged. No additional scheme benefits or offers shall be applicable on the excess value.',
  'Payment of instalments after due dates will be considered as a default, for that month and the eligible discount would be reduced proportionately.',
  'Any Pre-Maturity requests shall not be accepted, other than medical emergencies subject to documents being submitted with a time frame of 24 hours for the company to approve.',
  'The discretion to approve is with the company,',
  'In case of missed payments of instalments or if the customer fails to make payments on agreed terms every month, the customer shall not be eligible for the additional instalment.',
  'The customer shall make payment on the agreed date every month, and a delay of more than 4 days from the due date shall be considered as a material breach.',
  'Any kind of material breach shall make the customer ineligible for this scheme.',
  'The company has the right to change the terms and conditions as per its discretion and shall be intimated to the customer through mail and shall be updated on the website.',
  'Any conditions that are not explicitly covered above would be at the discretion of the Company at the time of transaction/redemption. The decision of the Company in this regard would be deemed irrevocable and final. Disputes, if any, shall be resolved in the courts of Pune jurisdiction only.',
  'In case of non-cash payment mode, there is no restriction on accumulated amount provided the customer submits the PAN card if accumulation exceeds ₹1,50,000/-. For monthly instalments amounting to ₹19,000/- or above, PAN Card of the Customer shall be collected as mandatory KYC Proof.',
  'Only Individuals above the age of 18 can enrol for the Scheme. The Company reserves the right to obtain proof for the same from a customer.',
  'Entities such as companies, partnership firms or proprietorship concerns or trusts or Hindu Undivided Family (HUF) or NRIs, international users and minors (under the age of 18 years) are not eligible to enrol under the Scheme.',
  'The Customer may cancel the Scheme during the tenure of the Scheme; however, the amount of monthly instalment deposited by the Customer can be redeemed only against the purchase of 9kt gold jewellery. In the event of partial completion of the scheme, no benefit/discount will be provided by the Company. The Customer shall not be refunded money by way of Cheque/Cash/online transfer.',
  'The Company reserves the right to alter, amend, add, or delete part or whole of the terms of the Scheme without prior notice to the customer, if the same is not detrimental to the interests of the customer.',
  'The liability of the Company or its franchisee(s) under the Scheme is limited to the extent of instalments paid by the Customer(s) and the accrued discount amount, as per Scheme and the Terms & Conditions contained herein.',
  'The Terms & Conditions listed herein do not in any way indicate any assurance or warranty whatsoever by the Company.',
  'The Customer must maintain correct and updated contact details and payment details with the company once enrolled. The company will not be liable for any loss to the Customer as a result of incorrect or out-of-date information provided to the Company.',
  'The Customer shall not have recourse to any damages, costs, or interest.',
]
