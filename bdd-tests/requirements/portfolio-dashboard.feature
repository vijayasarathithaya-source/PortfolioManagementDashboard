Feature: Portfolio Dashboard
  As an Investor
  I want to view my portfolio summary
  So that I can monitor my investments

  Scenario: Display Portfolio Summary
    Given the user is authenticated as "investor@deepsea.com" with password "Password123!"
    And investments exist for the user:
      | symbol | quantity | purchasePrice |
      | AAPL   | 10       | 150.0         |
      | MSFT   | 5        | 300.0         |
    When the dashboard is opened
    Then total portfolio value should be displayed
    And total investment cost should be displayed
    And total profit loss should be displayed
    And total asset count should be 2

  Scenario: No Investments Available
    Given the user is authenticated as "investor@deepsea.com" with password "Password123!"
    And no investments exist for the user
    When the dashboard is opened
    Then total portfolio value should be 0
    And total investment cost should be 0
    And total profit loss should be 0
    And total asset count should be 0
