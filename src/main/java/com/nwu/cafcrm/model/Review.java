package com.nwu.cafcrm.model;

import java.time.LocalDateTime;
import java.util.Objects;
import java.util.UUID;

public class Review implements Identifiable<UUID> {
	private final UUID id;
	private final UUID customerId;
	private final UUID foodItemId;
	private final int rating; // 1-5
	private final String comment;
	private final LocalDateTime createdAt;

	public Review(UUID customerId, UUID foodItemId, int rating, String comment) {
		if (rating < 1 || rating > 5) {
			throw new IllegalArgumentException("Rating must be 1-5");
		}
		this.id = UUID.randomUUID();
		this.customerId = customerId;
		this.foodItemId = foodItemId;
		this.rating = rating;
		this.comment = comment == null ? "" : comment.trim();
		this.createdAt = LocalDateTime.now();
	}

	@Override
	public UUID getId() {
		return id;
	}

	public UUID getCustomerId() {
		return customerId;
	}

	public UUID getFoodItemId() {
		return foodItemId;
	}

	public int getRating() {
		return rating;
	}

	public String getComment() {
		return comment;
	}

	public LocalDateTime getCreatedAt() {
		return createdAt;
	}

	@Override
	public boolean equals(Object o) {
		if (this == o) return true;
		if (o == null || getClass() != o.getClass()) return false;
		Review review = (Review) o;
		return Objects.equals(id, review.id);
	}

	@Override
	public int hashCode() {
		return Objects.hash(id);
	}
}

