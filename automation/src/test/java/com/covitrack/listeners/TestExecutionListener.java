package com.covitrack.listeners;

import com.covitrack.base.BaseTest;
import com.covitrack.config.TestConfig;
import com.covitrack.utils.ScreenshotUtil;
import org.openqa.selenium.WebDriver;
import org.testng.ITestContext;
import org.testng.ITestListener;
import org.testng.ITestResult;

import java.io.FileWriter;
import java.io.IOException;
import java.io.PrintWriter;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.text.SimpleDateFormat;
import java.util.Date;

public class TestExecutionListener implements ITestListener {

    private PrintWriter logWriter;

    @Override
    public void onStart(ITestContext context) {
        try {
            Path logDir = Paths.get(TestConfig.LOGS_DIR);
            if (!Files.exists(logDir)) {
                Files.createDirectories(logDir);
            }
            Path logFile = logDir.resolve("execution.log");
            logWriter = new PrintWriter(new FileWriter(logFile.toFile(), true));
            log("=== SUITE STARTED: " + context.getName() + " ===");
        } catch (IOException e) {
            System.err.println("[ExecutionListener Error] Could not initialize log file: " + e.getMessage());
        }
    }

    @Override
    public void onTestStart(ITestResult result) {
        log("[START] " + result.getTestClass().getName() + " -> " + result.getMethod().getMethodName());
    }

    @Override
    public void onTestSuccess(ITestResult result) {
        long duration = result.getEndMillis() - result.getStartMillis();
        log("[PASS]  " + result.getMethod().getMethodName() + " (" + duration + " ms)");
    }

    @Override
    public void onTestFailure(ITestResult result) {
        long duration = result.getEndMillis() - result.getStartMillis();
        String testName = result.getMethod().getMethodName();
        log("[FAIL]  " + testName + " (" + duration + " ms) - Reason: " + result.getThrowable());

        Object currentClass = result.getInstance();
        if (currentClass instanceof BaseTest) {
            WebDriver driver = ((BaseTest) currentClass).getDriver();
            if (driver != null) {
                String screenshotPath = ScreenshotUtil.captureFailureScreenshot(driver, testName);
                if (screenshotPath != null) {
                    log("        Failure Screenshot: " + screenshotPath);
                }
            }
        }
    }

    @Override
    public void onTestSkipped(ITestResult result) {
        log("[SKIP]  " + result.getMethod().getMethodName() + " - Reason: " + result.getThrowable());
    }

    @Override
    public void onFinish(ITestContext context) {
        log("=== SUITE FINISHED: " + context.getName() + " [Passed: " + context.getPassedTests().size() +
                ", Failed: " + context.getFailedTests().size() +
                ", Skipped: " + context.getSkippedTests().size() + "] ===\n");
        if (logWriter != null) {
            logWriter.flush();
            logWriter.close();
        }
    }

    private void log(String message) {
        String timestamp = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss.SSS").format(new Date());
        String entry = "[" + timestamp + "] " + message;
        System.out.println(entry);
        if (logWriter != null) {
            logWriter.println(entry);
            logWriter.flush();
        }
    }
}

