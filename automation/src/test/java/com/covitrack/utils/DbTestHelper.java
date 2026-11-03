package com.covitrack.utils;

import com.covitrack.config.TestConfig;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.sql.Statement;

public class DbTestHelper {

    private static String getJdbcUrl() {
        return "jdbc:mysql://" + TestConfig.DB_HOST + ":" + TestConfig.DB_PORT + "/" + TestConfig.TEST_DB_NAME +
                "?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC";
    }

    public static Connection getConnection() throws SQLException {
        return DriverManager.getConnection(getJdbcUrl(), TestConfig.DB_USER, TestConfig.DB_PASS);
    }

    public static boolean isDatabaseAvailable() {
        try (Connection conn = getConnection()) {
            return conn != null && !conn.isClosed();
        } catch (SQLException e) {
            return false;
        }
    }

    public static void cleanTestDatabase() {
        if (!isDatabaseAvailable()) {
            return;
        }

        try (Connection conn = getConnection(); Statement stmt = conn.createStatement()) {
            stmt.execute("SET FOREIGN_KEY_CHECKS = 0;");
            stmt.execute("DELETE FROM audit_logs WHERE 1=1;");
            stmt.execute("DELETE FROM diagnostic_reports WHERE 1=1;");
            stmt.execute("DELETE FROM appointments WHERE 1=1;");
            stmt.execute("DELETE FROM appointment_slots WHERE 1=1;");
            stmt.execute("DELETE FROM patient_profiles WHERE 1=1;");
            stmt.execute("DELETE FROM users WHERE email LIKE '%@covitrack.local%' OR email LIKE '%test.%';");
            stmt.execute("SET FOREIGN_KEY_CHECKS = 1;");
            System.out.println("[DbTestHelper] Cleaned isolated test database synthetic records.");
        } catch (SQLException e) {
            System.err.println("[DbTestHelper Clean Warning] " + e.getMessage());
        }
    }
}

