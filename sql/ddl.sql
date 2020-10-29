use meeting_scheduler;
/*drop tables with FOREIGN KEY first and order is important*/
DROP TABLE IF EXISTS `attendants`;

/*drop in any order*/
DROP TABLE IF EXISTS `meetings`;
DROP TABLE IF EXISTS `invite_users`;
DROP TABLE IF EXISTS `users`;
DROP TABLE IF EXISTS `validate_time`;
DROP TABLE IF EXISTS `invite_Meeting`;

CREATE TABLE `users`(
	`id` VARCHAR(30) NOT NULL 	UNIQUE,
	`username` VARCHAR(15) NOT NULL UNIQUE,
    `pass` VARCHAR(70) NOT NULL,
    `email` VARCHAR(70) NOT NULL UNIQUE,
    /*if you want to know how long ago a account was in use
	  only useful ig you want to be able to remove unactive accounts
    */
    `last_active` TIMESTAMP,
    
    PRIMARY KEY (username)
)
ENGINE = InnoDB;

CREATE TABLE meetings(
	`id` VARCHAR(30) NOT NULL,
    hostname VARCHAR(15),
    title VARCHAR(30),
    start_time TIMESTAMP,
    end_time TIMESTAMP,
    description VARCHAR(300),
    PRIMARY KEY(id)
)
ENGINE = InnoDB;

CREATE TABLE attendants(
	attendant_name VARCHAR(15) NOT NULL,
    meetingID VARCHAR(30),
    FOREIGN KEY (attendant_name) REFERENCES users(username),
    FOREIGN KEY (meetingID) REFERENCES meetings(id)
)
ENGINE = InnoDB;

CREATE TABLE `invite_Meeting`(
	`id` VARCHAR(30) NOT NULL,
    hostname VARCHAR(15),
    title VARCHAR(30),
    description VARCHAR(300),
    creationtime TIMESTAMP, 
    PRIMARY KEY(id)
)
ENGINE = InnoDB;

CREATE Table `validate_time`(
	start_time TIMESTAMP,
    end_time TIMESTAMP,
    response BOOL,
    invite_id VARCHAR(30) NOT NULL,
    invite_user VARCHAR(15) NOT NULL
)
ENGINE = InnoDB;
CREATE TABLE invite_users(
	invite_id VARCHAR(30) NOT NULL,
    invite_user VARCHAR(15) NOT NULL
    
    /*
    PRIMARY KEY(invite_id),
    FOREIGN KEY (invite_id) REFERENCES invite_Meeting(id),
    FOREIGN KEY (invite_user) REFERENCES users(username)
    */
)
ENGINE = InnoDB;

select * FROM users;