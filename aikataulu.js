function debug(x) {
  console.log(x);
  return 0;
}

var finnish = {
  days : ["su", "ma", "ti", "ke", "to", "pe", "la"],
  months : ["tammi", "helmi", "maalis", "huhti", "touko", "kesä", "heinä", "elo", "syys", "loka", "marras", "joulu"],
  dateString : function(date) {
    let dateText = [
      finnish.days[date.getDay()],
      " ",
      date.getDate(),
      ". ",
      finnish.months[date.getMonth()],
      " ",
      date.getFullYear()
    ];
    return dateText.join("");
  }
};

var a = {
  savedDate : null, //Date object
  savedStart : null, //Date object
  savedEnd : null, //Date object
  breakDurations : [], //simple list of durations in milliseconds
  breakTimes : [], //array pairs of Date objects
  breakCounter : null,
  totalCounter : null,
  justTime : function() {
    let now = new Date();
    return [now.getHours(), now.getMinutes(), now.getSeconds()];
  },
  prettyTime : function(timeArray) {
    //adds a leading zero if time is single digits
    for(let c = 0; c < timeArray.length; c++) {
      if(timeArray[c] < 10) {
        timeArray[c] = "0" + timeArray[c].toString();
      }
    }
    return timeArray;
  },
  prettyDuration : function(duration) {
    let before = a.millisecondsToHours(duration);
    let pretty = [];
    if(before[0]) {pretty.push(before[0] + "t");}
    if(before[1]) {pretty.push(before[1] + "m");}
    pretty.push(before[2] + "s"); //include seconds even if 0

    return pretty.join("");
  },
  millisecondsToHours : function(duration) {
    var seconds = Math.floor((duration / 1000) % 60);
    var minutes = Math.floor((duration / (1000 * 60)) % 60);
    var hours = Math.floor((duration / (1000 * 60 * 60)) % 24);

    return [hours, minutes, seconds];
  },
  getInner : function(id) {
    return document.getElementById(id).innerHTML;
  },
  setInner : function(id, inner) {
    document.getElementById(id).innerHTML = inner;
    return inner;
  },
  getStartTime : function() {
    return document.getElementById("start-time").value;
  },
  setStartTime : function(value) {
    document.getElementById("start-time").value = value;
    return value;
  },
  getEndTime : function() {
    return document.getElementById("end-time").value;
  },
  setEndTime : function(value) {
    document.getElementById("end-time").value = value;
    return value;
  },
  getDate : function() {
    return document.getElementById("workday-date").value;
  },
  setDate : function(value) {
    document.getElementById("workday-date").value = value;
    return value;
  },
  editDate : function() {
    let datePicker = '<input type="date" id="workday-date" name="workday-date" onblur="a.updateDate();">';
    a.setInner("current-date", datePicker);
    a.setDate(a.savedDate.toISOString().split("T")[0]);
    a.savedDate = null;
    document.getElementById("current-date-display").onclick = "";
    return 0;
  },
  updateDate : function() {
    //todo: make this also update the start time date but preserve the start time
    //todo: also, how in the world will i handle workdays that go past midnight? maybe i need another date picker
    a.savedDate = new Date(a.getDate());
    a.setInner("current-date", finnish.dateString(a.savedDate));
    document.getElementById("current-date-display").onclick = a.editDate;
    return 0;
  },
  startButton : function() {
    let timePicker = '<input type="time" id="start-time" name="start-time" value="09:00" onblur="a.updateStart();">';
    let pauseButton = document.getElementById("pause-button");
    a.savedStart = new Date();
    let timeFormat = a.prettyTime([a.savedStart.getHours(), a.savedStart.getMinutes()]);
    a.setInner("start-time-wrapper", timePicker);
    a.setStartTime(timeFormat.join(":"));
    //start the work timer rolling
    a.totalCounter = setInterval(a.updateTotal, 1000);
    //update pause button appearance and functionality
    pauseButton.onclick = a.pauseButton;
    pauseButton.innerHTML = "||";
    return 0;
  },
  stopButton : function() {
    if(!a.savedStart) {
      alert("Et voi lopettaa ennen aloittamista!");
    }
    else {
      let timePicker = '<input type="time" id="end-time" name="end-time" value="17:00" onblur="a.updateEnd();">';
      let justKidding = '&nbsp;<button onclick="a.clearEndTime();">&#10005; Hups, oli vielä yksi asia.</button>';
      let saveData = '<br><br><button onclick=\'alert("saving not implemented yet");\'>&#x2713; Tallenna</button>';
      let pauseButton = document.getElementById("pause-button");
      clearInterval(a.totalCounter);
      a.savedEnd = new Date();
      a.updateTotal();
      pauseButton.innerHTML = "&#x2713;";
      pauseButton.onclick = "";
      a.setInner("end-time-wrapper", timePicker + justKidding + saveData);
      let timeFormat = a.prettyTime([a.savedEnd.getHours(), a.savedEnd.getMinutes()]);
      a.setEndTime(timeFormat.join(":"));
    }
    return 0;
  },
  pauseButton : function() {
    let i = a.breakDurations.length; //index of new break
    let now = new Date();
    let pauseButton = document.getElementById("pause-button");
    //stop the work timer
    clearInterval(a.totalCounter);
    //add break to app data
    a.breakDurations[i] = 0;
    a.breakTimes[i] = [now, null];
    //properly format time hh:mm
    now = a.prettyTime([now.getHours(), now.getMinutes()]).join(":");
    //update page to reflect new break info
    document.getElementById("timeline-breaks").innerHTML += `<li id="break-${i}" class="timeline-midpoint">Tauko <input type="time" id="break-input-start-${i}" value="${now}" onblur="a.changeBreak(${i},0);"></li>`;
    pauseButton.innerHTML = "&#x25B6;";
    pauseButton.onclick = a.unpauseButton;
    return 0;
  },
  unpauseButton : function() {
    let i = a.breakDurations.length - 1; //index of latest break
    let now = new Date();
    let theBreak = document.getElementById("break-" + i.toString());
    let pauseButton = document.getElementById("pause-button");
    //update app data
    a.breakTimes[i][1] = now;
    a.breakDurations[i] = a.breakTimes[i][1] - a.breakTimes[i][0]; //calculate duration of break
    //properly format time hh:mm
    now = a.prettyTime([now.getHours(), now.getMinutes()]).join(":");
    //update page to reflect end of break
    theBreak.innerHTML += `<input type="time" id="break-input-end-${i}" value="${now}" onblur="a.changeBreak(${i},1);">&nbsp;<span id="break-duration-${i}">${a.prettyDuration(a.breakDurations[i])}</span><span id="remove-break-${i}" class="remove-break" onclick="a.removeBreak(${i});">&nbsp;&nbsp;&#10005;</span>`;
    pauseButton.innerHTML = "||";
    pauseButton.onclick = a.pauseButton;
    //set the work timer rolling again
    a.totalCounter = setInterval(a.updateTotal, 1000);
    return 0;
  },
  changeBreak : function(i, startOrEnd) {
    let elem;
    let newTime;
    if(startOrEnd == 0) { //start
      elem = document.getElementById("break-input-start-" + i);
    }
    else {//end
      elem = document.getElementById("break-input-end-" + i);
    }

    newTime = elem.value.split(":");
    a.breakTimes[i][startOrEnd] = a.breakTimes[i][startOrEnd].setHours(newTime[0], newTime[1], 0); //zeroed seconds
    //recalculate duration and save in app data
    a.breakDurations[i] = a.breakTimes[i][1] - a.breakTimes[i][0];
    //update break duration and total work time duration on page
    document.getElementById("break-duration-" + i).innerHTML = a.prettyDuration(a.breakDurations[i]);
    a.updateTotal();
    return 0;
  },
  removeBreak : function(num) {
    if(!a.breakTimes[num][1]) { //there's an unfinished break in progress
      alert("Lopeta tauko ennen poistamista.");
    }
    else {
      a.breakDurations[num] = 0;
      a.breakTimes[num] = null;
      //break-${i}"
      let elem = document.querySelector('#break-' + num);
      elem.parentNode.removeChild(elem);
      a.updateTotal();
    }
    return 0;
  },
  clearEndTime : function() {
    let stopButton = '<button id="stop-button" onclick="a.stopButton();">Lopeta</button>';
    let pauseButton = document.getElementById("pause-button");
    pauseButton.innerHTML = "||";
    pauseButton.onclick = a.pauseButton;
    a.setInner("end-time-wrapper", stopButton);
    a.savedEnd = null;
    a.totalCounter = setInterval(a.updateTotal, 1000);
    return 0;
  },
  updateStart : function() {
    let startA = a.getStartTime().split(":"); //get user-selected start time from picker
    a.savedDate.setHours(startA[0], startA[1], 0); //saved date should reflect date at start time with zeroed seconds
    a.savedStart = new Date(a.savedDate.getTime()); //copy date to start time, don't just reference
    a.updateTotal(); //update the diplayed total duration on the page
    return 0;
  },
  updateEnd : function() {
    let endA = a.getEndTime().split(":");
    a.savedEnd = new Date(a.savedDate.getTime()); //copy saved date, don't change its hours
    a.savedEnd.setHours(endA[0], endA[1], 0);
    a.updateTotal(); //update the diplayed total duration on the page
    return 0;
  },
  updateCurrent : function() {
    let now = new Date();
    let nowA = a.prettyTime([now.getHours(), now.getMinutes(), now.getSeconds()]);
    a.setInner("current-time", nowA.join(":"));
    return nowA;
  },
  updateTotal : function() {
    let f = a.savedEnd || new Date(); //if user hasn't set end time, use current moment
    let i = a.savedStart;

    //first calculate overall difference between start and now
    let diff = f - i;
    if(diff < 0) {
      debug("Kesto on negatiivinen!");
    }
    //now subtract all break times from this duration
    for(let c = 0; c < a.breakDurations.length; c++) {
      diff -= a.breakDurations[c];
    }
    diff = a.millisecondsToHours(diff);
    diff = a.prettyTime(diff);
    a.setInner("total-time", diff[0] + " t " + diff[1] + " m " + diff[2] + " s");
    return diff;
  }
};

function init() {
  a.savedDate = new Date();
  a.setInner("current-date", finnish.dateString(a.savedDate));

  setInterval(a.updateCurrent, 1000);
  return 0;
}
