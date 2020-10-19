use meeting_scheduler;
select * from users;
select * from meetings;
select * from attendants;
select * from invite_Meeting;
select * from invite_users;
select * from validate_time;

	SELECT 
		im.id as 'meetingID',
		im.hostname as 'host',
		im.title as 'title',
		im.description as 'description'
	From invite_users as iu
	LEFT JOIN invite_Meeting as im ON iu.invite_id=im.id
	LEFT JOIN users on iu.invite_user = users.username
	WHERE users.id = 1602747583815
	;

SELECT 
	*
FROM validate_time as vt
LEFT JOIN invite_Meeting as im on vt.invite_id = im.id
Left JOIN invite_users as iu on im.id = iu.invite_id
WHERE iu.invite_user = "Erik Konkell"
;
SELECT
	*
FROM validate_time as vt
LEFT JOIN invite_Meeting as im ON vt.invite_id=im.id
LEFT JOIN invite_users as iu on im.id = iu.invite_id
LEFT JOIN users on iu.invite_user = users.username
WHERE users.id = 1602747583815 and im.id = 1602747782503
;

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
WHERE users.id = 1602762613973 and im.id = 1602765900969
;

select
	im.id,
    im.title,
    im.description
from users 
left join invite_Meeting as im on users.username = im.hostname 
Where username = "erik konkell"
;

/**/