package com.covitrack.utils;

import com.covitrack.config.TestConfig;
import org.openqa.selenium.OutputType;
import org.openqa.selenium.TakesScreenshot;
import org.openqa.selenium.WebDriver;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.text.SimpleDateFormat;
import java.util.Date;

public class ScreenshotUtil {

    public static String captureFailureScreenshot(WebDriver driver, String testName) {
        if (driver == null) {
            return null;
        }

        try {
            File srcFile = ((TakesScreenshot) driver).getScreenshotAs(OutputType.FILE);
            String timestamp = new SimpleDateFormat("yyyyMMdd_HHmmss_SSS").format(new Date());
            String sanitizedName = testName.replaceAll("[^a-zA-Z0-9_.-]", "_");
            String fileName = sanitizedName + "_" + timestamp + ".png";

            Path targetDir = Paths.get(TestConfig.SCREENSHOTS_DIR);
            if (!Files.exists(targetDir)) {
                Files.createDirectories(targetDir);
            }

            Path targetPath = targetDir.resolve(fileName);
            Files.copy(srcFile.toPath(), targetPath);
            System.out.println("[Automation Screenshot] Saved failure capture to: " + targetPath.toAbsolutePath());
            return targetPath.toAbsolutePath().toString();
        } catch (IOException e) {
            System.err.println("[Automation Screenshot Error] " + e.getMessage());
            return null;
        }
    }
}

