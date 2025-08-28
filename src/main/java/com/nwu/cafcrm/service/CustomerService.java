package com.nwu.cafcrm.service;

import com.nwu.cafcrm.model.Customer;
import com.nwu.cafcrm.repo.BaseInMemoryRepository;

import java.util.Collection;
import java.util.Optional;
import java.util.UUID;

public class CustomerService {
	private final BaseInMemoryRepository<Customer, UUID> customerRepo;

	public CustomerService(BaseInMemoryRepository<Customer, UUID> customerRepo) {
		this.customerRepo = customerRepo;
	}

	public Customer registerCustomer(String name, String email) {
		Customer c = new Customer(name, email);
		return customerRepo.save(c);
	}

	public Optional<Customer> getCustomer(UUID id) {
		return customerRepo.findById(id);
	}

	public Collection<Customer> listCustomers() {
		return customerRepo.findAll();
	}
}

