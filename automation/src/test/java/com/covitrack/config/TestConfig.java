package com.covitrack.config;

public class TestConfig {
    public static final String BASE_URL = System.getProperty("baseUrl", "http://127.0.0.1:5173");
    public static final String API_BASE_URL = System.getProperty("apiUrl", "http://127.0.0.1:5000/api");

    public static final String DB_HOST = System.getProperty("dbHost", "127.0.0.1");
    public static final int DB_PORT = Integer.parseInt(System.getProperty("dbPort", "3306"));
    public static final String DB_USER = System.getProperty("dbUser", "root");
    public static final String DB_PASS = System.getProperty("dbPass", "");
    public static final String TEST_DB_NAME = System.getProperty("testDbName", "covitrack_test");

    public static final int EXPLICIT_WAIT_SECONDS = 10;
    public static final boolean HEADLESS = Boolean.parseBoolean(System.getProperty("headless", "true"));

    public static final String SCREENSHOTS_DIR = "../test-results/screenshots";
    public static final String LOGS_DIR = "../test-results/logs";
}

