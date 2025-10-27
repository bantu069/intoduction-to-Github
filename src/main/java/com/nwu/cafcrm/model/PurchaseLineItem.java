package com.nwu.cafcrm.model;

import java.util.Objects;
import java.util.UUID;

public class PurchaseLineItem {
	private final UUID foodItemId;
	private final int quantity;
	private final double unitPrice;

	public PurchaseLineItem(UUID foodItemId, int quantity, double unitPrice) {
		if (quantity <= 0) throw new IllegalArgumentException("quantity must be > 0");
		if (unitPrice < 0) throw new IllegalArgumentException("unitPrice must be >= 0");
		this.foodItemId = foodItemId;
		this.quantity = quantity;
		this.unitPrice = unitPrice;
	}

	public UUID getFoodItemId() {
		return foodItemId;
	}

	public int getQuantity() {
		return quantity;
	}

	public double getUnitPrice() {
		return unitPrice;
	}

	public double getLineTotal() {
		return unitPrice * quantity;
	}

	@Override
	public boolean equals(Object o) {
		if (this == o) return true;
		if (o == null || getClass() != o.getClass()) return false;
		PurchaseLineItem that = (PurchaseLineItem) o;
		return quantity == that.quantity && Double.compare(that.unitPrice, unitPrice) == 0 && Objects.equals(foodItemId, that.foodItemId);
	}

	@Override
	public int hashCode() {
		return Objects.hash(foodItemId, quantity, unitPrice);
	}
}

