package com.nwu.cafcrm.service;

import com.nwu.cafcrm.model.Customer;
import com.nwu.cafcrm.repo.BaseInMemoryRepository;

import java.util.UUID;

public class LoyaltyService {
	private final BaseInMemoryRepository<Customer, UUID> customerRepo;

	public LoyaltyService(BaseInMemoryRepository<Customer, UUID> customerRepo) {
		this.customerRepo = customerRepo;
	}

	public void addPointsForPurchase(UUID customerId, double amountSpent) {
		int points = (int) Math.floor(amountSpent); // 1 point per $1
		customerRepo.findById(customerId).ifPresent(c -> {
			c.addPoints(points);
			customerRepo.save(c);
		});
	}

	public void redeemPoints(UUID customerId, int points) {
		customerRepo.findById(customerId).ifPresent(c -> {
			c.redeemPoints(points);
			customerRepo.save(c);
		});
	}

	public int getPoints(UUID customerId) {
		return customerRepo.findById(customerId).map(Customer::getLoyaltyPoints).orElse(0);
	}
}

