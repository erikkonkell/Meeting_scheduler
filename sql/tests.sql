use meeting_scheduler;
SET SQL_SAFE_UPDATES = 0;

/*UPDATE validate_time
SET response = null
;*/


SELECT *
FROM users 
LEFT JOIN attendants as a ON users.username = a.attendant_name
Left join meetings as m ON a.meetingID = m.id
WHERE users.username = "erik konkell" and
	start_time >= "2020-10-01 00:00:00" and 
    start_time <= "2020-10-31 23:59:59"
;

SELECT 
	m.title,
    m.hostname,
    m.description,
    m.start_time,
    m.end_time
FROM users 
LEFT JOIN attendants as a ON users.username = a.attendant_name
Left join meetings as m ON a.meetingID = m.id
WHERE users.username = "erik konkell" and
	start_time >= "2020-10-01 00:00:00" and 
    start_time <= "2020-10-31 23:59:59"
ORDER BY m.start_time DESC
;
    