Feature: Buy Investment
  As an Investor
  I want to buy an investment
  So that I can add assets to my portfolio

  Scenario: Buy Investment Successfully
    Given the user is authenticated as "investor@deepsea.com" with password "Password123!"
    When the user buys asset "AAPL" with quantity 10 and price 150.0
    Then a BUY transaction should be created
    And portfolio holdings quantity for "AAPL" should be 10

  Scenario: Asset Name Missing
    Given the user is authenticated as "investor@deepsea.com" with password "Password123!"
    When the user attempts to buy investment with empty asset ID
    Then transaction request should fail with status 400

  Scenario: Invalid Quantity
    Given the user is authenticated as "investor@deepsea.com" with password "Password123!"
    When the user attempts to buy "AAPL" with quantity 0 and price 150.0
    Then transaction request should fail with status 400

  Scenario: Invalid Purchase Price
    Given the user is authenticated as "investor@deepsea.com" with password "Password123!"
    When the user attempts to buy "AAPL" with quantity 10 and price 0
    Then transaction request should fail with status 400
