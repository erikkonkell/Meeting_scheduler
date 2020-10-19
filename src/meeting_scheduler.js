/**
 * A module for exporting functions that uses the database.
 */
"use strict";


const mysql = require("promise-mysql");
const config = require("../config/meeting_scheduler.json");
let db //db == database

module.exports = {
    login: LogIn,
    register: Register,
    getUserByName: GetUserByName,
    getUserById: GetUserById,
    getUserByMail: GetUserByMail,
    createMeeting: CreateMeeting,
    initializeMeeting: InitializeMeeting,
    getUserInvitations: GetUserInvitations,
    getSelectedInviteVote: GetSelectedInviteVote,
    updateVotingValues: updateVotingValues,
    getHostedMeetings: GetHostedMeetings,
    getMeetingVotes:GetMeetingVotes,
    dateFix:dateFix,
    getVotesForMeeting: GetVotesForMeeting
};
/**
 * Main function.
 * @async
 * @returns void
 */
(async function() {
    db = await mysql.createConnection(config);
    process.on("exit", () => {
        db.end();
    });
})();


async function LogIn(username, password) {
    let sql = `CALL login(?,?)`;
    let res = await db.query(sql, [username, password]);
    console.table(res[0]);
    return res[0];
}
async function Register(username, password, email) {
    let sql = `Call register(?,?,?,?)`;
    await db.query(sql, [Date.now().toString(),username, password, email]);
}

async function GetUserByName(username) {
    let sql = `CALL getuserbyname(?)`;
    let res = await db.query(sql, [username]);
    let data = res[0]
    if(data[0] && data[0].id)
    {
        let user = {
            id: data[0].id,
            name: data[0].username,
            email: data[0].email,
            pass: data[0].pass
        }

        return user;
    }
    return null;
}
async function GetUserById(id) {
    let sql = `CALL getuserbyid(?)`;
    let res = await db.query(sql, [id]);
    let data = res[0]
    if(data[0].id)
    {
        let user = {
            id: data[0].id,
            name: data[0].username,
            email: data[0].email,
            pass: data[0].pass
        }

        return user;
    }
    return null;
}
async function GetUserByMail(email){
    let sql = `CALL getuserbymail(?)`;
    let res = await db.query(sql, [email]);
    let data = res[0]
    if(data && data[0].id)
    {
        let user = {
            id: data[0].id,
            name: data[0].username,
            email: data[0].email,
            pass: data[0].pass
        }

        return user;
    }
    return null;
}
async function CreateMeeting(user, title,start_time,end_time,description, attendants)
{
    let sql = `CALL createMeeting(?,?,?,?,?,?)`;
    let res = await db.query(sql,[Date.now(),user,title,start_time,end_time,description]);
    let meeting = res[0];
    attendants_list = attendants.split(",");
    for (let i = 0; i < attendants_list.length; i++) {
        let element = attendants_list[i];
        element = element.trim();
        if(getUserByMail(element.id))
        {
            let sql2 = `CALL addAttendantToMeeting(?,?)`;
            let res2 = db.query(sql2,[element[0].username, res.id]);
        }
    }    
}
async function InitializeMeeting(host, title,description, startTimes,endtimes, guests) {
    let initialze_sql = `CALL initializeMeeting(?,?,?,?)`;
    let time_sql = `CALL initializeTimeForVoting(?,?,?,?)`;
    let guests_sql = `CALL initializeAttendant(?,?)`;
    let id = Date.now();
    var i;
    await db.query(initialze_sql,[id,host,title,description]);

    //uncomment if you want the host to be able to vote
    //await db.query(guests_sql,[id,host])
    for (i = 0; i < guests.length; i++)
    {
        await db.query(guests_sql,[id,guests[i]]);
        for (var j = 0; j < startTimes.length; j++)
        {
            await db.query(time_sql,[startTimes[j],endtimes[j],id,guests[i]]);
        }
    }
}

async function GetUserInvitations(userID) {
    let sql = `CALL getUserInvitations(?)`;
    let res = await db.query(sql,[userID]);
    return res[0];
}

async function GetSelectedInviteVote(userID, meetingID)
{
    let sql = `CALL getSelectedInviteVote(?,?)`;
    let res = await db.query(sql,[userID,meetingID]);
    return res[0];
}

async function updateVotingValues(start_time,end_time,response,invite_id,invite_user)
{
    let sql = `CALL updateVotingValues(?,?,?,?,?)`;
    let res = [];
    for (let i = 0; i < response.length; i++) {
        let start = dateFix(new Date(start_time[i]).toString())
        let end =  dateFix(new Date(end_time[i]).toString())
        res.push(await db.query(sql,[start,end,response[i],invite_id,invite_user]))        
    }
}

async function GetHostedMeetings(userID) {
    let sql  = `CALL getHostedMeetings(?)`
    let res = await db.query(sql,[userID])
    return res[0];
}

async function GetMeetingVotes(meetingID)
{
    let sql = `CALL getMeetingVotes(?)`
    let res = await db.query(sql,[meetingID])
    return res[0];
}

async function GetVotesForMeeting(id,start,end)
{
    let sql = `Call getVotesForMeeting(?,?,?)`
    let res = await db.query(sql,[id,start,end])
    return res[0];
}

async function addMeetingToCalander(id,hostname,start_time,end_time,users) {
    let getAdditionalData = `CALL`
}

function dateFix(dateString) {
    let date = dateString.split(" ")
    let year = date[3]
    let day = date[2]
    let time = date[4]
    let months;
    switch (date[1]) {
        case "Jan":
            months = "01"
            break;
        case "Feb":
            months = "02"
            break;    
        case "Mar":
            months = "03"
            break;
        case "Apr":
            months = "04"
            break;
        case "May":
            months = "05"
            break;    
        case "Jun":
            months = "06"
            break;
        case "Jul":
            months = "07"
            break;
        case "Aug":
            months = "08"
            break;  
        case "Sep":
            months = "09"  
        case "Oct":
            months = "10"
            break;
        case "Nov":
            months = "11"
            break;    
        case "Dec":
            months = "12"
            break;
        default:
            break;
    }
    return ""+year + "-" + months + "-" + day + " " + time;

}