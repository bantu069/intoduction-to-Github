package com.nwu.cafeteria.controller;

import com.nwu.cafeteria.model.Feedback;
import com.nwu.cafeteria.repo.FeedbackRepository;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;

import jakarta.servlet.http.HttpServletRequest;

import java.util.Arrays;
import java.util.List;

@Controller
public class WebController {
	private static final List<String> CAFETERIAS = Arrays.asList(
		"Student Centre",
		"Engineering",
		"Science",
		"Law",
		"Education",
		"Health Sciences",
		"Commerce",
		"Residence A",
		"Residence B"
	);

	private final FeedbackRepository feedbackRepository;

	public WebController(FeedbackRepository feedbackRepository) {
		this.feedbackRepository = feedbackRepository;
	}

	@GetMapping("/")
	public String index(@RequestParam(name = "ok", required = false) String ok, Model model) {
		model.addAttribute("cafeterias", CAFETERIAS);
		model.addAttribute("ok", ok != null);
		return "index";
	}

	@PostMapping("/submit")
	public String submit(@RequestParam("cafeteria") String cafeteria,
						@RequestParam("rating") Integer rating,
						@RequestParam(name = "comments", required = false) String comments,
						HttpServletRequest request) {
		if (!CAFETERIAS.contains(cafeteria) || rating == null || rating < 1 || rating > 5) {
			return "redirect:/";
		}
		Feedback f = new Feedback();
		f.setCafeteria(cafeteria);
		f.setRating(rating);
		f.setComments(StringUtils.hasText(comments) ? comments.trim() : null);
		String ip = request.getHeader("X-Forwarded-For");
		if (!StringUtils.hasText(ip)) ip = request.getRemoteAddr();
		f.setIpAddress(ip);
		f.setUserAgent(request.getHeader("User-Agent"));
		feedbackRepository.save(f);
		return "redirect:/?ok=1";
	}

	@GetMapping("/dashboard")
	public String dashboard(Model model) {
		model.addAttribute("cafeterias", CAFETERIAS);
		return "dashboard";
	}
}

