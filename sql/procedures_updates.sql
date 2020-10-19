DROP PROCEDURE IF EXISTS updateVotingValues;

USE meeting_scheduler;
/* need to do this to be able to change valus in tables */
SET SQL_SAFE_UPDATES = 0;

DELIMITER ;;
CREATE PROCEDURE updateVotingValues(
	get_start_time VARCHAR(19),
    get_end_time VARCHAR(19),
    get_response BOOL,
    get_invite_id VARCHAR(30),
    get_invite_user VARCHAR(15)
)
BEGIN
	UPDATE validate_time
	SET response = get_response
	WHERE start_time = get_start_time and
			end_time = get_end_time and
            invite_id = get_invite_id and 
            invite_user = get_invite_user
    ;
    SELECT 
    response
    from
    validate_time
    ;
END
;;

DELIMITER ;
