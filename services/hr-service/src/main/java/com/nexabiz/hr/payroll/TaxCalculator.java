package com.nexabiz.hr.payroll;

import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;

/**
 * Zimbabwe ZIMRA PAYE + NSSA tax calculator
 * Rates current as of 2025 tax year
 */
@Component
public class TaxCalculator {

    private static final BigDecimal PAYE_THRESHOLD   = BigDecimal.valueOf(700);
    private static final BigDecimal PAYE_BAND_1_MAX  = BigDecimal.valueOf(2_000);
    private static final BigDecimal PAYE_BAND_2_MAX  = BigDecimal.valueOf(5_000);
    private static final BigDecimal PAYE_BAND_1_RATE = BigDecimal.valueOf(0.20);
    private static final BigDecimal PAYE_BAND_2_RATE = BigDecimal.valueOf(0.25);
    private static final BigDecimal PAYE_BAND_3_RATE = BigDecimal.valueOf(0.30);
    private static final BigDecimal NSSA_RATE        = BigDecimal.valueOf(0.035);
    private static final BigDecimal NSSA_CAP         = BigDecimal.valueOf(700);

    /**
     * Calculate monthly PAYE tax (Zimbabwe 2025 brackets)
     */
    public BigDecimal calculatePAYE(BigDecimal monthlySalary) {
        if (monthlySalary.compareTo(PAYE_THRESHOLD) <= 0) {
            return BigDecimal.ZERO;
        }
        if (monthlySalary.compareTo(PAYE_BAND_1_MAX) <= 0) {
            return monthlySalary.subtract(PAYE_THRESHOLD)
                    .multiply(PAYE_BAND_1_RATE)
                    .setScale(2, RoundingMode.HALF_UP);
        }
        if (monthlySalary.compareTo(PAYE_BAND_2_MAX) <= 0) {
            return BigDecimal.valueOf(260)
                    .add(monthlySalary.subtract(PAYE_BAND_1_MAX).multiply(PAYE_BAND_2_RATE))
                    .setScale(2, RoundingMode.HALF_UP);
        }
        return BigDecimal.valueOf(1_010)
                .add(monthlySalary.subtract(PAYE_BAND_2_MAX).multiply(PAYE_BAND_3_RATE))
                .setScale(2, RoundingMode.HALF_UP);
    }

    /**
     * Calculate NSSA contribution (3.5% capped at $700/month)
     */
    public BigDecimal calculateNSSA(BigDecimal monthlySalary) {
        return monthlySalary.multiply(NSSA_RATE)
                .min(NSSA_CAP)
                .setScale(2, RoundingMode.HALF_UP);
    }

    /**
     * Calculate total deductions
     */
    public BigDecimal totalDeductions(BigDecimal gross) {
        return calculatePAYE(gross).add(calculateNSSA(gross)).setScale(2, RoundingMode.HALF_UP);
    }

    /**
     * Calculate net pay
     */
    public BigDecimal netPay(BigDecimal gross) {
        return gross.subtract(totalDeductions(gross)).setScale(2, RoundingMode.HALF_UP);
    }
}
