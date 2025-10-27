package com.nwu.cafcrm.model;

import java.util.Objects;
import java.util.UUID;

public class Employee implements Identifiable<UUID> {
	private final UUID id;
	private String name;
	private EmployeeRole role;

	public Employee(String name, EmployeeRole role) {
		this.id = UUID.randomUUID();
		this.name = name;
		this.role = role;
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

	public EmployeeRole getRole() {
		return role;
	}

	public void setRole(EmployeeRole role) {
		this.role = role;
	}

	@Override
	public boolean equals(Object o) {
		if (this == o) return true;
		if (o == null || getClass() != o.getClass()) return false;
		Employee employee = (Employee) o;
		return Objects.equals(id, employee.id);
	}

	@Override
	public int hashCode() {
		return Objects.hash(id);
	}
}

