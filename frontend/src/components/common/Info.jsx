export const ingredients = {
  샴페인: { unit: "병", price: 25000 },
  와인: { unit: "병", price: 20000 },
  커피: { unit: "포트", price: 10000 },
  바게트: { unit: "개", price: 2000 },
  빵: { unit: "개", price: 1500 },
  샐러드: { unit: "접시", price: 6000 },
  스테이크: { unit: "접시", price: 20000 },
  베이컨: { unit: "인분", price: 4000 },
  에그스크램블: { unit: "인분", price: 5000 },
}; // 잔은 1/5로 계산

export const unitConversion = {
  잔: 0.2, // 1잔 = 0.2 병/포트
  병: 1,
  포트: 1,
};

export const defaultStock = {
  샴페인: 20,
  와인: 50,
  커피: 90,
  바게트: 150,
  빵: 60,
  샐러드: 60,
  스테이크: 210,
  베이컨: 60,
  에그스크램블: 60,
};

export const staff = {
  cook: [
    ["A", { userId: null, cartedTime: null }],
    ["B", { userId: null, cartedTime: null }],
    ["C", { userId: null, cartedTime: null }],
    ["D", { userId: null, cartedTime: null }],
    ["E", { userId: null, cartedTime: null }],
  ],
  delivery: [
    ["가", { userId: null, cartedTime: null }],
    ["나", { userId: null, cartedTime: null }],
    ["다", { userId: null, cartedTime: null }],
    ["라", { userId: null, cartedTime: null }],
    ["마", { userId: null, cartedTime: null }],
  ],
};

export const styles = {
  simple: 0,
  grand: 5000,
  deluxe: 10000,
};

// 단가 기반으로 각 항목 가격 계산 함수
export const calculateItemPrice = (itemName, qty, units) => {
  const ingredient = ingredients[itemName];
  if (!ingredient) return 0;

  let unitPrice = ingredient.price;

  // units: { wineUnit, champagneUnit, coffeeUnit }
  if (itemName === "와인") {
    unitPrice =
      units.wineUnit === "잔" ? ingredient.price / 5 : ingredient.price;
  }
  if (itemName === "샴페인") {
    unitPrice =
      units.champagneUnit === "잔" ? ingredient.price / 5 : ingredient.price;
  }
  if (itemName === "커피") {
    unitPrice =
      units.coffeeUnit === "잔" ? ingredient.price / 5 : ingredient.price;
    if (units.coffeeUnit === "포트") unitPrice = ingredient.price;
  }

  return unitPrice * qty;
};

// 스타일 가격 계산
export const calculateStylePrice = (selectedStyle) => {
  if (!selectedStyle) return 0;
  return styles[selectedStyle] || 0;
};

// 총 가격 계산
export const calculateTotalPrice = (quantities, selectedStyle, units) => {
  const itemsPrice = Object.entries(quantities).reduce(
    (sum, [name, qty]) => sum + calculateItemPrice(name, qty, units),
    0
  );
  return itemsPrice + calculateStylePrice(selectedStyle);
};
