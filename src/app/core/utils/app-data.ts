import { FileTypes } from '../../enum/file-types.enum';
import { Select } from '../../interfaces/core/select';


export const defaultUploadImage = '/assets/images/avatar/image-upload.jpg';

export const DATA_BOOLEAN: Select[] = [
  { value: true, viewValue: 'Yes' },
  { value: false, viewValue: 'No' },
];

export const VENDOR_ROLES: Select[] = [
  { value: 'admin', viewValue: 'Admin' },
  { value: 'manager', viewValue: 'Manager' },
  { value: 'editor', viewValue: 'Editor' },
];

export const PAGES: Select[] = [
  { "value": "dashboard", "viewValue": "Dashboard" },
  { "value": "orders", "viewValue": "Orders" },
  { "value": "products", "viewValue": "Products" },
  { "value": "settings", "viewValue": "Settings" },
  { "value": "customization", "viewValue": "Customization" },
  { "value": "catalog", "viewValue": "Catalog" },
  { "value": "landing-page", "viewValue": "Landing page" },
  { "value": "coupon", "viewValue": "Coupon" },
  { "value": "review", "viewValue": "Review" },
  { "value": "customer", "viewValue": "Customer" },
  { "value": "gallery", "viewValue": "Gallery" },
  { "value": "additional-pages", "viewValue": "Additional Pages" },
  { "value": "seo-pages", "viewValue": "Seo Pages" },
  { "value": "admin-control", "viewValue": "Admin Control" },
  { "value": "Support", "viewValue": "Support" },
  { "value": "Tutorials", "viewValue": "Tutorials" },
  { "value": "New Release", "viewValue": "New Release" },
  { "value": "profile", "viewValue": "Profile" },
  { "value": "expense", "viewValue": "Expense" },
  { "value": "affiliate", "viewValue": "Affiliate" },
  { "value": "accounts", "viewValue": "Accounts" },
  { "value": "pos", "viewValue": "Pos" },
  // POS Sub-pages
  { "value": "pos-dashboard", "viewValue": "POS Dashboard" },
  { "value": "pos-sales", "viewValue": "POS Sales" },
  { "value": "pos-customer", "viewValue": "POS Customer" },
  { "value": "pos-supplier", "viewValue": "POS Supplier" },
  { "value": "pos-purchase", "viewValue": "POS Purchase" },
  { "value": "pos-reports", "viewValue": "POS Reports" },
  { "value": "pos-accounts", "viewValue": "POS Accounts" },
  { "value": "pos-stock-management", "viewValue": "POS Stock Management" },
]


export const PERMISSIONS: Select[] = [
  { value: 'add', viewValue: 'Add' },
  { value: 'edit', viewValue: 'Edit' },
  { value: 'delete', viewValue: 'Delete' }
];

export const ADMIN_ROLES: Select[] = [
  { value: 'super_admin', viewValue: 'Admin' },
  { value: 'admin', viewValue: 'Manager' },
  { value: 'editor', viewValue: 'User' },
];

export const SMS_PROVIDERS: Select[] = [
  { value: 'Bulk SMS BD', viewValue: 'Bulk SMS BD', country: 'Bangladesh' },
  { value: 'iSMS Plus SSL Wireless', viewValue: 'iSMS Plus SSL Wireless', country: 'Bangladesh' },
  { value: 'Smsq BD', viewValue: 'Smsq BD', country: 'Bangladesh' },
  { value: 'Revesms', viewValue: 'Revesms', country: 'Bangladesh' },
  { value: 'Elitbuzz', viewValue: 'Elitbuzz', country: 'Bangladesh' },
  { value: 'Twilio', viewValue: 'Twilio', country: 'international' },
  { value: 'SMS.TO', viewValue: 'SMS.TO', country: 'international' },
];


export const COURIER_PROVIDERS: Select[] = [
  { value: 'Steadfast Courier', viewValue: 'Steadfast Courier' },
  { value: 'Pathao Courier', viewValue: 'Pathao Courier' },
  // {value: 'REDX', viewValue: 'REDX'},

];

export const CURRENCIES: Select[] = [
  { value: '৳', viewValue: 'Bangladesh', code: 'BDT', countryCode: '880' },
  { value: '$', viewValue: 'USA', code: 'USD', countryCode: '1' },
  { value: '€', viewValue: 'Europe', code: 'EUR', countryCode: '' }, // No single country code
  { value: '$', viewValue: 'Singapore', code: 'SGD', countryCode: '65' },
  { value: 'AED', viewValue: 'Dubai', code: 'AED', countryCode: '971' },
  { value: '£', viewValue: 'UK', code: 'GBP', countryCode: '44' }
];


export const COUNTRIES: Select[] = [
  { value: 'BD', viewValue: 'Bangladesh', code: 'BD', countryCode: '880' },
  { value: 'US', viewValue: 'USA', code: 'US', countryCode: '1' },
  { value: 'CA', viewValue: 'Canada', code: 'CA', countryCode: '1' },
  { value: 'SG', viewValue: 'Singapore', code: 'SG', countryCode: '65' },
  { value: 'AE', viewValue: 'Dubai', code: 'AE', countryCode: '971' },
  { value: 'UK', viewValue: 'England', code: 'UK', countryCode: '44' }
];

export const PAYMENT_PROVIDERS: Select[] = [
  { value: 'Bkash', viewValue: 'Bkash', country: 'Bangladesh' },
  { value: 'Nagad', viewValue: 'Nagad', country: 'Bangladesh' },
  { value: 'Rocket', viewValue: 'Rocket', country: 'Bangladesh' },
  { value: 'SSl Commerz', viewValue: 'SSl Commerz', country: 'Bangladesh' },
  { value: 'Binance', viewValue: 'Binance', country: 'Bangladesh' },
  { value: 'Stripe', viewValue: 'Stripe', country: 'International' },
];

export const PAYMENT_METHODS: Select[] = [
  { value: 'Bkash', viewValue: 'Bkash' },
  { value: 'Nagad', viewValue: 'Nagad' },
  { value: 'Rocket', viewValue: 'Rocket' },
  { value: 'SSL', viewValue: 'SSL' },
  { value: 'Card', viewValue: 'Card' },
  { value: 'Binance', viewValue: 'Binance' },
];

export const PAYMENT_PROVIDERS_TYPES: any[] = [
  {
    value: 'api',
    viewValue: 'Bkash Api (Automatic Payment)',
    provider: 'Bkash'
  },
  {
    value: 'sent-money',
    viewValue: 'Sent Money (Manual)',
    provider: 'Bkash'
  },
  {
    value: 'payment',
    viewValue: 'Payment (Manual)',
    provider: 'Bkash'
  },
  {
    value: 'sent-money',
    viewValue: 'Sent Money (Manual)',
    provider: 'Nagad'
  },
  {
    value: 'payment',
    viewValue: 'Payment (Manual)',
    provider: 'Nagad'
  },
  {
    value: 'payment',
    viewValue: 'Payment (Manual)',
    provider: 'Binance'
  },
  {
    value: 'sent-money',
    viewValue: 'Sent Money (Manual)',
    provider: 'Rocket'
  },
  {
    value: 'payment',
    viewValue: 'Payment (Manual)',
    provider: 'Rocket'
  },
  {
    value: 'api',
    viewValue: 'SSl Commerz Api (Automatic Payment)',
    provider: 'SSl Commerz'
  },
  {
    value: 'api',
    viewValue: 'Stripe Api (Automatic Payment)',
    provider: 'Stripe'
  },
];


export const BINANCE_METHODS: Select[] = [
  { value: 'TRC20', viewValue: 'TRC20' },
  { value: 'ERC20', viewValue: 'ERC20' },
  // { value: 'BEP20', viewValue: 'BEP20' },
];



export const OVERVIEW_FILTER: Select[] = [
  {
    value: 'today',
    viewValue: 'Today'
  },
  {
    value: 'lastDays',
    viewValue: 'Last Days'
  },
  {
    value: 'thisWeek',
    viewValue: 'This Week'
  },
  {
    value: 'lastWeek',
    viewValue: 'Last Week'
  },
  {
    value: 'last7Days',
    viewValue: 'Last 7 Days'
  },
  {
    value: 'last15Days',
    viewValue: 'Last 15 Days'
  },
  {
    value: 'last30Days',
    viewValue: 'Last 30 Days'
  },
  {
    value: 'thisMonth',
    viewValue: 'This Month'
  },
  {
    value: 'lastMonth',
    viewValue: 'Last Month'
  },
];

export const DISCOUNT_TYPES: Select[] = [
  {
    value: 'Percentage',
    viewValue: 'Percentage'
  },
  {
    value: 'Cash',
    viewValue: 'Cash'
  },
];

export const PACKAGE_TYPES: Select[] = [
  {
    value: 'regular',
    viewValue: 'Regular'
  },
  {
    value: 'premium',
    viewValue: 'Premium'
  },
];

export const DATA_STATUS: Select[] = [
  { value: 'publish', viewValue: 'Publish' },
  { value: 'draft', viewValue: 'Draft' },
];

export const DATA_STATUS1: Select[] = [
  { value: 'approve', viewValue: 'Approve' },
  { value: 'pending', viewValue: 'Pending' },
];


export const PAYMENT_STATUS: Select[] = [
  { value: 'unpaid', viewValue: 'Unpaid' },
  { value: 'paid', viewValue: 'Paid' },
];

export const PAYMENT_TYPES: Select[] = [
  { value: 'cash', viewValue: 'Cash' },
  { value: 'card', viewValue: 'Card' },
  { value: 'bkash', viewValue: 'Bkash' },
  { value: 'nagad', viewValue: 'Nagad' },
  { value: 'rocket', viewValue: 'Rocket' },
  { value: 'due', viewValue: 'Due' },
  { value: 'mixed', viewValue: 'Mixed Payment' },
];

export const ORDER_STATUS: Select[] = [
  { value: 'pending', viewValue: 'Pending' },
  { value: 'confirmed', viewValue: 'Confirm' },
  { value: 'on_hold', viewValue: 'On Hold' },
  { value: 'processing', viewValue: 'Processing' },
  { value: 'shipped', viewValue: 'Shipping' },
  { value: 'sent to courier', viewValue: 'Sent to Courier' },
  { value: 'print', viewValue: 'Print' },
  { value: 'delivered', viewValue: 'Delivered' },
  { value: 'cancelled', viewValue: 'Cancel' },
  { value: 'returned', viewValue: 'Return' },
  { value: 'refunded', viewValue: 'Refund' },
  { value: 'returned receive', viewValue: 'Returned Receive' },
];


export const URL_TYPES: Select[] = [
  { value: 'internal', viewValue: 'Internal' },
  { value: 'external', viewValue: 'External' },
];

export const MAX_UPLOAD: number = 3;
export const MAX_POPUP_UPLOAD: number = 1;

export const BANNER_TYPE: Select[] = [
  { value: 'home-page-top-banner', viewValue: 'Home Page Top Banner' },
  { value: 'home-page-top-banner-one-beside-carousel', viewValue: 'Home Page Top Banner One Beside Carousel (Desktop (244px * 170px)' },
  { value: 'home-page-top-banner-two-beside-carousel', viewValue: 'Home Page Top Banner Two Beside Carousel (Desktop (244px * 170px)' },
  { value: 'banner-one', viewValue: 'Banner One' },
  { value: 'banner-two', viewValue: 'Banner Two' },
  { value: 'banner-three', viewValue: 'Banner Three' },
];

export const TagBannerType: Select[] = [
  { value: 'horizontal', viewValue: 'Horizontal' },
  { value: 'vertical', viewValue: 'Vertical' },
];

export const SEO_PAGE_TYPE: Select[] = [
  { value: 'home-page', viewValue: 'Home Page' },
  { value: 'product-list-page', viewValue: 'Product List Page' },
  { value: 'category-page', viewValue: 'Category Page' },
  { value: 'login-page', viewValue: 'Login Page' },
  { value: 'registration-page', viewValue: 'Registration Page' },
  { value: 'landing-page', viewValue: 'Landing Page' },
];

export const ShowType: Select[] = [
  { value: 'image', viewValue: 'Image' },
  { value: 'video', viewValue: 'Video' },
];

export const DATA_STATUS_2: Select[] = [
  { value: 'publish', viewValue: 'Active' },
  { value: 'draft', viewValue: 'Inactive' },
  { value: 'running', viewValue: 'Running' },
];

export const REPLY_STATUS: Select[] = [
  { value: 'Mail Sent', viewValue: 'Mail Sent' },
  { value: 'Negotiation', viewValue: 'Negotiation' },
  { value: 'Positive', viewValue: 'Positive' },
  { value: 'Negative', viewValue: 'Negative' },
  { value: 'Others', viewValue: 'Others' },
  { value: 'Wrong Email', viewValue: 'Wrong Email' },
  { value: 'Late Respond', viewValue: 'Late Respond' },
];


export const MONTHS: Select[] = [
  { value: 1, viewValue: 'January' },
  { value: 2, viewValue: 'February' },
  { value: 3, viewValue: 'March' },
  { value: 4, viewValue: 'April' },
  { value: 5, viewValue: 'May' },
  { value: 6, viewValue: 'June' },
  { value: 7, viewValue: 'July' },
  { value: 8, viewValue: 'August' },
  { value: 9, viewValue: 'September' },
  { value: 10, viewValue: 'October' },
  { value: 11, viewValue: 'November' },
  { value: 12, viewValue: 'December' },
];



export const YEARS: Select[] = [
  { value: 2024, viewValue: '2024' },
  { value: 2023, viewValue: '2023' },
  { value: 2022, viewValue: '2022' },
];

export const GENDERS: Select[] = [
  { value: 'male', viewValue: 'Male' },
  { value: 'female', viewValue: 'Female' },
  { value: 'others', viewValue: 'Others' },
];

export const THEME_CATEGORIES = [
  {
    _id: '1',
    name: 'E-commerce',
  }
]

export const THEME_SUB_CATEGORIES = [
  {
    _id: '1',
    category: '1',
    name: 'Electronics',
  },
  {
    _id: '2',
    category: '1',
    name: 'Clothing',
  }
]

export const FILE_TYPES: Select[] = [
  { value: FileTypes.IMAGE, viewValue: 'Image' },
  { value: FileTypes.VIDEO, viewValue: 'Video' },
  { value: FileTypes.PDF, viewValue: 'Pdf' }
];


export const TABLE_TAB_DATA: Select[] = [
  { viewValue: "All Data", value: 'all' },
  { viewValue: "Publish", value: 'publish' },
  { viewValue: "Draft", value: 'draft' },
  { viewValue: "Trash", value: 'trash' },
];

export const TABLE_TAB_DATA1: Select[] = [
  { viewValue: "All Data", value: 'all' },
  { value: 'approve', viewValue: 'Approve' },
  { value: 'pending', viewValue: 'Pending' },
  { viewValue: "Trash", value: 'trash' },
];

export const TABLE_TAB_OTHERS: Select[] = [
  { viewValue: "All Data", value: 'all' },
  { viewValue: "Trash", value: 'trash' },
];

export const TABLE_TAB_ORDER_DATA: Select[] = [
  { value: 'all', viewValue: 'All Data' },
  { value: 'pending', viewValue: 'Pending' },
  { value: 'confirmed', viewValue: 'Confirm' },
  { value: 'on_hold', viewValue: 'On Hold' },
  { value: 'processing', viewValue: 'Processing' },
  { value: 'shipped', viewValue: 'Shipped' },
  { value: 'sent to courier', viewValue: 'Sent to Courier' },
  { value: 'delivered', viewValue: 'Delivered' },
  { value: 'cancelled', viewValue: 'Cancelled' },
  { value: 'returned', viewValue: 'Return' },
  { value: 'refunded', viewValue: 'Refund' },
  { value: 'returned receive', viewValue: 'Returned Receive' },
  { value: 'trash', viewValue: 'Trash' },
];


export const DELIVERY_TYPES: Select[] = [
  {
    value: 'regular',
    viewValue: 'Regular Delivery',
    country: 'Bangladesh'
  },
  {
    value: 'express',
    viewValue: 'Express Delivery',
    country: 'Bangladesh'
  },
  {
    value: 'regular',
    viewValue: 'Standard Delivery',
    country: 'Singapore'
  },
  {
    value: 'express',
    viewValue: 'Same-day Delivery',
    country: 'Singapore'
  },
  {
    value: 'free',
    viewValue: 'Free Delivery',
  },
];

export const SOCIAL_LOGIN_TYPES: Select[] = [
  {
    value: 'Google',
    viewValue: 'Google',
  },
  // {
  //   value: 'Facebook',
  //   viewValue: 'Facebook',
  // },
];



export const ADVANCE_PAYMENTS: Select[] = [
  {
    value: 'advance_delivery_payment',
    viewValue: 'Advance Delivery Payment',
  },
  {
    value: 'custom_advance_payment',
    viewValue: 'Custom Advance Payment',
  },
];




export const OFFER_TYPES: Select[] = [
  {
    value: 'new-registration',
    viewValue: 'New Registration',
  },
  {
    value: 'online-payment',
    viewValue: 'Online Payment',
  },
];

export const PROMO_OFFER_TYPES: Select[] = [
  {
    value: 'Product Offer',
    viewValue: 'Product Offer'
  },
  {
    value: 'Banner Offer',
    viewValue: 'Banner Offer'
  },

];


export const CHAT_TYPES: Select[] = [
  {
    value: 'whatsapp',
    viewValue: 'Whatsapp',
  },
  {
    value: 'messenger',
    viewValue: 'Messenger',
  },
  {
    value: 'phone',
    viewValue: 'Phone',
  },
  {
    value: 'telegram',
    viewValue: 'Telegram',
  },
];


export const DOMAIN_TYPES: Select[] = [
  {
    value: 'domain',
    viewValue: 'Domain',
  },
];

export const PDF_MAKE_LOGO = '/assets/images/temp/logo.png';


export const ALL_LOCAL_DOMAIN = {
  Bangladesh: [
    { name: 'BDNIC (BTCL)', url: 'https://www.bdnic.net.bd' },
    { name: 'ExonHost', url: 'https://www.exonhost.com' },
    { name: 'XeonBD', url: 'https://www.xeonbd.com' },
    { name: 'HostMight', url: 'https://www.hostmight.com' },
    { name: 'Alpha Net', url: 'https://www.alphanetbd.com' },
    { name: 'EyHost', url: 'https://www.eyhost.biz' },
    { name: 'Dhaka Web Host', url: 'https://www.dhakawebhost.com' },
    { name: 'Code For Host', url: 'https://www.codeforhost.com' },
    { name: 'Exabytes Singapore', url: 'https://www.exabytes.sg' },
    { name: 'Vodien', url: 'https://www.vodien.com' },
    { name: 'Cybersite', url: 'https://www.cybersite.com.sg' },
    { name: 'Singapore Domain', url: 'https://www.singaporedomain.sg' },
    { name: 'ReadySpace', url: 'https://www.readyspace.com.sg' },
  ],
  Dubai: [
    { name: 'AEserver', url: 'https://www.aeserver.com' },
    { name: 'Tasjeel', url: 'https://www.tasjeel.ae' },
    { name: 'Etisalat', url: 'https://www.etisalat.ae/en/c/hosting/domain-registration.jsp' },
    { name: 'Host Arabia', url: 'https://www.hostarabia.com' },
    { name: 'InstaServe', url: 'https://www.instaserve.com' },
  ],
  Singapore: [
    { name: 'Exabytes Singapore', url: 'https://www.exabytes.sg' },
    { name: 'Vodien', url: 'https://www.vodien.com' },
    { name: 'Cybersite', url: 'https://www.cybersite.com.sg' },
    { name: 'Singapore Domain', url: 'https://www.singaporedomain.sg' },
    { name: 'ReadySpace', url: 'https://www.readyspace.com.sg' },
  ],
  England: [
    { name: '123 Reg', url: 'https://www.123-reg.co.uk' },
    { name: 'UK2', url: 'https://www.uk2.net' },
    { name: 'Names.co.uk', url: 'https://www.names.co.uk' },
    { name: 'Fasthosts', url: 'https://www.fasthosts.co.uk' },
    { name: 'Heart Internet', url: 'https://www.heartinternet.uk' },
  ],
  Canada: [
    { name: 'Hover Canada', url: 'https://www.hover.com' },
    { name: 'Namespro.ca', url: 'https://www.namespro.ca' },
    { name: 'Register.ca', url: 'https://www.register.ca' },
    { name: 'CanSpace Solutions', url: 'https://www.canspace.ca' },
    { name: 'Rebel', url: 'https://www.rebel.com' },
  ],
  USA: [
    { name: 'GoDaddy', url: 'https://www.godaddy.com' },
    { name: 'Namecheap', url: 'https://www.namecheap.com' },
    { name: 'Network Solutions', url: 'https://www.networksolutions.com' },
    { name: 'Domain.com', url: 'https://www.domain.com' },
    { name: 'Name.com', url: 'https://www.name.com' },
  ]
};
