# CREATE DATABASE IF NOT EXISTS generico;

USE generico;



SET foreign_key_checks = 0;



DROP TABLE IF EXISTS tenants;
CREATE TABLE `tenants` (
  `tenant_id` int(11) NOT NULL AUTO_INCREMENT,
  `uuid` varchar(45) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `active` tinyint(1) DEFAULT 1,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `altered_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`tenant_id`),
  UNIQUE KEY `tenants_uuid_uindex` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

INSERT INTO tenants (uuid, name) VALUES ("6240c87df780d27f4620b3c0", "Master");
INSERT INTO tenants (uuid, name) VALUES ("6240c87df780d27f4620b3c1", "Loja 1");
INSERT INTO tenants (uuid, name) VALUES ("6240c87df780d27f4620b3c2", "Loja 2");
INSERT INTO tenants (uuid, name) VALUES ("6240c87df780d27f4620b3c3", "Loja 3");



DROP TABLE IF EXISTS people;
CREATE TABLE `people` (
  `person_id` int(11) NOT NULL AUTO_INCREMENT,
  `uuid` varchar(45) NOT NULL,
  `tenant_id` int NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `birth_date` date NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `altered_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`person_id`),
  UNIQUE KEY `people_uuid_uindex` (`uuid`),
  KEY `people_tenants_tenant_id_fk` (`tenant_id`),
  CONSTRAINT `people_tenants_tenant_id_fk` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`tenant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

INSERT INTO people (uuid, tenant_id, name, birth_date) VALUES ("6240c87df780d27f4620b3c0", 1, "Leandro Macedo", "1989-03-02");
INSERT INTO people (uuid, tenant_id, name, birth_date) VALUES ("6240c87df780d27f4620b3c1", 1, "Renan Silva", "1989-03-02");



DROP TABLE IF EXISTS users;
CREATE TABLE `users` (
  `user_id` int(11) NOT NULL AUTO_INCREMENT,
  `uuid` varchar(45) NOT NULL,
  `person_id` int NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `active` tinyint(1) DEFAULT 1,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `altered_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `users_uuid_uindex` (`uuid`),
  KEY `users_people_person_id_fk` (`person_id`),
  CONSTRAINT `users_people_person_id_fk` FOREIGN KEY (`person_id`) REFERENCES `people` (`person_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

INSERT INTO users (uuid, person_id, email, password) VALUES ("6240c87df780d27f4620b3c0", 1, "leandro@email.com", "123456");
INSERT INTO users (uuid, person_id, email, password) VALUES ("6240c87df780d27f4620b3c1", 1, "renan@email.com", "123456");



DROP TABLE IF EXISTS tenants_users;
CREATE TABLE `tenants_users` (
  `tenant_user_id` int NOT NULL AUTO_INCREMENT,
  `tenant_id` int NOT NULL,
  `user_id` int NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`tenant_user_id`),
  KEY `tenants_users_tenants_tenant_id_fk` (`tenant_id`),
  KEY `tenants_users_users_user_id_fk` (`user_id`),
  CONSTRAINT `tenants_users_tenants_tenant_id_fk` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`tenant_id`),
  CONSTRAINT `tenants_users_users_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users` (`person_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

INSERT INTO tenants_users (tenant_id, user_id) VALUES (1, 1);
INSERT INTO tenants_users (tenant_id, user_id) VALUES (1, 2);



SET foreign_key_checks = 1;