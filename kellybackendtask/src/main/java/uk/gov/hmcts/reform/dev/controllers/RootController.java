package uk.gov.hmcts.reform.dev.controllers;

import static org.springframework.http.ResponseEntity.ok;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class RootController {

  /**
   * Simple root endpoint returning a welcome message.
   *
   * <p>Acts as a smoke-test-able URL ("/") to confirm the application starts and responds without
   * requiring authentication or complex setup.
   */
  @GetMapping("/")
  public ResponseEntity<String> welcome() {
    return ok("Welcome to test-backend");
  }
}
