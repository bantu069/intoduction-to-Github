package com.nwu.cafcrm.service;

import com.nwu.cafcrm.model.Review;
import com.nwu.cafcrm.repo.BaseInMemoryRepository;

import java.util.Collection;
import java.util.UUID;

public class FeedbackService {
	private final BaseInMemoryRepository<Review, UUID> reviewRepo;

	public FeedbackService(BaseInMemoryRepository<Review, UUID> reviewRepo) {
		this.reviewRepo = reviewRepo;
	}

	public Review addReview(Review review) {
		return reviewRepo.save(review);
	}

	public Collection<Review> getReviewsForFoodItem(UUID foodId) {
		return reviewRepo.findWhere(r -> r.getFoodItemId().equals(foodId));
	}

	public double getAverageRatingForFoodItem(UUID foodId) {
		var reviews = getReviewsForFoodItem(foodId);
		return reviews.isEmpty() ? 0.0 : reviews.stream().mapToInt(Review::getRating).average().orElse(0.0);
	}
}

