use meeting_scheduler;

DROP PROCEDURE IF EXISTS deleteFromInviteMeeting;
SET SQL_SAFE_UPDATES = 0;

DELIMITER ;;
/*Delete a meeting invitation that has been confirmed this should be called after a meeting has been created*/
CREATE PROCEDURE deleteFromInviteMeeting
(
	get_id VARCHAR(30)
)
BEGIN 
	DELETE FROM invite_Meeting
    WHERE id = get_id
    ;
    DELETE FROM validate_time
    WHERE invite_id = get_id
    ;
    DELETE FROM invite_users
    WHERE invite_id = get_id
    ;
END
;;
DELIMITER ;