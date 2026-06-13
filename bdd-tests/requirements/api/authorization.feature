Feature: API Security
  As an API Client
  I want my requests to be validated
  So that unauthorized requests are rejected

  Scenario: Access Protected API With Token
    Given the user is authenticated as "investor@deepsea.com" with password "Password123!"
    When the user calls protected portfolio API with valid JWT token
    Then data should be returned

  Scenario: Access Protected API Without Token
    When the user calls protected portfolio API without JWT token
    Then request should be rejected with status 401

  Scenario: Access Protected API With Expired Token
    Given an invalid or expired JWT token
    When the user calls protected portfolio API with expired JWT token
    Then request should be rejected with status 401
