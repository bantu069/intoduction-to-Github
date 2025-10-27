package com.nwu.cafeteria.repo;

import com.nwu.cafeteria.model.Feedback;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FeedbackRepository extends JpaRepository<Feedback, Long> {
}

