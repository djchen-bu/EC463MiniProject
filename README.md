# EC463 Software MiniProject

This is a very simple implementation of a web app retrieving sensor data from a database. It also includes google authentication as a way to log in.

## Hosting

We decided to use Firebase as our hosting site since it had a lot of nice functions built in, like google authentication and a database.

## Web App

We first set up the google authentication. Upon clicking the sign in button, it first checks if the user is already signed in. At the same time there is a firebase function that detects authentication change and if the user is logged in, it retrieves the appropriate user info like name and email, and creates/updates the entry in the database. Although we did not implement sensor data based on uid of the user, it could be done with the uid already stored. 

In order to emulate the sensor we setup a simple structure in which there is temperature and humidity data under every minute. In the startDatabaseQueries function. (shown below)

```
function startDatabaseQueries() {

  var d = new Date();
  var min = d.getMinutes();
  var myUserId = firebase.auth().currentUser.uid;
  var temperature = firebase.database().ref('sensor/1/' + min + '/temperature');
  var humidity = firebase.database().ref('sensor/1/' + min + '/humidity');

  temperature.on('value', function(snapshot) {
    document.getElementById("temp").innerHTML = "Temperature: " + snapshot.val();
  });

  humidity.on('value', function(snapshot) { 
    document.getElementById("humid").innerHTML = "Humidity: " + snapshot.val();
  });

}
```

It takes the current minute number and retrieves the appropriate data values based on the current time on a minute scale, and then outputs it to the html page, therefore replicating a live sensor reading one could view away from their house for instance.


## Contributions

Devin Chen: Database query and setup, google authentication, base html formatting

Adian Mikulic: Google authenication, firebase setup


