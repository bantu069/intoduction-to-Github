package com.nwu.cafcrm.model;

import java.util.Objects;
import java.util.UUID;

public class FoodItem implements Identifiable<UUID> {
	private final UUID id;
	private String name;
	private FoodCategory category;
	private double price;

	public FoodItem(String name, FoodCategory category, double price) {
		this.id = UUID.randomUUID();
		this.name = name;
		this.category = category;
		this.price = price;
	}

	@Override
	public UUID getId() {
		return id;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public FoodCategory getCategory() {
		return category;
	}

	public void setCategory(FoodCategory category) {
		this.category = category;
	}

	public double getPrice() {
		return price;
	}

	public void setPrice(double price) {
		this.price = price;
	}

	@Override
	public boolean equals(Object o) {
		if (this == o) return true;
		if (o == null || getClass() != o.getClass()) return false;
		FoodItem foodItem = (FoodItem) o;
		return Objects.equals(id, foodItem.id);
	}

	@Override
	public int hashCode() {
		return Objects.hash(id);
	}
}

