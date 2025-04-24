-- MySQL Dump from PostgreSQL structure

-- DROP & CREATE TABLES

DROP TABLE IF EXISTS `attendance`;
CREATE TABLE `attendance` (
  `id` VARCHAR(255) NOT NULL,
  `session_id` VARCHAR(32),
  `student_id` VARCHAR(32),
  `status` VARCHAR(255),
  `checkin_time` TIME(6),
  `attendance_type` VARCHAR(255),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `class_student`;
CREATE TABLE `class_student` (
  `id` VARCHAR(255) NOT NULL,
  `class_id` VARCHAR(255),
  `student_id` VARCHAR(255),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `course`;
CREATE TABLE `course` (
  `id` VARCHAR(255) NOT NULL,
  `subject_name` VARCHAR(255),
  `subject_code` VARCHAR(255),
  `created_at` DATE,
  `created_by` VARCHAR(255),
  `description` TEXT,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `course_class`;
CREATE TABLE `course_class` (
  `id` VARCHAR(255) NOT NULL,
  `course_id` VARCHAR(255),
  `teacher_id` VARCHAR(255),
  `semester` VARCHAR(255),
  `room` VARCHAR(255),
  `schedule` JSON,
  `created_at` DATE,
  `create_by` VARCHAR(255),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `event`;
CREATE TABLE `event` (
  `id` VARCHAR(255) NOT NULL,
  `event_name` VARCHAR(255),
  `event_date` VARCHAR(255),
  `event_time` DATE,
  `location` VARCHAR(255),
  `staff_id` VARCHAR(255),
  `description` VARCHAR(255),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `event_student`;
CREATE TABLE `event_student` (
  `id` VARCHAR(255) NOT NULL,
  `student_id` VARCHAR(255),
  `event_id` VARCHAR(255),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `role`;
CREATE TABLE `role` (
  `id` VARCHAR(255) NOT NULL,
  `role_name` VARCHAR(255),
  `created_at` DATE,
  `created_by` VARCHAR(255),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `session`;
CREATE TABLE `session` (
  `id` VARCHAR(255) NOT NULL,
  `class_id` VARCHAR(255),
  `session_date` DATE,
  `start_time` TIME(6),
  `end_time` TIME(6),
  `status` VARCHAR(255),
  `reason` VARCHAR(255),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `staff`;
CREATE TABLE `staff` (
  `id` VARCHAR(255) NOT NULL,
  `staff_id` VARCHAR(255),
  `name` VARCHAR(255),
  `department` VARCHAR(255),
  `position` VARCHAR(255),
  `staff_type` VARCHAR(255),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `student`;
CREATE TABLE `student` (
  `id` VARCHAR(255) NOT NULL,
  `student_id` VARCHAR(255),
  `major` VARCHAR(255),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `user`;
CREATE TABLE `user` (
  `id` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `first_name` VARCHAR(255),
  `last_name` VARCHAR(255),
  `phone` VARCHAR(255),
  `role` VARCHAR(255),
  `active` TINYINT DEFAULT 1,
  `image_path` VARCHAR(255),
  `created_by` VARCHAR(255),
  `created_at` DATE,
  `student_id` VARCHAR(32),
  `password` VARCHAR(255) NOT NULL,
  `oauth_id` VARCHAR(255),
  `oauth_provider` VARCHAR(255),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- FOREIGN KEYS

ALTER TABLE `attendance` ADD CONSTRAINT `fk_att_session` FOREIGN KEY (`session_id`) REFERENCES `session` (`id`);

ALTER TABLE `class_student` 
  ADD CONSTRAINT `fk_classstudent_courseclass` FOREIGN KEY (`class_id`) REFERENCES `course_class` (`id`),
  ADD CONSTRAINT `fk_classstudent_user` FOREIGN KEY (`student_id`) REFERENCES `user` (`id`);

ALTER TABLE `course_class` 
  ADD CONSTRAINT `fk_course_class` FOREIGN KEY (`course_id`) REFERENCES `course` (`id`);

ALTER TABLE `event` 
  ADD CONSTRAINT `fk_event_stafff` FOREIGN KEY (`staff_id`) REFERENCES `user` (`id`);

ALTER TABLE `event_student` 
  ADD CONSTRAINT `fk_event` FOREIGN KEY (`event_id`) REFERENCES `event` (`id`),
  ADD CONSTRAINT `fk_st_event` FOREIGN KEY (`student_id`) REFERENCES `user` (`id`);

ALTER TABLE `session` 
  ADD CONSTRAINT `fk_class_csclass` FOREIGN KEY (`class_id`) REFERENCES `course_class` (`id`);

ALTER TABLE `staff` 
  ADD CONSTRAINT `fk_staff_user` FOREIGN KEY (`staff_id`) REFERENCES `user` (`id`);

ALTER TABLE `student` 
  ADD CONSTRAINT `fk_st_user` FOREIGN KEY (`student_id`) REFERENCES `user` (`id`);

ALTER TABLE `user` 
  ADD CONSTRAINT `fk_user_role` FOREIGN KEY (`role`) REFERENCES `role` (`id`);
