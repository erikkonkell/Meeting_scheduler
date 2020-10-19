use meeting_scheduler;
DROP PROCEDURE IF EXISTS login;
DROP PROCEDURE IF EXISTS register;
DROP PROCEDURE IF EXISTS getuserbyname;
DROP PROCEDURE IF EXISTS getuserbymail;
DROP PROCEDURE IF EXISTS getuserbyid;
DROP PROCEDURE IF EXISTS createMeeting;
DROP PROCEDURE IF EXISTS addAttendantToMeeting;
DROP PROCEDURE IF EXISTS initializeMeeting;
DROP PROCEDURE IF EXISTS initializeAttendant;
DROP PROCEDURE IF EXISTS initializeTimeForVoting;
DROP PROCEDURE IF EXISTS getUserInvitations;
DROP PROCEDURE IF EXISTS getInviteTime;
DROP PROCEDURE IF EXISTS getSelectedInviteVote;
DROP PROCEDURE IF EXISTS getHostedMeetings;
DROP PROCEDURE IF EXISTS getMeetingVotes;
DROP PROCEDURE IF EXISTS getVotesForMeeting;

DELIMITER ;;
CREATE PROCEDURE login(
 get_user VARCHAR(15),
 get_pass VARCHAR(70)
)
BEGIN
	UPDATE users SET
		last_active = NOW()
	WHERE get_user = username AND get_pass = pass    
	;
    SELECT 
    username,
    pass
    FROM users
    WHERE get_user = username AND get_pass = pass
    ;
END
;;

CREATE PROCEDURE register(
	set_id VARCHAR(40),
	set_user VARCHAR(15),
    set_pass VARCHAR(70),
    set_email VARCHAR(70)
)
BEGIN
	INSERT INTO users (id, username, pass, email, last_active)
		VALUE(set_id, set_user, set_pass, set_email, NOW())
	;
END
;;

CREATE PROCEDURE getuserbyname(
	get_user VARCHAR(15)
)
BEGIN
	SELECT 
		*
	From users
    WHERE username = get_user
    ;
END
;;
CREATE PROCEDURE getuserbyid(
	get_id VARCHAR(40)
)
BEGIN
	SELECT
		*
    FROM users
    WHERE get_id = id
    ;
END
;;

CREATE PROCEDURE getuserbymail(
	get_email VARCHAR(70)
)
BEGIN
	SELECT
    *
    FROM users
    WHERE get_email = email
;
END
;;

CREATE PROCEDURE createMeeting(
	get_id VARCHAR(30),
	get_host VARCHAR(15),
	get_title VARCHAR(30),
	get_start_time TIMESTAMP,
    get_end_time TIMESTAMP,
	get_description VARCHAR(300)
)
BEGIN
	INSERT INTO meetings (id,hostname,title,start_time, end_time, description)
	VALUES (get_id,get_host,get_title,get_start_time, get_end_time, get_description);
    SELECT *
    FROM meetings 
    WHERE get_host = hostname AND get_title = title
    ;
END
;;

CREATE PROCEDURE addAttendantToMeeting(
	get_attendant VARCHAR(15),
    get_meetingID VARCHAR(30)
)
BEGIN
	INSERT INTO attendants (attendant_name,meetingID)
    VALUES (get_attendant, get_meetingID);
END
;;

CREATE PROCEDURE initializeMeeting(
	get_id VARCHAR(30),
	get_hostname VARCHAR(15),
    get_title VARCHAR(30),
    get_description VARCHAR(300)
)
BEGIN
	INSERT INTO invite_Meeting(id,hostname,title,description,creationtime)
    VALUES(get_id,get_hostname,get_title,get_description,NOW())
    ;
END
;;
CREATE PROCEDURE initializeTimeForVoting(
	get_start_time TIMESTAMP,
    get_end_time TIMESTAMP,
    get_invite_id VARCHAR(30),
    get_invite_user VARCHAR(15)
)
BEGIN
	INSERT INTO validate_time(start_time,end_time,invite_id,invite_user)
    VALUES(get_start_time, get_end_time, get_invite_id, get_invite_user)
    ;
END
;;

CREATE PROCEDURE initializeAttendant(
	get_invite_id VARCHAR(30),
    get_invite_user VARCHAR(15)
)
BEGIN
	INSERT INTO  invite_users(invite_id,invite_user)
    VALUES(get_invite_id,get_invite_user)
    ;
END
;;

CREATE PROCEDURE getUserInvitations
(
	get_users_id VARCHAR(30)
)
BEGIN 
	SELECT 
		im.id as 'meetingID',
		im.hostname as 'host',
		im.title as 'title',
		im.description as 'description'
	From invite_users as iu
	LEFT JOIN invite_Meeting as im ON iu.invite_id=im.id
	LEFT JOIN users on iu.invite_user = users.username
	WHERE users.id = get_users_id
	;
END
;;

CREATE PROCEDURE getInviteTime
(
	get_invite_id VARCHAR(30),
    get_userID VARCHAR(30)
)
BEGIN
	SELECT 
		*
	FROM validate_time as vt
	LEFT JOIN invite_Meeting as im on vt.invite_id = im.id
	Left JOIN invite_users as iu on im.id = iu.invite_id
	WHERE iu.invite_user = get_userID
	;
END
;;

CREATE PROCEDURE getSelectedInviteVote
(
	get_user_id VARCHAR(30),
    get_meeting_id VARCHAR(30)
)
BEGIN
	SELECT
		vt.response,
		vt.start_time,
		vt.end_time,
		im.title,
		im.hostname,
		im.description,
		users.username
	FROM users
	LEFT JOIN validate_time vt ON  users.username = vt.invite_user
	LEFT JOIN invite_Meeting as im ON vt.invite_id=im.id
	WHERE users.id = get_user_id and im.id = get_meeting_id
	;
END
;;

CREATE PROCEDURE getHostedMeetings(
	get_user_id VARCHAR(30)
)
BEGIN
	select
		im.id,
		im.title,
		im.description
	from users 
	left join invite_Meeting as im on users.username = im.hostname 
	Where users.id = get_user_id
	;
END
;;

CREATE PROCEDURE getMeetingVotes(
	get_id VARCHAR(30)
)
BEGIN
	SELECT
		im.id,
		im.title,
		im.description,
		vt.start_time,
		vt.end_time,
		SUM(if(vt.response = 1, 1, 0)) as antal
		FROM invite_Meeting AS im
		LEFT JOIN validate_time AS vt ON  im.id = vt.invite_id
		WHERE im.id = get_id
		GROUP BY vt.start_time,vt.end_time
		ORDER BY antal DESC       
	;
END
;;

CREATE PROCEDURE getVotesForMeeting
(
	get_id VARCHAR(30),
    get_start_time TIMESTAMP,
    get_end_time TIMESTAMP
)
BEGIN
	SELECT
		vt.start_time,
		vt.end_time,
		response,
		vt.invite_user,
		im.hostname
		FROM validate_time as vt
		LEFT Join invite_Meeting as im on vt.invite_id = im.id
		WHERE invite_id = get_id and
			start_time = get_start_time and
			end_time = get_end_time
	;
END
;;
DELIMITER ;

