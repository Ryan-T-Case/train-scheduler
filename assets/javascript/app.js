//Initialize Firebase
var config = {
    apiKey: "AIzaSyAfdgSmJEN9aLl8wN2eA9NoCvYaZsdxgfo",
    authDomain: "case-railways-train-scheduler.firebaseapp.com",
    databaseURL: "https://case-railways-train-scheduler.firebaseio.com",
    projectId: "case-railways-train-scheduler",
    storageBucket: "case-railways-train-scheduler.appspot.com",
    messagingSenderId: "784342071168"
};

firebase.initializeApp(config);

//Define a variable that holds the database
var database = firebase.database();

//Submit button that adds new trains to the database when clicked
$("#add-train").on("click", function (event) {
    event.preventDefault();
    //Get the user input
    var trainName = $("#train-name-input").val().trim();
    var trainDestination = $("#destination-input").val().trim();
    //The time input is converted to unix time to be stored in Firebase
    var trainFirstTime = moment($("#initial-time-input").val().trim(), "HH:mm").format("X");
    var trainFrequency = $("#frequency-input").val().trim();
    //Prevent form from being submitted if one or more fields does not have a value
    if ((trainName === "") || (trainDestination === "") || (trainFirstTime === "") || (trainFrequency === "")) {
        alert("The form cannot be submitted because one or more fields has no value");
    } else if (trainFirstTime === "Invalid date") {
        //Prevent form from being submitted if an invalid start time is entered
        alert("Please enter a valid start time");
    } else {
        //Temporarily hold the train data in an object
        var newTrain = {
            name: trainName,
            destination: trainDestination,
            time: trainFirstTime,
            frequency: trainFrequency
        };

        //Upload new train data to the database
        database.ref().push(newTrain);

        //Log all user inputs to the console to check values
        console.log("Stored Data");
        console.log("Name: " + newTrain.name);
        console.log("Destination: " + newTrain.destination);
        console.log("Time: " + newTrain.time);
        console.log("Frequency: " + newTrain.frequency);

        //Notify the user that they successfully added a train to the schedule
        alert("New Train Added Successfully");

        //Clear all input fields
        $("#train-name-input").val("");
        $("#destination-input").val("");
        $("#initial-time-input").val("");
        $("#frequency-input").val("");
    }
});

//Retrieve new train data from the database and add to the scheduler table
database.ref().on("child_added", function (childSnapshot) {
    console.log("Snapshot: " + childSnapshot.val());

    //Store the snapshotted data into variables
    var trainName = childSnapshot.val().name;
    var trainDestination = childSnapshot.val().destination;
    var trainFirstTime = childSnapshot.val().time;
    var trainFrequency = childSnapshot.val().frequency;

    //Log all snapshotted data to console
    console.log("Snapshotted Data");
    console.log("Name: " + trainName);
    console.log("Destination: " + trainDestination);
    console.log("Time: " + trainFirstTime);
    console.log("Frequency: " + trainFrequency);

    //Time Scheduler Data Calculation Logic

    //////////////////////////////////////////////////////////////////

    //Convert First Time to one year prior so it always precedes current time
    var firstTimeReadable = moment.unix(trainFirstTime).format("HH:mm");
    var firstTimeConverted = moment(firstTimeReadable, "HH:mm").subtract(1, "years");
    console.log("First time converted: " + firstTimeConverted);

    //Store the current time
    var currentTime = moment();
    console.log("Current time: " + moment(currentTime).format("hh:mm"));

    //Find the difference between the first time and the current time in minutes
    var diffTime = moment().diff(moment(firstTimeConverted), "minutes");
    console.log("Difference in time: " + diffTime);

    //Find the remainder of the difference in time divided by the train frequency
    var tRemainder = diffTime % trainFrequency;
    console.log("Remainder: " + tRemainder);

    //Find how many minutes away the train is
    var tMinutesAway = trainFrequency - tRemainder;
    console.log("Minutes Away: " + tMinutesAway);

    //Find time of next train arrival
    var nextTrain = moment().add(tMinutesAway, "minutes");
    //Convert that time in a presentable format
    var nextTrainConverted = moment(nextTrain).format("hh:mm A");
    console.log("Next arrival time: " + nextTrainConverted)

    ////////////////////////////////////////////////////////////////////

    //Create a new row element using the data from user input and the calculated train arrival data
    var newRow = $("<tr>").append(
        $("<td>").text(trainName),
        $("<td>").text(trainDestination),
        $("<td>").text(trainFrequency),
        $("<td>").text(nextTrainConverted),
        $("<td>").text(tMinutesAway),
        $("<td>").html(`
        <button class="btn btn-primary delete-button">Delete</button>
        `)
    );

    //And append the new row to the train scheduler table
    $("#train-table-rows").append(newRow);
});