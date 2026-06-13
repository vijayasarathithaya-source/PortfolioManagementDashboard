Feature: Portfolio Dashboard UI

  As an Investor
  I want to visual check my portfolio metrics on the Dashboard UI
  So that I can analyze my asset distributions

  Scenario: Display Dashboard Summary and Stats Cards
    Given the user is authenticated on the UI as "investor@deepsea.com" with password "Password123!"
    And the user has investments in database:
      | symbol | quantity | purchasePrice |
      | AAPL   | 10       | 150.0         |
      | BND    | 20       | 80.0          |
    And the user navigates to the dashboard page
    Then the "Total Value" stat card should display a positive dollar number
    And the "Total Cost" stat card should display "$3,100.00"
    And the allocation segment details should display "Stocks"
    And the asset share chart center should show "2 Assets"

  Scenario: No Investments Empty State UI
    Given the user is authenticated on the UI as "investor@deepsea.com" with password "Password123!"
    And the user has no investments in database
    And the user navigates to the dashboard page
    Then the empty state placeholder "No Investments Found" should be visible
    And a "Buy Investment" button should be visible in the empty state
