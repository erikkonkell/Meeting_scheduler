use meeting_scheduler;

DROP PROCEDURE IF EXISTS createConfirmedMeeting;
DROP PROCEDURE IF EXISTS inviteConfirmedAttendent;

DELIMITER ;;
CREATE PROCEDURE createConfirmedMeeting
(
	get_id VARCHAR(30),
	get_hostname VARCHAR(15),
    get_title VARCHAR(30),
    get_start_time TIMESTAMP,
    get_end_time TIMESTAMP,
    get_description VARCHAR(300)
)
BEGIN
	INSERT INTO meetings(id,hostname,title,start_time,end_time,`description`)
    VALUES(get_id,get_hostname,get_title,get_start_time,get_end_time,get_description)
    ;
END
;;

CREATE PROCEDURE inviteConfirmedAttendent
(
	get_attendant_name VARCHAR(15),
    get_meetingID VARCHAR(30)
)
BEGIN
	INSERT INTO attendants(attendant_name, meetingID)
    VALUES (get_attendant_name,get_meetingID)
    ;
END
;;

DELIMITER ;
