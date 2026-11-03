package com.covitrack.utils;

import java.util.Random;

public class TestDataGenerator {
    private static final Random RANDOM = new Random();

    public static String generateRandomName() {
        String[] firstNames = {"Aarav", "Priya", "Rahul", "Sneha", "Vikram", "Ananya", "Rohan", "Pooja"};
        String[] lastNames = {"Sharma", "Verma", "Patel", "Reddy", "Mehta", "Iyer", "Nair", "Singh"};
        return firstNames[RANDOM.nextInt(firstNames.length)] + " " + lastNames[RANDOM.nextInt(lastNames.length)];
    }

    public static String generateRandomEmail() {
        long timestamp = System.currentTimeMillis();
        int rand = RANDOM.nextInt(9000) + 1000;
        return "test.patient." + timestamp + "." + rand + "@covitrack.local";
    }

    public static String generateRandomMobile() {
        // Generates exactly 10 digits: starts with 9, 8, 7, or 6, followed by 9 numeric digits
        int prefix = 6 + RANDOM.nextInt(4);
        long nineDigits = 100_000_000L + (long) (RANDOM.nextDouble() * 900_000_000L);
        return String.valueOf(prefix) + String.valueOf(nineDigits);
    }

    public static String generateSynthetic12DigitId() {
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < 12; i++) {
            sb.append(RANDOM.nextInt(10));
        }
        return sb.toString();
    }
}

