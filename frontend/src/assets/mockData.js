// Mock order data — in production this would come from the ZILO backend
export const MOCK_ORDERS = {
  "ZL-20482": {
    orderId: "ZL-20482",
    customerName: "Priya S.",
    deliveryPartner: "Arjun K.",
    trialWindowMinutes: 30,
    items: [
      {
        id: 1,
        name: "Floral Wrap Dress",
        brand: "TrueBrowns",
        size: "M",
        price: 2499,
        color: "Dusty Rose",
        image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&q=80",
        category: "Dresses"
      },
      {
        id: 2,
        name: "Linen Blazer",
        brand: "AND",
        size: "S",
        price: 3299,
        color: "Ivory",
        image: "https://images.unsplash.com/photo-1594938298603-c8148c4b4e7d?w=400&q=80",
        category: "Workwear"
      },
      {
        id: 3,
        name: "Midi Slip Dress",
        brand: "Vero Moda",
        size: "M",
        price: 1899,
        color: "Sage Green",
        image: "https://images.unsplash.com/photo-1566479179817-c38e8e6ead1e?w=400&q=80",
        category: "Dresses"
      },
      {
        id: 4,
        name: "High-Rise Wide Leg Jeans",
        brand: "Only",
        size: "28",
        price: 2199,
        color: "Classic Blue",
        image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=400&q=80",
        category: "Bottoms"
      }
    ]
  }
};

export const RETURN_REASONS = [
  "Didn't fit right",
  "Not my style",
  "Colour looked different",
  "Quality concern",
  "Changed my mind"
];