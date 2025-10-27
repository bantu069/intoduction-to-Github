package com.nwu.cafcrm;

import com.nwu.cafcrm.model.Customer;
import com.nwu.cafcrm.model.Employee;
import com.nwu.cafcrm.model.EmployeeRole;
import com.nwu.cafcrm.model.FoodCategory;
import com.nwu.cafcrm.model.FoodItem;
import com.nwu.cafcrm.model.Purchase;
import com.nwu.cafcrm.model.PurchaseLineItem;
import com.nwu.cafcrm.model.Review;
import com.nwu.cafcrm.repo.BaseInMemoryRepository;
import com.nwu.cafcrm.service.AnalyticsService;
import com.nwu.cafcrm.service.CustomerService;
import com.nwu.cafcrm.service.FeedbackService;
import com.nwu.cafcrm.service.LoyaltyService;
import com.nwu.cafcrm.service.PurchaseService;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

public class App {
	public static void main(String[] args) {
		// Initialize repositories
		var customerRepo = new BaseInMemoryRepository<Customer, UUID>();
		var employeeRepo = new BaseInMemoryRepository<Employee, UUID>();
		var foodRepo = new BaseInMemoryRepository<FoodItem, UUID>();
		var reviewRepo = new BaseInMemoryRepository<Review, UUID>();
		var purchaseRepo = new BaseInMemoryRepository<Purchase, UUID>();

		// Initialize services
		var customerService = new CustomerService(customerRepo);
		var feedbackService = new FeedbackService(reviewRepo);
		var purchaseService = new PurchaseService(purchaseRepo);
		var loyaltyService = new LoyaltyService(customerRepo);
		var analyticsService = new AnalyticsService(foodRepo, reviewRepo, purchaseRepo);

		// Seed data
		var alice = customerService.registerCustomer("Alice Johnson", "alice@example.com");
		var bob = customerService.registerCustomer("Bob Smith", "bob@example.com");

		var emp = new Employee("Eve Manager", EmployeeRole.MANAGER);
		employeeRepo.save(emp);

		var burger = new FoodItem("Beef Burger", FoodCategory.MAIN, 7.99);
		var salad = new FoodItem("Garden Salad", FoodCategory.MAIN, 5.49);
		var coffee = new FoodItem("Cappuccino", FoodCategory.DRINK, 3.25);
		var cake = new FoodItem("Cheesecake", FoodCategory.DESSERT, 4.50);
		foodRepo.save(burger);
		foodRepo.save(salad);
		foodRepo.save(coffee);
		foodRepo.save(cake);

		// Purchases (also award loyalty points)
		var p1 = new Purchase(alice.getId(), List.of(
			new PurchaseLineItem(burger.getId(), 1, burger.getPrice()),
			new PurchaseLineItem(coffee.getId(), 1, coffee.getPrice())
		));
		var p2 = new Purchase(bob.getId(), List.of(
			new PurchaseLineItem(salad.getId(), 2, salad.getPrice()),
			new PurchaseLineItem(cake.getId(), 1, cake.getPrice())
		));
		var p3 = new Purchase(alice.getId(), List.of(
			new PurchaseLineItem(coffee.getId(), 2, coffee.getPrice())
		));

		purchaseService.recordPurchase(p1);
		purchaseService.recordPurchase(p2);
		purchaseService.recordPurchase(p3);

		loyaltyService.addPointsForPurchase(alice.getId(), p1.getTotalAmount());
		loyaltyService.addPointsForPurchase(bob.getId(), p2.getTotalAmount());
		loyaltyService.addPointsForPurchase(alice.getId(), p3.getTotalAmount());

		// Reviews
		feedbackService.addReview(new Review(alice.getId(), burger.getId(), 5, "Delicious!"));
		feedbackService.addReview(new Review(bob.getId(), salad.getId(), 4, "Fresh and tasty."));
		feedbackService.addReview(new Review(alice.getId(), coffee.getId(), 4, "Nice foam."));
		feedbackService.addReview(new Review(bob.getId(), coffee.getId(), 5, "Perfect morning brew."));

		// Analytics
		double totalSales = analyticsService.getTotalSales();
		Map<UUID, Double> avgRatings = analyticsService.getAverageRatingsForFoodItems();
		List<Map.Entry<UUID, Integer>> topSelling = analyticsService.getTopFoodItemsByQuantity(3);

		System.out.println("=== NWU Cafeteria CRM Demo ===");
		System.out.printf("Total Sales: $%.2f%n", totalSales);
		System.out.println("\nAverage Ratings per Item:");
		avgRatings.forEach((foodId, avg) -> {
			var food = foodRepo.findById(foodId).orElse(null);
			if (food != null) {
				System.out.printf("- %s: %.2f/5%n", food.getName(), avg);
			}
		});

		System.out.println("\nTop Selling Items (by quantity):");
		for (var entry : topSelling) {
			var food = foodRepo.findById(entry.getKey()).orElse(null);
			if (food != null) {
				System.out.printf("- %s: %d units%n", food.getName(), entry.getValue());
			}
		}

		System.out.println("\nLoyalty Balances:");
		for (var c : customerService.listCustomers()) {
			System.out.printf("- %s: %d points (LTV $%.2f)%n",
				c.getName(), loyaltyService.getPoints(c.getId()), analyticsService.getCustomerLifetimeValue(c.getId()));
		}

		System.out.println("\nRecent Reviews for Coffee:");
		for (var r : feedbackService.getReviewsForFoodItem(coffee.getId())) {
			var author = customerRepo.findById(r.getCustomerId()).map(Customer::getName).orElse("Unknown");
			System.out.printf("- %s (%s): %d/5 - %s%n", author, r.getCreatedAt(), r.getRating(), r.getComment());
		}
	}
}

