Feature: Profit Loss Calculation & Performance Percentage

  Scenario: Calculate Profit
    Given quantity is 100
    And purchase price is 50
    And current value is 60
    When profit loss is calculated
    Then profit loss should equal 1000

  Scenario: Calculate Loss
    Given quantity is 100
    And purchase price is 60
    And current value is 50
    When profit loss is calculated
    Then profit loss should equal -1000

  Scenario: Calculate Positive Return
    Given purchase price is 100
    And current value is 120
    When return percentage is calculated
    Then return percentage should equal 20

  Scenario: Calculate Negative Return
    Given purchase price is 100
    And current value is 80
    When return percentage is calculated
    Then return percentage should equal -20
