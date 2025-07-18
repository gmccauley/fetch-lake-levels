PRAGMA defer_foreign_keys=TRUE;
CREATE TABLE levels (
    id INTEGER PRIMARY KEY,
    timestamp DATE,
    fetched_on DATETIME,
    full_name VARCHAR(255),
    condensed_name VARCHAR(255),
    short_name VARCHAR(255),
    conservation_pool_elevation FLOAT,
    elevation FLOAT,
    percent_full FLOAT
);
INSERT INTO levels VALUES(1,'2025-07-16','2025-07-17T00:45:08.041Z','Amistad Reservoir','Amistad','Amistad',1117,1055.46,33.6);
INSERT INTO levels VALUES(2,'2025-07-16','2025-07-17T00:45:08.041Z','Canyon Lake','Canyon','Canyon',909,891.03,65.8);
INSERT INTO levels VALUES(3,'2025-07-16','2025-07-17T00:45:08.041Z','Choke Canyon Reservoir','ChokeCanyon','Choke Canyon',220.5,184.29,12.8);
INSERT INTO levels VALUES(4,'2025-07-16','2025-07-17T00:45:08.041Z','Medina Lake','Medina','Medina',1064.2,982.15,5.5);
INSERT INTO levels VALUES(5,'2025-07-16','2025-07-17T00:45:08.041Z','O. H. Ivie Reservoir','OHIvie','O H Ivie',1551.5,1535.7,54.7);
INSERT INTO levels VALUES(6,'2025-07-17','2025-07-17T10:00:51.053Z','Amistad Reservoir','Amistad','Amistad',1117,1055.49,32.2);
INSERT INTO levels VALUES(7,'2025-07-17','2025-07-17T10:00:51.053Z','Canyon Lake','Canyon','Canyon',909,891.51,66.6);
INSERT INTO levels VALUES(8,'2025-07-17','2025-07-17T10:00:51.053Z','Choke Canyon Reservoir','ChokeCanyon','Choke Canyon',220.5,184.26,12.8);
INSERT INTO levels VALUES(9,'2025-07-17','2025-07-17T10:00:51.053Z','Medina Lake','Medina','Medina',1064.2,982.77,5.7);
INSERT INTO levels VALUES(10,'2025-07-17','2025-07-17T10:00:51.053Z','O. H. Ivie Reservoir','OHIvie','O H Ivie',1551.5,1535.71,54.8);
