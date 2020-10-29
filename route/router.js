/**
 * General routes.
 */

 "use strict";

const express = require("express");
const router = express.Router();
const meeting = require("../src/meeting_scheduler.js");
const bodyParser = require("body-parser");
const urlencodeParser = bodyParser.urlencoded({"extended": false});
const bcrypt = require('bcrypt');
const passport = require("passport");
const initializePassport = require('../src/passport-config.js');
const { getSelectedInviteVote } = require("../src/meeting_scheduler.js");

// initializePassport(
//   passport,
//   email => users.find(user => user.email === email),
//   id => users.find(user => user.id === id)
// )


initializePassport(
  passport,
  email => meeting.getUserByMail(email),
  id => meeting.getUserById(id)
)
//const users = []

router.get('/', (req, res) => {
    let login = loginCheck(req);
    let data = {
      title: "welcome",
      login: login
    }
    res.render('welcome.ejs', data)
  })
  
router.get('/login', checkNotAuthenticated, (req, res) => {
  let data = {
      title: "login",
      login: false
  }
  res.render('login.ejs', data)
})
  
router.post('/login', checkNotAuthenticated, passport.authenticate('local', {
  successRedirect: '/mypage',
  failureRedirect: '/login',
  failureFlash: true
}))

router.get('/register', checkNotAuthenticated, (req, res) => {

  let data = {
    title: "register",
    login: false
  }
  res.render('register.ejs', data)
})
  
router.post('/register',checkNotAuthenticated, async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10)
    /*users.push({
      id: Date.now().toString(),
      name: req.body.name,
      email: req.body.email,
      pass: hashedPassword
    })*/
    meeting.register(
        req.body.name,
        hashedPassword,
        req.body.email
      )
    res.redirect('/login')
  } catch (e) {
      console.log(e);
      res.redirect('/register')
  }
})
  
router.get('/logout', checkAuthenticated , (req, res) => {
  req.logOut()
  res.redirect('/login')
})

router.get('/mypage', checkAuthenticated, async (req, res) =>
{
  let temp = await getUser(req);
  
  let data = {
    title: "My Page",
    name: temp.name,
    login: true,
    res: null
  };
  res.render('mypage.ejs', data)
})

router.post('/mypage', checkAuthenticated, async (req, res) =>
{
  let user = await getUser(req);
  if(req.body.start == "" || req.body.end < req.body.start)
  {
    res.redirect('/mypage')
    return
  }
  let datapack = await meeting.getMeetingsBetweenDates(req.body.start,req.body.end,user.name);
  let data = {
    title: "My Page",
    name: user.name,
    login: true,
    res: datapack
  };
  res.render('mypage.ejs', data)
})

router.get('/create-meeting', checkAuthenticated, async (req, res) =>
{
  let data = {
    title: "Create Meeting",
    error_title: "",
    login: true
  }
  res.render('create_meeting.ejs', data)
})

router.post('/create_meeting', checkAuthenticated, async (req, res) =>
{

  let error_title = "";
  let start_times = [];
  let end_times = [];
  let guests = req.body.attendants.split(",");
  let usersExists = true;
  if (guests.length != 1 && guests[0] !="")
  {
    for (let i = 0; i < guests.length; i++) {
      let user = await meeting.getUserByName(guests[i])
      if(!user || user.length )
      {
        usersExists = false
        error_title += "User: " + guests[i] + " did not exist\n"
      }    
    }
  }
  
  else if(guests.length == 1 && guests[0] !="")
  {
    let exist = await meeting.getUserByName(guests[0])
    if (!exist)
      error_title += "user: " + guests[0] + " does not exist\n";
  }
  if(!req.body.title || req.body.title == "")
    error_title += "no title\n"
  

  if(!req.body.starttime1 || !req.body.endtime1)
  {
    if(!req.body.starttime1)
      error_title += "missing the first start time"
    
    else if (!req.body.endtime1)
      error_title += "missing the first end time"
  }
  else
  {
    start_times.push(req.body.starttime1)
    end_times.push(req.body.endtime1)
  }
  if(req.body.starttime2 && req.body.endtime2)
  {
    start_times.push(req.body.starttime2)
    end_times.push(req.body.endtime2)
  }
  if(req.body.starttime3 && req.body.endtime3)
  {
    start_times.push(req.body.starttime3)
    end_times.push(req.body.endtime3)
  }
  


  if(error_title)
  {
    let data = {
      title: "Create Meeting",
      error_title: error_title,
      login: true
    }
    res.render('create_meeting.ejs', data)
    return;
  }

  
  meeting.initializeMeeting((
    await getUser(req)).name,
    req.body.title,
    req.body.description,
    start_times,
    end_times,
    guests
    )
  
  //meeting.createMeeting((await getUser(req)).name,req.body.title, req.body.startDate, req.body.endDate, req.body.description,req.body.attendants);
  res.redirect("/mypage")
})

router.get('/meeting-invitation', checkAuthenticated, async (req, res) =>
{
  //may want to incrypt meetingID
  let temp = await meeting.getUserInvitations(req.session.passport.user)
  let data = {
    title: "Meeting invitation",
    res: temp,
    login: true
  }
  res.render('meeting-invitation.ejs', data);
})
router.get('/meeting-invitation/:id', checkAuthenticated, async (req, res) =>
{
  //get times for the selected meeting
  //todo check if this meeting has been voted on
  let get_id = req.params.id;
  let temp = await meeting.getSelectedInviteVote(req.session.passport.user, get_id);
  let data = {
    title: "Meeting invitation",
    res: temp,
    id:get_id,
    login:true
  }
  //change
  res.render('vote_for_meeting_time.ejs', data);
})

router.post('/meeting-invitation/:id', checkAuthenticated, async (req, res) =>
{
  let datapack = {
    start_time: [],
    end_time: [],
    response: [],
    invite_id: req.params.id,
    invite_user: req.body.user
  };
  if(req.body.vote.length > 1)
  {
    for(var i = 0; i < req.body.vote.length; i++)
    {
      datapack.start_time.push(req.body.start_time[i])
      datapack.end_time.push(req.body.end_time[i])
      let boolValue = 0
      if(req.body.vote[i] != "")
        boolValue = 1
      datapack.response.push(boolValue)
    }
  }
  else{
    datapack.start_time.push(req.body.start_time)
    datapack.end_time.push(req.body.end_time)
    let boolValue = 0
    if(req.body.vote != "")
      boolValue = 1
    datapack.response.push(boolValue)
  }
  await meeting.updateVotingValues(datapack.start_time,
                                      datapack.end_time,
                                      datapack.response,
                                      datapack.invite_id,
                                      datapack.invite_user)
  res.redirect("/meeting-invitation")
})

router.get('/meeting-manager', checkAuthenticated, async (req, res) =>
{
  let meetings = await meeting.getHostedMeetings(req.session.passport.user)
  let data = {
    title: "Meeting Manager",
    login: true,
    res: meetings
  }

  res.render("meeting-manager.ejs", data)
})

router.get('/meeting-manager/:id', checkAuthenticated, async (req,res) =>
{
  let resultat = await meeting.getMeetingVotes(req.params.id);
  for (let i = 0; i < resultat.length; i++) {
    resultat[i].start_time = meeting.dateFix(new Date(resultat[i].start_time).toString())  
    resultat[i].end_time = meeting.dateFix(new Date(resultat[i].end_time).toString())  
  }
  let data = 
  {
    title: "Meeting manager editor",
    login: true,
    res: resultat
  }
  res.render("Meeting-manager-edit.ejs",data)
})

router.get('/meeting-manager/:id/:start/:end', checkAuthenticated, async (req, res) => 
{
  let resultat = await meeting.getVotesForMeeting(req.params.id,req.params.start,req.params.end);
  let hostname = resultat[0].hostname;
  for (let i = 0; i < resultat.length; i++) {
    resultat[i].start_time = meeting.dateFix(new Date(resultat[i].start_time).toString())  
    resultat[i].end_time = meeting.dateFix(new Date(resultat[i].end_time).toString())
    if(resultat[i].response == 1)
      resultat[i].response = "Yes"
    else if(resultat[i].response == 0)
      resultat[i].response = "No"
    else
      resultat[i].response = "Not Voted"  
  }
  let data =
  {
    title: "Meeting Votes",
    login: true,
    res: resultat,
    id: req.params.id,
    start: req.params.start,
    end: req.params.end,
    host: hostname
  }
  res.render('meeting-manager-vote.ejs',data)
})

router.post('/meeting-manager/:id/:start/:end', checkAuthenticated, async (req, res) => 
{
  let host = req.body.host;
  let users = req.body.users;
  let responses = req.body.responses;
  let gustInAttendents = [];
  //if the host is also voting 
  //and in case he has not singed upp of the meeting for whatever resson.
  if(users.indexOf(host) == -1)
    gustInAttendents.push(host)
  for (let i = 0; i < responses.length; i++) {
    if(responses[i] == "Yes" && gustInAttendents.indexOf(users[i]) == -1)
      gustInAttendents.push(users[i]);
  }
  meeting.addMeetingToCalander(req.params.id,host,req.params.start,req.params.end,gustInAttendents)
  res.redirect('/mypage')
})

//local functions  
function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next()
  }

  res.redirect('/login')
}

function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect('/')
  }
  next()
}
async function getUser(req)
{
  let user = await meeting.getUserById(req.session.passport.user);
  return user;
}
function loginCheck(req) {
  try {
    let login = req.session.passport.user;
    //not loged in.
    if(!login)
      return false
  } catch (e) {
    //if passport has not been defined
    return false;
  }
  return true;
}
  

module.exports = router;