package com.nwu.cafcrm.service;

import com.nwu.cafcrm.model.FoodItem;
import com.nwu.cafcrm.model.Purchase;
import com.nwu.cafcrm.model.PurchaseLineItem;
import com.nwu.cafcrm.model.Review;
import com.nwu.cafcrm.repo.BaseInMemoryRepository;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

public class AnalyticsService {
	private final BaseInMemoryRepository<FoodItem, UUID> foodRepo;
	private final BaseInMemoryRepository<Review, UUID> reviewRepo;
	private final BaseInMemoryRepository<Purchase, UUID> purchaseRepo;

	public AnalyticsService(
		BaseInMemoryRepository<FoodItem, UUID> foodRepo,
		BaseInMemoryRepository<Review, UUID> reviewRepo,
		BaseInMemoryRepository<Purchase, UUID> purchaseRepo
	) {
		this.foodRepo = foodRepo;
		this.reviewRepo = reviewRepo;
		this.purchaseRepo = purchaseRepo;
	}

	public double getTotalSales() {
		return purchaseRepo.findAll().stream().mapToDouble(Purchase::getTotalAmount).sum();
	}

	public Map<UUID, Double> getAverageRatingsForFoodItems() {
		Map<UUID, List<Integer>> ratings = new HashMap<>();
		for (var r : reviewRepo.findAll()) {
			ratings.computeIfAbsent(r.getFoodItemId(), k -> new ArrayList<>()).add(r.getRating());
		}
		Map<UUID, Double> avg = new HashMap<>();
		ratings.forEach((foodId, list) -> {
			double a = list.stream().mapToInt(i -> i).average().orElse(0.0);
			avg.put(foodId, a);
		});
		return avg;
	}

	public List<Map.Entry<UUID, Integer>> getTopFoodItemsByQuantity(int limit) {
		Map<UUID, Integer> counts = new HashMap<>();
		for (var p : purchaseRepo.findAll()) {
			for (PurchaseLineItem item : p.getItems()) {
				counts.merge(item.getFoodItemId(), item.getQuantity(), Integer::sum);
			}
		}
		return counts.entrySet().stream()
			.sorted(Map.Entry.comparingByValue(Comparator.reverseOrder()))
			.limit(Math.max(1, limit))
			.toList();
	}

	public double getCustomerLifetimeValue(UUID customerId) {
		return purchaseRepo.findAll().stream()
			.filter(p -> p.getCustomerId().equals(customerId))
			.mapToDouble(Purchase::getTotalAmount)
			.sum();
	}
}

