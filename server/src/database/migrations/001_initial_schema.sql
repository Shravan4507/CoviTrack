-- Migration: 001_initial_schema.sql
-- Description: Create initial core tables for CoviTrack

CREATE TABLE IF NOT EXISTS `users` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `full_name` VARCHAR(100) NOT NULL,
    `email` VARCHAR(150) NOT NULL UNIQUE,
    `mobile_number` VARCHAR(15) NOT NULL UNIQUE,
    `password_hash` VARCHAR(255) NOT NULL,
    `role` ENUM('patient', 'staff', 'admin') NOT NULL DEFAULT 'patient',
    `account_status` ENUM('active', 'inactive', 'suspended') NOT NULL DEFAULT 'active',
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_users_role` (`role`),
    INDEX `idx_users_email` (`email`),
    INDEX `idx_users_mobile` (`mobile_number`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `patient_profiles` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL UNIQUE,
    `patient_id_number` VARCHAR(30) NOT NULL UNIQUE,
    `date_of_birth` DATE NOT NULL,
    `address` TEXT NOT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT `fk_patient_profiles_user` FOREIGN KEY (`user_id`) 
        REFERENCES `users` (`id`) ON DELETE CASCADE,
    INDEX `idx_patient_id_number` (`patient_id_number`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `appointment_slots` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `start_time` DATETIME NOT NULL,
    `end_time` DATETIME NOT NULL,
    `max_capacity` INT NOT NULL DEFAULT 10,
    `current_bookings` INT NOT NULL DEFAULT 0,
    `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
    `created_by` INT NOT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT `fk_slots_created_by` FOREIGN KEY (`created_by`) 
        REFERENCES `users` (`id`) ON DELETE RESTRICT,
    INDEX `idx_slots_start_time` (`start_time`),
    INDEX `idx_slots_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `appointments` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `patient_id` INT NOT NULL,
    `slot_id` INT NOT NULL,
    `test_type` VARCHAR(50) NOT NULL DEFAULT 'RT-PCR',
    `booking_reference` VARCHAR(50) NOT NULL UNIQUE,
    `status` ENUM('booked', 'confirmed', 'completed', 'cancelled') NOT NULL DEFAULT 'booked',
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT `fk_appointments_patient` FOREIGN KEY (`patient_id`) 
        REFERENCES `users` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_appointments_slot` FOREIGN KEY (`slot_id`) 
        REFERENCES `appointment_slots` (`id`) ON DELETE RESTRICT,
    INDEX `idx_appointments_status` (`status`),
    INDEX `idx_appointments_patient` (`patient_id`),
    INDEX `idx_appointments_slot` (`slot_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `diagnostic_reports` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `appointment_id` INT NOT NULL UNIQUE,
    `patient_id` INT NOT NULL,
    `report_reference` VARCHAR(50) NOT NULL UNIQUE,
    `test_result` ENUM('positive', 'negative', 'inconclusive') NOT NULL,
    `testing_date` DATE NOT NULL,
    `staff_id` INT NOT NULL,
    `notes` TEXT NULL,
    `pdf_path` VARCHAR(255) NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT `fk_reports_appointment` FOREIGN KEY (`appointment_id`) 
        REFERENCES `appointments` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_reports_patient` FOREIGN KEY (`patient_id`) 
        REFERENCES `users` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_reports_staff` FOREIGN KEY (`staff_id`) 
        REFERENCES `users` (`id`) ON DELETE RESTRICT,
    INDEX `idx_reports_result` (`test_result`),
    INDEX `idx_reports_date` (`testing_date`),
    INDEX `idx_reports_patient` (`patient_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `audit_logs` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NULL,
    `action` VARCHAR(100) NOT NULL,
    `entity_type` VARCHAR(50) NOT NULL,
    `entity_id` INT NULL,
    `ip_address` VARCHAR(45) NULL,
    `details` TEXT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_audit_user` FOREIGN KEY (`user_id`) 
        REFERENCES `users` (`id`) ON DELETE SET NULL,
    INDEX `idx_audit_action` (`action`),
    INDEX `idx_audit_entity` (`entity_type`, `entity_id`),
    INDEX `idx_audit_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

