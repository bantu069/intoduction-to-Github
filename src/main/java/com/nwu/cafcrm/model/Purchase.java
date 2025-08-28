package com.nwu.cafcrm.model;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

public class Purchase implements Identifiable<UUID> {
	private final UUID id;
	private final UUID customerId;
	private final List<PurchaseLineItem> items;
	private final LocalDateTime purchasedAt;

	public Purchase(UUID customerId, List<PurchaseLineItem> items) {
		this.id = UUID.randomUUID();
		this.customerId = customerId;
		this.items = new ArrayList<>(items);
		this.purchasedAt = LocalDateTime.now();
	}

	@Override
	public UUID getId() {
		return id;
	}

	public UUID getCustomerId() {
		return customerId;
	}

	public List<PurchaseLineItem> getItems() {
		return List.copyOf(items);
	}

	public LocalDateTime getPurchasedAt() {
		return purchasedAt;
	}

	public double getTotalAmount() {
		return items.stream().mapToDouble(PurchaseLineItem::getLineTotal).sum();
	}

	@Override
	public boolean equals(Object o) {
		if (this == o) return true;
		if (o == null || getClass() != o.getClass()) return false;
		Purchase purchase = (Purchase) o;
		return Objects.equals(id, purchase.id);
	}

	@Override
	public int hashCode() {
		return Objects.hash(id);
	}
}

