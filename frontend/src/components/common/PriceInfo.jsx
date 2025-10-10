export const ingredients = {
  샴페인: { unit: "병", price: 90000 },
  와인: { unit: "병", price: 72000 },
  커피: { unit: "포트", price: 18000 },
  바게트: { unit: "개", price: 2000 },
  빵: { unit: "개", price: 1500 },
  샐러드: { unit: "접시", price: 8000 },
  스테이크: { unit: "접시", price: 30000 },
  베이컨: { unit: "인분", price: 5000 },
  에그스크램블: { unit: "인분", price: 6000 },
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
      units.wineUnit === "잔" ? ingredient.price / 6 : ingredient.price;
  }
  if (itemName === "샴페인") {
    unitPrice =
      units.champagneUnit === "잔" ? ingredient.price / 6 : ingredient.price;
  }
  if (itemName === "커피") {
    unitPrice =
      units.coffeeUnit === "잔" ? ingredient.price / 6 : ingredient.price;
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
