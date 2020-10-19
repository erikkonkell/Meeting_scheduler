DROP DATABASE IF EXISTS meeting_scheduler;

CREATE DATABASE meeting_scheduler;
DROP USER IF EXISTS 'user';

CREATE USER 'user'
	IDENTIFIED WITH mysql_native_password
    BY 'pass'
;

GRANT ALL PRIVILEGES
	ON meeting_scheduler.*
    TO 'user'@'%'
;