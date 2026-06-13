Feature: Sell Investment
  As an Investor
  I want to sell investments
  So that I can realize gains or losses

  Scenario: Sell Investment Successfully
    Given the user is authenticated as "investor@deepsea.com" with password "Password123!"
    And the user has investment for "AAPL" with quantity 15 and purchase price 150.0
    When the user sells investment "AAPL" with quantity 5 and price 160.0
    Then a SELL transaction should be created
    And portfolio holdings quantity for "AAPL" should be 10

  Scenario: Sell Entire Holding
    Given the user is authenticated as "investor@deepsea.com" with password "Password123!"
    And the user has investment for "AAPL" with quantity 15 and purchase price 150.0
    When the user sells investment "AAPL" with quantity 15 and price 160.0
    Then a SELL transaction should be created
    And portfolio holdings quantity for "AAPL" should be 0

  Scenario: Sell More Than Available Quantity
    Given the user is authenticated as "investor@deepsea.com" with password "Password123!"
    And the user has investment for "AAPL" with quantity 15 and purchase price 150.0
    When the user attempts to sell "AAPL" with quantity 20 and price 160.0
    Then transaction request should fail with status 400
