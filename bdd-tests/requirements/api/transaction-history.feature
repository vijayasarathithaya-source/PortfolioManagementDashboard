Feature: View Transaction History
  As an Investor
  I want to review transactions
  So that I can track portfolio activities

  Scenario: Display Transactions
    Given the user is authenticated as "investor@deepsea.com" with password "Password123!"
    And transactions exist for the user
    When the user requests the transaction list
    Then transaction list should be returned

  Scenario: Filter By Transaction Type BUY
    Given the user is authenticated as "investor@deepsea.com" with password "Password123!"
    And transactions exist for the user
    When the user requests the transaction list filtered by type "BUY"
    Then only "BUY" transactions should be returned

  Scenario: Filter By Transaction Type SELL
    Given the user is authenticated as "investor@deepsea.com" with password "Password123!"
    And transactions exist for the user
    When the user requests the transaction list filtered by type "SELL"
    Then only "SELL" transactions should be returned

  Scenario: Filter By Asset Type
    Given the user is authenticated as "investor@deepsea.com" with password "Password123!"
    And transactions exist for the user
    When the user requests the transaction list filtered by asset type "Stocks"
    Then only transactions with asset type "Stocks" should be returned

  Scenario: Filter By Date Range
    Given the user is authenticated as "investor@deepsea.com" with password "Password123!"
    And transactions exist for the user
    When the user requests the transaction list filtered by date range from "2026-06-01" to "2026-06-15"
    Then only transactions within that date range should be returned
