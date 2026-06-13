Feature: Sell Investment UI

  As an Investor
  I want to sell investments using the UI dialog
  So that I can realize gains or losses visually

  Scenario: Sell Investment Successfully
    Given the user is authenticated on the UI as "investor@deepsea.com" with password "Password123!"
    And the user has investments in database:
      | symbol | quantity | purchasePrice |
      | AAPL   | 10       | 150.0         |
    And the user navigates to the holdings page
    When the user clicks the sell action for row "AAPL"
    Then the sell modal dialog should open
    When the user enters quantity "4" in sell modal
    And the user clicks the submit sell button inside dialog
    Then the sell modal dialog should close
    And the holdings table should display symbol "AAPL" with quantity "6"

  Scenario: Sell More Than Available Quantity
    Given the user is authenticated on the UI as "investor@deepsea.com" with password "Password123!"
    And the user has investments in database:
      | symbol | quantity | purchasePrice |
      | AAPL   | 10       | 150.0         |
    And the user navigates to the holdings page
    When the user clicks the sell action for row "AAPL"
    Then the sell modal dialog should open
    When the user enters quantity "12" in sell modal
    And the user clicks the submit sell button inside dialog
    Then the error alert "Insufficient quantity to sell" should be displayed inside dialog
