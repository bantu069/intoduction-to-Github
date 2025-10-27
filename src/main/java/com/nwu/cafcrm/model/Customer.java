package com.nwu.cafcrm.model;

import java.util.HashSet;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;

public class Customer implements Identifiable<UUID> {
	private final UUID id;
	private String name;
	private String email;
	private final Set<String> dietaryPreferences;
	private int loyaltyPoints;

	public Customer(String name, String email) {
		this.id = UUID.randomUUID();
		this.name = name;
		this.email = email;
		this.dietaryPreferences = new HashSet<>();
		this.loyaltyPoints = 0;
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

	public String getEmail() {
		return email;
	}

	public void setEmail(String email) {
		this.email = email;
	}

	public Set<String> getDietaryPreferences() {
		return dietaryPreferences;
	}

	public int getLoyaltyPoints() {
		return loyaltyPoints;
	}

	public void addPoints(int points) {
		this.loyaltyPoints += Math.max(0, points);
	}

	public void redeemPoints(int points) {
		int redeem = Math.max(0, points);
		if (redeem > this.loyaltyPoints) {
			throw new IllegalArgumentException("Insufficient loyalty points");
		}
		this.loyaltyPoints -= redeem;
	}

	@Override
	public boolean equals(Object o) {
		if (this == o) return true;
		if (o == null || getClass() != o.getClass()) return false;
		Customer customer = (Customer) o;
		return Objects.equals(id, customer.id);
	}

	@Override
	public int hashCode() {
		return Objects.hash(id);
	}
}

