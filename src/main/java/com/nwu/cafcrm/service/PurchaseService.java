package com.nwu.cafcrm.service;

import com.nwu.cafcrm.model.Purchase;
import com.nwu.cafcrm.repo.BaseInMemoryRepository;

import java.util.Collection;
import java.util.UUID;

public class PurchaseService {
	private final BaseInMemoryRepository<Purchase, UUID> purchaseRepo;

	public PurchaseService(BaseInMemoryRepository<Purchase, UUID> purchaseRepo) {
		this.purchaseRepo = purchaseRepo;
	}

	public Purchase recordPurchase(Purchase purchase) {
		return purchaseRepo.save(purchase);
	}

	public Collection<Purchase> getPurchasesByCustomer(UUID customerId) {
		return purchaseRepo.findWhere(p -> p.getCustomerId().equals(customerId));
	}

	public Collection<Purchase> listAllPurchases() {
		return purchaseRepo.findAll();
	}
}

