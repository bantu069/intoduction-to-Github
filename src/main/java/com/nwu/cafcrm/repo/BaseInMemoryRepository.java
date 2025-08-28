package com.nwu.cafcrm.repo;

import com.nwu.cafcrm.model.Identifiable;

import java.util.ArrayList;
import java.util.Collection;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.function.Predicate;
import java.util.stream.Collectors;

public class BaseInMemoryRepository<T extends Identifiable<UUID>, ID> {
	private final Map<UUID, T> storage = new ConcurrentHashMap<>();

	public T save(T entity) {
		storage.put((UUID) entity.getId(), entity);
		return entity;
	}

	public Optional<T> findById(UUID id) {
		return Optional.ofNullable(storage.get(id));
	}

	public Collection<T> findAll() {
		return new ArrayList<>(storage.values());
	}

	public void deleteById(UUID id) {
		storage.remove(id);
	}

	public Collection<T> findWhere(Predicate<T> predicate) {
		return storage.values().stream().filter(predicate).collect(Collectors.toList());
	}
}

