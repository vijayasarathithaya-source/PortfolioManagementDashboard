Feature: Buy Investment UI

  As an Investor
  I want to buy investments using the UI dialog
  So that my positions table updates reactively

  Scenario: Buy New Investment Successfully
    Given the user is authenticated on the UI as "investor@deepsea.com" with password "Password123!"
    And the user has no investments in database
    And the user navigates to the dashboard page
    When the user clicks the "Buy Investment" empty state button
    Then the buy modal dialog should open
    When the user selects the asset type filter pill "Stocks"
    And the user selects the asset symbol "AAPL" from dropdown
    Then the purchase price field should be prefilled with a random price
    When the user enters quantity "10" in buy modal
    And the user clicks the "Buy" button inside dialog
    Then the buy modal dialog should close
    And the holdings table should display symbol "AAPL" with quantity "10"

  Scenario: Asset Name Validation UI
    Given the user is authenticated on the UI as "investor@deepsea.com" with password "Password123!"
    And the user navigates to the dashboard page
    When the user clicks the "Buy Investment" empty state button
    Then the buy modal dialog should open
    When the user clicks the "Buy" button inside dialog
    Then the validation error "This field is required" or equivalent should be shown for asset field
